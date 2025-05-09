import { createTRPCClient, type Operation } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "../../../shared/trpc";

// Custom IPC link that calls main-process router via ipcRenderer.
const ipcLink =
  () =>
  ({ op }: { op: Operation }) =>
    observable((observer) => {
      // `electron` API is exposed by preload.
      window.electron.ipcRenderer
        .invoke("trpc", op)
        .then((data) => {
          observer.next({ result: { type: "data", data } });
          observer.complete();
        })
        .catch((err) => observer.error(err));
      return () => {};
    });

export const trpc = createTRPCClient<AppRouter>({
  links: [ipcLink],
});
