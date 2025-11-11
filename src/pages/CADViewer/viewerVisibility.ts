// viewerVisibility.ts
export const viewerVisibility = (viewRef: React.MutableRefObject<any>) => {
  const visibleIds = new Set<number>();

  /** 👁 Show all elements in the model */
  const showAllModels = async () => {
    const viewer = viewRef.current;
    if (!viewer) return;
    viewer.showAll();
    visibleIds.clear();
    console.log("✅ All models shown");
  };

  /** 🔄 Toggle visibility for the given dbIds */
  const toggleModelVisibility = async (localIds: string[]) => {
    if (!localIds?.length) return;
    const viewer = viewRef.current;
    if (!viewer) return;

    const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

    numericIds.forEach((id) => {
      const isVisible = viewer.isNodeVisible(id);
      if (isVisible) {
        viewer.hide(id);
        visibleIds.delete(id);
      } else {
        viewer.show(id);
        visibleIds.add(id);
      }
    });

    console.log("🔁 Toggled visibility for IDs:", numericIds);
  };

  /** 🎯 Isolate given dbIds (hide all others) */
  const toggleModelIsolated = async (localIds: string[], visible?: boolean) => {
    if (!localIds?.length) return;
    const viewer = viewRef.current;
    if (!viewer) return;

    const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

    if (visible === false) {
      // Clear isolation (show everything)
      viewer.isolate([]);
      viewer.showAll();
      console.log("🔙 Isolation cleared");
    } else {
      // Isolate the given elements
      viewer.isolate(numericIds);
      console.log("🎯 Isolated:", numericIds);
    }
  };

  /** 👁 Explicitly set visibility for specific ids */
  const handleVisibilty = async (localIds: string[], visible: boolean) => {
    if (!localIds?.length) return;
    const viewer = viewRef.current;
    if (!viewer) return;

    const numericIds = Array.from(new Set(localIds.map((l) => parseInt(l))));

    if (visible) {
      viewer.show(numericIds);
      numericIds.forEach((id) => visibleIds.add(id));
    } else {
      viewer.hide(numericIds);
      numericIds.forEach((id) => visibleIds.delete(id));
    }

    console.log(
      `👁 Set visibility=${visible} for ids:`,
      numericIds,
      "Current visible count:",
      visibleIds.size
    );
  };

  return {
    showAllModels,
    toggleModelVisibility,
    toggleModelIsolated,
    handleVisibilty,
  };
};
