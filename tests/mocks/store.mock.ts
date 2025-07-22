import type { TypedStore } from "@main/persistence/store.js";
import { vi, type MockedFunction } from "vitest";

type MockedStore = {
  [K in keyof TypedStore]: MockedFunction<TypedStore[K]>;
};

export const createMockStore = (): MockedStore =>
  ({
    get: vi.fn().mockResolvedValue([]),
    set: vi.fn().mockResolvedValue(undefined),
    has: vi.fn().mockResolvedValue(false),
  }) as MockedStore;
