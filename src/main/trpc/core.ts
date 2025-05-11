import { initTRPC } from "@trpc/server";

/**
 * tRPC初期化
 * - コアとなるtRPC関連のセットアップ
 */
const t = initTRPC.create();

/** Public procedure helper (no auth middleware yet) */
export const publicProcedure = t.procedure;

/** Router utility */
export const router = t.router;
