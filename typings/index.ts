export type LanguageType = "scss" | "css";

export type ColorFormatType = "hsl" | "hex" | "rgb";

export interface IPluginMessage {
  language: LanguageType;
  colorFormat: ColorFormatType;
  excludeFolderName: boolean;
  useVariables: boolean;
}

export interface IStyle {
  name: string;
  value: string;
}

export interface IResult {
  rootClass: string;
  variables: string;
}
