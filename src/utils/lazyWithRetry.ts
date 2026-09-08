import { ComponentType, lazy } from "react";

/**
 * Wraps dynamic React.lazy imports with an automatic reload mechanism
 * when a stale chunk hash error (ChunkLoadError) occurs after code updates.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    const hasBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem("page-has-been-force-refreshed") || "false",
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem("page-has-been-force-refreshed", "false");
      return component;
    } catch (error) {
      if (!hasBeenForceRefreshed) {
        // Assume chunk mismatch; reload page to retrieve latest manifest and chunks
        window.sessionStorage.setItem("page-has-been-force-refreshed", "true");
        window.location.reload();
        return { default: (() => null) as unknown as T };
      }
      throw error;
    }
  });
}
