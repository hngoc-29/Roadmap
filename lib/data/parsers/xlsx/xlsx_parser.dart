import 'dart:typed_data';

import 'package:excel/excel.dart';

import '../../../core/errors/app_exception.dart';
import '../../../domain/abstractions/document_format.dart';
import '../../../domain/abstractions/document_parser_interface.dart';
import '../../../domain/abstractions/document_source.dart';
import '../../models/document_block.dart';
import '../../models/document_metadata.dart';
import '../../models/document_model.dart';

/// XLSX parser — reads worksheets and produces [SpreadsheetBlock]s,
/// one per sheet.
class XlsxParser extends DocumentParserInterface {
  XlsxParser();

  @override
  DocumentFormat get format => DocumentFormat.xlsx;

  @override
  Future<DocumentModel> parse(DocumentSource source) async {
    Uint8List bytes;
    try {
      bytes = await source.readBytes();
    } catch (e) {
      throw ParseException('Cannot read XLSX file: $e');
    }

    Excel workbook;
    try {
      workbook = Excel.decodeBytes(bytes);
    } catch (e) {
      throw ParseException('Cannot parse XLSX: $e');
    }

    if (workbook.tables.isEmpty) {
      throw const ParseException('XLSX file contains no sheets.');
    }

    final blocks    = <DocumentBlock>[];
    final warnings  = <String>[];
    int   blockIdx  = 0;

    for (final sheetName in workbook.tables.keys) {
      final sheet = workbook.tables[sheetName]!;

      if (sheet.rows.isEmpty) {
        warnings.add('Sheet "$sheetName" is empty — skipped.');
        continue;
      }

      // Convert each cell to a display string
      final rows = <List<String?>>[];
      int colCount = 0;

      for (final row in sheet.rows) {
        final cells = row.map((cell) {
          if (cell == null || cell.value == null) return null;
          final v = cell.value;
          return switch (v) {
            TextCellValue()   => v.value,
            IntCellValue()    => v.value.toString(),
            DoubleCellValue() => _formatDouble(v.value),
            BoolCellValue()   => v.value ? 'TRUE' : 'FALSE',
            DateCellValue()   => '${v.year}-${_pad(v.month)}-${_pad(v.day)}',
            DateTimeCellValue() =>
              '${v.year}-${_pad(v.month)}-${_pad(v.day)} '
              '${_pad(v.hour)}:${_pad(v.minute)}',
            FormulaCellValue() => v.formula,
            _ => v.toString(),
          };
        }).toList();

        rows.add(cells);
        if (cells.length > colCount) colCount = cells.length;
      }

      // Trim entirely-empty trailing rows
      while (rows.isNotEmpty && rows.last.every((c) => c == null || c.isEmpty)) {
        rows.removeLast();
      }

      if (rows.isEmpty) {
        warnings.add('Sheet "$sheetName" has no data after trimming.');
        continue;
      }

      blocks.add(SpreadsheetBlock(
        id:        'sheet_${blockIdx++}',
        sheetName: sheetName,
        rows:      rows,
        colCount:  colCount,
      ));
    }

    if (blocks.isEmpty) {
      throw const ParseException('XLSX file has no renderable sheets.');
    }

    return DocumentModel(
      blocks:        blocks,
      metadata: DocumentMetadata(
        title:    source.name ?? 'Spreadsheet',
        modified: DateTime.now(),
      ),
      images:        const {},
      parseWarnings: warnings,
    );
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  static String _formatDouble(double v) {
    if (v == v.truncateToDouble()) return v.truncate().toString();
    // Trim unnecessary trailing zeros
    return v.toStringAsFixed(10).replaceAll(RegExp(r'0+$'), '').replaceAll(RegExp(r'\.$'), '');
  }

  static String _pad(int n) => n.toString().padLeft(2, '0');
}

