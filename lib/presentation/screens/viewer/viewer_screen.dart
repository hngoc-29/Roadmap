import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:collection/collection.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/constants/theme_constants.dart';
import '../../../domain/abstractions/document_source.dart';
import '../../providers/document_provider.dart';
import '../../providers/font_size_provider.dart';
import '../../providers/history_provider.dart';
import '../../providers/search_provider.dart';
import '../../providers/service_providers.dart';
import '../../renderers/document_renderer_widget.dart';
import '../../theme/app_theme.dart';
import '../../widgets/document_search_bar.dart';
import '../../widgets/scroll_position_indicator.dart';
import 'widgets/toc_drawer.dart';
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
  final _scaffoldKey         = GlobalKey<ScaffoldState>();

  double  _currentZoom    = AppConstants.defaultZoom;
  bool    _showWarnings   = false;
  String? _currentFileId;
  Timer?  _scrollSaveTimer;
  bool    _resumeToastShown = false;

  // ── Zoom / gesture tracking ────────────────────────────────────────────────
  // Tracks how many fingers are currently on screen so we can switch between
  // "scroll mode" (1 finger at zoom=1) and "pan/zoom mode" (2 fingers or
  // any finger when scale > 1).
  int  _activePointers = 0;
  bool _multiTouch     = false;

  /// Whether InteractiveViewer should handle panning.
  ///
  /// True when:
  ///   • Two or more fingers are down (pinch-zoom needs pan enabled), OR
  ///   • Already zoomed in (single-finger pans the zoomed content).
  bool get _panActive => _multiTouch || _currentZoom > 1.005;

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

    // ListView with images may not have its full extent on the first frame.
    // We retry up to 10 times (every 100 ms) until maxScrollExtent > 0.
    _scrollRestoreWithRetry(record.lastScrollPosition, retries: 10);
  }

  void _scrollRestoreWithRetry(double fraction, {required int retries}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scrollController.hasClients) return;
      final max = _scrollController.position.maxScrollExtent;
      if (max <= 0 && retries > 0) {
        // Not rendered yet — try again after a short delay
        Future.delayed(const Duration(milliseconds: 100), () {
          _scrollRestoreWithRetry(fraction, retries: retries - 1);
        });
        return;
      }
      final target = (fraction * max).clamp(0.0, max);
      if (target > 10) {
        _scrollController.animateTo(
          target,
          duration: const Duration(milliseconds: 400),
          curve:    Curves.easeOut,
        );
        _showResumeToast(fraction);
      }
    });
  }

  // ── Zoom ─────────────────────────────────────────────────────────────────

  void _applyZoom(double zoom) {
    final clamped = zoom.clamp(AppConstants.minZoom, AppConstants.maxZoom);
    setState(() => _currentZoom = clamped);
    _transformController.value = Matrix4.diagonal3Values(clamped, clamped, 1);
  }

  // ── Table of contents ─────────────────────────────────────────────────────

  void _openToc() => _scaffoldKey.currentState?.openDrawer();

  void _jumpToBlock(int blockIndex) {
    if (!_scrollController.hasClients) return;
    // Estimate scroll position: assumes ~60px per block on average
    final target = (blockIndex * 60.0)
        .clamp(0.0, _scrollController.position.maxScrollExtent);
    _scrollController.animateTo(
      target,
      duration: const Duration(milliseconds: 400),
      curve:    Curves.easeInOut,
    );
  }

  // ── Share file ────────────────────────────────────────────────────────────

  Future<void> _shareFile() async {
    final state = ref.read(documentNotifierProvider);
    final path  = state.currentFilePath;
    if (path == null) return;
    try {
      await ShareXFiles([XFile(path)],
          subject: state.currentFileName ?? 'Tài liệu');
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể chia sẻ file này')),
        );
      }
    }
  }

  // ── Favorite ──────────────────────────────────────────────────────────────

  Future<void> _toggleFavorite() async {
    final state = ref.read(documentNotifierProvider);
    final path  = state.currentFilePath;
    if (path == null) return;
    final histSvc = ref.read(historyServiceProvider);
    final record  = ref.read(historyNotifierProvider)
        .recentFiles
        .where((r) => r.path == path)
        .firstOrNull;
    if (record == null) return;
    await histSvc.toggleFavorite(record.id);
    await ref.read(historyNotifierProvider.notifier).load();
    if (mounted) {
      final isFav = ref.read(historyNotifierProvider)
          .favorites
          .any((r) => r.id == record.id);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(isFav ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích'),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ));
    }
  }

  // ── Document stats ────────────────────────────────────────────────────────

  void _showStats() {
    final state = ref.read(documentNotifierProvider);
    final model = state.model;
    if (model == null) return;

    final meta = model.metadata;
    final rows = <_StatRow>[
      if (meta.title   != null) _StatRow('Tiêu đề',   meta.title!),
      if (meta.author  != null) _StatRow('Tác giả',   meta.author!),
      if (meta.subject != null) _StatRow('Chủ đề',    meta.subject!),
      if (meta.created != null) _StatRow('Tạo lúc',
          '${meta.created!.day}/${meta.created!.month}/${meta.created!.year}'),
      _StatRow('Số block',        '${model.blocks.length}'),
      if (model.equationCount > 0)
        _StatRow('Công thức',     '${model.equationCount}'),
      if (model.images.isNotEmpty)
        _StatRow('Hình ảnh',      '${model.images.length}'),
      if (model.hasWarnings)
        _StatRow('Cảnh báo',      '${model.parseWarnings.length}'),
    ];

    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36, height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text('Thông tin tài liệu',
                style: Theme.of(context)
                    .textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            ...rows.map((r) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 100,
                    child: Text(r.label,
                        style: TextStyle(
                          color: Theme.of(context)
                              .colorScheme.onSurface.withValues(alpha: 0.6),
                          fontSize: 13,
                        )),
                  ),
                  Expanded(
                    child: Text(r.value,
                        style: const TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w500)),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  // ── Resume toast ──────────────────────────────────────────────────────────

  void _showResumeToast(double fraction) {
    if (_resumeToastShown) return;
    _resumeToastShown = true;
    final pct = (fraction * 100).round();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Tiếp tục từ $pct%'),
      action: SnackBarAction(
        label:     'Đầu trang',
        onPressed: () => _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 400),
          curve:    Curves.easeOut,
        ),
      ),
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 4),
    ));
  }



  Future<void> _handleLinkTap(String url) async {
    final svc = ref.read(hyperlinkServiceProvider);
    final ok  = await svc.open(url);
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Không thể mở: $url'),
          action:  SnackBarAction(
            label:     'Sao chép',
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

    final fontSize  = ref.watch(fontSizeProvider);

    return Scaffold(
      key:             _scaffoldKey,
      backgroundColor: ThemeConstants.paperLight,
      drawer: state.isLoaded && state.model != null
          ? TocDrawer(
              model:  state.model!,
              onJump: _jumpToBlock,
            )
          : null,
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
            onToc:       _openToc,
            onShare:     _shareFile,
            onFavorite:  _toggleFavorite,
            onStats:     _showStats,
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
    // ── Listener tracks active pointer count ────────────────────────────────
    // We use raw pointer events (not GestureDetector) so we can reliably
    // count fingers without fighting the gesture arena.
    return Listener(
      behavior: HitTestBehavior.translucent,
      onPointerDown: (_) {
        _activePointers++;
        // As soon as a second finger touches, enable pan in InteractiveViewer
        // so the pinch-zoom gesture can include a pan component (Flutter
        // requires panEnabled:true for reliable multi-touch scale).
        if (_activePointers >= 2 && !_multiTouch) {
          setState(() => _multiTouch = true);
        }
      },
      onPointerUp: (_) {
        if (_activePointers > 0) _activePointers--;
        if (_activePointers < 2 && _multiTouch) {
          setState(() => _multiTouch = false);
        }
      },
      onPointerCancel: (_) {
        if (_activePointers > 0) _activePointers--;
        if (_activePointers < 2 && _multiTouch) {
          setState(() => _multiTouch = false);
        }
      },
      child: LayoutBuilder(builder: (context, constraints) {
        final viewW = constraints.maxWidth;
        final viewH = constraints.maxHeight;

        return Stack(children: [
          // ── White gap fill ─────────────────────────────────────────────
          // When scale < 1 the shrunken content leaves gaps. A plain white
          // Container behind the InteractiveViewer fills them so the user
          // never sees the dark Scaffold background.
          Container(color: ThemeConstants.paperLight),

          InteractiveViewer(
            transformationController: _transformController,
            minScale: AppConstants.minZoom,
            maxScale: AppConstants.maxZoom,
            constrained: false, // lets content exceed viewport when zoomed in

            // Dynamic pan: off during single-finger-at-1× so the ListView
            // inside can scroll normally; on during pinch or when zoomed in.
            panEnabled: _panActive,

            onInteractionUpdate: (_) {
              final s = _transformController.value.getMaxScaleOnAxis();
              if ((s - _currentZoom).abs() > 0.01) {
                setState(() => _currentZoom = s);
              }
            },
            onInteractionEnd: (_) {
              // If the user fully pinched back to 1×, snap the matrix to
              // identity so the content re-centres and scrolling resumes.
              final s = _transformController.value.getMaxScaleOnAxis();
              if (s <= 1.005) {
                _transformController.value = Matrix4.identity();
                if (_currentZoom != 1.0) setState(() => _currentZoom = 1.0);
              }
            },

            child: SizedBox(
              // Explicit viewport dimensions give the inner ListView bounded
              // height constraints (constrained:false would pass ∞ otherwise).
              width:  viewW,
              height: viewH,
              child: AbsorbPointer(
                // Only block child touch events during a 2-finger gesture.
                // Using _panActive (which includes zoom>1) would also block
                // SelectionArea's long-press, preventing text copy entirely
                // whenever the document is zoomed in.
                absorbing: _multiTouch,
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(
                        maxWidth: AppConstants.documentMaxWidth),
                    child: Theme(
                      data: AppTheme.light,
                      child: Container(
                        color: ThemeConstants.paperLight,
                        child: SelectionArea(
                          child: DocumentRendererWidget(
                            model:            state.model!,
                            scrollController: _scrollController,
                            onLinkTap:        _handleLinkTap,
                            baseFontSize:     fontSize,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ]);
      }),
    );
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
  final VoidCallback  onToc;
  final VoidCallback  onShare;
  final VoidCallback  onFavorite;
  final VoidCallback  onStats;

  const _ViewerAppBar({
    required this.state,
    required this.currentZoom,
    required this.onBack,
    required this.onZoomIn,
    required this.onZoomOut,
    required this.onZoomReset,
    required this.onSearch,
    required this.onWarnings,
    required this.onToc,
    required this.onShare,
    required this.onFavorite,
    required this.onStats,
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
            icon: Icon(
              searchState.isOpen ? Icons.search_off : Icons.search,
              color: searchState.isOpen ? Colors.orange.shade200 : null,
            ),
            tooltip:  'Tìm kiếm',
            onPressed: onSearch,
          ),

        // Zoom controls
        if (state.isLoaded) ...[
          IconButton(
            icon:      const Icon(Icons.zoom_out, size: 20),
            tooltip:   'Thu nhỏ',
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
            tooltip:   'Phóng to',
            onPressed: currentZoom < AppConstants.maxZoom ? onZoomIn : null,
          ),
        ],

        // More actions menu
        if (state.isLoaded)
          PopupMenuButton<_AppBarAction>(
            icon: const Icon(Icons.more_vert),
            onSelected: (action) {
              switch (action) {
                case _AppBarAction.toc:      onToc();
                case _AppBarAction.share:    onShare();
                case _AppBarAction.favorite: onFavorite();
                case _AppBarAction.stats:    onStats();
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: _AppBarAction.toc,
                child: Row(children: [
                  Icon(Icons.list_alt_outlined, size: 18),
                  SizedBox(width: 12), Text('Mục lục'),
                ]),
              ),
              const PopupMenuItem(
                value: _AppBarAction.favorite,
                child: Row(children: [
                  Icon(Icons.star_outline, size: 18),
                  SizedBox(width: 12), Text('Thêm yêu thích'),
                ]),
              ),
              const PopupMenuItem(
                value: _AppBarAction.share,
                child: Row(children: [
                  Icon(Icons.share_outlined, size: 18),
                  SizedBox(width: 12), Text('Chia sẻ'),
                ]),
              ),
              const PopupMenuItem(
                value: _AppBarAction.stats,
                child: Row(children: [
                  Icon(Icons.info_outline, size: 18),
                  SizedBox(width: 12), Text('Thông tin tài liệu'),
                ]),
              ),
            ],
          ),

        // Warnings badge
        if (state.isLoaded && state.model != null && state.model!.hasWarnings)
          IconButton(
            tooltip: '${state.model!.parseWarnings.length} cảnh báo',
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

// ── Supporting types ──────────────────────────────────────────────────────────

enum _AppBarAction { toc, share, favorite, stats }

class _StatRow {
  final String label;
  final String value;
  const _StatRow(this.label, this.value);
}
