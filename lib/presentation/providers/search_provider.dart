import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/document_model.dart';
import '../../data/models/search_result.dart';
import '../../services/document_search_service.dart';
import 'service_providers.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

class SearchState {
  final bool   isOpen;
  final String query;
  final List<SearchResult> results;
  final int    currentIndex;
  final bool   caseSensitive;
  final bool   wholeWord;

  const SearchState({
    this.isOpen        = false,
    this.query         = '',
    this.results       = const [],
    this.currentIndex  = 0,
    this.caseSensitive = false,
    this.wholeWord     = false,
  });

  // ── Derived ───────────────────────────────────────────────────────────────

  bool get hasResults   => results.isNotEmpty;
  int  get totalResults => results.length;
  bool get isSearching  => isOpen && query.isNotEmpty;

  /// The currently active (orange) match, or null if no results.
  SearchResult? get currentResult =>
      results.isEmpty ? null : results[_safeIndex];

  int get _safeIndex =>
      results.isEmpty ? 0 : currentIndex.clamp(0, results.length - 1);

  /// Returns [SearchHighlight] annotations for a given block, for the renderer.
  List<SearchHighlight> highlightsForBlock(String blockId) {
    if (!isSearching || results.isEmpty) return const [];
    final list = <SearchHighlight>[];
    for (int i = 0; i < results.length; i++) {
      final r = results[i];
      if (r.blockId != blockId) continue;
      list.add(SearchHighlight(
        charStart: r.charStart,
        charEnd:   r.charEnd,
        isCurrent: i == _safeIndex,
      ));
    }
    return list;
  }

  // ── Status string (e.g. "3 / 12") ────────────────────────────────────────

  String get statusText {
    if (!isOpen || query.isEmpty) return '';
    if (results.isEmpty) return 'Không tìm thấy';
    return '${_safeIndex + 1} / ${results.length}';
  }

  SearchState copyWith({
    bool?   isOpen,
    String? query,
    List<SearchResult>? results,
    int?    currentIndex,
    bool?   caseSensitive,
    bool?   wholeWord,
  }) {
    return SearchState(
      isOpen:        isOpen        ?? this.isOpen,
      query:         query         ?? this.query,
      results:       results       ?? this.results,
      currentIndex:  currentIndex  ?? this.currentIndex,
      caseSensitive: caseSensitive ?? this.caseSensitive,
      wholeWord:     wholeWord     ?? this.wholeWord,
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFIER
// ═══════════════════════════════════════════════════════════════════════════════

class SearchNotifier extends StateNotifier<SearchState> {
  final DocumentSearchService _svc;
  DocumentModel? _model;

  SearchNotifier(this._svc) : super(const SearchState());

  // ── Document binding ──────────────────────────────────────────────────────

  /// Called by the viewer when a new document is loaded.
  void bindDocument(DocumentModel? model) {
    _model = model;
    if (state.query.isNotEmpty) _runSearch();
  }

  // ── Open / close ──────────────────────────────────────────────────────────

  void open() => state = state.copyWith(isOpen: true);

  void close() => state = const SearchState();

  // ── Query ─────────────────────────────────────────────────────────────────

  void updateQuery(String query) {
    state = state.copyWith(query: query, currentIndex: 0);
    _runSearch();
  }

  void clearQuery() {
    state = state.copyWith(query: '', results: const [], currentIndex: 0);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  void next() {
    if (!state.hasResults) return;
    final next = (state.currentIndex + 1) % state.results.length;
    state = state.copyWith(currentIndex: next);
  }

  void previous() {
    if (!state.hasResults) return;
    final prev =
        (state.currentIndex - 1 + state.results.length) % state.results.length;
    state = state.copyWith(currentIndex: prev);
  }

  void toggleCaseSensitive() {
    state = state.copyWith(caseSensitive: !state.caseSensitive);
    _runSearch();
  }

  void toggleWholeWord() {
    state = state.copyWith(wholeWord: !state.wholeWord);
    _runSearch();
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  void _runSearch() {
    if (_model == null || state.query.trim().isEmpty) {
      state = state.copyWith(results: const [], currentIndex: 0);
      return;
    }
    final results = _svc.search(
      _model!,
      SearchQuery(
        term:          state.query,
        caseSensitive: state.caseSensitive,
        wholeWord:     state.wholeWord,
      ),
    );
    state = state.copyWith(results: results, currentIndex: 0);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

/// Auto-disposed: each ViewerScreen gets its own search notifier.
final searchNotifierProvider =
    StateNotifierProvider.autoDispose<SearchNotifier, SearchState>(
  (ref) => SearchNotifier(ref.read(documentSearchServiceProvider)),
  name: 'searchNotifierProvider',
);
