import '../../../core/errors/app_exception.dart';
import '../../../domain/abstractions/document_format.dart';
import '../../../domain/abstractions/document_parser_interface.dart';
import '../../../domain/abstractions/document_source.dart';
import '../../models/document_model.dart';

/// Excel XLSX parser — Phase 5+ stub.
///
/// XLSX is a ZIP archive. Implementation plan:
///   Parse `xl/worksheets/sheet*.xml` for cell data.
///   Map worksheets to [SpreadsheetBlock] with scrollable grid renderer.
///   Support formulas display (read-only, no calculation engine).
class XlsxParser extends DocumentParserInterface {
  XlsxParser();

  @override
  DocumentFormat get format => DocumentFormat.xlsx;

  @override
  Future<DocumentModel> parse(DocumentSource source) async {
    throw const ParseException(
      'Excel (.xlsx) viewing is planned for a future release.\n'
      'FormulaDoc currently supports DOCX files.',
    );
  }
}
