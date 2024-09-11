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
  markerMidId?: string;
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
    markerMid?: {
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
  {
    name: "Double Line",
    id: "double-line",
    style: {
      "stroke-width": "4",
      "stroke-dasharray": "2, 2, 8, 2",
    },
    className: "stroke-black stroke-opacity-100",
  },
  {
    name: "Dash-Dot Line",
    id: "dash-dot-line",
    style: {
      "stroke-width": "3",
      "stroke-dasharray": "10, 5, 2, 5",
    },
    className: "stroke-black stroke-opacity-100",
  },
  {
    name: "Zigzag Line",
    id: "zigzag-line",
    style: {
      "stroke-width": "2",
      "stroke-dasharray": "4, 2, 4, 2",
    },
    className: "stroke-black stroke-opacity-100",
  },

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
    name: "circle Line",
    id: "circle-line",
    markerEndId: "circle-marker",
    markerStartId: "circle-marker",
    markerEndName: "circle",
    markerStartName: "circle",
    markerMidId: "circle-marker",
  },
  {
    name: "square Line",
    id: "square-line",
    markerEndId: "square-marker",
    markerStartId: "square-marker",
    markerMidId: "square-marker",
    markerEndName: "square",
    markerStartName: "square",
  },
  {
    name: "diamond Line",
    id: "diamond-line",
    markerEndId: "diamond-marker",
    markerStartId: "diamond-marker",
    markerMidId: "diamond-marker",
    markerEndName: "diamond",
    markerStartName: "diamond",
  },

  {
    name: "arrow with circle Line",
    id: "arrow-circle-line",
    markerEndId: "arrow-end-marker",
    markerStartId: "circle-marker",
    markerEndName: "arrowEnd",
    markerStartName: "circle",
  },
  {
    name: "arrow with circle Line",
    id: "arrow-circle-line",
    markerEndId: "circle-marker",
    markerStartId: "arrow-start-marker",
    markerEndName: "circle",
    markerStartName: "arrowStart",
  },

  {
    name: "Hexagon Line",
    id: "hexagon-line",
    markerEndId: "hexagon-marker",
    markerStartId: "hexagon-marker",
    markerMidId: "hexagon-marker",
    markerEndName: "hexagon",
    markerStartName: "hexagon",
  },
  {
    name: "Pentagon Line",
    id: "pentagon-line",
    markerEndId: "pentagon-marker",
    markerStartId: "pentagon-marker",
    markerMidId: "pentagon-marker",
    markerEndName: "pentagon",
    markerStartName: "pentagon",
  },
  {
    name: "Burst Line",
    id: "burst-line",
    markerEndId: "burst-marker",
    markerStartId: "burst-marker",
    markerMidId: "burst-marker",
    markerEndName: "burst",
    markerStartName: "burst",
  },

  {
    name: "Bolt Line",
    id: "bolt-line",
    markerEndId: "bolt-marker",
    markerStartId: "bolt-marker",
    markerMidId: "bolt-marker",
    markerEndName: "bolt",
    markerStartName: "bolt",
  },
];
