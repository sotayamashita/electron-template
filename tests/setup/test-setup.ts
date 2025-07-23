import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// Mock Electron APIs
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn().mockReturnValue("/tmp/test-app"),
    getName: vi.fn().mockReturnValue("App Test"),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
  },
}));

// Mock electron-store
vi.mock("electron-store", () => ({
  default: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    has: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  })),
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Global test utilities
declare global {
  var createMockDate: (dateString: string) => Date;
  var restoreDate: () => void;
}

global.createMockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
  return mockDate;
};

global.restoreDate = () => {
  vi.useRealTimers();
};
