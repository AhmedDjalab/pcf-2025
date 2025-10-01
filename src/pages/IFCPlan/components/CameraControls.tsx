import React, { useCallback, useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  RotateCcw,
} from "lucide-react";

interface CameraControlsProps {
  worldRef: React.MutableRefObject<any>;
  fragmentsRef: React.MutableRefObject<any>;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  worldRef,
  fragmentsRef,
}) => {
  const panSpeed = 2;
  const zoomSpeed = 2;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const panCamera = useCallback(
    (direction: "up" | "down" | "left" | "right", speed = panSpeed) => {
      if (!worldRef.current?.camera?.controls) return;
      const controls = worldRef.current.camera.controls;

      switch (direction) {
        case "up":
          controls.truck(0, speed, false);
          break;
        case "down":
          controls.truck(0, -speed, false);
          break;
        case "left":
          controls.truck(-speed, 0, false);
          break;
        case "right":
          controls.truck(speed, 0, false);
          break;
      }
    },
    [panSpeed]
  );

  const zoomCamera = useCallback(
    (direction: "in" | "out", speed = zoomSpeed) => {
      if (!worldRef.current?.camera?.controls) return;
      const controls = worldRef.current.camera.controls;
      controls.forward(direction === "in" ? speed : -speed, false);
    },
    [zoomSpeed]
  );

  const resetCamera = useCallback(() => {
    if (!worldRef.current?.camera?.controls) return;
    worldRef.current.camera.controls.setLookAt(50, 50, 50, 0, 0, 0, true);
  }, []);

  const fitToView = useCallback(() => {
    if (!worldRef.current?.camera?.controls || !fragmentsRef.current) return;
    for (const [, model] of fragmentsRef.current.list) {
      worldRef.current.camera.controls.fitToSphere(model.boundingSphere, true);
      break;
    }
  }, []);

  // --- Hold press handler ---
  const handleHold = (
    action: () => void,
    speedUp = false // if true → accelerates over time
  ) => {
    let step = 1;
    action(); // first immediate action
    intervalRef.current = setInterval(() => {
      action();
      if (speedUp && step < 10) step += 0.5; // increase speed gradually
    }, 100); // every 100ms
  };

  const stopHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Keyboard controls (still works)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          panCamera("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          panCamera("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          panCamera("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          panCamera("right");
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomCamera("in");
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomCamera("out");
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetCamera();
          break;
        case "f":
        case "F":
          e.preventDefault();
          fitToView();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [panCamera, zoomCamera, resetCamera, fitToView]);

  return (
    <div className="absolute z-20 flex flex-col gap-2 bottom-4 right-4">
      {/* Direction Controls */}
      <div className="p-2 bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-1">
          {/* Up */}
          <button
            onMouseDown={() => handleHold(() => panCamera("down"), true)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
          >
            <ArrowUp />
          </button>

          {/* Left / Fit / Right */}
          <div className="flex gap-1">
            <button
              onMouseDown={() => handleHold(() => panCamera("left"), true)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
            >
              <ArrowLeft />
            </button>
            <button onClick={fitToView}>
              <Maximize2 />
            </button>
            <button
              onMouseDown={() => handleHold(() => panCamera("right"), true)}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
            >
              <ArrowRight />
            </button>
          </div>

          {/* Down */}
          <button
            onMouseDown={() => handleHold(() => panCamera("up"), true)}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
          >
            <ArrowDown />
          </button>
        </div>
      </div>

      {/* Zoom */}
      <div className="flex gap-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg">
        <button
          onMouseDown={() => handleHold(() => zoomCamera("in"), true)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
        >
          +
        </button>
        <button
          onMouseDown={() => handleHold(() => zoomCamera("out"), true)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
        >
          −
        </button>
      </div>

      <button className="bg-white p-2" onClick={resetCamera}>
        <RotateCcw /> Reset
      </button>
    </div>
  );
};

export default CameraControls;
