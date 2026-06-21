import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/constants/theme_constants.dart';
import '../../../data/parsers/parser_registry.dart';
import '../../providers/history_provider.dart';
import '../../providers/service_providers.dart';
import '../../../domain/abstractions/document_format.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  ThemeMode _themeMode = ThemeMode.system;

  @override
  Widget build(BuildContext context) {
    final cache    = ref.watch(documentCacheProvider);
    final registry = ref.watch(parserRegistryProvider);

    return Scaffold(
      appBar: AppBar(
        title:       const Text('Settings'),
        centerTitle: false,
      ),
      body: ListView(
        children: [
          // ── App header ──────────────────────────────────────────────────
          _SectionHeader(child: _AppHeader()),

          const SizedBox(height: 8),

          // ── Appearance ──────────────────────────────────────────────────
          _SectionCard(
            title:    'Appearance',
            icon:     Icons.palette_outlined,
            children: [
              ListTile(
                title:    const Text('Theme'),
                subtitle: Text(_themeName(_themeMode)),
                trailing: const Icon(Icons.chevron_right),
                onTap:    () => _showThemePicker(context),
              ),
            ],
          ),

          // ── Document cache ───────────────────────────────────────────────
          _SectionCard(
            title:    'Document Cache',
            icon:     Icons.storage_outlined,
            children: [
              _StatRow(
                label: 'Cached documents',
                value: '${cache.size} / ${cache.maxEntries}',
              ),
              _StatRow(
                label: 'Estimated size',
                value: _formatKb(cache.estimatedSizeKb()),
              ),
              if (cache.cachedPaths.isNotEmpty)
                ExpansionTile(
                  title:    const Text('Cached files'),
                  tilePadding: const EdgeInsets.symmetric(horizontal: 16),
                  children: cache.cachedPaths.map((p) => ListTile(
                    leading: const Icon(Icons.description_outlined, size: 18),
                    title:   Text(
                      p.split('/').last,
                      style: const TextStyle(fontSize: 13),
                      maxLines:  1,
                      overflow:  TextOverflow.ellipsis,
                    ),
                    dense: true,
                  )).toList(),
                ),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                child: OutlinedButton.icon(
                  onPressed: () => _clearCache(context),
                  icon:  const Icon(Icons.delete_sweep_outlined, size: 18),
                  label: const Text('Clear Cache'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Theme.of(context).colorScheme.error,
                    side: BorderSide(
                        color: Theme.of(context).colorScheme.error.withValues(alpha: 0.5)),
                  ),
                ),
              ),
            ],
          ),

          // ── File history ────────────────────────────────────────────────
          _SectionCard(
            title:    'File History',
            icon:     Icons.history_outlined,
            children: [
              Consumer(builder: (context, ref, _) {
                final histState = ref.watch(historyNotifierProvider);
                return Column(
                  children: [
                    _StatRow(
                      label: 'Recent files',
                      value: '${histState.recentFiles.length}',
                    ),
                    _StatRow(
                      label: 'Favorites',
                      value: '${histState.favorites.length}',
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                      child: OutlinedButton.icon(
                        onPressed: () => _clearHistory(context),
                        icon:  const Icon(Icons.clear_all, size: 18),
                        label: const Text('Clear History'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Theme.of(context).colorScheme.error,
                          side: BorderSide(
                              color: Theme.of(context).colorScheme.error.withValues(alpha: 0.5)),
                        ),
                      ),
                    ),
                  ],
                );
              }),
            ],
          ),

          // ── Supported formats ────────────────────────────────────────────
          _SectionCard(
            title:    'Supported Formats',
            icon:     Icons.folder_open_outlined,
            children: [
              ...DocumentFormat.values.map((fmt) => ListTile(
                leading: _FormatDot(supported: fmt.isSupported),
                title:   Text(fmt.displayName),
                subtitle: Text(
                  fmt.isSupported ? 'Fully supported' : 'Coming soon',
                  style: TextStyle(
                    fontSize: 12,
                    color: fmt.isSupported
                        ? Colors.green.shade700
                        : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
                  ),
                ),
                trailing: Text(
                  '.${fmt.extensions.join(' / .')}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
                    fontFamily: 'monospace',
                  ),
                ),
                dense: true,
              )),
            ],
          ),

          // ── About ────────────────────────────────────────────────────────
          _SectionCard(
            title:    'About',
            icon:     Icons.info_outline,
            children: [
              _StatRow(label: 'Version',    value: AppConstants.appVersion),
              _StatRow(label: 'Build',      value: 'Phase 5 / 5'),
              _StatRow(
                label: 'Parsers registered',
                value: '${registry.registeredCount}',
              ),
              ListTile(
                leading:  const Icon(Icons.science_outlined),
                title:    const Text('Math Engine'),
                subtitle: const Text('OMML → LaTeX via built-in renderer'),
                dense:    true,
              ),
              ListTile(
                leading:  const Icon(Icons.code_outlined),
                title:    const Text('Open Source'),
                subtitle: const Text('MIT License'),
                dense:    true,
              ),
            ],
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  Future<void> _clearCache(BuildContext context) async {
    final ok = await _confirm(
      context,
      title:   'Clear Cache?',
      message: 'Cached documents will be re-parsed on next open.',
    );
    if (!ok) return;
    ref.read(documentCacheProvider).clear();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cache cleared')),
      );
      setState(() {});
    }
  }

  Future<void> _clearHistory(BuildContext context) async {
    final ok = await _confirm(
      context,
      title:   'Clear History?',
      message: 'All recent files and favorites will be removed.',
    );
    if (!ok) return;
    await ref.read(historyNotifierProvider.notifier).clearAll();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('History cleared')),
      );
    }
  }

  void _showThemePicker(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('Choose Theme',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          ),
          for (final mode in ThemeMode.values)
            RadioListTile<ThemeMode>(
              title:    Text(_themeName(mode)),
              value:    mode,
              groupValue: _themeMode,
              onChanged: (v) {
                setState(() => _themeMode = v!);
                Navigator.pop(context);
              },
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Future<bool> _confirm(BuildContext context,
      {required String title, required String message}) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title:   Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
    return result == true;
  }

  String _themeName(ThemeMode m) => switch (m) {
        ThemeMode.system => 'System default',
        ThemeMode.light  => 'Light',
        ThemeMode.dark   => 'Dark',
      };

  String _formatKb(int kb) {
    if (kb < 1024) return '$kb KB';
    return '${(kb / 1024).toStringAsFixed(1)} MB';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER WIDGETS
// ═══════════════════════════════════════════════════════════════════════════════

class _AppHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width:   double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
      child: Row(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color:        ThemeConstants.primaryBlue,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.functions, color: Colors.white, size: 30),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(AppConstants.appName,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              Text(
                'v${AppConstants.appVersion} · Phase 5',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 4),
              Text(
                'DOCX · Equations · Math',
                style: TextStyle(
                  fontSize:  11,
                  color:     ThemeConstants.primaryBlue,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final Widget child;
  const _SectionHeader({required this.child});

  @override
  Widget build(BuildContext context) => child;
}

class _SectionCard extends StatelessWidget {
  final String       title;
  final IconData     icon;
  final List<Widget> children;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, bottom: 6),
            child: Row(
              children: [
                Icon(icon, size: 16,
                    color: ThemeConstants.primaryBlue.withValues(alpha: 0.8)),
                const SizedBox(width: 6),
                Text(
                  title.toUpperCase(),
                  style: TextStyle(
                    fontSize:      11,
                    fontWeight:    FontWeight.w700,
                    letterSpacing: 1.1,
                    color:         Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
          Card(
            margin:      EdgeInsets.zero,
            child: Column(children: children),
          ),
        ],
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;

  const _StatRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodyMedium),
            Text(
              value,
              style: TextStyle(
                fontSize:   14,
                fontWeight: FontWeight.w600,
                color:      ThemeConstants.primaryBlue,
              ),
            ),
          ],
        ),
      );
}

class _FormatDot extends StatelessWidget {
  final bool supported;
  const _FormatDot({required this.supported});

  @override
  Widget build(BuildContext context) => Container(
        width: 10, height: 10,
        decoration: BoxDecoration(
          color:  supported ? Colors.green : Colors.grey.shade400,
          shape:  BoxShape.circle,
        ),
      );
}

