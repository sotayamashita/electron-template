import { ipcMain } from "electron";
import { LanguageRepo } from "../repository/language-repository.js";

/**
 * Sets up IPC handlers for language-related operations
 * These handlers are separate from tRPC and provide sync access for the preload script
 */
export function setupLanguageIpcHandlers(): void {
  // Set up handler for getting the initial language synchronously
  // This is critical for zero-flicker language initialization in the renderer
  ipcMain.on("get-initial-language", async (event) => {
    try {
      console.log("[IPC] Getting initial language");
      // Get the user's stored language preference
      const language = await LanguageRepo.get();

      console.log(`[IPC] Returning initial language: ${language}`);
      // Set the synchronous return value
      event.returnValue = language;
    } catch (error) {
      console.error("[IPC] Error getting initial language:", error);
      // Return default 'en' on error
      console.log('[IPC] Returning default language "en" due to error');
      event.returnValue = "en";
    }
  });
}
