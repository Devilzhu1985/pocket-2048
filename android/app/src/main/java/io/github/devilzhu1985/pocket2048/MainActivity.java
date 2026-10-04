package io.github.devilzhu1985.pocket2048;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import androidx.webkit.WebViewAssetLoader;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String RELEASE_API = "https://api.github.com/repos/Devilzhu1985/pocket-2048/releases/latest";
    private static final String DOWNLOAD_PREFIX = "https://github.com/Devilzhu1985/pocket-2048/releases/download/";
    private WebView webView;
    private final ExecutorService network = Executors.newSingleThreadExecutor();
    private boolean checking;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FrameLayout frame = new FrameLayout(this);
        frame.setBackgroundColor(Color.rgb(242, 247, 255));
        frame.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(242, 247, 255));
        frame.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(frame);
        frame.requestApplyInsets();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        WebViewAssetLoader assets = new WebViewAssetLoader.Builder().addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = assets.shouldInterceptRequest(request.getUrl());
                if (response != null) {
                    response.setResponseHeaders(Collections.singletonMap("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'"));
                    return response;
                }
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("pocket2048".equals(uri.getScheme()) && "update".equals(uri.getHost()) && request.isForMainFrame()) {
                    checkForUpdates();
                    return true;
                }
                return !("https".equals(uri.getScheme()) && HOST.equals(uri.getHost()) && uri.getPath() != null && uri.getPath().startsWith("/assets/"));
            }
        });
        webView.loadUrl("https://" + HOST + "/assets/index.html");
    }

    private void updateStatus(String message) {
        if (isFinishing() || isDestroyed()) return;
        webView.evaluateJavascript("document.getElementById('update-status').textContent=" + JSONObject.quote(message), null);
    }

    private void checkForUpdates() {
        if (checking) return;
        checking = true;
        updateStatus("Checking for a new Android version...");
        network.execute(() -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(RELEASE_API).openConnection();
                connection.setConnectTimeout(10000); connection.setReadTimeout(10000);
                connection.setRequestProperty("Accept", "application/vnd.github+json");
                connection.setRequestProperty("User-Agent", "Pocket2048-Android/" + BuildConfig.VERSION_NAME);
                int status = connection.getResponseCode();
                if (status == 404) { showResult("You have the latest available Android version."); return; }
                if (status != 200) throw new IllegalStateException("Update check unavailable");
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                try (InputStream input = connection.getInputStream()) {
                    byte[] buffer = new byte[4096]; int count;
                    while ((count = input.read(buffer)) != -1) {
                        if (bytes.size() + count > 1048576) throw new IllegalStateException("Response too large");
                        bytes.write(buffer, 0, count);
                    }
                }
                JSONObject release = new JSONObject(bytes.toString(StandardCharsets.UTF_8.name()));
                Matcher version = Pattern.compile("^android-v(\\d{1,3})\\.(\\d{1,2})\\.(\\d{1,2})$").matcher(release.getString("tag_name"));
                if (!version.matches()) throw new IllegalStateException("Unrecognized release");
                int latest = Integer.parseInt(version.group(1)) * 10000 + Integer.parseInt(version.group(2)) * 100 + Integer.parseInt(version.group(3));
                if (latest <= BuildConfig.VERSION_CODE) { showResult("You're up to date! Android v" + BuildConfig.VERSION_NAME); return; }
                String download = null;
                JSONArray list = release.getJSONArray("assets");
                for (int i = 0; i < list.length(); i++) {
                    JSONObject asset = list.getJSONObject(i);
                    if ("Pocket-2048.apk".equals(asset.getString("name"))) {
                        String candidate = asset.getString("browser_download_url");
                        if (candidate.startsWith(DOWNLOAD_PREFIX) && candidate.endsWith("/Pocket-2048.apk")) download = candidate;
                    }
                }
                if (download == null) throw new IllegalStateException("APK not yet ready");
                final String apk = download;
                final String versionName = version.group(1) + "." + version.group(2) + "." + version.group(3);
                runOnUiThread(() -> {
                    checking = false;
                    if (isFinishing() || isDestroyed()) return;
                    updateStatus("Android v" + versionName + " is ready to download.");
                    new AlertDialog.Builder(this).setTitle("Update Pocket 2048?")
                        .setMessage("Download version " + versionName + ", then open the APK and choose Update. Your saved game stays on this phone.")
                        .setNegativeButton("Later", null)
                        .setPositiveButton("Download APK", (dialog, which) -> {
                            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(apk))); }
                            catch (Exception e) { updateStatus("Open the Pocket 2048 GitHub releases page in your browser to download the update."); }
                        }).show();
                });
            } catch (Exception e) { showResult("Couldn't check for updates. Connect to Wi-Fi or mobile data and try again. Your game is safe."); }
            finally { if (connection != null) connection.disconnect(); }
        });
    }
    private void showResult(String message) {
        runOnUiThread(() -> { checking = false; updateStatus(message); });
    }
    @Override protected void onPause() { webView.onPause(); super.onPause(); }
    @Override protected void onResume() { super.onResume(); if (webView != null) webView.onResume(); }
    @Override protected void onDestroy() { network.shutdownNow(); webView.destroy(); super.onDestroy(); }
}
