import { ColorFormatType, IPluginMessage, IResult } from "../typings";

figma.showUI(__html__, { width: 360, height: 600 });

figma.ui.onmessage = async ({
  language,
  colorFormat,
  excludeFolderName,
  useVariables,
}: IPluginMessage) => {
  const [paintStyles, effectStyles] = await Promise.all([
    figma.getLocalPaintStylesAsync(),
    figma.getLocalEffectStylesAsync(),
  ]);

  if (paintStyles.length === 0 && effectStyles.length === 0) {
    figma.notify("Styles cannot be found.");
    return;
  }

  const processedPaintStyles = processPaintStyles(
    colorFormat,
    excludeFolderName,
    paintStyles,
  );
  const processedEffectStyles = processEffectStyles(
    colorFormat,
    excludeFolderName,
    effectStyles,
  );

  const result = generateResult(language === "sass" && useVariables, [
    ...processedPaintStyles,
    ...processedEffectStyles,
  ]);
  figma.ui.postMessage(result);
};

const processPaintStyles = (
  colorFormat: ColorFormatType,
  excludeFolderName: boolean,
  paintStyles: PaintStyle[],
): { name?: string; value?: string }[] => {
  return paintStyles.map((s) => {
    const name = generateName(s.name, excludeFolderName);

    const paints = s.paints.filter(
      (p) => p.visible && p.type === "SOLID",
    ) as SolidPaint[];

    if (paints.length === 0) {
      return {};
    }

    const { color, opacity } = paints[0];
    const opacityParam =
      opacity !== 1 && opacity !== undefined
        ? Math.round(opacity * 10) / 10
        : undefined;

    let value: string;

    switch (colorFormat) {
      case "hsl":
      default:
        value = convertIntoHSL(color, opacityParam);
        break;
      case "hex":
        value = convertIntoHEX(color, opacityParam);
        break;
      case "rgb":
        value = convertIntoRGB(color, opacityParam);
        break;
    }

    return {
      name: name,
      value: value,
    };
  });
};

const processEffectStyles = (
  colorFormat: ColorFormatType,
  excludeFolderName: boolean,
  effectStyles: EffectStyle[],
) => {
  return effectStyles.map((e) => {
    const name = generateName(e.name, excludeFolderName);

    const shadowEffects = e.effects.filter(
      (effect) =>
        (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") &&
        effect.visible,
    ) as Array<DropShadowEffect | InnerShadowEffect>;

    if (shadowEffects.length === 0) {
      return {};
    }

    const { color, offset, type, radius, spread } = shadowEffects[0];
    // MEMO: Destructuring with rest syntax causes an error for some reason
    const { a, r, g, b } = color;
    const colorParam = { r: r, g: g, b: b };
    const opacityParam = a !== 1 ? Math.round(a * 100) / 100 : undefined;

    let value: string;

    switch (colorFormat) {
      case "hsl":
      default:
        value = convertIntoHSL(colorParam, opacityParam);
        break;
      case "hex":
        value = convertIntoHEX(colorParam, opacityParam);
        break;
      case "rgb":
        value = convertIntoRGB(colorParam, opacityParam);
        break;
    }

    return {
      name: name,
      value: `${type === "INNER_SHADOW" ? "inset " : ""}${offset.x}px ${offset.y}px ${radius}px${spread !== undefined ? ` ${spread}px ` : " "}${value}`,
    };
  });
};

const generateName = (name: string, excludeFolderName: boolean): string => {
  if (excludeFolderName) {
    name = name.split("/").pop() || name;
  }
  return name.replace(/[\s/]+/g, "-").replace(/[ /]/g, "-");
};

const convertIntoHSL = ({ r, g, b }: RGB, opacity?: number): string => {
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h: number, s: number, l: number;

  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;

  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  s = +(s * 100).toFixed(0);
  l = +(l * 100).toFixed(0);

  return opacity !== undefined
    ? `hsla(${h}, ${s}%, ${l}%, ${opacity})`
    : `hsl(${h}, ${s}%, ${l}%)`;
};

const convertIntoHEX = ({ r, g, b }: RGB, opacity?: number): string => {
  const toHex = (val: number): string => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const toHexAlpha = (percentage: number) => {
    return (percentage * 255).toString(16);
  };

  const hex = [
    opacity && toHexAlpha(opacity),
    toHex(r),
    toHex(g),
    toHex(b),
  ].join("");
  return `#${hex}`;
};

const convertIntoRGB = ({ r, g, b }: RGB, opacity?: number): string => {
  const toRGB = (val: number): string => {
    return Math.floor(val * 255).toString();
  };

  return opacity !== undefined
    ? `rgba(${toRGB(r)}, ${toRGB(g)}, ${toRGB(b)}, ${opacity})`
    : `rgb(${toRGB(r)}, ${toRGB(g)}, ${toRGB(b)})`;
};

const generateResult = (
  useVariables: boolean,
  styles: {
    name?: string;
    value?: string;
  }[],
): IResult => {
  let rootClass = ":root {\n";
  let variables = "";

  if (useVariables) {
    styles.forEach((style) => {
      if (style.name !== undefined && style.value !== undefined) {
        rootClass += `  --${style.name}: #{$${style.name}};\n`;
        variables += `$${style.name}: ${style.value};\n`;
      }
    });
  } else {
    styles.forEach((style) => {
      if (style.name !== undefined && style.value !== undefined) {
        rootClass += `  --${style.name}: ${style.value};\n`;
      }
    });
  }

  rootClass += "}\n";

  return {
    rootClass: rootClass,
    variables: variables,
  };
};
