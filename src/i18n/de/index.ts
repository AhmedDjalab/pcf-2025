import widget from "./widget.json";
import hotkey from "./hotkey.json";
import workMode from "src/config/workMode.json";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  widget,
  hotkey,
  workMode: workMode.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {}),
};
