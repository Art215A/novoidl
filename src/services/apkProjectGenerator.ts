import JSZip from 'jszip';

export interface AndroidProjectConfig {
  appName: string;
  packageName: string;
  targetUrl: string;
  enableWakeLock: boolean;
  enableForegroundService: boolean;
  enableAudioBypass: boolean;
}

export const defaultAndroidConfig: AndroidProjectConfig = {
  appName: 'PokeIdle Runner',
  packageName: 'io.pokeidle.runner',
  targetUrl: 'https://pokeidle.io/app',
  enableWakeLock: true,
  enableForegroundService: true,
  enableAudioBypass: true,
};

export function generateAndroidManifest(config: AndroidProjectConfig): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

    <!-- Permissões essenciais para rodar em segundo plano -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_MULTICAST_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${config.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:largeHeap="true"
        android:theme="@style/Theme.PokeIdleRunner">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Serviço de primeiro plano que impede o Android de suspender o jogo -->
        <service
            android:name=".PokeIdleBackgroundService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse" />

    </application>
</manifest>`;
}

export function generateMainActivity(config: AndroidProjectConfig): string {
  return `package ${config.packageName}

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity

/**
 * MainActivity configurada especificamente para o PokeIdle.io
 * Mantém o WebView ativo sem pausar timers JavaScript ao minimizar!
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Mantém a tela ligada se configurado
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Inicia o Serviço de Primeiro Plano com notificação persistente
        startBackgroundService()

        // Solicita desativação de economia de bateria (para não ser encerrado pelo Android)
        requestIgnoreBatteryOptimizations()

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        setupTopControlBar()
        setupWebView()

        if (savedInstanceState == null) {
            webView.loadUrl("${config.targetUrl}")
        }
    }

    private fun setupTopControlBar() {
        val topBar = findViewById<View?>(R.id.topControlBar)
        val btnCollapse = findViewById<View?>(R.id.btnCollapseBar)
        val btnExpand = findViewById<View?>(R.id.btnExpandBar)
        val btnWake = findViewById<android.widget.Button?>(R.id.btnWakeToggle)
        val btnOled = findViewById<android.widget.Button?>(R.id.btnOledMode)

        btnCollapse?.setOnClickListener {
            topBar?.visibility = View.GONE
            btnExpand?.visibility = View.VISIBLE
        }

        btnExpand?.setOnClickListener {
            topBar?.visibility = View.VISIBLE
            btnExpand?.visibility = View.GONE
        }

        var isWakeOn = true
        btnWake?.setOnClickListener {
            isWakeOn = !isWakeOn
            if (isWakeOn) {
                window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                btnWake.text = "WakeLock: ON"
            } else {
                window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                btnWake.text = "WakeLock: OFF"
            }
        }

        btnOled?.setOnClickListener {
            // Ativa modo tela preta OLED para economizar 90% de bateria
            val oledScript = "let o=document.getElementById('p-oled');if(o){o.remove();}else{o=document.createElement('div');o.id='p-oled';o.style='position:fixed;inset:0;background:#000;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#666;font-family:sans-serif;font-size:13px;';o.innerHTML='<p>MODO OLED ATIVO</p><p style=\"font-size:11px;\">Toque duas vezes para desbloquear</p>';o.ondblclick=()=>o.remove();document.body.appendChild(o);}"
            webView.evaluateJavascript(oledScript, null)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(true)
        settings.builtInZoomControls = true
        settings.displayZoomControls = false
        settings.allowFileAccess = true
        settings.allowContentAccess = true

        // Permite reprodução de áudio sem interação manual (crucial para keep-alive)
        settings.mediaPlaybackRequiresUserGesture = false

        // User Agent mobile idêntico ao Chrome oficial para evitar erro 403 disallowed_useragent do Google
        val baseUa = settings.userAgentString
        settings.userAgentString = baseUa.replace("; wv", "").replace(Regex("Version/[0-9.]+ "), "")
        settings.javaScriptCanOpenWindowsAutomatically = true
        settings.setSupportMultipleWindows(true)

        // Habilita cookies persistentes e de terceiros para autenticação
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // Desativa a rolagem elástica e o gesto nativo de 'pull-to-refresh' que recarrega a tela acidentalmente
        webView.overScrollMode = View.OVER_SCROLL_NEVER

        // Inicia pulso de batimento nativo do Android a cada 15 segundos (impede queda do servidor de 60s)
        val heartbeatHandler = Handler(Looper.getMainLooper())
        val heartbeatRunnable = object : Runnable {
            override fun run() {
                try {
                    val pulse = "if (window.__pokeidle_pulse) { window.__pokeidle_pulse(); }"
                    webView.evaluateJavascript(pulse, null)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                heartbeatHandler.postDelayed(this, 15000)
            }
        }
        heartbeatHandler.postDelayed(heartbeatRunnable, 15000)

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                
                // Injeta scripts: 1) Anti-Pausa, 2) Anti-Recarregar, 3) Anti-AFK Heartbeat WebSocket
                val injectedScript = """
                    (function() {
                        // 1. Mascara a visibilidade da aba para o jogo achar que a tela está sempre em foco
                        try {
                            Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
                            Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
                            document.hasFocus = () => true;
                        } catch(e) {}

                        // 2. Intercepta a criação do WebSocket do PokeIdle para ter o canal de keepalive
                        if (!window.__pokeidle_ws_hooked) {
                            window.__pokeidle_ws_hooked = true;
                            const OrigWS = window.WebSocket;
                            window.WebSocket = function(...args) {
                                const ws = new OrigWS(...args);
                                window.__pokeidle_ws = ws;
                                return ws;
                            };
                            window.WebSocket.prototype = OrigWS.prototype;
                        }

                        // 3. Função de pulso Anti-Inatividade: envia ping a cada 15s para não cair no limite de 60s
                        window.__pokeidle_pulse = function() {
                            try {
                                if (window.__pokeidle_ws && window.__pokeidle_ws.readyState === 1) {
                                    window.__pokeidle_ws.send(JSON.stringify({ t: 'ping' }));
                                }
                                document.dispatchEvent(new Event('mousemove', { bubbles: true }));
                                window.dispatchEvent(new Event('focus', { bubbles: true }));
                            } catch(e) {}
                        };

                        // 4. Desativa o gesto nativo de 'pull-to-refresh'
                        if (!document.getElementById('pokeidle-anti-refresh-style')) {
                            const style = document.createElement('style');
                            style.id = 'pokeidle-anti-refresh-style';
                            style.innerHTML = 'html, body, div { overscroll-behavior: none !important; overscroll-behavior-y: none !important; }';
                            document.head.appendChild(style);
                        }

                        // Inicia o pulso interno também via JS
                        setInterval(window.__pokeidle_pulse, 15000);

                        console.log('[PokeIdleRunner] Anti-AFK Heartbeat e Anti-Pausa ativos 24/7!');
                    })();
                """.trimIndent()
                view?.evaluateJavascript(injectedScript, null)
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                // Abre links externos (Discord, etc) ou mantém dentro
                if (url.startsWith("https://pokeidle.io") || url.contains("google.com") || url.contains("discord.com") || url.contains("cloudflare")) {
                    return false
                }
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
                return true
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }
        }
    }

    private fun startBackgroundService() {
        val serviceIntent = Intent(this, PokeIdleBackgroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }

    private fun requestIgnoreBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    /**
     * CRUCIAL:
     * Por padrão, o Android chama webView.onPause() e suspende os timers de JS.
     * Nós sobrescrevemos onPause e onStop para NÃO pausar o WebView nem os timers,
     * permitindo que o jogo continue progredindo mesmo minimizado!
     */
    override fun onPause() {
        super.onPause()
        // NÃO chamamos webView.onPause() propositalmente!
        // webView.resumeTimers() garante que o relógio continue batendo
        webView.resumeTimers()
    }

    override fun onStop() {
        super.onStop()
        // Mantém timers ativos
        webView.resumeTimers()
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            // Em vez de fechar, minimiza para a tela inicial mantendo o jogo rodando
            moveTaskToBack(true)
        }
    }
}
`;
}

export function generateForegroundService(config: AndroidProjectConfig): string {
  return `package ${config.packageName}

