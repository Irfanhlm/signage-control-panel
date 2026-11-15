const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;

const DEFAULT_PORT = 3000;
const DEFAULT_URL = `http://localhost:${DEFAULT_PORT}`;

function parseArguments() {
  const args = process.argv.slice(1);
  let targetUrl = null;
  let isKiosk = false;

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      targetUrl = arg.split('=')[1];
    } else if (arg.startsWith('--player=')) {
      const deviceId = arg.split('=')[1];
      targetUrl = `${process.env.APP_URL || DEFAULT_URL}/player/${deviceId}`;
      isKiosk = true;
    } else if (arg === '--kiosk') {
      isKiosk = true;
    }
  }

  if (!targetUrl) {
    targetUrl = process.env.APP_URL || `${DEFAULT_URL}/dashboard`;
  }

  return { targetUrl, isKiosk };
}

function checkServerReady(url, callback) {
  try {
    const parsed = new URL(url);
    const req = http.get(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: '/',
        timeout: 1500,
      },
      () => {
        callback(true);
      }
    );
    req.on('error', () => callback(false));
    req.on('timeout', () => {
      req.destroy();
      callback(false);
    });
  } catch {
    callback(false);
  }
}

function getFallbackHtml(targetUrl) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Signage Control Panel</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #FFFFFF;
      color: #111827;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      text-align: center;
      background-color: #F3F4F6;
      padding: 36px 32px;
      border-radius: 8px;
    }
    .badge {
      display: inline-block;
      background-color: #3B82F6;
      color: #FFFFFF;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      color: #4B5563;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .url-box {
      font-family: monospace;
      font-size: 13px;
      background-color: #FFFFFF;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 24px;
      word-break: break-all;
      border: 2px solid #E5E7EB;
    }
    .btn {
      display: inline-block;
      background-color: #3B82F6;
      color: #FFFFFF;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      border: none;
      cursor: pointer;
    }
    .btn:hover {
      background-color: #2563EB;
    }
    .spinner {
      margin: 18px auto 0;
      width: 24px;
      height: 24px;
      border: 3px solid #E5E7EB;
      border-top: 3px solid #3B82F6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Signage Desktop</div>
    <h1>Menghubungkan ke Server</h1>
    <p>Aplikasi sedang menunggu server Next.js & Express aktif...</p>
    <div class="url-box" id="targetUrl">${targetUrl}</div>
    <button class="btn" onclick="retry()">Coba Hubungkan Sekarang</button>
    <div class="spinner"></div>
  </div>
  <script>
    function retry() {
      window.location.href = "${targetUrl}";
    }
    setInterval(() => {
      fetch("${targetUrl}", { mode: 'no-cors' })
        .then(() => { window.location.href = "${targetUrl}"; })
        .catch(() => {});
    }, 2000);
  </script>
</body>
</html>`;
}

function setupMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    }] : []),
    {
      label: 'Navigasi',
      submenu: [
        {
          label: 'Dashboard Admin',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) mainWindow.loadURL(`${DEFAULT_URL}/dashboard`);
          },
        },
        {
          label: 'Daftar Perangkat',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) mainWindow.loadURL(`${DEFAULT_URL}/devices`);
          },
        },
        {
          label: 'Daftar Konten',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) mainWindow.loadURL(`${DEFAULT_URL}/contents`);
          },
        },
        { type: 'separator' },
        {
          label: 'Buka Player SIGN-001',
          click: () => {
            if (mainWindow) mainWindow.loadURL(`${DEFAULT_URL}/player/SIGN-001`);
          },
        },
        {
          label: 'Buka Player SIGN-002',
          click: () => {
            if (mainWindow) mainWindow.loadURL(`${DEFAULT_URL}/player/SIGN-002`);
          },
        },
        {
          label: 'Buka Player SIGN-003',
          click: () => {
            if (mainWindow) mainWindow.loadURL(`${DEFAULT_URL}/player/SIGN-003`);
          },
        },
      ],
    },
    {
      label: 'Tampilan',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        {
          label: 'Toggle Kiosk Mode',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              const currentKiosk = mainWindow.isKiosk();
              mainWindow.setKiosk(!currentKiosk);
            }
          },
        },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Jendela',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
        ] : [
          { role: 'close' },
        ]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const { targetUrl, isKiosk } = parseArguments();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#FFFFFF',
    kiosk: isKiosk,
    fullscreen: isKiosk,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  setupMenu();

  checkServerReady(targetUrl, (ready) => {
    if (ready) {
      mainWindow.loadURL(targetUrl);
    } else {
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getFallbackHtml(targetUrl))}`);
      const checkInterval = setInterval(() => {
        checkServerReady(targetUrl, (isUp) => {
          if (isUp) {
            clearInterval(checkInterval);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.loadURL(targetUrl);
            }
          }
        });
      }, 2000);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
