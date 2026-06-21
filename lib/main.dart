import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/constants/app_constants.dart';
import 'data/parsers/parser_registry.dart';
import 'presentation/providers/document_provider.dart';
import 'presentation/providers/service_providers.dart';
import 'presentation/screens/home/home_screen.dart';
import 'presentation/screens/viewer/viewer_screen.dart';
import 'presentation/theme/app_theme.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Phase 5: register all format parsers before the app starts
  DocumentParserRegistry.instance.registerDefaults();

  runApp(
    const ProviderScope(
      child: FormulaDocApp(),
    ),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

class FormulaDocApp extends ConsumerStatefulWidget {
  const FormulaDocApp({super.key});

  @override
  ConsumerState<FormulaDocApp> createState() => _FormulaDocAppState();
}

class _FormulaDocAppState extends ConsumerState<FormulaDocApp> {
  final _navigatorKey = GlobalKey<NavigatorState>();
  StreamSubscription<String>? _intentSub;
  bool _handlerReady = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initIntentHandler());
  }

  @override
  void dispose() {
    _intentSub?.cancel();
    super.dispose();
  }

  // ── Intent / "Open with" handling ─────────────────────────────────────────

  Future<void> _initIntentHandler() async {
    if (_handlerReady) return;
    _handlerReady = true;

    try {
      final handler = ref.read(intentHandlerProvider);
      await handler.initialize();

      _intentSub = handler.fileStream.listen(
        _handleIncomingFile,
        onError: (Object e) =>
            debugPrint('[FormulaDocApp] Intent stream error: $e'),
      );
    } catch (e) {
      debugPrint('[FormulaDocApp] Intent handler init failed: $e');
    }
  }

  void _handleIncomingFile(String path) {
    if (path.isEmpty) return;
    final navigator = _navigatorKey.currentState;
    if (navigator == null) return;

    ref.read(documentNotifierProvider.notifier).openFromPath(path);

    navigator.pushAndRemoveUntil(
      MaterialPageRoute<void>(builder: (_) => const ViewerScreen()),
      (route) => route.isFirst,
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title:                    AppConstants.appName,
      navigatorKey:             _navigatorKey,
      debugShowCheckedModeBanner: false,
      theme:      AppTheme.light,
      darkTheme:  AppTheme.dark,
      themeMode:  ThemeMode.system,
      home:       const HomeScreen(),
    );
  }
}
