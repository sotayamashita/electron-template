import { initTRPC } from "@trpc/server";

/**
 * tRPC initialization
 * - Core tRPC setup
 */
const t = initTRPC.create();

/** Public procedure helper (no auth middleware yet) */
export const publicProcedure = t.procedure;

/** Router utility */
export const router = t.router;
