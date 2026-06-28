import 'dart:io';

import 'package:path/path.dart' as p;
import 'package:collection/collection.dart';

import '../core/utils/logger.dart';
import '../data/models/file_record.dart';
import '../data/repositories/history_repository.dart';

/// Business logic for the file history / recents system.
///
/// Sits between [HistoryRepository] (raw persistence) and
/// [HistoryNotifier] (Riverpod state).
class HistoryService {
  final HistoryRepository _repository;

  const HistoryService(this._repository);

  // ── Queries ───────────────────────────────────────────────────────────────

  Future<List<FileRecord>> getAll() => _repository.loadAll();

  Future<List<FileRecord>> getRecent({int limit = 20}) async {
    final all = await _repository.loadAll();
    // We intentionally do NOT filter by _fileExists here.
    // Files opened via "Open With" are stored in a temp cache that is still
    // accessible during the session that wrote the record, but the path may
    // not survive between sessions on some devices.  Removing the existence
    // check keeps PDF / XLSX intent entries visible in history; a "File not
    // found" error is shown when the user taps a stale entry.
    return all.take(limit).toList();
  }

  Future<List<FileRecord>> getFavorites() async {
    final all = await _repository.loadAll();
    return all.where((r) => r.isFavorite).toList();
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  /// Records that the document at [path] was opened, returning the record.
  Future<FileRecord> recordOpen(String path) async {
    final all = await _repository.loadAll();
    final existing = all.where((r) => r.path == path).firstOrNull;

    late FileRecord record;
    if (existing != null) {
      record = existing.copyWith(lastOpenedAt: DateTime.now());
    } else {
      final size = _sizeOf(path);
      record = FileRecord(
        id: _generateId(path),
        path: path,
        name: p.basename(path),
        lastOpenedAt: DateTime.now(),
        fileSizeBytes: size,
      );
    }

    await _repository.upsert(record);
    AppLogger.debug('Recorded open: ${record.name}', tag: 'HistoryService');
    return record;
  }

  /// Saves the reading scroll [position] for a document.
  Future<void> saveScrollPosition(String fileId, double position) async {
    final all = await _repository.loadAll();
    final idx = all.indexWhere((r) => r.id == fileId);
    if (idx == -1) return;
    final updated = all[idx].copyWith(lastScrollPosition: position);
    await _repository.upsert(updated);
  }

  /// Toggles the favorite status for the file with [fileId].
  Future<FileRecord?> toggleFavorite(String fileId) async {
    final all = await _repository.loadAll();
    final idx = all.indexWhere((r) => r.id == fileId);
    if (idx == -1) return null;
    final toggled = all[idx].copyWith(isFavorite: !all[idx].isFavorite);
    await _repository.upsert(toggled);
    return toggled;
  }

  /// Removes a document from history.
  Future<void> remove(String fileId) => _repository.remove(fileId);

  /// Clears all history.
  Future<void> clearAll() => _repository.clearAll();

  // ── Helpers ───────────────────────────────────────────────────────────────

  bool _fileExists(String path) {
    try {
      return File(path).existsSync();
    } catch (_) {
      return false;
    }
  }

  int? _sizeOf(String path) {
    try {
      return File(path).lengthSync();
    } catch (_) {
      return null;
    }
  }

  /// Generates a stable ID from the file path (consistent across reopens).
  String _generateId(String path) {
    return 'rec_${path.hashCode.abs()}';
  }
}
