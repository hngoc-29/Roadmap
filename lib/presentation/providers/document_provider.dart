import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/errors/app_exception.dart';
import '../../core/utils/logger.dart';
import '../../data/models/document_model.dart';
import '../../domain/abstractions/document_format.dart';
import '../../domain/abstractions/document_source.dart';
import 'history_provider.dart';
import 'service_providers.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

enum DocumentStatus { initial, loading, loaded, error }

class DocumentState {
  final DocumentStatus status;
  final DocumentModel? model;
  final String?        errorMessage;
  final String?        currentFilePath;
  final String?        currentFileName;
  final double         loadingProgress;

  const DocumentState({
    this.status          = DocumentStatus.initial,
    this.model,
    this.errorMessage,
    this.currentFilePath,
    this.currentFileName,
    this.loadingProgress = 0.0,
  });

  DocumentState copyWith({
    DocumentStatus? status,
    DocumentModel?  model,
    String?         errorMessage,
    String?         currentFilePath,
    String?         currentFileName,
    double?         loadingProgress,
  }) =>
      DocumentState(
        status:          status          ?? this.status,
        model:           model           ?? this.model,
        errorMessage:    errorMessage    ?? this.errorMessage,
        currentFilePath: currentFilePath ?? this.currentFilePath,
        currentFileName: currentFileName ?? this.currentFileName,
        loadingProgress: loadingProgress ?? this.loadingProgress,
      );

  bool get isLoading => status == DocumentStatus.loading;
  bool get isLoaded  => status == DocumentStatus.loaded;
  bool get hasError  => status == DocumentStatus.error;
  bool get isInitial => status == DocumentStatus.initial;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFIER
// ═══════════════════════════════════════════════════════════════════════════════

class DocumentNotifier extends StateNotifier<DocumentState> {
  final Ref _ref;

  DocumentNotifier(this._ref) : super(const DocumentState());

  // ── Open ──────────────────────────────────────────────────────────────────

  Future<void> open(DocumentSource source) async {
    state = DocumentState(
      status:          DocumentStatus.loading,
      currentFileName: source.name,
      currentFilePath: source.path,
      loadingProgress: 0.1,
    );

    try {
      // Phase 5: use registry to auto-select the right parser
      final registry = _ref.read(parserRegistryProvider);
      final parser   = registry.forSource(source);

      if (parser == null) {
        throw UnsupportedFormatException(
          source.name.contains('.') ? source.name.split('.').last : 'unknown',
        );
      }

      // Friendly message for planned-but-not-implemented formats
      if (!parser.format.isSupported) {
        throw ParseException(
          '${parser.format.displayName} viewing is coming soon!\n'
          'FormulaDoc currently supports DOCX files.',
        );
      }

      // Phase 4: cache check
      final cache  = _ref.read(documentCacheProvider);
      final cached = source.path != null ? cache.get(source.path!) : null;

      DocumentModel model;
      if (cached != null) {
        AppLogger.info('Loaded from cache: ${source.name}', tag: 'DocumentNotifier');
        state = state.copyWith(loadingProgress: 0.8);
        model = cached;
      } else {
        state = state.copyWith(loadingProgress: 0.3);
        model = await parser.parse(source);
        if (source.path != null) cache.put(source.path!, model);
      }

      state = DocumentState(
        status:          DocumentStatus.loaded,
        model:           model,
        currentFilePath: source.path,
        currentFileName: source.name,
        loadingProgress: 1.0,
      );

      if (source.path != null) {
        await _ref.read(historyNotifierProvider.notifier).recordOpen(source.path!);
      }
    } on AppException catch (e) {
      AppLogger.error('Failed to open: ${e.message}', tag: 'DocumentNotifier', error: e);
      state = state.copyWith(
        status:       DocumentStatus.error,
        errorMessage: e.message,
      );
    } catch (e) {
      AppLogger.error('Unexpected error', tag: 'DocumentNotifier', error: e);
      state = state.copyWith(
        status:       DocumentStatus.error,
        errorMessage: 'An unexpected error occurred while opening the document.',
      );
    }
  }

  Future<void> openFromPath(String path) => open(FileDocumentSource(path));

  Future<void> pickAndOpen() async {
    final source = await _ref.read(fileServiceProvider).pickDocument();
    if (source != null) await open(source);
  }

  void evictFromCache(String path) => _ref.read(documentCacheProvider).evict(path);

  void reset()      => state = const DocumentState();
  void clearError() => state = const DocumentState();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

final documentNotifierProvider =
    StateNotifierProvider.autoDispose<DocumentNotifier, DocumentState>(
  (ref) => DocumentNotifier(ref),
  name: 'documentNotifierProvider',
);
