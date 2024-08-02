export const markerConfig = {
  arrowStart: {
    id: "arrow-start",
    viewBox: "0 0 10 10",
    refX: "0",
    refY: "5",
    markerUnits: "strokeWidth",
    markerWidth: "4",
    markerHeight: "4",
    orient: "auto-start-reverse",
    path: "M 0 0 L 10 5 L 0 10 z",
  },
  arrowEnd: {
    id: "arrow-end",
    viewBox: "0 0 10 10",
    refX: "10",
    refY: "5",
    markerUnits: "strokeWidth",
    markerWidth: "4",
    markerHeight: "4",
    orient: "auto",
    path: "M 0 0 L 10 5 L 0 10 z",
  },
  doubleArrowStart: {
    id: "double-arrow-start",
    viewBox: "0 0 20 20",
    refX: "0",
    refY: "10",
    markerUnits: "strokeWidth",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto-start-reverse",
    path: "M 0 0 L 20 10 L 0 20 z",
  },
  doubleArrowEnd: {
    id: "double-arrow-end",
    viewBox: "0 0 20 20",
    refX: "20",
    refY: "10",
    markerUnits: "strokeWidth",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto",
    path: "M 0 0 L 20 10 L 0 20 z",
  },
  waveStart: {
    id: "wave-start",
    viewBox: "0 0 20 20",
    refX: "0",
    refY: "10",
    markerUnits: "strokeWidth",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto-start-reverse",
    path: "M 0 10 Q 5 0 10 10 Q 15 20 20 10",
  },
  waveEnd: {
    id: "wave-end",
    viewBox: "0 0 20 20",
    refX: "20",
    refY: "10",
    markerUnits: "strokeWidth",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto",
    path: "M 0 10 Q 5 0 10 10 Q 15 20 20 10",
  },
  crosshatchStart: {
    id: "crosshatch-start",
    viewBox: "0 0 20 20",
    refX: "0",
    refY: "10",
    markerUnits: "strokeWidth",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto-start-reverse",
    path: `
        <line x1="0" y1="0" x2="20" y2="20" stroke={color} style={{ strokeWidth: 3 }} />
        <line x1="0" y1="20" x2="20" y2="0" stroke={color} style={{ strokeWidth: 3 }} />
      `,
  },
  crosshatchEnd: {
    id: "crosshatch-end",
    viewBox: "0 0 20 20",
    refX: "20",
    refY: "10",
    markerUnits: "strokeWidth",
    markerWidth: "6",
    markerHeight: "6",
    orient: "auto",
    path: `
        <line x1="0" y1="0" x2="20" y2="20" style={{ strokeWidth: 3 }} stroke={color} fill={color} />
        <line x1="0" y1="20" x2="20" y2="0" style={{ strokeWidth: 3 }} stroke={color} fill={color} />
      `,
  },
  // Add more marker configurations as needed
};

export interface PatternConfig {
  [key: string]: {
    id: string;
    width?: number;
    height?: number;
    name: string;
    patternUnits: string;
    fill?: string;
    d?: string;
    x1?: string;
    x2?: string;
    y1?: string;
    y2?: string;
    patternFillType: "Line" | "Path";

    content: (id?: string, width?: any, height?: any) => any;
  };
}
export type ShapeConfig =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
    }
  | { type: "circle"; cx: number; cy: number; r: number; fill: string }
  | {
      type: "ellipse";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      fill: string;
    }
  | { type: "path"; d: string; fill: string };
export type MarkerConfig = {
  id: string;
  markerUnits: string;
  markerType?: "path" | "rect" | "circle" | "ellipse";
  config: {
    viewBox: string;
    markerWidth: number;
    markerHeight: number;
    refX: number;
    refY: number;
    x?: number;
    y?: number;
    cx?: number;
    cy?: number;
    r?: number;
    ry?: number;
    rx?: number;
    width?: number;
    height?: number;
    stroke?: string;
    strokeWidth?: number;
    orient: string;
    markerUnits?: string;
    d?: string;
    shapes?: ShapeConfig[];
  };
  content: (color?: string, id?: string) => JSX.Element;
};

