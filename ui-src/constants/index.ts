import { ColorFormatType, LanguageType } from "../typings";

export const LANGUAGE_MAP = new Map<LanguageType, string>([
  ["sass", "SASS"],
  ["css", "CSS"],
]);

export const COLOR_FORMAT_MAP = new Map<ColorFormatType, string>([
  ["hsl", "HSL"],
  ["hex", "HEX"],
  ["rgb", "RGB"],
]);
