import { ColorFormatType, IPluginMessage, IResult } from "../typings";

figma.showUI(__html__, { width: 400, height: 600 });

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

  const result = generateResult(language === "scss" && useVariables, [
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
      (p) => p.visible && (p.type === "SOLID" || p.type === "GRADIENT_LINEAR"),
    ) as (SolidPaint | GradientPaint)[];

    if (paints.length === 0) {
      return {};
    }

    if (paints[0].type === "SOLID") {
      const { color, opacity } = paints[0];
      const opacityParam = generateOpacity(opacity);
      const value = generateColor(colorFormat, color, opacityParam);

      return {
        name: name,
        value: value,
      };
    } else {
      const { gradientStops, gradientTransform } = paints[0];

      const degree = `${convertIntoDegree(gradientTransform)}deg`;

      const valArr = gradientStops.map((gradient) => {
        const { position, color } = gradient;
        const { r, g, b, a } = color;
        const opacityParam = generateOpacity(a);
        const stopVal = generateColor(colorFormat, { r, g, b }, opacityParam);
        const positionVal = Math.round(position * 100);

        return `${stopVal} ${positionVal}%`;
      });

      return {
        name: name,
        value: `linear-gradient(${degree}, ${valArr.join(", ")})`,
      };
    }
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
    // MEMO: Destructuring an object with rest syntax causes an error for some reason
    const { r, g, b, a } = color;
    const opacityParam = generateOpacity(a);
    const value = generateColor(colorFormat, { r, b, g }, opacityParam);

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

const generateOpacity = (val: number | undefined): number | undefined => {
  if (val === 1 || val === undefined) return undefined;
  else return Math.round(val * 100) / 100;
};

const generateColor = (
  colorFormat: ColorFormatType,
  rgb: RGB,
  opacity: number | undefined,
): string => {
  let value;

  switch (colorFormat) {
    case "hsl":
    default:
      value = convertIntoHSL(rgb, opacity);
      break;
    case "hex":
      value = convertIntoHEX(rgb, opacity);
      break;
    case "rgb":
      value = convertIntoRGB(rgb, opacity);
      break;
  }

  return value;
};

const convertIntoDegree = (matrix: Transform): number => {
  const values = [...matrix[0], ...matrix[1]];
  const [a, b] = values;
  const angle = Number((Math.atan2(b, a) * (180 / Math.PI) + 90).toFixed(2));

  return angle <= 0 ? angle + 360 : angle;
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
    return Math.round(255 * percentage)
      .toString(16)
      .padStart(2, "0");
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
