import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/theme_constants.dart';
import '../../../data/models/file_record.dart';
import '../../providers/document_provider.dart';
import '../../providers/history_provider.dart';
import '../viewer/viewer_screen.dart';
import 'widgets/empty_state_widget.dart';
import '../settings/settings_screen.dart' show SettingsScreen;
import 'widgets/recent_file_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(historyNotifierProvider.notifier).load();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  void _openRecord(FileRecord record) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ViewerScreen.fromPath(record.path),
      ),
    );
  }

  Future<void> _openFilePicker() async {
    // Pick file THEN navigate — the notifier holds state across navigation
    await ref.read(documentNotifierProvider.notifier).pickAndOpen();
    if (!mounted) return;

    final docState = ref.read(documentNotifierProvider);
    if (docState.isLoaded || docState.isLoading) {
      // Navigate to viewer which will render the already-loaded/loading document
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => const ViewerScreen(),
        ),
      );
    } else if (docState.hasError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(docState.errorMessage ?? 'Failed to open document'),
          backgroundColor: Theme.of(context).colorScheme.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          _buildSliverAppBar(context, innerBoxIsScrolled),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            _RecentTab(
              searchQuery: _searchQuery,
              onOpenRecord: _openRecord,
              onOpenPicker: _openFilePicker,
            ),
            _FavoritesTab(
              searchQuery: _searchQuery,
              onOpenRecord: _openRecord,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openFilePicker,
        icon: const Icon(Icons.folder_open_outlined),
        label: const Text('Open File'),
        tooltip: 'Open a .docx file from storage',
      ),
    );
  }

  SliverAppBar _buildSliverAppBar(BuildContext context, bool collapsed) {
    return SliverAppBar(
      expandedHeight: 160,
      floating: false,
      pinned: true,
      elevation: collapsed ? 4 : 0,
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.parallax,
        background: _HeaderBackground(onOpenFile: _openFilePicker),
      ),
      title: AnimatedOpacity(
        opacity: collapsed ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 200),
        child: const Text('FormulaDoc'),
      ),
      actions: [
        IconButton(
          icon:     const Icon(Icons.settings_outlined),
          tooltip:  'Settings',
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const SettingsScreen()),
          ),
        ),
      ],
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(100),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: TextField(
                controller: _searchController,
                onChanged: (v) => setState(() => _searchQuery = v.trim()),
                decoration: InputDecoration(
                  hintText: 'Search recent files…',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                ),
              ),
            ),
            TabBar(
              controller: _tabController,
              indicatorColor: Colors.white,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white60,
              tabs: const [Tab(text: 'Recent'), Tab(text: 'Favorites')],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────

class _HeaderBackground extends StatelessWidget {
  final VoidCallback onOpenFile;

  const _HeaderBackground({required this.onOpenFile});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            ThemeConstants.primaryBlueDark,
            ThemeConstants.primaryBlue,
            Color(0xFF1976D2),
          ],
        ),
      ),
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.functions, color: Colors.white, size: 28),
              const SizedBox(width: 10),
              Text(
                'FormulaDoc',
                style: Theme.of(context).textTheme.displayMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Word equations rendered correctly',
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: Colors.white60),
          ),
        ],
      ),
    );
  }
}

// ─── Recent Tab ───────────────────────────────────────────────────────────────

class _RecentTab extends ConsumerWidget {
  final String searchQuery;
  final void Function(FileRecord) onOpenRecord;
  final VoidCallback onOpenPicker;

  const _RecentTab({
    required this.searchQuery,
    required this.onOpenRecord,
    required this.onOpenPicker,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyState = ref.watch(historyNotifierProvider);
    final notifier = ref.read(historyNotifierProvider.notifier);

    if (historyState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    var records = historyState.recentFiles;
    if (searchQuery.isNotEmpty) {
      final q = searchQuery.toLowerCase();
      records = records.where((r) => r.name.toLowerCase().contains(q)).toList();
    }

    if (records.isEmpty) {
      return EmptyStateWidget(onOpenFile: onOpenPicker);
    }

    return RefreshIndicator(
      onRefresh: notifier.load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        itemCount: records.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final r = records[i];
          return RecentFileCard(
            record: r,
            onTap: () => onOpenRecord(r),
            onFavoriteToggle: () => notifier.toggleFavorite(r.id),
            onRemove: () => notifier.removeRecord(r.id),
          );
        },
      ),
    );
  }
}

// ─── Favorites Tab ────────────────────────────────────────────────────────────

class _FavoritesTab extends ConsumerWidget {
  final String searchQuery;
  final void Function(FileRecord) onOpenRecord;

  const _FavoritesTab({
    required this.searchQuery,
    required this.onOpenRecord,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyState = ref.watch(historyNotifierProvider);
    final notifier = ref.read(historyNotifierProvider.notifier);

    if (historyState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    var favorites = historyState.favorites;
    if (searchQuery.isNotEmpty) {
      final q = searchQuery.toLowerCase();
      favorites =
          favorites.where((r) => r.name.toLowerCase().contains(q)).toList();
    }

    if (favorites.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.star_outline,
                size: 48,
                color: Theme.of(context)
                    .colorScheme
                    .onSurface
                    .withValues(alpha: 0.3)),
            const SizedBox(height: 12),
            Text(
              'No favorites yet',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withValues(alpha: 0.5),
                  ),
            ),
            const SizedBox(height: 6),
            Text('Tap ★ on a document to add it here',
                style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      itemCount: favorites.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (_, i) {
        final r = favorites[i];
        return RecentFileCard(
          record: r,
          onTap: () => onOpenRecord(r),
          onFavoriteToggle: () => notifier.toggleFavorite(r.id),
          onRemove: () => notifier.removeRecord(r.id),
        );
      },
    );
  }
}
