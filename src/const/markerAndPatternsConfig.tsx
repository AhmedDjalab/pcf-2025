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

export type MarkerConfig = {
  id: string;
  markerUnits: string;
  config: {
    viewBox: string;
    markerWidth: number;
    markerHeight: number;
    refX: number;
    refY: number;
    orient: string;
    markerUnits: string;
    d?: string;
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
};
