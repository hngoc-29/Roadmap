import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/theme_constants.dart';
import '../../../../core/utils/file_utils.dart';
import '../../../../data/models/file_record.dart';

/// A card displaying a [FileRecord] in the recent files / favorites list.
class RecentFileCard extends StatelessWidget {
  final FileRecord record;
  final VoidCallback onTap;
  final VoidCallback onFavoriteToggle;
  final VoidCallback onRemove;

  const RecentFileCard({
    super.key,
    required this.record,
    required this.onTap,
    required this.onFavoriteToggle,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: ThemeConstants.cardRadius,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              // ── File icon ─────────────────────────────────────────────────
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: ThemeConstants.primaryBlue.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(ThemeConstants.radiusSm),
                ),
                child: const Center(
                  child: Text(
                    'W',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: ThemeConstants.primaryBlue,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // ── Info ──────────────────────────────────────────────────────
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      FileUtils.stemOf(record.name),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Text(
                          _formatDate(record.lastOpenedAt),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        if (record.fileSizeBytes != null) ...[
                          Text(
                            '  ·  ',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          Text(
                            FileUtils.formatSize(record.fileSizeBytes!),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ],
                    ),
                    // Reading progress bar
                    if (record.lastScrollPosition > 0.01) ...[
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: record.lastScrollPosition.clamp(0.0, 1.0),
                          minHeight: 3,
                          backgroundColor: isDark
                              ? const Color(0xFF2A2A2A)
                              : const Color(0xFFE0E0E0),
                          valueColor: const AlwaysStoppedAnimation(
                            ThemeConstants.primaryBlue,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              // ── Actions ───────────────────────────────────────────────────
              IconButton(
                icon: Icon(
                  record.isFavorite ? Icons.star : Icons.star_outline,
                  size: 20,
                  color: record.isFavorite
                      ? const Color(0xFFFFAB00)
                      : Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withValues(alpha: 0.4),
                ),
                onPressed: onFavoriteToggle,
                tooltip: record.isFavorite
                    ? 'Remove from favorites'
                    : 'Add to favorites',
              ),
              PopupMenuButton<_Action>(
                icon: Icon(
                  Icons.more_vert,
                  size: 20,
                  color: Theme.of(context)
                      .colorScheme
                      .onSurface
                      .withValues(alpha: 0.5),
                ),
                itemBuilder: (_) => [
                  PopupMenuItem(
                    value: _Action.open,
                    child: const Row(
                      children: [
                        Icon(Icons.open_in_new, size: 18),
                        SizedBox(width: 10),
                        Text('Open'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: _Action.remove,
                    child: Row(
                      children: [
                        Icon(
                          Icons.delete_outline,
                          size: 18,
                          color: Theme.of(context).colorScheme.error,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Remove from history',
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                onSelected: (action) {
                  if (action == _Action.open) onTap();
                  if (action == _Action.remove) onRemove();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);

    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inHours < 1) return '${diff.inMinutes}m ago';
    if (diff.inDays < 1) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return DateFormat('MMM d, y').format(dt);
  }
}

enum _Action { open, remove }
