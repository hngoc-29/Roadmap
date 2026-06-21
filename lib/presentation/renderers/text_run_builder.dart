import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import '../../data/models/document_block.dart';
import '../../data/models/search_result.dart';

/// Converts [TextRun] lists into Flutter [InlineSpan] children.
///
/// Phase 2: hyperlink runs are tappable via [TapGestureRecognizer].
/// Phase 4: character ranges in [highlights] are rendered with coloured
///          backgrounds (yellow = match, orange = current match).
class TextRunBuilder {
  TextRunBuilder._();

  // ── Main entry points ─────────────────────────────────────────────────────

  static List<InlineSpan> buildSpans(
    List<TextRun> runs,
    BuildContext context, {
    TextStyle?               defaultStyle,
    void Function(String url)? onLinkTap,
  }) =>
      buildSpansWithHighlights(
        runs,
        context,
        const [],
        defaultStyle: defaultStyle,
        onLinkTap:    onLinkTap,
      );

  /// Phase 4: builds spans with optional character-level highlights.
  ///
  /// [highlights] are [SearchHighlight] objects whose offsets refer to the
  /// **concatenated flat text** of all runs (`runs.map(r=>r.text).join()`).
  static List<InlineSpan> buildSpansWithHighlights(
    List<TextRun>         runs,
    BuildContext          context,
    List<SearchHighlight> highlights, {
    TextStyle?               defaultStyle,
    void Function(String url)? onLinkTap,
  }) {
    final baseColor    = Theme.of(context).colorScheme.onSurface;
    final baseFontSize = defaultStyle?.fontSize ?? 16.0;
    final spans        = <InlineSpan>[];
    int   charOffset   = 0; // running position through all runs

    for (final run in runs) {
      final runEnd = charOffset + run.text.length;

      // Highlights that overlap this run
      final overlapping = highlights
          .where((h) => h.charEnd > charOffset && h.charStart < runEnd)
          .toList();

      if (overlapping.isEmpty) {
        spans.add(_singleSpan(
          run,
          baseColor:    baseColor,
          baseFontSize: baseFontSize,
          onLinkTap:    onLinkTap,
        ));
      } else {
        spans.addAll(_highlightedSpans(
          run,
          runStart:     charOffset,
          highlights:   overlapping,
          baseColor:    baseColor,
          baseFontSize: baseFontSize,
          onLinkTap:    onLinkTap,
        ));
      }

      charOffset = runEnd;
    }

    return spans;
  }

  // ── Single span (no highlights) ───────────────────────────────────────────

  static InlineSpan _singleSpan(
    TextRun run, {
    required Color  baseColor,
    required double baseFontSize,
    void Function(String url)? onLinkTap,
  }) {
    final style = _buildStyle(run.style, baseColor, baseFontSize);

    if (run.style.superscript || run.style.subscript) {
      return _scriptSpan(run, style, run.style.fontSizePt ?? baseFontSize);
    }

    if (run.isHyperlink && onLinkTap != null) {
      return TextSpan(
        text:       run.text,
        style:      style.copyWith(decoration: TextDecoration.underline),
        recognizer: TapGestureRecognizer()..onTap = () => onLinkTap(run.url!),
      );
    }

    return TextSpan(text: run.text, style: style);
  }

  // ── Spans split at highlight boundaries ───────────────────────────────────

  static List<InlineSpan> _highlightedSpans(
    TextRun               run, {
    required int                  runStart,
    required List<SearchHighlight> highlights,
    required Color                baseColor,
    required double               baseFontSize,
    void Function(String url)?    onLinkTap,
  }) {
    final text   = run.text;
    final base   = _buildStyle(run.style, baseColor, baseFontSize);
    final result = <InlineSpan>[];

    // Convert to run-local offsets and sort
    final segs = highlights
        .map((h) => (
              start:     (h.charStart - runStart).clamp(0, text.length),
              end:       (h.charEnd   - runStart).clamp(0, text.length),
              isCurrent: h.isCurrent,
            ))
        .where((s) => s.start < s.end)
        .toList()
      ..sort((a, b) => a.start.compareTo(b.start));

    int pos = 0;
    for (final seg in segs) {
      // Normal text before highlight
      if (pos < seg.start) {
        result.add(TextSpan(
          text:  text.substring(pos, seg.start),
          style: base,
        ));
      }
      // Highlighted text
      result.add(TextSpan(
        text:  text.substring(seg.start, seg.end),
        style: base.copyWith(
          backgroundColor: seg.isCurrent
              ? const Color(0xFFFF9800)  // orange  = current
              : const Color(0xFFFFEB3B), // yellow  = other match
          color: Colors.black87,
        ),
      ));
      pos = seg.end;
    }
    // Remaining text
    if (pos < text.length) {
      result.add(TextSpan(text: text.substring(pos), style: base));
    }

    return result;
  }

  // ── Script span (super/sub) ────────────────────────────────────────────────

  static WidgetSpan _scriptSpan(TextRun run, TextStyle base, double fontSize) {
    final s      = run.style;
    final small  = fontSize * 0.65;
    final offset = s.superscript ? -(fontSize * 0.35) : (fontSize * 0.15);
    return WidgetSpan(
      alignment: PlaceholderAlignment.baseline,
      baseline:  TextBaseline.alphabetic,
      child:     Transform.translate(
        offset: Offset(0, offset),
        child:  Text(run.text, style: base.copyWith(fontSize: small)),
      ),
    );
  }

  // ── TextStyle builder ─────────────────────────────────────────────────────

  static TextStyle _buildStyle(
    TextRunStyle style,
    Color        baseColor,
    double       baseFontSize,
  ) {
    final color    = style.colorArgb != null ? Color(style.colorArgb!) : baseColor;
    final hlt      = style.highlightArgb != null ? Color(style.highlightArgb!) : null;
    final fontSize = style.fontSizePt != null
        ? (style.fontSizePt! * 1.333).clamp(8.0, 72.0)
        : baseFontSize;

    return TextStyle(
      fontWeight:      style.bold      ? FontWeight.bold   : FontWeight.normal,
      fontStyle:       style.italic    ? FontStyle.italic  : FontStyle.normal,
      decoration:      _decoration(style),
      decorationColor: color,
      fontSize:        fontSize,
      color:           color,
      backgroundColor: hlt,
      fontFamily:      style.fontFamily,
      height:          1.4,
    );
  }

  static TextDecoration _decoration(TextRunStyle s) {
    if (!s.underline && !s.strikethrough) return TextDecoration.none;
    if (s.underline && s.strikethrough) {
      return TextDecoration.combine(
          [TextDecoration.underline, TextDecoration.lineThrough]);
    }
    return s.underline ? TextDecoration.underline : TextDecoration.lineThrough;
  }
}
