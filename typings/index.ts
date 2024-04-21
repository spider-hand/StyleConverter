export type LanguageType = "sass" | "css";

export type ColorFormatType = "hsl" | "hex" | "rgb";

export interface IPluginMessage {
  language: LanguageType;
  colorFormat: ColorFormatType;
  excludeFolderName: boolean;
  useVariables: boolean;
}

export interface IResult {
  rootClass: string;
  variables: string;
}
