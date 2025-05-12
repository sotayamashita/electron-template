import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, shell } from "electron";
import { fileURLToPath } from "url";
import icon from "../../resources/icon.png?asset";
import { container } from "./di/container.js";
import { getI18n } from "./i18n/index.js";
import { setupLanguageIpcHandlers } from "./ipc/language-handlers.js";
import { setupLanguageChangeListeners, updateAppMenu } from "./menu/index.js";
import { attachTRPC } from "./trpc-ipc-adapter.js";
import { appRouter } from "./trpc/router.js";

/**
 * Initialize application services and dependencies
 */
async function initializeApp(): Promise<void> {
  try {
    // Ensure container is initialized and dependencies are ready
    await container.getStore();

    // Set up IPC handlers for language
    setupLanguageIpcHandlers();

    console.log("Application services initialized");

    // Initialize i18n
    await getI18n();

    // Initialize menu with translations
    await updateAppMenu();

    // Set up language change listeners
    setupLanguageChangeListeners();

    console.log("i18n and menu initialized");

    // Attach tRPC router over a single IPC channel
    attachTRPC("trpc", appRouter);

    console.log("tRPC router attached to IPC");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
}

/**
 * Create the main application window
 */
function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      // Disable direct use of Node.js APIs in renderer process
      nodeIntegration: false,
      // Isolate context between renderer process and preload script
      contextIsolation: true,
      // Disable sandboxing for renderer process
      sandbox: false,
      // Load the preload script
      preload: fileURLToPath(new URL("../preload/index.mjs", import.meta.url)),
      // Enable web security
      webSecurity: true,
      // Allow loading local resources
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(
      fileURLToPath(new URL("../renderer/index.html", import.meta.url)),
    );
  }

  return mainWindow;
}

/**
 * Configure application-wide settings
 */
function setupAppSettings(): void {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
}

// Application startup sequence
app.whenReady().then(async () => {
  try {
    console.log("Starting application...");

    // Configure app settings
    setupAppSettings();

    // Initialize dependencies
    await initializeApp();

    // Create window
    createWindow();

    // macOS re-activation handler
    app.on("activate", function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    console.log("Application started successfully");
  } catch (error) {
    console.error("Application startup failed:", error);
    app.quit();
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
