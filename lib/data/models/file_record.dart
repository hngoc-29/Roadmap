/// A single entry in the document history / recent-files list.
///
/// Serialized to JSON and stored in SharedPreferences under
/// [AppConstants.historyPrefsKey].
class FileRecord {
  final String id;

  /// Absolute path on the device. May become stale if the user moves the file.
  final String path;

  /// Display name (usually the file's base name with extension).
  final String name;

  /// When the document was last opened.
  final DateTime lastOpenedAt;

  /// Fractional scroll position (0.0 = top, 1.0 = bottom) for resume reading.
  final double lastScrollPosition;

  /// Whether the user has starred this document.
  final bool isFavorite;

  /// File size in bytes at the time of last open.  Null = unknown.
  final int? fileSizeBytes;

  const FileRecord({
    required this.id,
    required this.path,
    required this.name,
    required this.lastOpenedAt,
    this.lastScrollPosition = 0.0,
    this.isFavorite = false,
    this.fileSizeBytes,
  });

  FileRecord copyWith({
    String? id,
    String? path,
    String? name,
    DateTime? lastOpenedAt,
    double? lastScrollPosition,
    bool? isFavorite,
    int? fileSizeBytes,
  }) {
    return FileRecord(
      id: id ?? this.id,
      path: path ?? this.path,
      name: name ?? this.name,
      lastOpenedAt: lastOpenedAt ?? this.lastOpenedAt,
      lastScrollPosition: lastScrollPosition ?? this.lastScrollPosition,
      isFavorite: isFavorite ?? this.isFavorite,
      fileSizeBytes: fileSizeBytes ?? this.fileSizeBytes,
    );
  }

  // ── JSON serialization ───────────────────────────────────────────────────

  Map<String, dynamic> toJson() => {
        'id': id,
        'path': path,
        'name': name,
        'lastOpenedAt': lastOpenedAt.toIso8601String(),
        'lastScrollPosition': lastScrollPosition,
        'isFavorite': isFavorite,
        'fileSizeBytes': fileSizeBytes,
      };

  factory FileRecord.fromJson(Map<String, dynamic> json) => FileRecord(
        id: json['id'] as String,
        path: json['path'] as String,
        name: json['name'] as String,
        lastOpenedAt: DateTime.parse(json['lastOpenedAt'] as String),
        lastScrollPosition:
            (json['lastScrollPosition'] as num?)?.toDouble() ?? 0.0,
        isFavorite: json['isFavorite'] as bool? ?? false,
        fileSizeBytes: json['fileSizeBytes'] as int?,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is FileRecord && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'FileRecord(name: $name, id: $id)';
}
