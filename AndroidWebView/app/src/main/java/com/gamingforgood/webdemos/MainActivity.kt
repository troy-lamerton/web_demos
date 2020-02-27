package com.gamingforgood.webdemos

import android.annotation.SuppressLint
import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.Toast
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        WebView.setWebContentsDebuggingEnabled(true)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // play videos
        @SuppressLint("SetJavaScriptEnabled")
        webview.settings.javaScriptEnabled = true
        webview.webChromeClient = WebChromeClient()
        webview.settings.mediaPlaybackRequiresUserGesture = false

        // accept calls from js code
        webview.addJavascriptInterface(WebAppInterface(this), "cosAudioAndroid")

        // demo page
        webview.loadUrl("http://80.153.114.230:9966/")
    }

    /** Instantiate the interface and set the context  */
    class WebAppInterface(private val mContext: Context) {

        private var charsTotal = 0
        private var startedAt: Long? = null
        private var nextLog = 1000

        /** Show a toast from the web page  */
        @JavascriptInterface
        fun showToast(toast: String) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
        }

        /** Show a toast from the web page  */
        @JavascriptInterface
        fun giveAudio(floats: String) {
            if (startedAt == null) startedAt = SystemClock.uptimeMillis()

            // TODO: write most optimal code to split string at commas ',' and create floats
            //  https://stackoverflow.com/a/19356088
            // remove the [brackets] from json string ends
            val csvFloats = floats.subSequence(1, floats.lastIndex - 1)
            charsTotal += csvFloats.length
            val buffer = csvFloats.split(',')
                .map { it.toFloat() }

            if (charsTotal > nextLog) {
                Log.i(TAG, "giveAudio kt got: ${buffer[0]}, ${buffer[1]}, ${buffer[2]}")
                val timeSince = (SystemClock.uptimeMillis() - startedAt!!) / 1000f
                Log.i(TAG, "giveAudio stats: ${charsTotal/1000f / timeSince} kchar/sec  $charsTotal chars, $timeSince sec")
                nextLog = charsTotal + 24000
            }
        }
        val TAG = "WebCosAudio"
    }

}
