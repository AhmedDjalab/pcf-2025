export interface LineStyle {
  name: string;
  id: string;
  style?: {
    stroke?: string;
    "stroke-width": string;
    "stroke-dasharray"?: string;
    "marker-start"?: string;
    "marker-end"?: string;
  };
  className?: string;
  patternUrl?: string;
  patternId?: string;
  markerStartId?: string;
  markerEndId?: string;
  markerId?: string;
  markerEndName?: string;
  markerStartName?: string;
}

type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
};
export type PatternAndMarkerMap = Record<
  string,
  {
    pattern?: {
      id: string;
      text: string;
      fontSize: number;
      fontFamily: string;
      fontWeight?: string;
    } | null;
    markerStart?: {
      id: string;
      path?: string;
      fill?: string;
      lines?: Line[];
    } | null;
    markerEnd?: {
      id: string;
      path?: string;
      fill?: string;
      lines?: Line[];
    } | null;
  }
>;

export const lineStyles: LineStyle[] = [
  {
    name: "Solid Line",
    id: "solid-line",
    style: {
      "stroke-width": "2",
      "stroke-dasharray": "0",
    },
    className: "stroke-black stroke-opacity-100",
  },
  {
    name: "Dotted Line",
    id: "dotted-line",
    style: {
      "stroke-width": "2",
      "stroke-dasharray": "2, 2",
    },
    className: "stroke-black stroke-opacity-100 stroke-dotted",
  },

  // {
  //   name: "Dashed Line",
  //   id: "dashed-line",
  //   patternUrl: "dashed-pattern",
  //   patternId: "dashed",
  // },
  // {
  //   name: "inset Line",
  //   id: "inset-line",
  //   patternUrl: "inset-pattern",
  //   patternId: "inset",
  // },
  {
    name: "arrow end Line",
    id: "arrow-end-line",
    markerEndId: "arrow-end-marker",
    markerEndName: "arrowEnd",
  },
  {
    name: "arrow Line",
    id: "arrow-start-line",
    markerEndId: "arrow-end-marker",
    markerStartId: "arrow-start-marker",
    markerEndName: "arrowEnd",
    markerStartName: "arrowStart",
  },
  {
    name: "bracket  Line",
    id: "bracket-start-marker",
    markerEndId: "bracket-end-marker",
    markerStartId: "bracket-start-marker",
    markerStartName: "bracketStartMarker",
    markerEndName: "bracketEndMarker",
  },
  // {
  //   name: "double arrow Line",
  //   id: "double-arrow-pattern-line",
  //   patternUrl: "double-arrow-pattern",
  //   patternId: "double-arrow",
  // },
  // {
  //   name: "Diagonal Stripes Line",
  //   id: "diagonal-stripes-line",
  //   patternUrl: "diagonal-stripes-pattern",
  //   patternId: "diagonalStripes",
  // },
  // {
  //   name: "Double Waves Line",
  //   id: "double-waves-line",
  //   patternUrl: "double-waves-pattern",
  //   patternId: "doubleWaves",
  // },
  // {
  //   name: "Parallel Lines Line",
  //   id: "parallel-lines-line",
  //   patternUrl: "parallel-lines-pattern",
  //   patternId: "parallelLines",
  // },
  // {
  //   name: "Zigzag Double Line",
  //   id: "zigzag-double-line",
  //   patternUrl: "zigzag-double-pattern",
  //   patternId: "zigzagDouble",
  // },
  // {
  //   name: "Starburst Line",
  //   id: "starburst-line",
  //   patternUrl: "starburst-pattern",
  //   patternId: "starburst",
  // },
  // {
  //   name: "Concentric Circles Line",
  //   id: "concentric-circles-line",
  //   patternUrl: "concentric-circles-pattern",
  //   patternId: "concentricCircles",
  // },
  // {
  //   name: "Curved Stripes Line",
  //   id: "curved-stripes-line",
  //   patternUrl: "curved-stripes-pattern",
  //   patternId: "curvedStripes",
  // },
];