import android.app.*
import android.content.Context
import android.content.Intent
import android.net.wifi.WifiManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

/**
 * Foreground Service que previne o Android de suspender o app e matar a CPU ou o Wi-Fi
 */
class PokeIdleBackgroundService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null
    private var wifiLock: WifiManager.WifiLock? = null
    private val CHANNEL_ID = "PokeIdleBackgroundChannel"
    private val NOTIFICATION_ID = 1001

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        // Adquire WakeLock parcial de CPU
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "PokeIdleRunner::BackgroundExecutionLock"
        ).apply {
            setReferenceCounted(false)
            acquire()
        }

        // Adquire WifiLock de alta performance para o WebSocket não cair em standby
        try {
            val wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
            wifiLock = wifiManager.createWifiLock(
                WifiManager.WIFI_MODE_FULL_HIGH_PERF,
                "PokeIdleRunner::WifiLock"
            ).apply {
                setReferenceCounted(false)
                acquire()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val notification = createNotification()
        startForeground(NOTIFICATION_ID, notification)
    }

    private fun createNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("${config.appName} Ativo em 2º Plano")
            .setContentText("O PokeIdle continua rodando, farmando e coletando sem pausar.")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "PokeIdle Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Canal de execução contínua em segundo plano do PokeIdle"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(serviceChannel)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
        wifiLock?.let {
            if (it.isHeld) it.release()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
`;
}

export function generateLayoutXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#020617">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:layout_alignParentTop="true"
        android:indeterminate="false"
        android:max="100"
        android:progress="0"
        android:visibility="gone"
        android:elevation="12dp" />

    <!-- Barra de Controle Fixa no Topo do Jogo (Nunca Some) -->
    <LinearLayout
        android:id="@+id/topControlBar"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:background="#E60F172A"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:paddingStart="12dp"
        android:paddingEnd="12dp"
        android:paddingTop="6dp"
        android:paddingBottom="6dp"
        android:elevation="10dp">

        <TextView
            android:id="@+id/tvAppTitle"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="⚡ PokeIdle Runner (24/7)"
            android:textColor="#38BDF8"
            android:textSize="12sp"
            android:textStyle="bold" />

        <Button
            android:id="@+id/btnWakeToggle"
            android:layout_width="wrap_content"
            android:layout_height="32dp"
            android:text="WakeLock: ON"
            android:textSize="10sp"
            android:background="#0284C7"
            android:textColor="#FFFFFF"
            android:paddingStart="8dp"
            android:paddingEnd="8dp"
            android:layout_marginEnd="6dp" />

        <Button
            android:id="@+id/btnOledMode"
            android:layout_width="wrap_content"
            android:layout_height="32dp"
            android:text="🌙 OLED"
            android:textSize="10sp"
            android:background="#B45309"
            android:textColor="#FFFFFF"
            android:paddingStart="8dp"
            android:paddingEnd="8dp"
            android:layout_marginEnd="6dp" />

        <ImageButton
            android:id="@+id/btnCollapseBar"
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:background="#1E293B"
            android:src="@android:drawable/arrow_up_float"
            android:contentDescription="Recolher Barra" />
    </LinearLayout>

    <!-- O Jogo PokeIdle roda na tela toda abaixo da barra fixa -->
    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_below="@id/topControlBar" />

    <!-- Botão Flutuante Redondo para reabrir a barra caso recolhida -->
    <ImageButton
        android:id="@+id/btnExpandBar"
        android:layout_width="36dp"
        android:layout_height="36dp"
        android:layout_alignParentTop="true"
        android:layout_alignParentEnd="true"
        android:layout_margin="8dp"
        android:background="#DC2626"
        android:src="@android:drawable/arrow_down_float"
        android:visibility="gone"
        android:elevation="11dp"
        android:contentDescription="Expandir Barra" />

</RelativeLayout>
`;
}

export function generateAppBuildGradle(config: AndroidProjectConfig): string {
  return `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${config.packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${config.packageName}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
}
`;
}

export function generateRootBuildGradle(): string {
  return `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '8.2.2' apply false
    id 'org.jetbrains.kotlin.android' version '1.9.22' apply false
}
`;
}

export function generateSettingsGradle(appName: string): string {
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${appName.replace(/\s+/g, '')}"
include ':app'
`;
}

export function generateReadme(config: AndroidProjectConfig): string {
  return `# ${config.appName} - Aplicativo Android com Segundo Plano Ativo

Este é o projeto completo pré-configurado para compilar o APK do **PokeIdle** (${config.targetUrl}) com suporte nativo a **execução em segundo plano**, mesmo quando o app for minimizado ou a tela estiver desligada.

## 🚀 Como gerar seu arquivo .APK

### Método 1: Compilar com o Android Studio (Oficial e Recomendado)
1. Extraia este arquivo .ZIP em uma pasta no seu computador.
2. Abra o **Android Studio**.
3. Clique em **File > Open** e selecione a pasta extraída.
4. Aguarde a sincronização do Gradle (ocorre automaticamente).
5. Vá no menu superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Ao terminar, clique em **locate** para pegar o arquivo \`app-debug.apk\`.
7. Envie o APK para o seu celular Android via WhatsApp, Google Drive ou cabo USB e instale!

### Método 2: Gerar APK Online sem instalar nada (Web2APK / PWABuilder)
1. Acesse o site gratuito [PWABuilder.com](https://www.pwabuilder.com) ou [Web2Apk.com](https://web2apk.com).
2. Cole a URL da nossa aplicação ou do PokeIdle: \`${config.targetUrl}\`.
3. Selecione a opção "Android Package".
4. Baixe o APK pronto gerado na nuvem!

### Método 3: Compilar via Linha de Comando (Terminal)
\`\`\`bash
chmod +x gradlew
./gradlew assembleDebug
\`\`\`
O APK será gerado em: \`app/build/outputs/apk/debug/app-debug.apk\`.

---

## ⚡ Configurações Cruciais Já Inclusas no Código:
1. **Foreground Service com WakeLock**: Impede o Android de congelar o processo (Doze Mode).
2. **Override de onPause/onStop no WebView**: O WebView **não chama** o pause de timers JS.
3. **Ignorar Otimização de Bateria**: Solicitação automática na inicialização.
4. **Permissões de Terceiros**: Suporte total para cookies de sessão e login (Google / Discord / Senha).
5. **Anti-Pause Injection**: Define \`document.hidden = false\` para a engine do jogo não parar.
`;
}

export async function createAndroidProjectZip(config: AndroidProjectConfig = defaultAndroidConfig): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file('build.gradle', generateRootBuildGradle());
  zip.file('settings.gradle', generateSettingsGradle(config.appName));
  zip.file('README.md', generateReadme(config));

  // app module
  const appFolder = zip.folder('app');
  if (appFolder) {
    appFolder.file('build.gradle', generateAppBuildGradle(config));

    // src/main
    const mainFolder = appFolder.folder('src')?.folder('main');
    if (mainFolder) {
      mainFolder.file('AndroidManifest.xml', generateAndroidManifest(config));

      // java / kotlin package path
      const packagePath = config.packageName.replace(/\./g, '/');
      const kotlinFolder = mainFolder.folder('java')?.folder(packagePath);
      if (kotlinFolder) {
        kotlinFolder.file('MainActivity.kt', generateMainActivity(config));
        kotlinFolder.file('PokeIdleBackgroundService.kt', generateForegroundService(config));
      }

      // res
      const resFolder = mainFolder.folder('res');
      if (resFolder) {
        const layoutFolder = resFolder.folder('layout');
        layoutFolder?.file('activity_main.xml', generateLayoutXml());

        const valuesFolder = resFolder.folder('values');
        valuesFolder?.file(
          'strings.xml',
          `<resources>
    <string name="app_name">${config.appName}</string>
</resources>`
        );
        valuesFolder?.file(
          'themes.xml',
          `<resources>
    <style name="Theme.PokeIdleRunner" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:statusBarColor">#020617</item>
        <item name="android:navigationBarColor">#020617</item>
    </style>
</resources>`
        );
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}