export type MarkersConfig = Record<string, MarkerConfig>;
export const markersConfig: MarkersConfig = {
  arrowEnd: {
    id: "arrow-end-marker",
    markerUnits: "userSpaceOnUse",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 8,
      markerHeight: 8,
      refX: 5,
      refY: 5,
      orient: "auto",
      markerUnits: "userSpaceOnUse",
      d: "M 0 0 L 10 5 L 0 10 z",
    },
    content: (color?: string, id?: string) => (
      <marker
        key={id}
        id={id || "arrow-end-marker"}
        {...markersConfig.arrowEnd.config}
        fill={color}
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    ),
  },
  arrowStart: {
    id: "arrow-start-marker",
    markerUnits: "userSpaceOnUse",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 8,
      markerHeight: 8,
      refX: 5,
      refY: 5,
      orient: "auto-start-reverse",
      markerUnits: "userSpaceOnUse",
      d: "M 0 10 L 10 5 L 0 0 z",
    },
    content: (color?: string, id?: string) => (
      <marker
        key={id}
        id={id || "arrow-start-marker"}
        {...markersConfig.arrowStart.config}
        fill={color}
      >
        <path d="M 0 10 L 10 5 L 0 0 z" />
      </marker>
    ),
  },

  waveMarker1: {
    // Your new marker configuration
    id: "waveMarker1",
    markerUnits: "userSpaceOnUse",
    config: {
      viewBox: "0 0 100 100",
      markerWidth: 30,
      markerHeight: 30,
      refX: 50,
      refY: 50,
      orient: "auto-start-reverse",
      markerUnits: "userSpaceOnUse",
      d: `
        M-3.176 15.632a1.467 1.467 0 00-.294.038 1.463 1.463 0 00-1.08 1.754l.013.05c.503 2.134 1.828 3.999 3.533 5.201a9.21 9.21 0 005.803 1.68c2.012-.098 3.962-.883 5.422-2.17a8.142 8.142 0 001.93-2.494 9.028 9.028 0 002.67 2.984 9.213 9.213 0 005.803 1.68c2.012-.098 3.962-.883 5.422-2.17 1.472-1.277 2.454-3.068 2.7-4.944a.217.217 0 00-.16-.234c-.11-.036-.221.037-.246.148a7.302 7.302 0 01-2.932 4.207 7.598 7.598 0 01-4.772 1.325c-1.656-.098-3.227-.76-4.392-1.815-1.178-1.043-1.938-2.478-2.098-3.95a.392.392 0 00-.036-.172 1.463 1.463 0 00-1.755-1.08 1.463 1.463 0 00-1.079 1.754l.012.05c.121.512.29 1.008.5 1.484a7.35 7.35 0 01-2.205 2.404 7.601 7.601 0 01-4.772 1.325c-1.656-.098-3.227-.76-4.392-1.815-1.178-1.043-1.938-2.478-2.098-3.95a.392.392 0 00-.036-.172 1.464 1.464 0 00-1.461-1.118z
        M-11.51 2.298a1.463 1.463 0 00-1.373 1.792l.013.05c.503 2.135 1.828 4 3.533 5.202a9.21 9.21 0 005.802 1.68c2.012-.098 3.962-.883 5.422-2.171a8.142 8.142 0 001.931-2.493 9.028 9.028 0 002.67 2.983 9.213 9.213 0 005.802 1.68c2.012-.097 3.962-.882 5.422-2.17 1.473-1.276 2.454-3.067 2.7-4.944a.217.217 0 00-.16-.233c-.11-.037-.22.037-.245.147a7.302 7.302 0 01-2.933 4.208 7.598 7.598 0 01-4.771 1.325c-1.656-.098-3.227-.76-4.392-1.816-1.178-1.043-1.939-2.478-2.098-3.95a.392.392 0 00-.037-.172 1.463 1.463 0 00-1.754-1.08 1.463 1.463 0 00-1.08 1.755l.013.05c.12.512.29 1.007.5 1.483A7.35 7.35 0 011.25 8.03a7.601 7.601 0 01-4.773 1.325c-1.656-.098-3.226-.76-4.392-1.816-1.177-1.043-1.938-2.478-2.097-3.95a.392.392 0 00-.037-.172 1.464 1.464 0 00-1.46-1.118z
      `,
    },
    content: (color?: string, id?: string) => (
      <marker
        key={id}
        id={id || "waveMarker1"}
        {...markersConfig.waveMarker1.config}
        fill={color}
      >
        <path
          d={`
            M-3.176 15.632a1.467 1.467 0 00-.294.038 1.463 1.463 0 00-1.08 1.754l.013.05c.503 2.134 1.828 3.999 3.533 5.201a9.21 9.21 0 005.803 1.68c2.012-.098 3.962-.883 5.422-2.17a8.142 8.142 0 001.93-2.494 9.028 9.028 0 002.67 2.984 9.213 9.213 0 005.803 1.68c2.012-.098 3.962-.883 5.422-2.17 1.472-1.277 2.454-3.068 2.7-4.944a.217.217 0 00-.16-.234c-.11-.036-.221.037-.246.148a7.302 7.302 0 01-2.932 4.207 7.598 7.598 0 01-4.772 1.325c-1.656-.098-3.227-.76-4.392-1.815-1.178-1.043-1.938-2.478-2.098-3.95a.392.392 0 00-.036-.172 1.463 1.463 0 00-1.755-1.08 1.463 1.463 0 00-1.079 1.754l.012.05c.121.512.29 1.008.5 1.484a7.35 7.35 0 01-2.205 2.404 7.601 7.601 0 01-4.772 1.325c-1.656-.098-3.227-.76-4.392-1.815-1.178-1.043-1.938-2.478-2.098-3.95a.392.392 0 00-.036-.172 1.464 1.464 0 00-1.461-1.118z
            M-11.51 2.298a1.463 1.463 0 00-1.373 1.792l.013.05c.503 2.135 1.828 4 3.533 5.202a9.21 9.21 0 005.802 1.68c2.012-.098 3.962-.883 5.422-2.171a8.142 8.142 0 001.931-2.493 9.028 9.028 0 002.67 2.983 9.213 9.213 0 005.802 1.68c2.012-.097 3.962-.882 5.422-2.17 1.473-1.276 2.454-3.067 2.7-4.944a.217.217 0 00-.16-.233c-.11-.037-.22.037-.245.147a7.302 7.302 0 01-2.933 4.208 7.598 7.598 0 01-4.771 1.325c-1.656-.098-3.227-.76-4.392-1.816-1.178-1.043-1.939-2.478-2.098-3.95a.392.392 0 00-.037-.172 1.463 1.463 0 00-1.754-1.08 1.463 1.463 0 00-1.08 1.755l.013.05c.12.512.29 1.007.5 1.483A7.35 7.35 0 011.25 8.03a7.601 7.601 0 01-4.773 1.325c-1.656-.098-3.226-.76-4.392-1.816-1.177-1.043-1.938-2.478-2.097-3.95a.392.392 0 00-.037-.172 1.464 1.464 0 00-1.46-1.118z
          `}
        />
      </marker>
    ),
  },

  circle: {
    id: "circle-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "circle",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 4,
      markerHeight: 4,
      refX: 5,
      refY: 5,
      orient: "auto",
      cx: 5, // Center X for the circle
      cy: 5, // Center Y for the circle
      r: 3, // Radius for the circle
    },
    content: (color = "black", id = "circle-marker") => (
      <marker key={id} id={id} {...markersConfig.circle.config} fill={color}>
        <circle cx="5" cy="5" r="3" width="6" height="6" />
      </marker>
    ),
  },
  square: {
    id: "square-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "rect",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 3,
      markerHeight: 3,
      refX: 5,
      refY: 5,
      orient: "auto",
      x: 2, // X coordinate for the top-left corner of the rect
      y: 2, // Y coordinate for the top-left corner of the rect
      width: 6, // Width of the rect
      height: 6, // Height of the rect
    },
    content: (color = "black", id = "square-marker") => (
      <marker key={id} id={id} {...markersConfig.square.config} fill={color}>
        <rect x="2" y="2" width="6" height="6" />
      </marker>
    ),
  },
  diamond: {
    id: "diamond-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 4,
      markerHeight: 4,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: "M 5 0 L 10 5 L 5 10 L 0 5 z", // Path data for the diamond shape
    },
    content: (color = "black", id = "diamond-marker") => (
      <marker key={id} id={id} {...markersConfig.diamond.config} fill={color}>
        <path d="M 5 0 L 10 5 L 5 10 L 0 5 z" />
      </marker>
    ),
  },
  cross: {
    id: "cross-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 8,
      markerHeight: 8,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: "M 2 5 L 8 5 M 5 2 L 5 8", // Path data for the cross shape
      stroke: "black",
      strokeWidth: 2,
    },
    content: (color = "black", id = "cross-marker") => (
      <marker key={id} id={id} {...markersConfig.cross.config} fill={color}>
        <path d="M 2 5 L 8 5 M 5 2 L 5 8" stroke={color} strokeWidth="2" />
      </marker>
    ),
  },
  hexagon: {
    id: "hexagon-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 3,
      markerHeight: 3,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: "M 5 0 L 9 2.5 L 9 7.5 L 5 10 L 1 7.5 L 1 2.5 z", // Hexagon shape
    },
    content: (color = "black", id = "hexagon-marker") => (
      <marker key={id} id={id} {...markersConfig.hexagon.config} fill={color}>
        <path d="M 5 0 L 9 2.5 L 9 7.5 L 5 10 L 1 7.5 L 1 2.5 z" />
      </marker>
    ),
  },
  pentagon: {
    id: "pentagon-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 3,
      markerHeight: 3,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: "M 5 0 L 9 4 L 7 10 L 3 10 L 1 4 z", // Pentagon shape
    },
    content: (color = "black", id = "pentagon-marker") => (
      <marker key={id} id={id} {...markersConfig.pentagon.config} fill={color}>
        <path d="M 5 0 L 9 4 L 7 10 L 3 10 L 1 4 z" />
      </marker>
    ),
  },
  burst: {
    id: "burst-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 3,
      markerHeight: 3,
      refX: 6,
      refY: 5,
      orient: "auto",
      d: "M 5 0 L 6 3 L 10 4 L 7 6 L 8 10 L 5 8 L 2 10 L 3 6 L 0 4 L 4 3 z", // Star-like burst shape
    },
    content: (color = "black", id = "burst-marker") => (
      <marker key={id} id={id} {...markersConfig.burst.config} fill={color}>
        <path d="M 5 0 L 6 3 L 10 4 L 7 6 L 8 10 L 5 8 L 2 10 L 3 6 L 0 4 L 4 3 z" />
      </marker>
    ),
  },

  // ellipse: {
  //   id: "ellipse-marker",
  //   markerUnits: "userSpaceOnUse",
  //   markerType: "ellipse",
  //   config: {
  //     viewBox: "0 0 10 10",
  //     markerWidth: 3,
  //     markerHeight: 3,
  //     refX: 5,
  //     refY: 5,
  //     orient: "auto",
  //     cx: 5, // Center X for the ellipse
  //     cy: 5, // Center Y for the ellipse
  //     rx: 5, // Radius X for the ellipse
  //     ry: 5, // Radius Y for the ellipse
  //   },
  //   content: (color = "black", id = "ellipse-marker") => (
  //     <marker key={id} id={id} {...markersConfig.ellipse.config} fill={color}>
  //       <ellipse cx="5" cy="5" rx="3" ry="5" />
  //     </marker>
  //   ),
  // },

  bolt: {
    id: "bolt-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 3,
      markerHeight: 3,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: "M 2 0 L 8 0 L 5 5 L 8 10 L 2 10 L 5 5 z", // Bolt shape
    },
    content: (color = "black", id = "bolt-marker") => (
      <marker key={id} id={id} {...markersConfig.bolt.config} fill={color}>
        <path d="M 2 0 L 8 0 L 5 5 L 8 10 L 2 10 L 5 5 z" />
      </marker>
    ),
  },
  t: {
    id: "t-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 5,
      markerHeight: 5,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: "M 0 5 L 10 5 M 5 0 L 5 10", // T shape
    },
    content: (color = "black", id = "t-marker") => (
      <marker key={id} id={id} {...markersConfig.t.config} fill={color}>
        <path d="M 0 5 L 10 5 M 5 0 L 5 10" />
      </marker>
    ),
  },

  // swirl: {
  //   id: "swirl-marker",
  //   markerUnits: "userSpaceOnUse",
  //   markerType: "path",
  //   config: {
  //     viewBox: "0 0 10 10",
  //     markerWidth: 3,
  //     markerHeight: 3,
  //     refX: 5,
  //     refY: 5,
  //     orient: "auto",
  //     d: "M5,1 C7,1 9,3 9,5 C9,7 7,9 5,9 C3,9 1,7 1,5 C1,3 3,1 5,1 Z", // Swirl shape
  //   },
  //   content: (color = "black", id = "swirl-marker") => (
  //     <marker key={id} id={id} {...markersConfig.swirl.config} fill={color}>
  //       <path d="M5,1 C7,1 9,3 9,5 C9,7 7,9 5,9 C3,9 1,7 1,5 C1,3 3,1 5,1 Z" />
  //     </marker>
  //   ),
  // },
  // infinity: {
  //   id: "infinity-marker",
  //   markerUnits: "userSpaceOnUse",
  //   markerType: "path",
  //   config: {
  //     viewBox: "0 0 10 10",
  //     markerWidth: 5,
  //     markerHeight: 5,
  //     refX: 5,
  //     refY: 5,
  //     orient: "auto",
  //     d: "M2,5 C2,3 4,3 5,5 C6,7 8,7 8,5 C8,3 6,3 5,5 C4,7 2,7 2,5 Z", // Infinity shape
  //   },
  //   content: (color = "black", id = "infinity-marker") => (
  //     <marker key={id} id={id} {...markersConfig.infinity.config} fill={color}>
  //       <path d="M2,5 C2,3 4,3 5,5 C6,7 8,7 8,5 C8,3 6,3 5,5 C4,7 2,7 2,5 Z" />
  //     </marker>
  //   ),
  // },
  doubleLineTriangle: {
    id: "double-line-triangle-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 14 14",
      markerWidth: 4,
      markerHeight: 4,
      refX: 8,
      refY: 8,
      orient: "auto",
      d: "M2,2 L6,2 L8,6 L6,10 L2,10 L0,6 z M4,4 L8,4 L10,8 L8,12 L4,12 L2,8 z", // Double-line with repeating triangle shapes
    },
    content: (color = "black", id = "double-line-triangle-marker") => (
      <marker
        key={id}
        id={id}
        {...markersConfig.doubleLineTriangle.config}
        fill={color}
      >
        <path d="M2,2 L6,2 L8,6 L6,10 L2,10 L0,6 z M4,4 L8,4 L10,8 L8,12 L4,12 L2,8 z" />
      </marker>
    ),
  },

  geometricFusion: {
    id: "geometric-fusion-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 12 12",
      markerWidth: 5,
      markerHeight: 5,
      refX: 6,
      refY: 6,
      orient: "auto",
      d: `
        M6,1
        L8,3
        L7,5
        L9,6
        L6,9
        L3,6
        L5,5
        L4,3
        Z
        M6,4
        L7,5
        L5,5
        Z
      `, // Geometric fusion with overlapping shapes
    },
    content: (color = "black", id = "geometric-fusion-marker") => (
      <marker
        key={id}
        id={id}
        {...markersConfig.geometricFusion.config}
        fill={color}
      >
        <path d={markersConfig.geometricFusion.config.d} />
      </marker>
    ),
  },

  diagonalSlash: {
    id: "diagonal-slash-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 3,
      markerHeight: 3,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: `
        M0,0
        L10,10
        M0,10
        L10,0
        M2,0
        L8,10
        M2,10
        L8,0
        M4,0
        L6,10
        M4,10
        L6,0
      `, // Diagonal slashes pattern
    },
    content: (color = "black", id = "diagonal-slash-marker") => (
      <marker
        key={id}
        id={id}
        {...markersConfig.diagonalSlash.config}
        stroke={color}
        strokeWidth="1"
      >
        <path d={markersConfig.diagonalSlash.config.d} />
      </marker>
    ),
  },
  backslash: {
    id: "backslash-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 3,
      markerHeight: 3,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: `
        M0,0
        L10,10
        M0,1
        L9,10
        M0,2
        L8,10
        M0,3
        L7,10
        M0,4
        L6,10
      `, // Backslashes pattern
    },
    content: (color = "black", id = "backslash-marker") => (
      <marker
        key={id}
        id={id}
        {...markersConfig.backslash.config}
        stroke={color}
        strokeWidth="1"
      >
        <path d={markersConfig.backslash.config.d} />
      </marker>
    ),
  },
  equalLines: {
    id: "equal-lines-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 5,
      markerHeight: 5,
      refX: 5,
      refY: 5,
      orient: "auto",
      d: `
        M0,4
        L10,4
        M0,6
        L10,6
      `, // Equal lines pattern
    },
    content: (color = "black", id = "equal-lines-marker") => (
      <marker
        key={id}
        id={id}
        {...markersConfig.equalLines.config}
        stroke={color}
        strokeWidth="1"
      >
        <path d={markersConfig.equalLines.config.d} />
      </marker>
    ),
  },

  stripedRect: {
    id: "striped-rect-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "rect",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 5,
      markerHeight: 5,
      refX: 2.5,
      refY: 2.5,
      orient: "auto",
      shapes: [
        { type: "rect", x: 0, y: 0, width: 5, height: 5, fill: "black" },
        { type: "rect", x: 0, y: 1, width: 5, height: 1, fill: "white" },
        { type: "rect", x: 0, y: 3, width: 5, height: 1, fill: "white" },
      ],
    },
    content: (color = "black", id = "striped-rect-marker") => {
      const { shapes, ...config } = markersConfig.stripedRect.config;
      console.log("🚀 ~ shapes:", shapes);

      return (
        <marker
          key={id}
          id={id}
          viewBox={config.viewBox}
          markerWidth={config.markerWidth}
          markerHeight={config.markerHeight}
          refX={config.refX}
          refY={config.refY}
          orient={config.orient}
          //markerUnits={config.markerUnits || "userSpaceOnUse"}
          fill={color}
        >
          {shapes!.map((shape, index) => {
            switch (shape.type) {
              case "rect":
                return (
                  <rect
                    key={index}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={shape.fill}
                  />
                );
              case "circle":
                return (
                  <circle
                    key={index}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.r}
                    fill={shape.fill}
                  />
                );
              case "path":
                return <path key={index} d={shape.d} fill={shape.fill} />;
              default:
                return null;
            }
          })}
        </marker>
      );
    },
  },

  checkerboard: {
    id: "checkerboard-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "rect",
    config: {
      viewBox: "0 0 10 10",
      markerWidth: 4,
      markerHeight: 4,
      refX: 2.5,
      refY: 2.5,
      orient: "auto",
      x: 0,
      y: 0,
      width: 5,
      height: 5,
    },
    content: (color = "black", id = "checkerboard-marker") => (
      <marker
        key={id}
        id={id}
        {...markersConfig.checkerboard.config}
        fill={color}
      >
        <path
          d="M0 0h2.5v2.5H0zM2.5 2.5h2.5v2.5H2.5zM2.5 0h2.5v2.5H2.5zM0 2.5h2.5v2.5H0z"
          fill={color}
        />
      </marker>
    ),
  },

  sun: {
    id: "sun-marker",
    markerUnits: "userSpaceOnUse",
    markerType: "path",
    config: {
      viewBox: "0 0 24 24",
      markerWidth: 12,
      markerHeight: 12,
      refX: 12,
      refY: 12,
      orient: "auto",
      d: "M12 4a8 8 0 1 1 0 16a8 8 0 0 1 0-16zm0-2v2m0 16v2m-6-6h-2m16 0h2m-5-5l-1.4-1.4m-8.2 8.2L5 13m14.2-1.4l-1.4 1.4m-8.2-8.2L5 11",
    },
    content: (color = "yellow", id = "sun-marker") => (
      <marker
        key={id}
        id={id}
        {...markersConfig.sun.config}
        stroke={color}
        strokeWidth="2"
      />
    ),
  },
};

