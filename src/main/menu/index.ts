import type { MenuItemConstructorOptions } from "electron";
import { app, Menu } from "electron";
import type { TFunction } from "i18next";
import { getI18n } from "../i18n/index.js";

/**
 * Creates the application menu with translated strings
 * @param t The i18next translation function
 * @returns The constructed menu
 */
function createAppMenu(t: TFunction): Menu {
  const isMac = process.platform === "darwin";

  // Template with translations
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { label: t("menu:menu.app.about"), role: "about" as const },
              { type: "separator" as const },
              {
                label: t("menu:menu.app.preferences"),
                accelerator: "Cmd+,",
                click: () => {},
              },
              { type: "separator" as const },
              { label: t("menu:menu.app.quit"), role: "quit" as const },
            ],
          } as MenuItemConstructorOptions,
        ]
      : []),
    {
      label: t("menu:menu.file.title"),
      submenu: [
        {
          label: t("menu:menu.file.new"),
          accelerator: "CmdOrCtrl+N",
        },
        {
          label: t("menu:menu.file.open"),
          accelerator: "CmdOrCtrl+O",
        },
        { type: "separator" as const },
        {
          label: t("menu:menu.file.save"),
          accelerator: "CmdOrCtrl+S",
        },
        ...(isMac
          ? []
          : [
              { type: "separator" as const },
              { role: "quit" as const, label: t("menu:menu.app.quit") },
            ]),
      ],
    },
    {
      label: t("menu:menu.edit.title"),
      submenu: [
        { label: t("menu:menu.edit.undo"), role: "undo" as const },
        { label: t("menu:menu.edit.redo"), role: "redo" as const },
        { type: "separator" as const },
        { label: t("menu:menu.edit.cut"), role: "cut" as const },
        { label: t("menu:menu.edit.copy"), role: "copy" as const },
        { label: t("menu:menu.edit.paste"), role: "paste" as const },
        { label: t("menu:menu.edit.delete"), role: "delete" as const },
        { type: "separator" as const },
        { label: t("menu:menu.edit.selectAll"), role: "selectAll" as const },
      ],
    },
    {
      label: t("menu:menu.view.title"),
      submenu: [
        { label: t("menu:menu.view.reload"), role: "reload" as const },
        {
          label: t("menu:menu.view.toggleDevTools"),
          role: "toggleDevTools" as const,
        },
        { type: "separator" as const },
        {
          label: t("menu:menu.view.toggleFullScreen"),
          role: "togglefullscreen" as const,
        },
      ],
    },
    {
      label: t("menu:menu.window.title"),
      submenu: [
        { label: t("menu:menu.window.minimize"), role: "minimize" as const },
        { label: t("menu:menu.window.zoom"), role: "zoom" as const },
        ...(isMac
          ? [
              { type: "separator" as const },
              { role: "front" as const },
              { type: "separator" as const },
              { role: "window" as const },
            ]
          : [{ label: t("menu:menu.window.close"), role: "close" as const }]),
      ],
    },
    {
      label: t("menu:menu.help.title"),
      submenu: [
        {
          label: t("menu:menu.help.documentation"),
          click: async () => {
            const { shell } = await import("electron");
            await shell.openExternal("https://electron-vite.org");
          },
        },
        {
          label: t("menu:menu.help.reportIssue"),
          click: async () => {
            const { shell } = await import("electron");
            await shell.openExternal(
              "https://github.com/alexzvn/electron-vite-react/issues",
            );
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

/**
 * Updates the application menu with the current language
 */
export async function updateAppMenu(): Promise<void> {
  try {
    // Get the current i18n instance
    const i18n = await getI18n();

    // Create a new menu using the translation function
    const menu = createAppMenu(i18n.t.bind(i18n));

    // Apply the menu to the application
    Menu.setApplicationMenu(menu);

    console.log(`Application menu updated with language: ${i18n.language}`);
  } catch (error) {
    console.error("Failed to update application menu:", error);
  }
}

/**
 * Sets up listeners for language change events
 */
export function setupLanguageChangeListeners(): void {
  const i18nSetup = getI18n().then((i18n) => {
    // Listen for language changes
    i18n.on("languageChanged", () => {
      updateAppMenu();
    });
  });

  // Add error handling for the promise
  i18nSetup.catch((error) => {
    console.error("Failed to set up language change listeners:", error);
  });
}
