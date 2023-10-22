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
    patternUnits: string;
    fill?: string;
    content: (width: any, height: any, id?: string) => any;
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
  content: (id?: string) => JSX.Element;
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
    content: (id?: string) => (
      <marker
        key={id}
        id={id || "arrow-end-marker"}
        {...markersConfig.arrowEnd.config}
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
    content: (id?: string) => (
      <marker
        key={id}
        id={id || "arrow-start-marker"}
        {...markersConfig.arrowStart.config}
      >
        <path d="M 0 10 L 10 5 L 0 0 z" />
      </marker>
    ),
  },

  // bracketStartMarker: {
  //   id: "bracket-start-marker",
  //   markerUnits: "userSpaceOnUse",
  //   config: {
  //     viewBox: "0 0 10 10",
  //     markerWidth: 8,
  //     markerHeight: 8,
  //     refX: 0,
  //     refY: 5,
  //     orient: "auto",
  //     markerUnits: "userSpaceOnUse",
  //   },
  //   content: (id) => {
  //     return (
  //       <marker
  //         id={id || "bracket-start-marker"}
  //         {...markersConfig.bracketStartMarker.config}
  //       >
  //         <path d="M0,0 L0,10 L10,5 Z" fill="black" />
  //       </marker>
  //     );
  //   },
  // },
  // bracketEndMarker: {
  //   id: "bracket-end-marker",
  //   markerUnits: "userSpaceOnUse",
  //   config: {
  //     viewBox: "0 0 10 10",
  //     markerWidth: 8,
  //     markerHeight: 8,
  //     refX: 10,
  //     refY: 5,
  //     orient: "auto",
  //     markerUnits: "userSpaceOnUse",
  //   },
  //   content: (id) => {
  //     return (
  //       <marker
  //         id={id || "bracket-end-marker"}
  //         {...markersConfig.bracketEndMarker.config}
  //       >
  //         <path d="M10,0 L10,10 L0,5 Z" fill="black" />
  //       </marker>
  //     );
  //   },
  // },
};

// export const patternConfig: PatternConfig = {
//   dashed: {
//     id: "dashed-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <path
//         d="M0,10 L20,10"
//         strokeWidth="2"
//         stroke="black"
//         strokeDasharray="4 2"
//       />
//     ),
//   },
//   wavy: {
//     id: "wavy-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <path
//         d="M0,10 C5,0 15,0 20,10 C25,20 35,20 40,10"
//         strokeWidth="4"
//         stroke="black"
//       />
//     ),
//   },
//   zigzag: {
//     id: "zigzag-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <path d="M0,5 L5,10 L10,5 L15,10 L20,5" strokeWidth="2" stroke="black" />
//     ),
//   },
//   diagonalStripes: {
//     id: "diagonal-stripes-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <path
//         d="M-5,15 L15,-5 M-2,18 L18,-2 M1,20 L20,1"
//         strokeWidth="4"
//         stroke="black"
//       />
//     ),
//   },
//   doubleWaves: {
//     id: "double-waves-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <path
//         d="M0,10 C5,0 15,0 20,10 C25,20 35,20 40,10 M0,15 C5,5 15,5 20,15 C25,25 35,25 40,15"
//         strokeWidth="4"
//         stroke="black"
//       />
//     ),
//   },
//   parallelLines: {
//     id: "parallel-lines-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <>
//         <path d="M0,10 L20,10" strokeWidth="2" stroke="black" />
//         <path d="M0,15 L20,15" strokeWidth="2" stroke="black" />
//       </>
//     ),
//   },
//   zigzagDouble: {
//     id: "zigzag-double-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <path
//         d="M0,5 L5,10 L10,5 L15,10 L20,5 M0,15 L5,20 L10,15 L15,20 L20,15"
//         strokeWidth="4"
//         stroke="black"
//       />
//     ),
//   },
//   starburst: {
//     id: "starburst-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <>
//         <circle
//           cx="10"
//           cy="10"
//           r="8"
//           fill="none"
//           stroke="black"
//           strokeWidth="4"
//         />
//         <line x1="10" y1="2" x2="10" y2="18" stroke="black" strokeWidth="4" />
//         <line x1="2" y1="10" x2="18" y2="10" stroke="black" strokeWidth="4" />
//       </>
//     ),
//   },
//   concentricCircles: {
//     id: "concentric-circles-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <>
//         <circle
//           cx="10"
//           cy="10"
//           r="8"
//           fill="none"
//           stroke="black"
//           strokeWidth="4"
//         />
//         <circle
//           cx="10"
//           cy="10"
//           r="4"
//           fill="none"
//           stroke="black"
//           strokeWidth="4"
//         />
//       </>
//     ),
//   },
//   curvedStripes: {
//     id: "curved-stripes-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <path d="M0,10 C10,0 10,20 20,10" strokeWidth="4" stroke="black" />
//     ),
//   },

//   doubleArrow: {
//     id: "double-arrow-pattern",
//     width: 20,
//     height: 20,
//     patternUnits: "userSpaceOnUse",
//     content: (
//       <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <marker
//             id="double-arrow-start"
//             viewBox="0 0 10 10"
//             refX="5"
//             refY="5"
//             markerWidth="6"
//             markerHeight="6"
//             orient="auto"
//           >
//             <path d="M 0 5 L 10 0 L 10 10 z" />
//           </marker>
//           <marker
//             id="double-arrow-end"
//             viewBox="0 0 10 10"
//             refX="5"
//             refY="5"
//             markerWidth="6"
//             markerHeight="6"
//             orient="auto-start-reverse"
//           >
//             <path d="M 0 0 L 10 5 L 0 10 z" />
//           </marker>
//         </defs>
//         <line
//           x1="0"
//           y1="10"
//           x2="20"
//           y2="10"
//           strokeWidth="2"
//           stroke="black"
//           marker-start="url(#double-arrow-start)"
//           marker-end="url(#double-arrow-end)"
//         />
//       </svg>
//     ),
//   },
//   // Add more creative line patterns as needed
// };
