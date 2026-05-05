import { kleurData, demoPickerOrders } from "./data.js";

export const baseMaps = {
  HEA: {
    "100": "24010110096", "120": "240102120110", "140": "240103140135",
    "160": "240104160155", "180": "240105180175", "200": "240106200195",
    "220": "240107220215", "240": "240108240235", "260": "240109260255",
    "280": "240110280275", "300": "240111300295", "320": "240112320300",
    "340": "240113340300"
  },
  HEB: {
    "100": "240202100100", "120": "240203120120", "140": "240204140140",
    "160": "240205160160", "180": "240206180180", "200": "240207200200",
    "220": "240208220220", "240": "240209240240", "260": "240210260260",
    "280": "240211280280", "300": "240212300300", "320": "240213320300",
    "340": "240214340300"
  },
  IPE: {
    "100": "24040210050", "120": "24040312060", "140": "24040414070",
    "160": "24040516080", "180": "24040618090", "200": "240407200100",
    "220": "240408220110", "240": "240409240120", "270": "240410270135",
    "300": "240411300150", "330": "240412330165", "360": "240413360180",
    "400": "240414400200"
  },
  UNP: {
    "100": "24050210050", "120": "24050312060", "140": "24050414070",
    "160": "24050516080", "180": "24050618090", "200": "240507200100",
    "220": "240508220110", "240": "240509240120", "260": "240510260130",
    "280": "240511280140", "300": "240512300150", "330": "240513300165"
  }
};
export function getArticleCode(type, size, lengthMm, colorCode) {
  const length = Number(lengthMm);
  if (!type || !size || !length || !colorCode) return "";
  const base = baseMaps[type]?.[String(size)];
  if (!base) return "";
  return base + String(length) + "9" + String(colorCode);
}
export function findArticleByBase(base) {
  for (const typeName of Object.keys(baseMaps)) {
    for (const sizeName of Object.keys(baseMaps[typeName])) {
      if (baseMaps[typeName][sizeName] === base) {
        return { type: typeName, size: sizeName };
      }
    }
  }
  return null;
}
export function parseArticleCode(rawCode) {
  const cleanCode = String(rawCode || "").replace(/\D/g, "");
  if (!cleanCode) return null;
  const colorCodes = kleurData.map((c) => c.code).sort((a, b) => b.length - a.length);
  for (const colorCode of colorCodes) {
    if (!cleanCode.endsWith(colorCode)) continue;
    const withoutColor = cleanCode.slice(0, -colorCode.length);
    if (!withoutColor.endsWith("9")) continue;
    const withoutSeparator = withoutColor.slice(0, -1);
    for (let lengthDigits = 5; lengthDigits >= 4; lengthDigits--) {
      if (withoutSeparator.length <= lengthDigits) continue;
      const lengthText = withoutSeparator.slice(-lengthDigits);
      const length = Number(lengthText);
      const base = withoutSeparator.slice(0, -lengthDigits);
      if (length < 1000 || length > 20000 || length % 50 !== 0) continue;
      const found = findArticleByBase(base);
      if (!found) continue;
      const color = kleurData.find((c) => c.code === colorCode);
      return {
        type: found.type,
        size: found.size,
        length,
        colorCode,
        colorName: color?.naam || "",
        code: cleanCode
      };
    }
  }
  return null;
}