export const patternsConfig: PatternConfig = {
  customPattern: {
    id: "wave-pattern1",
    name: "customPattern",
    width: 15.825,
    height: 26.667,
    patternUnits: "userSpaceOnUse",
    fill: "none",
    patternFillType: "Path",
    d: "M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80",
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        width="15.825"
        height="26.667"
        patternUnits="userSpaceOnUse"
      >
        <path d="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" fill="none" />
      </pattern>
    ),
  },
  Line13Pattern: {
    id: "line-pattern13",
    width: 3.0,
    name: "Line13Pattern",
    height: 1, // Assuming height of 1 unit for simplicity
    patternUnits: "userSpaceOnUse",
    patternFillType: "Line",
    x1: "0",
    y1: "0",
    x2: "3.00",
    y2: "0",
    fill: "#000000", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern id={id} width="3.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0"
          x2="3.00"
          y2="0"
          stroke={color} // Color of the line, same as fill color
          strokeWidth="1" // Adjust thickness of the line as needed
        />
      </pattern>
    ),
  },

  Line16Pattern: {
    id: "line-pattern16",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "Line16Pattern",
    x1: "0",
    y1: "0.5", // Adjust position to center the line vertically
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5" // Adjust position to center the line vertically
          x2="6.00"
          y2="0.5" // Adjust position to center the line vertically
          stroke={color} // Color of the line, same as fill color
          strokeWidth="10" // Adjust thickness of the line as needed
        />
      </pattern>
    ),
  },
  DashedLinePattern: {
    id: "dashed-pattern5",
    width: 6.0,
    name: "DashedLinePattern",
    patternFillType: "Line",
    height: 1,
    x1: "0",
    y1: "0.5", // Adjust position to center the line vertically
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5" // Adjust position to center the line vertically
          x2="6.00"
          y2="0.5" // Adjust position to center the line vertically
          stroke={color} // Color of the line, same as fill color
        />
      </pattern>
    ),
  },
  CirclePattern: {
    id: "circle-pattern5",
    width: 6.0,
    height: 1,
    patternFillType: "Line",
    name: "CirclePattern",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "15",
    patternUnits: "userSpaceOnUse",
    fill: "#000000", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width="15"
        height="15"
        patternTransform="rotate(58)"
      >
        <line x1="0" y1="0" x2="0" y2="15" stroke={color} stroke-width="28" />
      </pattern>
    ),
  },
  horizentalLinePattern: {
    id: "hline-pattern5",
    width: 6.0,
    patternFillType: "Line",
    name: "horizentalLinePattern",
    height: 1,
    patternUnits: "userSpaceOnUse",
    fill: "#000000", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width="6"
        height="6"
        patternTransform="rotate(90)"
      >
        <line x1="0" y="0" x2="0" y2="6" stroke={color} stroke-width="10" />
      </pattern>
    ),
  },
  horizentalDashedLinePattern: {
    id: "hdashedline-pattern5",
    width: 6.0,
    name: "horizentalDashedLinePattern",
    height: 1,
    patternUnits: "userSpaceOnUse",
    patternFillType: "Line",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "3.5",
    fill: "#000000", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width="6"
        height="6"
        patternTransform="rotate(90)"
      >
        <line x1="0" y="0" x2="0" y2="3.5" stroke={color} stroke-width="10" />
      </pattern>
    ),
  },
  verticalLinePattern: {
    id: "vline-pattern5",
    width: 6.0,
    height: 1,
    name: "verticalLinePattern",
    patternUnits: "userSpaceOnUse",
    fill: "none",
    patternFillType: "Path",
    d: "M0,0 h2",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6" height="1" patternUnits="userSpaceOnUse">
        {/* Define the pattern with the path */}
        <path d="M0,0 h2" stroke={color} strokeWidth="4" />
      </pattern>
    ),
  },

  verticalLineLeftPattern: {
    id: "vlline-pattern5",
    width: 6.0,
    height: 1,
    name: "verticalLineLeftPattern",
    patternUnits: "userSpaceOnUse",
    patternFillType: "Path",
    d: "M0,0 h2",
    fill: "none", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        width="6"
        height="1"
        patternTransform="rotate(45)"
        patternUnits="userSpaceOnUse"
      >
        {/* Define the pattern with the path */}
        <path d="M0,0 h2" stroke={color} strokeWidth="4" />
      </pattern>
    ),
  },

  verticalLineRightPattern: {
    id: "vrline-pattern5",
    width: 6.0,
    height: 1,
    name: "verticalLineRightPattern",
    patternUnits: "userSpaceOnUse",
    patternFillType: "Path",
    d: "M1,2 h2",
    fill: "none", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        width="6"
        height="1"
        patternTransform="rotate(-45)"
        patternUnits="userSpaceOnUse"
      >
        {/* Define the pattern with the path */}
        <path d="M1,2 h2" stroke={color} strokeWidth="4" />
      </pattern>
    ),
  },
  vlineFilledLeftPattern: {
    id: "vlineLFilled-pattern5",
    width: 6.0,
    height: 1,
    name: "vlineFilledLeftPattern",
    patternUnits: "userSpaceOnUse",
    patternFillType: "Path",
    d: "M0,0 Q2,0 3,1 Q4,1 4,0",
    fill: "none", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        width="6"
        height="1"
        patternTransform="rotate(-45)"
        patternUnits="userSpaceOnUse"
      >
        {/* Define the pattern with the path */}
        <path d="M0,0 Q2,0 3,1 Q4,1 4,0" stroke={color} strokeWidth="2" />
      </pattern>
    ),
  },
  vlineFilledRightPattern: {
    id: "vlineRFilled-pattern5",
    width: 6.0,
    height: 1,
    name: "vlineFilledRightPattern",
    patternUnits: "userSpaceOnUse",
    patternFillType: "Path",
    d: "M0,0 Q2,0 4,1 Q4,1 4,0",
    fill: "none", // Color of the line, you can change it as needed
    content: (color?: string, id?: string) => (
      <pattern
        id={id}
        width="6"
        height="1"
        patternTransform="rotate(45)"
        patternUnits="userSpaceOnUse"
      >
        {/* Define the pattern with the path */}
        <path d="M0,0 Q2,0 4,1 Q4,1 4,0" stroke={color} strokeWidth="2" />
      </pattern>
    ),
  },
  LinePattern1: {
    id: "line-pattern1",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern1",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="10"
        />
      </pattern>
    ),
  },
  LinePattern2: {
    id: "line-pattern2",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern2",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="3.00"
          y2="0.5"
          stroke={color}
          strokeWidth="5"
        />
        <line
          x1="3.00"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="1"
        />
      </pattern>
    ),
  },
  LinePattern3: {
    id: "line-pattern3",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern3",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.25"
          x2="6.00"
          y2="0.25"
          stroke={color}
          strokeWidth="2"
        />
        <line
          x1="0"
          y1="0.75"
          x2="6.00"
          y2="0.75"
          stroke={color}
          strokeWidth="2"
        />
      </pattern>
    ),
  },
  LinePattern4: {
    id: "line-pattern4",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern4",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="2,2"
        />
      </pattern>
    ),
  },
  LinePattern5: {
    id: "line-pattern5",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern5",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.25"
          x2="6.00"
          y2="0.25"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="1,3"
        />
        <line
          x1="0"
          y1="0.75"
          x2="6.00"
          y2="0.75"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="1,3"
        />
      </pattern>
    ),
  },
  LinePattern6: {
    id: "line-pattern6",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern6",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="2.00"
          y2="0.5"
          stroke={color}
          strokeWidth="4"
        />
        <line
          x1="2.00"
          y1="0.5"
          x2="4.00"
          y2="0.5"
          stroke={color}
          strokeWidth="1"
        />
        <line
          x1="4.00"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="4"
        />
      </pattern>
    ),
  },
  LinePattern7: {
    id: "line-pattern7",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern7",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="5,1"
        />
      </pattern>
    ),
  },
  LinePattern8: {
    id: "line-pattern8",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern8",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="3.00"
          y2="0.5"
          stroke={color}
          strokeWidth="6"
        />
        <line
          x1="3.00"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="2"
        />
      </pattern>
    ),
  },
  LinePattern9: {
    id: "line-pattern9",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern9",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="0.5,4.5"
        />
      </pattern>
    ),
  },
  LinePattern10: {
    id: "line-pattern10",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern10",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.25"
          x2="6.00"
          y2="0.25"
          stroke={color}
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="0.75"
          x2="6.00"
          y2="0.75"
          stroke={color}
          strokeWidth="1"
        />
      </pattern>
    ),
  },
  LinePattern11: {
    id: "line-pattern11",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern11",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="2.00"
          y2="0.5"
          stroke={color}
          strokeWidth="8"
        />
        <line
          x1="2.00"
          y1="0.5"
          x2="4.00"
          y2="0.5"
          stroke={color}
          strokeWidth="2"
        />
        <line
          x1="4.00"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="8"
        />
      </pattern>
    ),
  },
  LinePattern12: {
    id: "line-pattern12",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern12",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.5"
          x2="6.00"
          y2="0.5"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="1,1"
        />
      </pattern>
    ),
  },
  LinePattern13: {
    id: "line-pattern13",
    width: 6.0,
    patternFillType: "Line",
    height: 1,
    name: "LinePattern13",
    x1: "0",
    y1: "0.5",
    x2: "6.00",
    y2: "0.5",
    patternUnits: "userSpaceOnUse",
    fill: "#000000",
    content: (color?: string, id?: string) => (
      <pattern id={id} width="6.00" height="1" patternUnits="userSpaceOnUse">
        <line
          x1="0"
          y1="0.25"
          x2="6.00"
          y2="0.25"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="2,3"
        />
        <line
          x1="0"
          y1="0.75"
          x2="6.00"
          y2="0.75"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="2,3"
        />
      </pattern>
    ),
  },
};
