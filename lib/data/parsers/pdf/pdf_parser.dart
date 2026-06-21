import '../../../core/errors/app_exception.dart';
import '../../../domain/abstractions/document_format.dart';
import '../../../domain/abstractions/document_parser_interface.dart';
import '../../../domain/abstractions/document_source.dart';
import '../../models/document_model.dart';

/// PDF document parser — Phase 5+ stub.
///
/// This class establishes the parser slot so the registry can return a
/// meaningful error rather than "no parser found".
///
/// Implementation plan (Phase 5+):
///   Add dependency: `pdfx` or `syncfusion_flutter_pdf`
///   Extract text, images, and page structure into [DocumentModel].
///   Render via a dedicated [PdfPageBlock] block type.
class PdfParser extends DocumentParserInterface {
  PdfParser();

  @override
  DocumentFormat get format => DocumentFormat.pdf;

  @override
  Future<DocumentModel> parse(DocumentSource source) async {
    throw const ParseException(
      'PDF viewing is coming in a future release.\n'
      'FormulaDoc currently supports DOCX files.\n\n'
      'Please open the PDF in your device\'s default PDF viewer.',
    );
  }
}
