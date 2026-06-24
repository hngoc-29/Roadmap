import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/constants/theme_constants.dart';
import '../../../domain/abstractions/document_source.dart';
import '../../providers/document_provider.dart';
import '../../providers/history_provider.dart';
import '../../providers/search_provider.dart';
import '../../providers/service_providers.dart';
import '../../renderers/document_renderer_widget.dart';
import '../../theme/app_theme.dart';
import '../../widgets/document_search_bar.dart';
import '../../widgets/scroll_position_indicator.dart';
import 'widgets/viewer_error_widget.dart';
import 'widgets/viewer_loading_widget.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// VIEWER SCREEN  (Phase 4)
// ═══════════════════════════════════════════════════════════════════════════════

class ViewerScreen extends ConsumerStatefulWidget {
  final DocumentSource? source;
  final String?         filePath;

  const ViewerScreen({super.key, this.source, this.filePath});

  const ViewerScreen.fromPath(String path, {super.key})
      : source   = null,
        filePath = path;

  @override
  ConsumerState<ViewerScreen> createState() => _ViewerScreenState();
}

class _ViewerScreenState extends ConsumerState<ViewerScreen> {
  late final ScrollController _scrollController;
  final _transformController = TransformationController();

  double  _currentZoom    = AppConstants.defaultZoom;
  bool    _showWarnings   = false;
  String? _currentFileId; // FileRecord.id for history
  Timer?  _scrollSaveTimer;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _openDocumentIfNeeded();
      _restoreScrollPosition();
    });
  }

  @override
  void dispose() {
    _scrollSaveTimer?.cancel();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _transformController.dispose();
    super.dispose();
  }

  // ── Document loading ──────────────────────────────────────────────────────

  Future<void> _openDocumentIfNeeded() async {
    final notifier = ref.read(documentNotifierProvider.notifier);
    if (widget.source != null) {
      await notifier.open(widget.source!);
    } else if (widget.filePath != null) {
      await notifier.openFromPath(widget.filePath!);
    }

    // Bind model to search notifier
    final model = ref.read(documentNotifierProvider).model;
    ref.read(searchNotifierProvider.notifier).bindDocument(model);
  }

  // ── Phase 4: scroll position save (debounced 800 ms) ─────────────────────

  void _onScroll() {
    _scrollSaveTimer?.cancel();
    _scrollSaveTimer = Timer(const Duration(milliseconds: 800), _saveScrollPos);
  }

  void _saveScrollPos() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.maxScrollExtent <= 0) return;
    final fraction = (pos.pixels / pos.maxScrollExtent).clamp(0.0, 1.0);

    final filePath = widget.filePath
        ?? widget.source?.path
        ?? ref.read(documentNotifierProvider).currentFilePath;
    if (filePath == null) return;

    // Find file record id for this path
    final record = ref
        .read(historyNotifierProvider)
        .recentFiles
        .where((r) => r.path == filePath)
        .firstOrNull;
    if (record != null) {
      ref
          .read(historyNotifierProvider.notifier)
          .saveScrollPosition(record.id, fraction);
    }
  }

  // ── Phase 4: scroll position restore ─────────────────────────────────────

  void _restoreScrollPosition() {
    final filePath = widget.filePath
        ?? widget.source?.path
        ?? ref.read(documentNotifierProvider).currentFilePath;
    if (filePath == null) return;

    final record = ref
        .read(historyNotifierProvider)
        .recentFiles
        .where((r) => r.path == filePath)
        .firstOrNull;

    if (record == null || record.lastScrollPosition < 0.02) return;

    // Wait for the ListView to lay out before scrolling
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      final maxScroll = _scrollController.position.maxScrollExtent;
      final target    = (record.lastScrollPosition * maxScroll).clamp(0.0, maxScroll);
      if (target > 10) {
        _scrollController.animateTo(
          target,
          duration: const Duration(milliseconds: 400),
          curve:    Curves.easeOut,
        );
      }
    });
  }

  // ── Zoom ─────────────────────────────────────────────────────────────────

  void _applyZoom(double zoom) {
    final clamped = zoom.clamp(AppConstants.minZoom, AppConstants.maxZoom);
    setState(() => _currentZoom = clamped);
    _transformController.value = Matrix4.diagonal3Values(clamped, clamped, 1);
  }

  // ── Hyperlink handler ─────────────────────────────────────────────────────

  Future<void> _handleLinkTap(String url) async {
    final svc = ref.read(hyperlinkServiceProvider);
    final ok  = await svc.open(url);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open: $url'),
          action:  SnackBarAction(
            label:     'Copy',
            onPressed: () => svc.copyToClipboard(url),
          ),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // ── Search navigation → auto-scroll to match ──────────────────────────────

  void _onSearchNavigate(int resultIndex) {
    final results = ref.read(searchNotifierProvider).results;
    if (resultIndex < 0 || resultIndex >= results.length) return;

    final result     = results[resultIndex];
    final blockIndex = ref
        .read(documentNotifierProvider)
        .model
        ?.blocks
        .indexWhere((b) => b.id == result.blockId) ?? -1;

    if (blockIndex == -1 || !_scrollController.hasClients) return;

    // Estimate offset: 64px per block on average
    final estimated = (blockIndex * 64.0).clamp(
      0.0,
      _scrollController.position.maxScrollExtent,
    );

    _scrollController.animateTo(
      estimated,
      duration: const Duration(milliseconds: 300),
      curve:    Curves.easeOut,
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(documentNotifierProvider);

    // Bind newly loaded document to search notifier
    ref.listen(documentNotifierProvider, (prev, next) {
      if (next.isLoaded && next.model != prev?.model) {
        ref.read(searchNotifierProvider.notifier).bindDocument(next.model);
      }
    });

    return Scaffold(
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? ThemeConstants.paperDark
          : ThemeConstants.paperLight,
      body: Column(
        children: [
          // ── AppBar ────────────────────────────────────────────────────────
          _ViewerAppBar(
            state:       state,
            currentZoom: _currentZoom,
            onBack:      () {
              _saveScrollPos();
              ref.read(documentNotifierProvider.notifier).reset();
              ref.read(searchNotifierProvider.notifier).close();
              Navigator.of(context).pop();
            },
            onZoomIn:    () => _applyZoom(_currentZoom + 0.25),
            onZoomOut:   () => _applyZoom(_currentZoom - 0.25),
            onZoomReset: () => _applyZoom(1.0),
            onSearch:    () {
              ref.read(searchNotifierProvider.notifier).open();
            },
            onWarnings:  () => setState(() => _showWarnings = !_showWarnings),
          ),

          // ── Phase 4: animated search bar ──────────────────────────────────
          DocumentSearchBar(onNavigate: _onSearchNavigate),

          // ── Main content area ─────────────────────────────────────────────
          Expanded(
            child: Stack(
              children: [
                if (state.isLoaded && state.model != null)
                  _buildDocumentView(context, state),
                if (state.isInitial)
                  const Center(child: CircularProgressIndicator()),
                if (state.isLoading)
                  ViewerLoadingWidget(
                    fileName: state.currentFileName,
                    progress: state.loadingProgress,
                  ),
                if (state.hasError)
                  ViewerErrorWidget(
                    message:       state.errorMessage ?? 'An unknown error occurred.',
                    onRetry:       _openDocumentIfNeeded,
                    onPickAnother: () => Navigator.of(context).pop(),
                  ),
                if (_showWarnings && state.model != null)
                  _WarningsPanel(
                    warnings:  state.model!.parseWarnings,
                    onDismiss: () => setState(() => _showWarnings = false),
                  ),

                // ── Phase 4: scroll position indicator ────────────────────
                if (state.isLoaded)
                  Positioned(
                    right:  12,
                    bottom: 24,
                    child:  ScrollPositionIndicator(controller: _scrollController),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentView(BuildContext context, DocumentState state) {
    // LayoutBuilder gives us the exact available viewport (Expanded area).
    // We pass these as explicit SizedBox dimensions so the inner ListView
    // gets bounded height constraints even though InteractiveViewer
    // (constrained:false) would otherwise pass infinite height → black screen.
    return LayoutBuilder(builder: (context, constraints) {
      final viewW = constraints.maxWidth;
      final viewH = constraints.maxHeight;

      return Stack(children: [
        // ── White gap fill ─────────────────────────────────────────────────
        // When zoom < 1 the scaled content is smaller than the viewport,
        // exposing the parent (dark Scaffold) background → black gaps.
        // This covers all four gaps with paper-white.
        Container(color: ThemeConstants.paperLight),

        // ── Zoomable + pannable content ────────────────────────────────────
        InteractiveViewer(
          transformationController: _transformController,
          minScale: AppConstants.minZoom,
          maxScale: AppConstants.maxZoom,
          // constrained:false → child can grow beyond viewport so the user
          // can pan to see the overflow when zoomed in.
          constrained: false,
          // panEnabled:true (the default) is required for 2-finger pinch-zoom
          // to function correctly. With panEnabled:false Flutter cancels the
          // entire multi-touch interaction when a pan component is detected,
          // preventing zoom-out with 2 fingers.
          // Single-finger vertical scroll is still owned by the ListView
          // inside DocumentRendererWidget — Flutter's gesture arena gives
          // inner scrollables priority for vertical single-touch drags.
          panEnabled: true,
          onInteractionUpdate: (_) {
            final scale = _transformController.value.getMaxScaleOnAxis();
            if ((scale - _currentZoom).abs() > 0.01) {
              setState(() => _currentZoom = scale);
            }
          },
          child: SizedBox(
            // Explicit dimensions so ListView receives bounded constraints.
            width:  viewW,
            height: viewH,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                    maxWidth: AppConstants.documentMaxWidth),
                child: Theme(
                  data: AppTheme.light,
                  child: Container(
                    color: ThemeConstants.paperLight,
                    child: DocumentRendererWidget(
                      model:            state.model!,
                      scrollController: _scrollController,
                      onLinkTap:        _handleLinkTap,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ]);
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP BAR
// ═══════════════════════════════════════════════════════════════════════════════

class _ViewerAppBar extends ConsumerWidget implements PreferredSizeWidget {
  final DocumentState state;
  final double        currentZoom;
  final VoidCallback  onBack;
  final VoidCallback  onZoomIn;
  final VoidCallback  onZoomOut;
  final VoidCallback  onZoomReset;
  final VoidCallback  onSearch;
  final VoidCallback  onWarnings;

  const _ViewerAppBar({
    required this.state,
    required this.currentZoom,
    required this.onBack,
    required this.onZoomIn,
    required this.onZoomOut,
    required this.onZoomReset,
    required this.onSearch,
    required this.onWarnings,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final searchState = ref.watch(searchNotifierProvider);
    final fileName    = state.currentFileName ?? 'Document';

    return AppBar(
      leading: IconButton(
        icon:      const Icon(Icons.arrow_back),
        onPressed: onBack,
      ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize:       MainAxisSize.min,
        children: [
          Text(
            fileName,
            style:    const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (state.isLoaded && state.model != null)
            Text(
              '${state.model!.blockCount} blocks'
              '${state.model!.equationCount > 0 ? ' · ${state.model!.equationCount} eq.' : ''}'
              '${state.model!.images.isNotEmpty ? ' · ${state.model!.images.length} img' : ''}'
              '${searchState.isSearching ? ' · ${searchState.statusText}' : ''}',
              style: const TextStyle(fontSize: 11, color: Colors.white70),
            ),
        ],
      ),
      actions: [
        // Search toggle
        if (state.isLoaded)
          IconButton(
            icon:     Icon(
              searchState.isOpen ? Icons.search_off : Icons.search,
              color: searchState.isOpen ? Colors.orange.shade200 : null,
            ),
            tooltip:  'Search in document',
            onPressed: onSearch,
          ),

        // Zoom controls
        if (state.isLoaded) ...[
          IconButton(
            icon:      const Icon(Icons.zoom_out, size: 20),
            tooltip:   'Zoom out',
            onPressed: currentZoom > AppConstants.minZoom ? onZoomOut : null,
          ),
          GestureDetector(
            onTap: onZoomReset,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Center(
                child: Text(
                  '${(currentZoom * 100).round()}%',
                  style: const TextStyle(fontSize: 12, color: Colors.white70),
                ),
              ),
            ),
          ),
          IconButton(
            icon:      const Icon(Icons.zoom_in, size: 20),
            tooltip:   'Zoom in',
            onPressed: currentZoom < AppConstants.maxZoom ? onZoomIn : null,
          ),
        ],

        // Warnings badge
        if (state.isLoaded && state.model != null && state.model!.hasWarnings)
          IconButton(
            tooltip:   '${state.model!.parseWarnings.length} parse warning(s)',
            icon: Badge(
              label: Text('${state.model!.parseWarnings.length}'),
              child: const Icon(Icons.warning_amber_outlined),
            ),
            onPressed: onWarnings,
          ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WARNINGS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

class _WarningsPanel extends StatelessWidget {
  final List<String> warnings;
  final VoidCallback onDismiss;

  const _WarningsPanel({required this.warnings, required this.onDismiss});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 0, left: 0, right: 0,
      child: Material(
        elevation: 8,
        child: Container(
          constraints: const BoxConstraints(maxHeight: 220),
          color:        const Color(0xFFFFF8E1),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 8, 8),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber, color: Color(0xFFF57F17), size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${warnings.length} parse warning(s)',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600, color: Color(0xFFF57F17)),
                      ),
                    ),
                    IconButton(
                      icon:      const Icon(Icons.close, size: 18),
                      onPressed: onDismiss,
                      color:     const Color(0xFFF57F17),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Flexible(
                child: ListView.builder(
                  shrinkWrap:  true,
                  padding:     const EdgeInsets.all(12),
                  itemCount:   warnings.length,
                  itemBuilder: (_, i) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child:   Text('• ${warnings[i]}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF5D4037))),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
