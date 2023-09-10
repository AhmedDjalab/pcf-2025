import textures from "textures";

export interface TextureData {
  id: string;
  label: string;
  configuration: any;
}

const texturesData: TextureData[] = [
  {
    id: "texture1",
    label: "Heavier Lines",
    configuration: textures.lines().heavier(),
  },
  {
    id: "texture2",
    label: "Lighter Lines",
    configuration: textures.lines().lighter(),
  },
  {
    id: "texture3",
    label: "Thicker Lines",
    configuration: textures.lines().thicker(),
  },
  {
    id: "texture4",
    label: "Thinner Lines",
    configuration: textures.lines().thinner(),
  },
  {
    id: "texture5",
    label: "Heavier and Thinner",
    configuration: textures.lines().heavier(10).thinner(1.5),
  },
  {
    id: "texture6",
    label: "Size 4, Stroke Width 1",
    configuration: textures.lines().size(4).strokeWidth(1),
  },
  {
    id: "texture7",
    label: "Size 8, Stroke Width 2",
    configuration: textures.lines().size(8).strokeWidth(2),
  },
  {
    id: "texture8",
    label: "Vertical Crisp Edges",
    configuration: textures
      .lines()
      .orientation("vertical")
      .strokeWidth(1)
      .shapeRendering("crispEdges")
      .stroke("darkorange"),
  },
  {
    id: "texture9",
    label: "3/8 Orientation, Dark Orange Stroke",
    configuration: textures.lines().orientation("3/8").stroke("darkorange"),
  },
  {
    id: "texture10",
    label: "Multiple Orientations",
    configuration: textures
      .lines()
      .orientation("3/8", "7/8")
      .stroke("darkorange"),
  },
  {
    id: "texture11",
    label: "Diagonal, Size 40, Stroke 26",
    configuration: textures
      .lines()
      .orientation("diagonal")
      .size(40)
      .strokeWidth(26)
      .stroke("darkorange")
      .background("firebrick"),
  },
  {
    id: "texture12",
    label: "Paths, hexagons darkorange",
    configuration: textures
      .paths()
      .d("hexagons")
      .size(8)
      .strokeWidth(2)
      .stroke("darkorange"),
  },
  {
    id: "texture13",
    label: "Path, woven, thicker",
    configuration: textures.paths().d("woven").lighter().thicker(),
  },
  {
    id: "texture14",
    label: "Circle,complement",
    configuration: textures.circles().complement(),
  },
  {
    id: "texture15",
    label: "Circle,radius",
    configuration: textures
      .circles()
      .radius(4)
      .fill("transparent")
      .strokeWidth(2),
  },
];

export default texturesData;
