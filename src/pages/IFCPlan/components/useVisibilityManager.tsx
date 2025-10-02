// Add this hook to your IFCViewer component or create a separate file

import { useRef, useCallback } from "react";
import * as OBC from "@thatopen/components";

export const useVisibilityManager = (
  hiderRef: React.MutableRefObject<OBC.Hider | undefined>,
  modelName: string
) => {
  // Track current visibility state to prevent redundant updates
  const currentVisibleSet = useRef<Set<string>>(new Set());
  const isUpdating = useRef(false);
  const pendingUpdate = useRef<Set<string> | null>(null);

  const applyVisibility = useCallback(
    async (shouldBeVisible: Set<string>) => {
      if (!hiderRef.current) return;

      // If already updating, store the pending update
      if (isUpdating.current) {
        pendingUpdate.current = shouldBeVisible;
        return;
      }

      // Check if there are actual changes
      const hasChanges =
        shouldBeVisible.size !== currentVisibleSet.current.size ||
        ![...shouldBeVisible].every((id) => currentVisibleSet.current.has(id));

      if (!hasChanges) {
        return; // No changes, skip update
      }

      isUpdating.current = true;

      try {
        // Calculate diff to minimize operations
        const toShow = new Set<string>();
        const toHide = new Set<string>();

        // Find items to show (in shouldBeVisible but not in current)
        shouldBeVisible.forEach((id) => {
          if (!currentVisibleSet.current.has(id)) {
            toShow.add(id);
          }
        });

        // Find items to hide (in current but not in shouldBeVisible)
        currentVisibleSet.current.forEach((id) => {
          if (!shouldBeVisible.has(id)) {
            toHide.add(id);
          }
        });

        // Apply changes in batches
        if (toShow.size > 0) {
          const showModelIdMap: OBC.ModelIdMap = {
            [modelName]: new Set(Array.from(toShow).map((id) => parseInt(id))),
          };
          await hiderRef.current.set(true, showModelIdMap);
        }

        if (toHide.size > 0) {
          const hideModelIdMap: OBC.ModelIdMap = {
            [modelName]: new Set(Array.from(toHide).map((id) => parseInt(id))),
          };
          await hiderRef.current.set(false, hideModelIdMap);
        }

        // Update tracking state
        currentVisibleSet.current = new Set(shouldBeVisible);

        console.log("Visibility updated:", {
          shown: toShow.size,
          hidden: toHide.size,
          totalVisible: shouldBeVisible.size,
        });
      } catch (error) {
        console.error("Visibility update error:", error);
      } finally {
        isUpdating.current = false;

        // Process pending update if any
        if (pendingUpdate.current) {
          const pending = pendingUpdate.current;
          pendingUpdate.current = null;
          await applyVisibility(pending);
        }
      }
    },
    [hiderRef, modelName]
  );

  const hideAll = useCallback(async () => {
    if (!hiderRef.current) return;
    await hiderRef.current.set(false);
    currentVisibleSet.current.clear();
  }, [hiderRef]);

  const showAll = useCallback(async () => {
    if (!hiderRef.current) return;
    await hiderRef.current.set(true);
    currentVisibleSet.current.clear();
  }, [hiderRef]);

  return { currentVisibleSet, applyVisibility, hideAll, showAll };
};
