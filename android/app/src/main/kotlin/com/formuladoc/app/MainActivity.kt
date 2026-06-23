package com.formuladoc.app

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/**
 * Single entry point activity using Flutter's Android v2 embedding.
 *
 * Exposes a MethodChannel `formuladoc/wmf` so the Dart layer can request
 * WMF-to-PNG conversion for legacy Equation Editor 3.x / MathType objects
 * embedded in DOCX files.
 */
class MainActivity : FlutterActivity() {

    private val CHANNEL = "formuladoc/wmf"
    private val renderer = WmfRenderer()

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "renderWmf" -> {
                        val wmfBytes = call.arguments as? ByteArray
                        if (wmfBytes == null) {
                            result.error("INVALID_ARG", "Expected ByteArray argument", null)
                            return@setMethodCallHandler
                        }
                        // Run on background thread to avoid blocking the UI
                        Thread {
                            try {
                                val png = renderer.render(wmfBytes)
                                runOnUiThread {
                                    if (png != null) result.success(png)
                                    else result.error("RENDER_FAILED", "WMF render returned null", null)
                                }
                            } catch (e: Exception) {
                                runOnUiThread {
                                    result.error("RENDER_ERROR", e.message, null)
                                }
                            }
                        }.start()
                    }
                    else -> result.notImplemented()
                }
            }
    }
}

