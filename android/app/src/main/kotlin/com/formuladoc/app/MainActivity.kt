package com.formuladoc.app

import io.flutter.embedding.android.FlutterActivity

/**
 * Single entry point activity using Flutter's Android v2 embedding.
 *
 * Deliberately minimal: all app logic lives in Dart. This class exists only
 * because Android requires a native Activity as the launch target, and the
 * platform intent filters declared in AndroidManifest.xml (for "Open with")
 * route here on cold start.
 */
class MainActivity : FlutterActivity()
