import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/constants/theme_constants.dart';

/// Provides [ThemeData] for light and dark modes.
///
/// Academic / scientific aesthetic: deep blue primary, warm paper surfaces,
/// clean typography optimised for reading long-form mathematical content.
class AppTheme {
  AppTheme._();

  // ── Light theme ───────────────────────────────────────────────────────────

  static ThemeData get light {
    const scheme = ColorScheme.light(
      primary: ThemeConstants.primaryBlue,
      onPrimary: Colors.white,
      secondary: ThemeConstants.accentTeal,
      onSecondary: Colors.white,
      surface: ThemeConstants.paperLight,
      onSurface: ThemeConstants.textPrimaryLight,
      surfaceContainerHighest: Color(0xFFEEEEEE),
      error: Color(0xFFC62828),
      onError: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFFF0F2F5),

      // ── AppBar ──────────────────────────────────────────────────────────
      appBarTheme: const AppBarTheme(
        backgroundColor: ThemeConstants.primaryBlue,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
        ),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
        ),
      ),

      // ── Cards ────────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        elevation: ThemeConstants.cardElevation,
        shape: const RoundedRectangleBorder(
          borderRadius: ThemeConstants.cardRadius,
        ),
        color: Colors.white,
        margin: EdgeInsets.zero,
      ),

      // ── Typography ───────────────────────────────────────────────────────
      textTheme: _buildTextTheme(ThemeConstants.textPrimaryLight),

      // ── Inputs ───────────────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ThemeConstants.radiusMd),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ThemeConstants.radiusMd),
          borderSide: const BorderSide(color: Color(0xFFDDDDDD)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ThemeConstants.radiusMd),
          borderSide: const BorderSide(
            color: ThemeConstants.primaryBlue,
            width: 2,
          ),
        ),
        hintStyle: const TextStyle(color: Color(0xFF999999)),
        prefixIconColor: const Color(0xFF666666),
      ),

      // ── FAB ──────────────────────────────────────────────────────────────
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: ThemeConstants.primaryBlue,
        foregroundColor: Colors.white,
        shape: CircleBorder(),
        elevation: 4,
      ),

      // ── Divider ──────────────────────────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE0E0E0),
        thickness: 1,
        space: 1,
      ),

      // ── Chip ─────────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFFE3F2FD),
        labelStyle: const TextStyle(
          color: ThemeConstants.primaryBlue,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ThemeConstants.radiusSm),
        ),
      ),
    );
  }

  // ── Dark theme ────────────────────────────────────────────────────────────

  static ThemeData get dark {
    const scheme = ColorScheme.dark(
      primary: ThemeConstants.primaryBlueLight,
      onPrimary: Colors.white,
      secondary: ThemeConstants.accentTeal,
      onSecondary: Colors.white,
      surface: ThemeConstants.paperDark,
      onSurface: ThemeConstants.textPrimaryDark,
      surfaceContainerHighest: ThemeConstants.surfaceDark,
      error: Color(0xFFEF9A9A),
      onError: Color(0xFF1A1A1A),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFF121212),

      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1A2340),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
        ),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
        ),
      ),

      cardTheme: CardThemeData(
        elevation: 2,
        shape: const RoundedRectangleBorder(
          borderRadius: ThemeConstants.cardRadius,
        ),
        color: ThemeConstants.paperDark,
        margin: EdgeInsets.zero,
      ),

      textTheme: _buildTextTheme(ThemeConstants.textPrimaryDark),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ThemeConstants.surfaceDark,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ThemeConstants.radiusMd),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ThemeConstants.radiusMd),
          borderSide: const BorderSide(color: Color(0xFF3A3A3A)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ThemeConstants.radiusMd),
          borderSide: const BorderSide(
            color: ThemeConstants.primaryBlueLight,
            width: 2,
          ),
        ),
        hintStyle: const TextStyle(color: Color(0xFF666666)),
        prefixIconColor: const Color(0xFF888888),
      ),

      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: ThemeConstants.primaryBlueLight,
        foregroundColor: Colors.white,
        shape: CircleBorder(),
        elevation: 4,
      ),

      dividerTheme: const DividerThemeData(
        color: Color(0xFF2A2A2A),
        thickness: 1,
        space: 1,
      ),
    );
  }

  // ── Shared typography ─────────────────────────────────────────────────────

  static TextTheme _buildTextTheme(Color base) {
    return TextTheme(
      displayLarge: TextStyle(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: base,
        letterSpacing: -0.5,
      ),
      displayMedium: TextStyle(
        fontSize: 26,
        fontWeight: FontWeight.w700,
        color: base,
      ),
      titleLarge: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: base,
      ),
      titleMedium: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: base,
      ),
      titleSmall: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: base,
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        height: 1.6,
        color: base,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        height: 1.5,
        color: base,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        color: base.withValues(alpha: 0.7),
      ),
      labelLarge: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: base,
      ),
    );
  }
}
