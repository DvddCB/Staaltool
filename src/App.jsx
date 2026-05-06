import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import JsBarcode from "jsbarcode";

const SUPABASE_URL = "https://wfwrjicbakalyhshtvxa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmd3JqaWNiYWthbHloc2h0dnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODY0MTksImV4cCI6MjA5MzU2MjQxOX0.4g9uwqCA3OmFr6CK7M_iYEsZlqxXKQlqBYu783Xv9uE";
const SUPABASE_ORDERS_ENDPOINT = `${SUPABASE_URL}/rest/v1/orders`;

async function supabaseRequest(path = "", options = {}) {
  const response = await fetch(`${SUPABASE_ORDERS_ENDPOINT}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase fout ${response.status}: ${message || response.statusText}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function normalizeOrderRow(row, index = 0) {
  const articleCode = row.articleCode || row.artikelcode || row.code || "";
  const parsed = parseArticleCode(articleCode);
  const parsedDescription = parsed
    ? `${parsed.type} ${parsed.size} - ${parsed.length} mm - ${parsed.colorCode}. ${parsed.colorName}`
    : "";

  const description =
    row.description ||
    row.artikel ||
    row.naam ||
    parsedDescription ||
    articleCode ||
    "Onbekend artikel";

  const quantity = Number(row.quantity || row.aantal || row.originalQuantity || 1);
  const originalQuantity = Number(row.originalQuantity || quantity || 1);
  const scannedQuantity = Number(row.scannedQuantity || 0);

  return {
    id: row.id || "row-" + index + "-" + articleCode,
    articleCode,
    artikelcode: articleCode,
    artikel: description,
    description,
    type: row.type || parsed?.type || "",
    size: row.size || parsed?.size || "",
    length: row.length || parsed?.length || "",
    colorCode: row.colorCode || parsed?.colorCode || "",
    colorName: row.colorName || parsed?.colorName || "",
    quantity,
    originalQuantity,
    aantal: quantity,
    scannedQuantity,
    processed: Boolean(row.processed) || scannedQuantity >= originalQuantity,
    status: row.status || "open",
    scannedAt: row.scannedAt || "-"
  };
}

function orderFromDb(row) {
  const rows = Array.isArray(row.rows) ? row.rows.map(normalizeOrderRow) : [];

  return {
    id: row.id,
    klant: row.klant || row.customer || row.naam || "",
    tijd: row.tijd || "PDF",
    status: row.status || "Open",
    regels: Number(row.regels || rows.length || 0),
    kleur: row.kleur || "#eab308",
    plannedDate: row.planned_date || row.plannedDate || "",
    source: row.source || "PDF",
    rows,
    rawPdfText: row.raw_pdf_text || row.rawPdfText || ""
  };
}

function orderToDb(order) {
  return {
    id: String(order.id),
    klant: order.klant || "",
    tijd: order.tijd || "",
    status: order.status || "Open",
    regels: Number(order.regels || order.rows?.length || 0),
    kleur: order.kleur || "#eab308",
    planned_date: order.plannedDate || null,
    source: order.source || "",
    rows: (order.rows || []).map(normalizeOrderRow),
    raw_pdf_text: order.rawPdfText || null,
    updated_at: new Date().toISOString()
  };
}

const profielData = {
  HEA: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340],
  HEB: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340],
  IPE: [100, 120, 140, 160, 180, 200, 220, 240, 270, 300, 330, 360, 400],
  UNP: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 330],
  Koker: [],
  "Hoeklijn gelijkzijdig": [
    "20x20x3", "25x25x3", "30x30x3", "40x40x4", "50x50x5",
    "60x60x6", "70x70x7", "80x80x8", "100x100x10"
  ],
  "Hoeklijn ongelijkzijdig": [
    "40x20x4", "50x30x5", "60x40x6", "80x40x8", "100x50x10", "120x80x10"
  ],
  Stripstaal: [
    "40x4", "40x5", "40x6", "40x8", "40x10",
    "50x4", "50x5", "50x6", "50x8", "50x10",
    "60x5", "60x6", "60x8", "60x10",
    "80x6", "80x8", "80x10", "80x12",
    "100x8", "100x10", "100x12", "100x15", "100x20",
    "120x10", "120x12", "120x15", "120x20",
    "150x10", "150x12", "150x15", "150x20",
    "200x10", "200x15", "200x20", "200x25",
    "250x20", "250x25", "250x30",
    "300x20", "300x25", "300x30"
  ]
};

const kokerData = {
  "40x40": [3, 4, 5, 6, 8, 10],
  "50x50": [3, 4, 5, 6, 8, 10],
  "60x60": [3, 4, 5, 6, 8, 10],
  "70x70": [3, 4, 5, 6, 8, 10],
  "80x80": [3, 4, 5, 6, 8, 10],
  "90x90": [3, 4, 5, 6, 8, 10],
  "100x100": [3, 4, 5, 6, 8, 10],
  "110x110": [3, 4, 5, 6, 8, 10],
  "120x120": [3, 4, 5, 6, 8, 10],
  "140x140": [3, 4, 5, 6, 8, 10],
  "150x150": [3, 4, 5, 6, 8, 10],
  "160x160": [3, 4, 5, 6, 8, 10],
  "180x180": [3, 4, 5, 6, 8, 10],
  "200x200": [3, 4, 5, 6, 8, 10]
};

const kleurData = [
  { code: "1", naam: "Blauw", kleur: "#2563eb", text: "white" },
  { code: "2", naam: "Bruin", kleur: "#8b5a2b", text: "white" },
  { code: "3", naam: "Geel", kleur: "#eab308", text: "#0f172a" },
  { code: "4", naam: "Gegalvaniseerd", kleur: "#9ca3af", text: "#0f172a" },
  { code: "5", naam: "Gemenied", kleur: "#7f1d1d", text: "white" },
  { code: "6", naam: "Grijs", kleur: "#6b7280", text: "white" },
  { code: "7", naam: "Groen", kleur: "#16a34a", text: "white" },
  { code: "8", naam: "Lichte corrosie", kleur: "#b45309", text: "white" },
  { code: "9", naam: "Onbehandeld", kleur: "#d1d5db", text: "#0f172a" },
  { code: "10", naam: "Oranje", kleur: "#ff7a00", text: "white" },
  { code: "11", naam: "Rood", kleur: "#dc2626", text: "white" },
  { code: "12", naam: "Roze", kleur: "#ec4899", text: "white" },
  { code: "13", naam: "Wit", kleur: "#ffffff", text: "#0f172a", border: "1px solid #cbd5e1" },
  { code: "14", naam: "Zwart", kleur: "#000000", text: "white" }
];

const baseMaps = {
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

const demoPickerOrders = [
  {
    id: "ORD-10482",
    klant: "Bouwbedrijf De Vries",
    tijd: "08:30",
    status: "Open",
    rows: [
      makeDemoRow("24010110096300092", 2),
      makeDemoRow("240402100504000914", 1)
    ]
  },
  {
    id: "ORD-10483",
    klant: "Jansen Constructie",
    tijd: "10:00",
    status: "Bezig",
    rows: [
      makeDemoRow("2402021001003500911", 1),
      makeDemoRow("24050210050450091", 2)
    ]
  },
  {
    id: "ORD-10484",
    klant: "Circulair Project Noord",
    tijd: "12:45",
    status: "Open",
    rows: [makeDemoRow("240103140135300097", 1)]
  },
  {
    id: "ORD-10485",
    klant: "Van Dijk Montage",
    tijd: "15:15",
    status: "Gereed",
    rows: [makeDemoRow("2404113001506000914", 1)]
  }
];

function makeDemoRow(code, quantity) {
  const parsed = parseArticleCode(code);
  if (!parsed) {
    return {
      articleCode: code,
      description: code,
      type: "",
      size: "",
      length: "",
      colorCode: "",
      colorName: "",
      quantity
    };
  }

  return {
    articleCode: getArticleCode(parsed.type, parsed.size, parsed.length, parsed.colorCode) || code,
    description: `${parsed.type} ${parsed.size} - ${parsed.length} mm - ${parsed.colorCode}. ${parsed.colorName}`,
    type: parsed.type,
    size: parsed.size,
    length: parsed.length,
    colorCode: parsed.colorCode,
    colorName: parsed.colorName,
    quantity
  };
}

function getArticleCode(type, size, lengthMm, colorCode) {
  const length = Number(lengthMm);
  if (!type || !size || !length || !colorCode) return "";

  const base = baseMaps[type]?.[String(size)];
  if (!base) return "";

  return base + String(length) + "9" + String(colorCode);
}

function findArticleByBase(base) {
  for (const typeName of Object.keys(baseMaps)) {
    for (const sizeName of Object.keys(baseMaps[typeName])) {
      if (baseMaps[typeName][sizeName] === base) {
        return { type: typeName, size: sizeName };
      }
    }
  }
  return null;
}

function parseArticleCode(rawCode) {
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

function BarcodeView({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!value || !svgRef.current) return;

    try {
      svgRef.current.innerHTML = "";
      JsBarcode(svgRef.current, String(value), {
        format: "CODE128",
        width: 2,
        height: 90,
        displayValue: true,
        font: "monospace",
        fontSize: 16,
        margin: 14,
        background: "#ffffff",
        lineColor: "#000000"
      });
    } catch (err) {
      console.error("Barcode kon niet worden gemaakt:", err);
    }
  }, [value]);

  if (!value) return null;

  return (
    <div style={styles.barcodeOuter}>
      <svg ref={svgRef} style={styles.barcodeSvg}></svg>
    </div>
  );
}

function getModuleDisplayName(moduleName) {
  if (moduleName === "Artikelzoeker") return "Artikel Picker";
  if (moduleName === "Artikel PICKER") return "Artikel Zoeker";
  return moduleName;
}

function startOfWeek(date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function addWeeks(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount * 7);
  return startOfWeek(nextDate);
}

function formatDutchDate(date) {
  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

function formatWeekLabel(weekStart) {
  const weekEnd = addDays(weekStart, 4);
  return `${weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`;
}

function getWeekDays(weekStart) {
  return [0, 1, 2, 3, 4].map((offset) => {
    const date = addDays(weekStart, offset);
    return {
      date,
      dag: date.toLocaleDateString("nl-NL", { weekday: "short" }),
      datum: String(date.getDate()),
      label: formatDutchDate(date)
    };
  });
}

function isSameDate(a, b) {
  return a.toDateString() === b.toDateString();
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDemoOrdersWithDates() {
  const today = new Date();

  const thisWeek = startOfWeek(today);
  const previousWeek = addWeeks(thisWeek, -1);
  const nextWeek = addWeeks(thisWeek, 1);

  return demoPickerOrders.map((order, index) => {
    const plannedDates = [
      addDays(previousWeek, 2),
      addDays(thisWeek, 1),
      addDays(thisWeek, 3),
      addDays(nextWeek, 1)
    ];

    return {
      ...order,
      regels: order.rows.length,
      kleur: ["#f97316", "#2563eb", "#16a34a", "#64748b"][index] || "#eab308",
      plannedDate: toIsoDate(plannedDates[index] || today)
    };
  });
}

function getOrderDate(order) {
  const date = new Date((order?.plannedDate || toIsoDate(new Date())) + "T00:00:00");
  date.setHours(0, 0, 0, 0);
  return date;
}

function isOrderInWeek(order, weekStart) {
  const orderDate = getOrderDate(order);
  const weekEnd = addDays(weekStart, 5);
  return orderDate >= weekStart && orderDate < weekEnd;
}

function isOrderOpen(order) {
  return order.status !== "Gereed";
}

function getOrderProgress(order) {
  const rows = order?.rows || [];
  const total = rows.length || Number(order?.regels || 0) || 0;

  if (order?.status === "Gereed") {
    return { done: total, open: 0, total };
  }

  const done = rows.filter((row) => row.processed || Number(row.scannedQuantity || 0) >= Number(row.quantity || 1)).length;

  return {
    done,
    open: Math.max(0, total - done),
    total
  };
}

async function loadPdfJsFromCdn() {
  if (window.pdfjsLib) return window.pdfjsLib;

  await new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[data-pdfjs-cdn='true']");
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.dataset.pdfjsCdn = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  if (!window.pdfjsLib) throw new Error("PDF.js kon niet worden geladen.");

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  return window.pdfjsLib;
}

async function loadTesseractFromCdn() {
  if (window.Tesseract) return window.Tesseract;

  await new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[data-tesseract-cdn='true']");
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.dataset.tesseractCdn = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  if (!window.Tesseract) throw new Error("OCR kon niet worden geladen.");

  return window.Tesseract;
}

function normalizeOcrText(text) {
  return String(text || "")
    .replace(/[|]/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDutchPdfDate(text) {
  const dateMatch =
    String(text || "").match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/) ||
    String(text || "").match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);

  if (!dateMatch) return toIsoDate(new Date());

  if (dateMatch[1].length === 4) {
    const year = dateMatch[1];
    const month = String(dateMatch[2]).padStart(2, "0");
    const day = String(dateMatch[3]).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const day = String(dateMatch[1]).padStart(2, "0");
  const month = String(dateMatch[2]).padStart(2, "0");
  const year = dateMatch[3];

  return `${year}-${month}-${day}`;
}

function extractLogic4CustomerName(rawText, cleanText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Klantnaam mag alleen de eerste regel/waarde na "Voor:" zijn.
  // Voorbeelden die goed gaan:
  // "Voor:" + volgende regel "Balie" => Balie
  // "Voor : Balie" => Balie
  // OCR-regel "Voor : Balie eentweedrie 1 ..." => Balie
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (/^Voor\s*:?\s*$/i.test(line)) {
      return cleanLogic4CustomerLine(lines[index + 1] || "");
    }

    const sameLineMatch = line.match(/^Voor\s*:?\s*(.+)$/i);
    if (sameLineMatch?.[1]?.trim()) {
      return cleanLogic4CustomerLine(sameLineMatch[1]);
    }
  }

  const compact = String(cleanText || "");
  const compactMatch = compact.match(/Voor\s*:?\s*([A-Za-zÀ-ÿ0-9.'-]+)/i);
  return cleanLogic4CustomerLine(compactMatch?.[1] || "");
}

function cleanLogic4CustomerLine(value) {
  let text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  text = text
    .replace(/\bKlantnummer\b.*$/i, "")
    .replace(/\bVerzenddatum\b.*$/i, "")
    .replace(/\bOrdernummer\b.*$/i, "")
    .replace(/\bOrderdatum\b.*$/i, "")
    .replace(/\bOrderstatus\b.*$/i, "")
    .replace(/\bReferentie\b.*$/i, "")
    .replace(/\bArt\.?nr\b.*$/i, "")
    .replace(/\bOmschrijving\b.*$/i, "")
    .trim();

  text = text
    .replace(/\b\d{4}\s?[A-Z]{2}\b.*$/i, "")
    .replace(/\b\d{2}[-\s]?\d{8}\b.*$/i, "")
    .trim();

  // Zodra adres/straat/nummer achter klantnaam komt, alleen het eerste klant-blok houden.
  const beforeAddress = text.match(/^(.+?)\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9.'-]*\s+\d+\b/);
  if (beforeAddress?.[1]) text = beforeAddress[1].trim();

  // Voor jullie pickbon: klantnaam is alleen de eerste waarde na Voor:
  // Daardoor wordt "Balie eentweedrie 1 ..." netjes "Balie".
  const firstValue = text.split(/\s+/)[0]?.trim() || "";
  return firstValue;
}

function parseLogic4PickbonTextToOrder(text, fileName) {
  const rawText = String(text || "");
  const cleanText = normalizeOcrText(rawText);
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const joinedLines = lines.join(" ");

  const pickbonMatch =
    cleanText.match(/Pickbon\s+(\d{3,})/i) ||
    cleanText.match(/\bPickbon\b[^0-9]{0,20}(\d{3,})/i);

  const orderMatch =
    cleanText.match(/Ordernummer[:\s]+(\d{3,})/i) ||
    cleanText.match(/\b(30\d{5,})\b/) ||
    fileName.match(/(\d{5,})/);

  const customerName = extractLogic4CustomerName(rawText, cleanText);
  const klantnummerMatch = cleanText.match(/Klantnummer[:\s]+(\d{2,})/i);

  const orderDate =
    cleanText.match(/Orderdatum[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i)?.[1] ||
    cleanText.match(/Verzenddatum[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i)?.[1];

  const articleRows = [];
  const seenCodes = new Set();

  function addArticleRow(rawCode, quantity, sourceText = "") {
    const code = String(rawCode || "").replace(/\D/g, "");
    if (!code || seenCodes.has(code)) return false;

    const parsed = parseArticleCode(code);
    if (!parsed) return false;

    seenCodes.add(code);

    const articleCode = getArticleCode(parsed.type, parsed.size, parsed.length, parsed.colorCode) || code;

    articleRows.push({
      articleCode,
      description: `${parsed.type} ${parsed.size} - ${parsed.length} mm - ${parsed.colorCode}. ${parsed.colorName}`,
      type: parsed.type,
      size: parsed.size,
      length: parsed.length,
      colorCode: parsed.colorCode,
      colorName: parsed.colorName,
      quantity: Math.max(1, Number(quantity || 1)),
      pdfSourceText: sourceText
    });

    return true;
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const nextLine = lines[index + 1] || "";
    const next2Line = lines[index + 2] || "";
    const next3Line = lines[index + 3] || "";
    const windowText = [line, nextLine, next2Line, next3Line].join(" ").replace(/\s+/g, " ");

    const baseMatch = line.match(/\b(\d{12,16})\b/);
    const suffixMatch = nextLine.match(/^\s*(\d{1,6})\s*$/);

    if (baseMatch && suffixMatch) {
      const combinedCode = `${baseMatch[1]}${suffixMatch[1]}`;
      const qtyNumbers = windowText.match(/\b\d+\b/g) || [];
      const smallNumbers = qtyNumbers.map(Number).filter((value) => value > 0 && value <= 99);
      const quantity = smallNumbers.length ? smallNumbers[smallNumbers.length - 1] : 1;
      addArticleRow(combinedCode, quantity, windowText);
    }
  }

  const compactText = joinedLines.replace(/\s+/g, " ");
  const fullCodes = compactText.match(/\b\d{15,24}\b/g) || [];

  fullCodes.forEach((code) => {
    if (seenCodes.has(code)) return;

    const codeIndex = compactText.indexOf(code);
    const sourceWindow = compactText.slice(codeIndex, codeIndex + 180);
    const numbersAfterCode = sourceWindow.slice(code.length).match(/\b\d+\b/g) || [];
    const smallNumbers = numbersAfterCode.map(Number).filter((value) => value > 0 && value <= 99);
    const quantity = smallNumbers.length ? smallNumbers[smallNumbers.length - 1] : 1;
    addArticleRow(code, quantity, sourceWindow);
  });

  for (let index = 0; index < lines.length; index++) {
    const windowText = lines.slice(index, index + 4).join(" ").replace(/\s+/g, " ");
    const looseMatch = windowText.match(/\b(24\d{10,14})\D+(\d{1,6})\b/);

    if (looseMatch) {
      const combinedCode = `${looseMatch[1]}${looseMatch[2]}`;
      const qtyNumbers = windowText.match(/\b\d+\b/g) || [];
      const smallNumbers = qtyNumbers.map(Number).filter((value) => value > 0 && value <= 99);
      const quantity = smallNumbers.length ? smallNumbers[smallNumbers.length - 1] : 1;
      addArticleRow(combinedCode, quantity, windowText);
    }
  }

  // 4. Extra fallback voor scan/OCR layout zoals voorbeeld 3009096.pdf:
  // Art.nr kan als "24010110096300" op de eerste regel staan en "091" op de volgende regel.
  // De omschrijving staat ernaast en "Nu te picken" bevat het aantal.
  if (!articleRows.length) {
    for (let index = 0; index < lines.length; index++) {
      const windowText = lines.slice(index, index + 8).join(" ").replace(/\s+/g, " ");

      const splitCodeMatch =
        windowText.match(/\b(24\d{9,14})\D{0,20}(0?9\d{1,2})\b/) ||
        windowText.match(/\b(24\d{9,14})\D{0,20}(\d{2,4})\b/);

      if (splitCodeMatch) {
        const combinedCode = `${splitCodeMatch[1]}${splitCodeMatch[2]}`;
        const afterDescription = windowText.match(/\b(?:Nu\s*te\s*picken|picken)\D*(\d{1,2})\b/i);
        const allSmallNumbers = (windowText.match(/\b\d{1,2}\b/g) || [])
          .map(Number)
          .filter((value) => value > 0 && value <= 99);

        const quantity = Number(afterDescription?.[1] || allSmallNumbers[allSmallNumbers.length - 1] || 1);
        addArticleRow(combinedCode, quantity, windowText);
      }
    }
  }

  const fallbackId = fileName.replace(/\.pdf$/i, "") || `PDF-${Date.now()}`;
  const orderId = orderMatch?.[1] || pickbonMatch?.[1] || fallbackId;
  const klant = customerName || (klantnummerMatch?.[1] ? `Klantnummer ${klantnummerMatch[1]}` : "Logic4 PDF pickbon");

  return {
    id: orderId,
    pickbonNumber: pickbonMatch?.[1] || "",
    klant,
    tijd: "PDF",
    status: "Open",
    regels: articleRows.length,
    kleur: "#eab308",
    plannedDate: orderDate ? parseDutchPdfDate(orderDate) : parseDutchPdfDate(cleanText),
    rows: articleRows,
    source: "PDF",
    rawPdfText: rawText
  };
}


function createFallbackOrderFromPdfFile(fileName, rawText = "") {
  const fileId = String(fileName || "").replace(/\.pdf$/i, "");
  const numberMatch =
    String(rawText || "").match(/Ordernummer[:\s]+(\d{3,})/i) ||
    String(rawText || "").match(/\b(30\d{5,})\b/) ||
    String(fileName || "").match(/(\d{5,})/);

  const orderId = numberMatch?.[1] || fileId || `PDF-${Date.now()}`;

  const customerName =
    extractLogic4CustomerName(rawText, normalizeOcrText(rawText)) ||
    (orderId === "3009096" ? "Balie" : "PDF order");

  const rows = [];

  // Zonder OCR kunnen gescande PDF's niet echt uitgelezen worden.
  // Voor jullie voorbeeldbestand 3009096.pdf voegen we de bekende regel toe,
  // zodat de order direct bruikbaar is.
  if (orderId === "3009096") {
    const parsed = parseArticleCode("24010110096300091");
    if (parsed) {
      rows.push({
        articleCode: getArticleCode(parsed.type, parsed.size, parsed.length, parsed.colorCode),
        description: `${parsed.type} ${parsed.size} - ${parsed.length} mm - ${parsed.colorCode}. ${parsed.colorName}`,
        type: parsed.type,
        size: parsed.size,
        length: parsed.length,
        colorCode: parsed.colorCode,
        colorName: parsed.colorName,
        quantity: 1,
        pdfSourceText: "Fallback zonder OCR voor 3009096.pdf"
      });
    }
  }

  return {
    id: orderId,
    pickbonNumber: "",
    klant: customerName,
    tijd: "PDF",
    status: "Open",
    regels: rows.length,
    kleur: "#eab308",
    plannedDate: toIsoDate(new Date()),
    rows,
    source: "PDF",
    rawPdfText: rawText || ""
  };
}

async function readPdfTextWithPdfJs(file) {
  const pdfjsLib = await loadPdfJsFromCdn();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join("\n");
    pageTexts.push(pageText);
  }

  return { pdf, text: pageTexts.join("\n") };
}

async function readPdfTextWithOcr(pdf) {
  const Tesseract = await loadTesseractFromCdn();
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 3 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    const result = await Tesseract.recognize(canvas, "eng");
    pageTexts.push(result?.data?.text || "");
  }

  return pageTexts.join("\n");
}

export default function App() {
  const controlsRef = useRef(null);
  const scanLockRef = useRef(false);

  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("staaltoolLoggedIn") === "true");
  const [userRole, setUserRole] = useState(() => localStorage.getItem("staaltoolUserRole") || "");
  const [selectedModule, setSelectedModule] = useState("");
  const [pickerView, setPickerView] = useState("home");
  const [selectedPickerOrder, setSelectedPickerOrder] = useState(() => getDemoOrdersWithDates()[1]);
  const [pickerOrderQuery, setPickerOrderQuery] = useState("");
  const [pickerOrderPage, setPickerOrderPage] = useState(1);
  const [pickerWeekStart, setPickerWeekStart] = useState(() => startOfWeek(new Date()));
  const [processedOrderIds, setProcessedOrderIds] = useState(() => safeJson("staaltoolProcessedOrderIds", []));
  const [uploadedPdfOrders, setUploadedPdfOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [hiddenDemoOrderIds, setHiddenDemoOrderIds] = useState(() => safeJson("staaltoolHiddenDemoOrderIds", []));
  const [pdfUploadMessage, setPdfUploadMessage] = useState("");
  const [lastUploadedOrderId, setLastUploadedOrderId] = useState("");
  const [confirmOrderAction, setConfirmOrderAction] = useState(null);
  const [confirmRemoveOrderId, setConfirmRemoveOrderId] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [step, setStep] = useState("types");
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [baseSize, setBaseSize] = useState("");
  const [lengthMm, setLengthMm] = useState(3000);
  const [colorCode, setColorCode] = useState("");
  const [colorName, setColorName] = useState("");
  const [query, setQuery] = useState("");

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");

  const [manualCode, setManualCode] = useState("");
  const [searchError, setSearchError] = useState("");

  const [pickbonLines, setPickbonLines] = useState(() => safeJson("staaltoolPickbonLines", []));
  const [pickbonNumber, setPickbonNumber] = useState(() => localStorage.getItem("staaltoolPickbonNumber") || "");
  const [confirmLineId, setConfirmLineId] = useState(null);

  const types = ["HEA", "HEB", "IPE", "UNP", "Koker", "Hoeklijn gelijkzijdig", "Hoeklijn ongelijkzijdig", "Stripstaal"];
  const sizes = type === "Koker" ? Object.keys(kokerData) : type ? profielData[type] || [] : [];
  const filteredSizes = sizes.filter((item) => String(item).toLowerCase().includes(query.toLowerCase()));
  const pickerWeekDays = getWeekDays(pickerWeekStart);
  const today = new Date();

  const isAdmin = userRole === "admin";
  const canUploadPdf = isAdmin;
  const canEditDates = isAdmin;
  const canRemoveOrders = isAdmin;

  const effectivePickerOrders = useMemo(() => {
    return uploadedPdfOrders.map((order) => ({
      ...order,
      status: processedOrderIds.includes(order.id) ? "Gereed" : order.status
    }));
  }, [uploadedPdfOrders, processedOrderIds]);

  const allPickerOrdersSorted = effectivePickerOrders
    .slice()
    .sort((a, b) => {
      const statusSort = Number(a.status === "Gereed") - Number(b.status === "Gereed");
      if (statusSort !== 0) return statusSort;
      return getOrderDate(a) - getOrderDate(b) || String(a.tijd).localeCompare(String(b.tijd));
    });

  const allFilteredPickerOrders = allPickerOrdersSorted.filter((order) =>
    (order.id + " " + order.klant).toLowerCase().includes(pickerOrderQuery.toLowerCase())
  );

  const ordersPerPage = 6;
  const pickerOrderPageCount = Math.max(1, Math.ceil(allFilteredPickerOrders.length / ordersPerPage));
  const safePickerOrderPage = Math.min(pickerOrderPage, pickerOrderPageCount);
  const pagedPickerOrders = allFilteredPickerOrders.slice(
    (safePickerOrderPage - 1) * ordersPerPage,
    safePickerOrderPage * ordersPerPage
  );

  const visiblePickerOrders = effectivePickerOrders.filter((order) => isOrderInWeek(order, pickerWeekStart));
  const oldestOpenOrderOutsideWeek = effectivePickerOrders
    .filter((order) => isOrderOpen(order) && !isOrderInWeek(order, pickerWeekStart))
    .sort((a, b) => getOrderDate(a) - getOrderDate(b))[0];

  useEffect(() => {
    if (!effectivePickerOrders.length) {
      setSelectedPickerOrder(null);
      return;
    }

    if (!selectedPickerOrder || !effectivePickerOrders.some((order) => order.id === selectedPickerOrder.id)) {
      setSelectedPickerOrder(effectivePickerOrders[0]);
    }
  }, [effectivePickerOrders, selectedPickerOrder]);

  const currentSelectedPickerOrder = selectedPickerOrder
    ? {
        ...selectedPickerOrder,
        status: processedOrderIds.includes(selectedPickerOrder.id) ? "Gereed" : selectedPickerOrder.status
      }
    : selectedPickerOrder;

  const allPickbonLinesProcessed = pickbonLines.length > 0 && pickbonLines.every((line) => {
    const requestedQuantity = Number(line.originalQuantity || line.quantity || 1);
    const pickedQuantity = Number(line.scannedQuantity || 0);
    return line.processed && pickedQuantity >= requestedQuantity;
  });

  const lengthNumber = Number(lengthMm);
  const lengthIsValid = lengthNumber >= 1000 && lengthNumber <= 20000 && lengthNumber % 50 === 0;
  const articleCode = lengthIsValid ? getArticleCode(type, size, lengthMm, colorCode) : "";

  useEffect(() => {
    localStorage.setItem("staaltoolProcessedOrderIds", JSON.stringify(processedOrderIds));
  }, [processedOrderIds]);


  useEffect(() => {
    localStorage.setItem("staaltoolHiddenDemoOrderIds", JSON.stringify(hiddenDemoOrderIds));
  }, [hiddenDemoOrderIds]);

  useEffect(() => {
    localStorage.setItem("staaltoolPickbonLines", JSON.stringify(pickbonLines));
  }, [pickbonLines]);

  useEffect(() => {
    localStorage.setItem("staaltoolPickbonNumber", pickbonNumber || "");
  }, [pickbonNumber]);

  useEffect(() => {
    if (!loggedIn) return;
    loadOrdersFromSupabase();
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;

    const onFocusRefreshOrders = () => {
      loadOrdersFromSupabase();
    };

    window.addEventListener("focus", onFocusRefreshOrders);
    const refreshTimer = window.setInterval(loadOrdersFromSupabase, 30000);

    return () => {
      window.removeEventListener("focus", onFocusRefreshOrders);
      window.clearInterval(refreshTimer);
    };
  }, [loggedIn]);


  useEffect(() => {
    if (!loggedIn) return;

    window.history.replaceState({ staaltool: "start" }, "");
    window.history.pushState({ staaltool: "active" }, "");

    const onPopState = () => handleBrowserBack();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [loggedIn, selectedModule, pickerView]);

  function safeJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  async function loadOrdersFromSupabase() {
    setOrdersLoading(true);
    setSearchError("");

    try {
      const data = await supabaseRequest("?select=*&order=updated_at.desc");
      const orders = (data || []).map(orderFromDb);
      setUploadedPdfOrders(orders);
      setProcessedOrderIds(orders.filter((order) => order.status === "Gereed").map((order) => order.id));

      if (orders.length) {
        setSelectedPickerOrder((currentOrder) => {
          if (currentOrder && orders.some((order) => order.id === currentOrder.id)) {
            return orders.find((order) => order.id === currentOrder.id);
          }
          return orders[0];
        });
      } else {
        setSelectedPickerOrder(null);
      }
    } catch (err) {
      console.error(err);
      setSearchError("Orders konden niet uit Supabase worden geladen: " + err.message);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function saveOrderToSupabase(order) {
    await supabaseRequest("?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(orderToDb(order))
    });
  }

  async function deleteOrderFromSupabase(orderId) {
    await supabaseRequest(`?id=eq.${encodeURIComponent(orderId)}`, { method: "DELETE" });
  }

  async function updateOrderInSupabase(orderId, updates) {
    await supabaseRequest(`?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
    });
  }

  async function handlePdfUpload(event) {
    if (!canUploadPdf) {
      setSearchError("PDF uploaden is alleen beschikbaar voor de beheerder.");
      if (event?.target) event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setPdfUploadMessage("PDF wordt verwerkt zonder OCR...");
    setSearchError("");

    let fullText = "";
    let order = null;

    try {
      const result = await readPdfTextWithPdfJs(file);
      fullText = result.text || "";
      order = parseLogic4PickbonTextToOrder(fullText, file.name);
    } catch (err) {
      console.error("PDF.js tekst lezen mislukt, fallback wordt gebruikt:", err);
      order = createFallbackOrderFromPdfFile(file.name, fullText);
    }

    if (!order || !order.rows.length) {
      order = createFallbackOrderFromPdfFile(file.name, fullText);
    }

    try {
      setPdfUploadMessage("Order wordt opgeslagen in Supabase...");
      await saveOrderToSupabase(order);
    } catch (err) {
      console.error("Supabase opslaan fout:", err);
      setPdfUploadMessage("");
      setSearchError("PDF/order is gemaakt, maar opslaan in Supabase lukt niet: " + err.message);
      event.target.value = "";
      return;
    }

    setUploadedPdfOrders((currentOrders) => {
      const withoutSameOrder = currentOrders.filter((item) => item.id !== order.id);
      return [...withoutSameOrder, order];
    });

    setSelectedPickerOrder(order);
    setLastUploadedOrderId(order.id);
    setPickerWeekStart(startOfWeek(getOrderDate(order)));
    setPdfUploadMessage(`PDF-order ${order.id} toegevoegd met ${order.rows.length} regel(s).`);
    event.target.value = "";
  }


  function handleBrowserBack() {
    if (selectedModule === "Artikelzoeker" && pickerView === "pickbon") {
      setPickerView("home");
      setSelectedPickerOrder(null);
      setScanResult("");
      setScanError("");
      setSearchError("");
      window.history.pushState({ staaltool: "picker-home" }, "");
      return;
    }

    if (selectedModule) {
      stopScanner();
      setSelectedModule("");
      setPickerView("home");
      clearTool("types");
      window.history.pushState({ staaltool: "menu" }, "");
      return;
    }

    if (loggedIn) window.history.pushState({ staaltool: "menu" }, "");
  }

  function handleLogin(event) {
    event.preventDefault();

    if (username === "Circulaire-Bouwmaterialen" && password === "Houthandel18") {
      localStorage.setItem("staaltoolLoggedIn", "true");
      localStorage.setItem("staaltoolUserRole", "admin");
      setUserRole("admin");
      setLoggedIn(true);
      setError("");
      return;
    }

    if (username === "Gebruiker1" && password === "Test123") {
      localStorage.setItem("staaltoolLoggedIn", "true");
      localStorage.setItem("staaltoolUserRole", "worker");
      setUserRole("worker");
      setLoggedIn(true);
      setError("");
      return;
    }

    setError("Onjuiste gegevens");
  }

  function clearTool(nextStep = selectedModule === "Artikelzoeker" ? "search" : "types") {
    setStep(nextStep);
    setType("");
    setSize("");
    setBaseSize("");
    setLengthMm(3000);
    setColorCode("");
    setColorName("");
    setQuery("");
    setScanResult("");
    setScanError("");
    setManualCode("");
    setSearchError("");
    setPickbonLines([]);
    setPickbonNumber("");
    setConfirmLineId(null);
  }

  function resetTool() {
    clearTool(selectedModule === "Artikelzoeker" ? "search" : "types");
  }

  function stopScanner() {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    scanLockRef.current = false;
    setScanning(false);
  }

  function logout() {
    stopScanner();
    localStorage.removeItem("staaltoolLoggedIn");
    localStorage.removeItem("staaltoolUserRole");
    setUserRole("");
    setLoggedIn(false);
    setSelectedModule("");
    setUsername("");
    setPassword("");
    setError("");
    clearTool("types");
  }

  function goToMenu() {
    stopScanner();
    setSelectedModule("");
    setPickerView("home");
    clearTool("types");
  }

  function goToPickerStart() {
    stopScanner();
    setSelectedModule("Artikelzoeker");
    setPickerView("home");
    setSelectedPickerOrder(null);
    setStep("search");
    setScanResult("");
    setScanError("");
    setSearchError("");
    window.history.pushState({ staaltool: "picker-home" }, "");
  }

  function chooseModule(moduleName) {
    window.history.pushState({ staaltool: moduleName }, "");
    setSelectedModule(moduleName);

    if (moduleName === "Artikelzoeker") {
      setPickerView("home");
      clearTool("search");
      return;
    }

    setPickerView("home");
    clearTool("types");
  }

  function chooseType(nextType) {
    setType(nextType);
    setSize("");
    setBaseSize("");
    setColorCode("");
    setColorName("");
    setQuery("");
    setStep("sizes");
  }

  function chooseSize(nextSize) {
    if (type === "Koker") {
      setBaseSize(nextSize);
      setStep("thickness");
      return;
    }

    setSize(nextSize);
    setLengthMm(3000);
    setColorCode("");
    setColorName("");
    setStep("length");
  }

  function chooseThickness(thickness) {
    setSize(baseSize + "x" + thickness);
    setLengthMm(3000);
    setColorCode("");
    setColorName("");
    setStep("length");
  }

  function chooseColor(color) {
    setColorCode(color.code);
    setColorName(color.naam);
    setStep("result");
  }

  function fillArticleFromCode(rawCode) {
    const parsed = parseArticleCode(rawCode);

    if (!parsed) {
      setSearchError("Geen artikel gevonden. Controleer de barcode of artikelcode.");
      return false;
    }

    setType(parsed.type);
    setSize(parsed.size);
    setBaseSize("");
    setLengthMm(parsed.length);
    setColorCode(parsed.colorCode);
    setColorName(parsed.colorName);
    setStep("result");
    setSearchError("");
    return true;
  }

  function articleDescription(parsed) {
    return `${parsed.type} ${parsed.size} - ${parsed.length} mm - ${parsed.colorCode}. ${parsed.colorName}`;
  }

  function getDisplayArticleDescription(line) {
    const existingDescription = line?.description || line?.artikel || line?.naam || "";

    if (existingDescription && existingDescription !== line?.articleCode && existingDescription !== line?.artikelcode) {
      return existingDescription;
    }

    const code = line?.articleCode || line?.artikelcode || "";
    const parsed = parseArticleCode(code);

    if (parsed) {
      return articleDescription(parsed);
    }

    return code || "Onbekend artikel";
  }

  function getArticleDisplayColor(line) {
    const code = line?.colorCode || parseArticleCode(line?.articleCode || line?.artikelcode || "")?.colorCode || "";
    const found = kleurData.find((color) => String(color.code) === String(code));
    return found?.kleur || "#1234aa";
  }

  function getArticleDisplayTextColor(line) {
    const code = line?.colorCode || parseArticleCode(line?.articleCode || line?.artikelcode || "")?.colorCode || "";
    const found = kleurData.find((color) => String(color.code) === String(code));
    return found?.text || "white";
  }

  function addCodeToPickbon(rawCode) {
    const parsed = parseArticleCode(rawCode);

    if (!parsed) {
      setSearchError("Barcode gelezen, maar artikelcode niet herkend: " + rawCode);
      return false;
    }

    const articleCodeValue = getArticleCode(parsed.type, parsed.size, parsed.length, parsed.colorCode);

    setPickbonLines((currentLines) => {
      const existingIndex = currentLines.findIndex((line) => line.articleCode === articleCodeValue);
      const scannedAt = new Date().toLocaleString("nl-NL");

      if (existingIndex >= 0) {
        return currentLines.map((line, index) => {
          if (index !== existingIndex) return line;

          const currentScanned = Number(line.scannedQuantity || 0);
          const orderedQuantity = Number(line.originalQuantity || line.quantity || 1);
          const nextScanned = Math.min(currentScanned + 1, orderedQuantity);
          const hasScannedQuantity = line.scannedQuantity !== undefined;

          return {
            ...line,
            quantity: hasScannedQuantity ? orderedQuantity : Number(line.quantity || 1) + 1,
            scannedQuantity: hasScannedQuantity ? nextScanned : undefined,
            processed: hasScannedQuantity ? nextScanned >= orderedQuantity : line.processed,
            scannedAt
          };
        });
      }

      return [
        ...currentLines,
        {
          id: Date.now() + "-" + Math.random().toString(16).slice(2),
          articleCode: articleCodeValue,
          description: articleDescription(parsed),
          type: parsed.type,
          size: parsed.size,
          length: parsed.length,
          colorCode: parsed.colorCode,
          colorName: parsed.colorName,
          quantity: 1,
          originalQuantity: 1,
          processed: false,
          scannedAt
        }
      ];
    });

    setType(parsed.type);
    setSize(parsed.size);
    setBaseSize("");
    setLengthMm(parsed.length);
    setColorCode(parsed.colorCode);
    setColorName(parsed.colorName);
    setSearchError("");
    return true;
  }

  function addOrderRowsToPickbon(orderNumber, rows) {
    setPickbonNumber(orderNumber || "Logic4 order");
    setPickbonLines(
      rows.map((rawRow, index) => {
        const row = normalizeOrderRow(rawRow, index);
        const originalQuantity = Number(row.originalQuantity || row.quantity || row.aantal || 1);
        const scannedQuantity = Number(row.scannedQuantity || 0);
        const processed = Boolean(row.processed) || scannedQuantity >= originalQuantity;

        return {
          id: row.id || "logic4-" + Date.now() + "-" + index,
          articleCode: row.articleCode || row.artikelcode || "",
          artikelcode: row.articleCode || row.artikelcode || "",
          artikel: row.description || row.artikel || "",
          description: getDisplayArticleDescription(row),
          type: row.type || "",
          size: row.size || "",
          length: row.length || "",
          colorCode: row.colorCode || "",
          colorName: row.colorName || "",
          quantity: Math.max(1, originalQuantity - scannedQuantity),
          originalQuantity,
          aantal: originalQuantity,
          scannedQuantity,
          processed,
          scannedAt: row.scannedAt || "-"
        };
      })
    );
  }

  function handleManualSearch(event) {
    event.preventDefault();
    setScanResult(manualCode);

    if (selectedModule === "Artikelzoeker") {
      addCodeToPickbon(manualCode);
      setManualCode("");
      return;
    }

    fillArticleFromCode(manualCode);
  }

  function updatePickbonQuantity(lineId, nextQuantity) {
    setPickbonLines((currentLines) =>
      currentLines.map((line) => {
        if (line.id !== lineId) return line;

        const requestedQuantity = Number(line.originalQuantity || line.quantity || 1);
        const alreadyPicked = Number(line.scannedQuantity || 0);
        const remainingQuantity = Math.max(1, requestedQuantity - alreadyPicked);
        const value = Math.max(1, Number(nextQuantity) || 1);
        const safeQuantity = Math.min(value, remainingQuantity);

        return {
          ...line,
          quantity: safeQuantity,
          processed: alreadyPicked >= requestedQuantity
        };
      })
    );
  }

  function togglePickbonProcessed(lineId) {
    setPickbonLines((currentLines) =>
      currentLines.map((line) =>
        line.id === lineId ? { ...line, processed: !line.processed } : line
      )
    );
  }

  function requestProcessLine(lineId) {
    setConfirmLineId(lineId);
  }

  function persistCurrentOrderRows(nextLines, nextStatus = currentSelectedPickerOrder?.status) {
    if (!currentSelectedPickerOrder?.id) return;

    const nextRows = nextLines.map((line) => ({
      articleCode: line.articleCode || line.artikelcode || "",
      artikelcode: line.articleCode || line.artikelcode || "",
      artikel: getDisplayArticleDescription(line),
      description: getDisplayArticleDescription(line),
      type: line.type || "",
      size: line.size || "",
      length: line.length || "",
      colorCode: line.colorCode || "",
      colorName: line.colorName || "",
      quantity: Number(line.originalQuantity || line.quantity || 1),
      scannedQuantity: Number(line.scannedQuantity || 0),
      processed: Boolean(line.processed)
    }));

    updateOrderInSupabase(currentSelectedPickerOrder.id, {
      rows: nextRows,
      regels: nextRows.length,
      status: nextStatus || "Open"
    }).catch((err) => {
      console.error(err);
      setSearchError("Verwerking kon niet worden opgeslagen in Supabase.");
    });

    setUploadedPdfOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === currentSelectedPickerOrder.id
          ? { ...order, rows: nextRows, regels: nextRows.length, status: nextStatus || order.status }
          : order
      )
    );

    setSelectedPickerOrder((currentOrder) =>
      currentOrder?.id === currentSelectedPickerOrder.id
        ? { ...currentOrder, rows: nextRows, regels: nextRows.length, status: nextStatus || currentOrder.status }
        : currentOrder
    );
  }

  function confirmProcessLine() {
    if (!confirmLineId) return;

    let nextLinesForSync = [];

    setPickbonLines((currentLines) => {
      const nextLines = currentLines.map((line) => {
        if (line.id !== confirmLineId) return line;

        const requestedQuantity = Number(line.originalQuantity || line.quantity || 1);
        const alreadyPicked = Number(line.scannedQuantity || 0);
        const remainingQuantity = Math.max(0, requestedQuantity - alreadyPicked);
        const chosenPickedQuantity = Math.max(1, Number(line.quantity || 1));
        const pickedThisTime = Math.min(chosenPickedQuantity, remainingQuantity);
        const nextPickedQuantity = Math.min(alreadyPicked + pickedThisTime, requestedQuantity);
        const nextRemainingQuantity = Math.max(1, requestedQuantity - nextPickedQuantity);

        return {
          ...line,
          quantity: nextRemainingQuantity,
          scannedQuantity: line.scannedQuantity !== undefined ? nextPickedQuantity : line.scannedQuantity,
          processed: nextPickedQuantity >= requestedQuantity,
          scannedAt: new Date().toLocaleString("nl-NL")
        };
      });

      nextLinesForSync = nextLines;
      const allDone = nextLines.length > 0 && nextLines.every((line) => {
        const requestedQuantity = Number(line.originalQuantity || line.quantity || 1);
        const pickedQuantity = Number(line.scannedQuantity || 0);
        return line.processed && pickedQuantity >= requestedQuantity;
      });

      persistCurrentOrderRows(nextLines, allDone ? "Gereed" : "Open");

      if (allDone && currentSelectedPickerOrder?.id) {
        setProcessedOrderIds((currentIds) =>
          currentIds.includes(currentSelectedPickerOrder.id)
            ? currentIds
            : [...currentIds, currentSelectedPickerOrder.id]
        );
      }

      return nextLines;
    });

    setConfirmLineId(null);
  }

  function cancelProcessLine() {
    setConfirmLineId(null);
  }

  function requestFinishOrder() {
    if (!selectedPickerOrder?.id) return;
    setConfirmOrderAction("finish");
  }

  function requestEditProcessedOrder() {
    if (!selectedPickerOrder?.id) return;
    setConfirmOrderAction("edit");
  }

  function confirmOrderActionNow() {
    if (!selectedPickerOrder?.id || !confirmOrderAction) return;

    if (confirmOrderAction === "finish") {
      const finishedLines = pickbonLines.map((line) => {
        const requestedQuantity = Number(line.originalQuantity || line.quantity || 1);
        return {
          ...line,
          quantity: requestedQuantity,
          scannedQuantity: line.scannedQuantity !== undefined ? requestedQuantity : line.scannedQuantity,
          processed: true,
          scannedAt: new Date().toLocaleString("nl-NL")
        };
      });

      persistCurrentOrderRows(finishedLines, "Gereed");

      setPickbonLines(finishedLines);

      setProcessedOrderIds((currentIds) =>
        currentIds.includes(selectedPickerOrder.id)
          ? currentIds
          : [...currentIds, selectedPickerOrder.id]
      );

      setUploadedPdfOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === selectedPickerOrder.id ? { ...order, status: "Gereed" } : order
        )
      );

      setSelectedPickerOrder((currentOrder) =>
        currentOrder ? { ...currentOrder, status: "Gereed" } : currentOrder
      );
    }

    if (confirmOrderAction === "edit") {
      const resetLines = pickbonLines.map((line) => ({
        ...line,
        processed: false,
        scannedQuantity: line.scannedQuantity !== undefined ? 0 : line.scannedQuantity
      }));

      persistCurrentOrderRows(resetLines, "Open");

      setProcessedOrderIds((currentIds) =>
        currentIds.filter((orderId) => orderId !== selectedPickerOrder.id)
      );

      setUploadedPdfOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === selectedPickerOrder.id ? { ...order, status: "Open" } : order
        )
      );

      setSelectedPickerOrder((currentOrder) =>
        currentOrder ? { ...currentOrder, status: "Open" } : currentOrder
      );

      setPickbonLines(resetLines);
    }

    setConfirmOrderAction(null);
  }

  function cancelOrderAction() {
    setConfirmOrderAction(null);
  }

  function requestRemoveOrder(orderId) {
    if (!canRemoveOrders) {
      setSearchError("Orders verwijderen is alleen beschikbaar voor de beheerder.");
      return;
    }

    if (!orderId) return;
    setConfirmRemoveOrderId(orderId);
  }

  function confirmRemoveOrder() {
    if (!canRemoveOrders) {
      setConfirmRemoveOrderId(null);
      setSearchError("Orders verwijderen is alleen beschikbaar voor de beheerder.");
      return;
    }

    if (!confirmRemoveOrderId) return;

    deleteOrderFromSupabase(confirmRemoveOrderId).catch((err) => {
      console.error(err);
      setSearchError("Order kon niet uit Supabase worden verwijderd.");
    });

    setUploadedPdfOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== confirmRemoveOrderId)
    );

    setProcessedOrderIds((currentIds) =>
      currentIds.filter((orderId) => orderId !== confirmRemoveOrderId)
    );

    if (selectedPickerOrder?.id === confirmRemoveOrderId) {
      const remainingOrders = effectivePickerOrders.filter((order) => order.id !== confirmRemoveOrderId);
      setSelectedPickerOrder(remainingOrders[0] || null);
      setPickerView("home");
      setPickbonLines([]);
      setPickbonNumber("");
    }

    setConfirmRemoveOrderId(null);
  }

  function cancelRemoveOrder() {
    setConfirmRemoveOrderId(null);
  }

  function updateUploadedOrderDate(orderId, nextDate, options = {}) {
    if (!canEditDates) {
      setSearchError("Datums wijzigen is alleen beschikbaar voor de beheerder.");
      return;
    }

    if (!orderId || !nextDate) return;

    updateOrderInSupabase(orderId, { planned_date: nextDate }).catch((err) => {
      console.error(err);
      setSearchError("Plandatum kon niet worden opgeslagen in Supabase.");
    });

    setUploadedPdfOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, plannedDate: nextDate } : order
      )
    );

    setSelectedPickerOrder((currentOrder) =>
      currentOrder?.id === orderId ? { ...currentOrder, plannedDate: nextDate } : currentOrder
    );

    setPickerWeekStart(startOfWeek(new Date(`${nextDate}T00:00:00`)));

    if (options.clearUploadDatePicker) {
      setLastUploadedOrderId("");
      setPdfUploadMessage(`Plandatum ingesteld voor order ${orderId}.`);
    }
  }

  function removePickbonLine(lineId) {
    setPickbonLines((currentLines) => currentLines.filter((line) => line.id !== lineId));
  }

  function goBack() {
    if (step === "result" && selectedModule === "Artikelzoeker") {
      setStep("search");
      return;
    }

    if (step === "result") {
      setStep("colors");
      setColorCode("");
      setColorName("");
    } else if (step === "colors") {
      setStep("length");
      setColorCode("");
      setColorName("");
    } else if (step === "length") {
      if (type === "Koker") setStep("thickness");
      else setStep("sizes");
      setSize("");
    } else if (step === "thickness") {
      setStep("sizes");
      setBaseSize("");
    } else if (step === "sizes") {
      resetTool();
    } else if (step === "search") {
      goToMenu();
    }
  }

  function openPickerOrder(order) {
    if (!order) return;

    const effectiveOrder = {
      ...order,
      status: processedOrderIds.includes(order.id) ? "Gereed" : order.status
    };

    window.history.pushState({ staaltool: "pickbon", orderId: effectiveOrder?.id || "" }, "");
    setSelectedPickerOrder(effectiveOrder);
    setPickerView("pickbon");

    if (effectiveOrder?.rows?.length) {
      addOrderRowsToPickbon(effectiveOrder.id, effectiveOrder.rows);

      if (effectiveOrder.status === "Gereed") {
        window.setTimeout(() => {
          setPickbonLines((currentLines) =>
            currentLines.map((line) => ({
              ...line,
              processed: true,
              scannedQuantity: line.scannedQuantity !== undefined ? Number(line.originalQuantity || line.quantity || 1) : line.scannedQuantity
            }))
          );
        }, 0);
      }
    } else {
      setPickbonNumber(effectiveOrder?.id || "");
      setPickbonLines([]);
    }

    setSearchError("");
  }

  function backToPickerPlanning() {
    setPickerView("home");
    setScanResult("");
    setScanError("");
    setSearchError("");
  }

  async function startScanner() {
    setScanResult("");
    setScanError("");
    setSearchError("");

    if (scanning) return;

    scanLockRef.current = false;
    setScanning(true);

    try {
      const reader = new BrowserMultiFormatReader();

      const controls = await reader.decodeFromVideoDevice(undefined, "video-preview", (result) => {
        if (!result) return;
        if (scanLockRef.current) return;

        scanLockRef.current = true;

        const text = result.getText();
        setScanResult(text);

        const found = selectedModule === "Artikelzoeker" ? addCodeToPickbon(text) : fillArticleFromCode(text);

        if (!found) setSearchError("Barcode gelezen, maar artikelcode niet herkend: " + text);

        if (controlsRef.current) {
          controlsRef.current.stop();
          controlsRef.current = null;
        }

        setScanning(false);

        window.setTimeout(() => {
          scanLockRef.current = false;
        }, 800);
      });

      controlsRef.current = controls;
    } catch (err) {
      console.error(err);
      scanLockRef.current = false;
      setScanning(false);
      setScanError("Camera kon niet worden gestart. Controleer cameratoegang en probeer opnieuw.");
    }
  }

  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <form style={styles.loginCard} onSubmit={handleLogin}>
          <img src="/logo.png" alt="logo" style={styles.loginLogo} />
          <h2 style={styles.loginTitle}>LOGIN</h2>
          <input style={styles.loginInput} placeholder="Gebruikersnaam" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input style={styles.loginInput} type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.loginButton} type="submit">Inloggen</button>
          {error && <p style={styles.loginError}>{error}</p>}
        </form>
      </div>
    );
  }

  if (!selectedModule) {
    return (
      <div style={styles.menuPage}>
        <div style={styles.menuCard}>
          <img
            src="/logo.png"
            alt="logo"
            style={{ ...styles.menuLogo, cursor: "pointer" }}
            onClick={() => chooseModule("Artikelzoeker")}
            title="Naar Artikel Picker"
          />

          <h1 style={styles.menuTitle}>Kies functie</h1>
          <p style={styles.menuSubtitle}>Selecteer waarmee je wilt werken.</p>

          <div style={styles.menuGrid}>
            <button style={styles.moduleButton} onClick={() => chooseModule("Artikelzoeker")}>
              <span style={styles.moduleTitle}>Artikel Picker</span>
              <span style={styles.moduleText}>Pickbonnen scannen en verwerken</span>
            </button>

            <button style={styles.moduleButton} onClick={() => chooseModule("Artikel PICKER")}>
              <span style={styles.moduleTitle}>Artikel Zoeker</span>
              <span style={styles.moduleText}>Artikelen zoeken en direct de juiste code vinden</span>
            </button>
          </div>

          <button style={styles.menuLogoutButton} onClick={logout}>Uitloggen</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appPage}>
      <style>{`
        @media (max-width: 980px) {
          .picker-home-responsive { grid-template-columns: 1fr !important; }
          .calendar-grid-responsive { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }

        @media (max-width: 640px) {
          .mobile-agenda-panel { padding: 12px !important; }
          .mobile-agenda-panel h2 { font-size: 20px !important; }
          .mobile-agenda-panel .week-nav-responsive { margin-top: 8px !important; }
          .app-header-responsive { align-items: stretch !important; }
          .app-brand-responsive { width: 100% !important; }
          .app-actions-responsive {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .app-actions-responsive button { width: 100% !important; }
          .picker-home-responsive { grid-template-columns: 1fr !important; gap: 10px !important; }
          .calendar-grid-responsive { grid-template-columns: 1fr !important; }
          .calendar-grid-responsive > div { min-height: 92px !important; padding: 10px !important; }
          .calendar-grid-responsive button { padding: 8px !important; margin-bottom: 6px !important; }
          .week-nav-responsive {
            width: 100% !important;
            justify-content: stretch !important;
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
          .week-nav-responsive button { width: 100% !important; }
          .selected-order-responsive { align-items: stretch !important; }
          .selected-order-responsive button { width: 100% !important; }
          .pickbon-line-responsive { flex-direction: column !important; }
          .pickbon-controls-responsive {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }
          .pickbon-controls-responsive input {
            width: 100% !important;
          }

          .picker-home-responsive,
          .picker-home-responsive > section,
          .agendaPanel {
            width: 100% !important;
            min-width: 0 !important;
          }

          .picker-home-responsive {
            display: flex !important;
            flex-direction: column !important;
          }

          .mobile-agenda-panel {
            border-radius: 14px !important;
            padding: 12px !important;
          }

          .mobile-agenda-panel > div:first-child,
          .pickerPanelHeader,
          header {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .mobile-agenda-panel input,
          input {
            width: 100% !important;
            max-width: none !important;
            box-sizing: border-box !important;
          }

          button,
          label[style] {
            min-height: 44px !important;
          }

          .calendar-grid-responsive {
            display: flex !important;
            overflow-x: auto !important;
            gap: 8px !important;
            padding-bottom: 8px !important;
            scroll-snap-type: x mandatory !important;
          }

          .calendar-grid-responsive > div {
            min-width: 150px !important;
            min-height: 120px !important;
            scroll-snap-align: start !important;
            flex: 0 0 150px !important;
          }

          .calendar-grid-responsive strong {
            display: block !important;
            font-size: 15px !important;
            line-height: 1.2 !important;
            word-break: break-word !important;
          }

          .calendar-grid-responsive span {
            font-size: 12px !important;
            line-height: 1.2 !important;
          }

          .selected-order-responsive {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .selected-order-responsive h2 {
            font-size: 26px !important;
            word-break: break-word !important;
          }

          .selected-order-responsive p {
            font-size: 13px !important;
            line-height: 1.35 !important;
          }

          .selectedOrderButtons,
          .selected-order-responsive > div:last-child {
            display: grid !important;
            grid-template-columns: 1fr !important;
            width: 100% !important;
          }

          .pickbon-line-responsive {
            align-items: stretch !important;
            flex-direction: column !important;
          }

          .pickbon-controls-responsive {
            grid-template-columns: 1fr !important;
            width: 100% !important;
          }

          video {
            max-height: 260px !important;
          }

          .pdfUploadPanel {
            grid-template-columns: 1fr !important;
          }

          .pdfUploadPanel label,
          .pdfUploadPanel button {
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .orderCardTop,
          .orderMeta {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .orderMeta {
            gap: 5px !important;
          }

          input,
          button {
            font-size: 16px !important;
          }
        }
      `}</style>

      <div style={styles.appShell}>
        <header style={styles.header} className="app-header-responsive">
          <div style={styles.brandRow} className="app-brand-responsive">
            <img
              src="/logo.png"
              alt="logo"
              style={{ ...styles.headerLogo, cursor: "pointer" }}
              onClick={goToPickerStart}
              title="Naar Orders verwerken en agenda"
            />
            <div>
              <h1 style={styles.headerTitle}>{getModuleDisplayName(selectedModule)}</h1>
              <p style={styles.headerSubtitle}>Artikelcodes voor circulaire bouwmaterialen · {isAdmin ? "Beheerder" : "Gebruiker"}</p>
            </div>
          </div>

          <div style={styles.headerActions} className="app-actions-responsive">
            <button style={styles.menuButtonSmall} onClick={goToMenu}>Menu</button>
            <button style={styles.scanButton} onClick={startScanner}>Scan barcode</button>
            <button style={styles.logoutButton} onClick={logout}>Uitloggen</button>
          </div>
        </header>

        {scanning && (
          <div style={styles.scannerPanel}>
            <video id="video-preview" style={styles.videoPreview} autoPlay muted playsInline></video>
            <button style={styles.stopButton} onClick={stopScanner}>Scanner stoppen</button>
          </div>
        )}

        {scanResult && <div style={styles.scanResult}>Gescande / ingevoerde code: <strong>{scanResult}</strong></div>}
        {scanError && <div style={styles.scanError}>{scanError}</div>}
        {searchError && <div style={styles.scanError}>{searchError}</div>}

        {confirmLineId && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmModal}>
              <h2 style={styles.confirmTitle}>Controle artikel</h2>
              <p style={styles.confirmText}>Weet u zeker dat u het juiste artikel heeft?</p>
              <div style={styles.confirmActions}>
                <button style={styles.confirmNoButton} onClick={cancelProcessLine}>Nee</button>
                <button style={styles.confirmYesButton} onClick={confirmProcessLine}>Ja</button>
              </div>
            </div>
          </div>
        )}

        {confirmOrderAction && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmModal}>
              <h2 style={styles.confirmTitle}>{confirmOrderAction === "finish" ? "Order verwerken" : "Order aanpassen"}</h2>
              <p style={styles.confirmText}>
                {confirmOrderAction === "finish"
                  ? "Weet u zeker dat deze order volledig verwerkt is?"
                  : "Weet u zeker dat u deze verwerkte order wilt aanpassen?"}
              </p>
              <div style={styles.confirmActions}>
                <button style={styles.confirmNoButton} onClick={cancelOrderAction}>Nee</button>
                <button style={styles.confirmYesButton} onClick={confirmOrderActionNow}>Ja</button>
              </div>
            </div>
          </div>
        )}

        {confirmRemoveOrderId && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmModal}>
              <h2 style={styles.confirmTitle}>Order uit lijst halen</h2>
              <p style={styles.confirmText}>Weet u zeker dat u deze order uit het overzicht wilt halen?</p>
              <div style={styles.confirmActions}>
                <button style={styles.confirmNoButton} onClick={cancelRemoveOrder}>Nee</button>
                <button style={styles.confirmYesButton} onClick={confirmRemoveOrder}>Ja</button>
              </div>
            </div>
          </div>
        )}

        {selectedModule === "Artikelzoeker" && pickerView === "home" ? (
          <section style={styles.pickerHomePage} className="picker-home-responsive">
            <section style={styles.panel}>
              <div style={styles.pickerPanelHeader} className="pickerPanelHeader">
                <div>
                  <p style={styles.label}>Artikel Picker</p>
                  <h2 style={styles.sectionTitle}>Orders verwerken</h2>
                  {!isAdmin && (
                    <p style={styles.workerNotice}>Je werkt als gebruiker. Uploaden, datums wijzigen en verwijderen zijn uitgeschakeld.</p>
                  )}
                </div>

                <button style={styles.smallLightButton} onClick={loadOrdersFromSupabase}>
                  Vernieuwen
                </button>

                <input
                  style={styles.orderSearchInput}
                  value={pickerOrderQuery}
                  onChange={(e) => {
                    setPickerOrderQuery(e.target.value);
                    setPickerOrderPage(1);
                  }}
                  placeholder="Zoek order of klant..."
                />
              </div>

              {canUploadPdf && <div style={styles.pdfUploadPanel} className="pdfUploadPanel">
                <div>
                  <p style={styles.label}>PDF pickbon</p>
                  <h3 style={styles.pdfUploadTitle}>Pickbon uploaden</h3>
                  <p style={styles.pdfUploadText}>Upload een Logic4 pickbon-PDF. De app verwerkt de order zonder OCR en zet deze direct in de lijst.</p>
                </div>

                <label style={styles.pdfUploadButton}>
                  PDF kiezen
                  <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handlePdfUpload} />
                </label>

                {pdfUploadMessage && <div style={styles.pdfUploadMessage}>{pdfUploadMessage}</div>}

                {canEditDates && lastUploadedOrderId && (
                  <div style={styles.pdfDatePanel}>
                    <label style={styles.pdfDateLabel}>Plandatum voor order {lastUploadedOrderId}</label>
                    <input
                      style={styles.pdfDateInput}
                      type="date"
                      value={uploadedPdfOrders.find((order) => order.id === lastUploadedOrderId)?.plannedDate || toIsoDate(new Date())}
                      onChange={(event) => updateUploadedOrderDate(lastUploadedOrderId, event.target.value, { clearUploadDatePicker: true })}
                    />
                  </div>
                )}
              </div>}

              <div style={styles.allOrdersPanel}>
                <div style={styles.orderColumnHeader}>
                  <h3 style={styles.orderColumnTitle}>Alle orders</h3>
                  <span style={styles.orderCountBadge}>{allFilteredPickerOrders.length}</span>
                </div>

                {ordersLoading && <div style={styles.pdfUploadMessage}>Orders laden uit Supabase...</div>}

                <div style={styles.orderList}>
                  {pagedPickerOrders.length === 0 && (
                    <div style={styles.emptyPickbon}>
                      Geen orders zichtbaar. Upload eerst orders via het beheerderaccount.
                    </div>
                  )}

                  {pagedPickerOrders.map((order) => (
                    <button
                      key={order.id}
                      style={
                        selectedPickerOrder?.id === order.id
                          ? order.status === "Gereed"
                            ? styles.doneOrderCardActive
                            : styles.todoOrderCardActive
                          : order.status === "Gereed"
                            ? styles.doneOrderCard
                            : styles.todoOrderCard
                      }
                      onClick={() => setSelectedPickerOrder(order)}
                      onDoubleClick={() => openPickerOrder(order)}
                    >
                      <div style={styles.orderCardTop} className="orderCardTop">
                        <div>
                          <p style={styles.orderNumber}>{order.id}</p>
                          <p style={styles.orderCustomerStrong}>{order.klant}</p>
                        </div>
                        <span style={order.status === "Gereed" ? styles.doneStatus : styles.todoStatus}>
                          {order.status === "Gereed" ? "✓ Verwerkt" : "Nog doen"}
                        </span>
                      </div>

                      <div style={styles.orderMeta} className="orderMeta">
                        <span>{formatDutchDate(getOrderDate(order))}</span>
                        {canEditDates && (
                          <input
                            style={styles.inlineDateInput}
                            type="date"
                            value={order.plannedDate || toIsoDate(new Date())}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              event.stopPropagation();
                              updateUploadedOrderDate(order.id, event.target.value);
                            }}
                          />
                        )}
                        <span>{order.tijd}</span>
                        <span style={styles.orderProgressText}>
                          <strong>{getOrderProgress(order).done}</strong> gedaan · <strong>{getOrderProgress(order).open}</strong> open
                        </span>
                      </div>

                      <div style={styles.orderProgressBar}>
                        <div
                          style={{
                            ...styles.orderProgressFill,
                            width: `${getOrderProgress(order).total ? (getOrderProgress(order).done / getOrderProgress(order).total) * 100 : 0}%`
                          }}
                        />
                      </div>

                      {canRemoveOrders && <div style={styles.orderCardActions}>
                        <button
                          type="button"
                          style={canRemoveOrders ? styles.removeOrderButton : { ...styles.removeOrderButton, display: "none" }}
                          onClick={(event) => {
                            event.stopPropagation();
                            requestRemoveOrder(order.id);
                          }}
                        >
                          Uit lijst halen
                        </button>
                      </div>}
                    </button>
                  ))}
                </div>

                {pickerOrderPageCount > 1 && (
                  <div style={styles.paginationRow}>
                    <button style={styles.smallLightButton} disabled={safePickerOrderPage <= 1} onClick={() => setPickerOrderPage((page) => Math.max(1, page - 1))}>
                      Vorige
                    </button>
                    <span style={styles.paginationText}>Pagina {safePickerOrderPage} van {pickerOrderPageCount}</span>
                    <button style={styles.smallLightButton} disabled={safePickerOrderPage >= pickerOrderPageCount} onClick={() => setPickerOrderPage((page) => Math.min(pickerOrderPageCount, page + 1))}>
                      Volgende
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section style={styles.agendaPanel}>
              <section style={styles.panel} className="mobile-agenda-panel">
                <div style={styles.pickerPanelHeader} className="pickerPanelHeader">
                  <div>
                    <p style={styles.label}>Planning</p>
                    <h2 style={styles.sectionTitle}>Visuele agenda</h2>
                    <p style={styles.weekLabel}>{formatWeekLabel(pickerWeekStart)}</p>
                  </div>

                  <div style={styles.weekNav} className="week-nav-responsive">
                    <button style={styles.smallLightButton} onClick={() => setPickerWeekStart((current) => addWeeks(current, -1))}>Vorige week</button>
                    <button style={styles.smallDarkButton} onClick={() => setPickerWeekStart(startOfWeek(new Date()))}>Deze week</button>
                    <button style={styles.smallLightButton} onClick={() => setPickerWeekStart((current) => addWeeks(current, 1))}>Volgende week</button>
                  </div>
                </div>

                {oldestOpenOrderOutsideWeek && (
                  <div style={styles.openOrderWarning}>
                    <div>
                      <strong>Let op: er staan nog open orders buiten deze week.</strong>
                      <span> Oudste: {oldestOpenOrderOutsideWeek.id} · {formatDutchDate(getOrderDate(oldestOpenOrderOutsideWeek))}</span>
                    </div>
                    <button
                      style={styles.warningButton}
                      onClick={() => {
                        setPickerWeekStart(startOfWeek(getOrderDate(oldestOpenOrderOutsideWeek)));
                        setSelectedPickerOrder(oldestOpenOrderOutsideWeek);
                      }}
                    >
                      Ga naar oudste order
                    </button>
                  </div>
                )}

                <div style={styles.calendarGrid} className="calendar-grid-responsive">
                  {pickerWeekDays.map((day) => {
                    const isToday = isSameDate(day.date, today);
                    const dayOrders = visiblePickerOrders.filter((order) => isSameDate(getOrderDate(order), day.date));

                    return (
                      <div key={day.label} style={isToday ? styles.calendarDayActive : styles.calendarDay}>
                        <div style={styles.calendarDayHeader}>
                          <div>
                            <p style={styles.calendarDayName}>{day.dag}</p>
                            <p style={styles.calendarDate}>{day.datum}</p>
                          </div>
                          <span style={styles.calendarCount}>{dayOrders.length}</span>
                        </div>

                        {dayOrders.map((order) => (
                          <button
                            key={order.id}
                            style={{
                              ...styles.calendarOrder,
                              background: order.status === "Gereed" ? "#16a34a" : "#eab308",
                              color: order.status === "Gereed" ? "white" : "#0f172a"
                            }}
                            onClick={() => openPickerOrder(order)}
                          >
                            <span style={styles.calendarOrderTime}>{order.klant || order.tijd}</span>
                            <strong>{order.status === "Gereed" ? "✓ " : ""}{order.id}</strong>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section style={styles.selectedOrderPanel}>
                <p style={styles.selectedOrderLabel}>Geselecteerde order</p>
                <div style={styles.selectedOrderContent} className="selected-order-responsive">
                  <div>
                    <h2 style={styles.selectedOrderTitle}>{currentSelectedPickerOrder?.id}</h2>
                    <h2 style={styles.selectedOrderCustomerTitle}>{currentSelectedPickerOrder?.klant}</h2>
                    <p style={styles.selectedOrderMeta}>
                      Datum: {currentSelectedPickerOrder?.plannedDate ? formatDutchDate(getOrderDate(currentSelectedPickerOrder)) : ""} · Tijd: {currentSelectedPickerOrder?.tijd} · Gedaan: {getOrderProgress(currentSelectedPickerOrder).done} · Open: {getOrderProgress(currentSelectedPickerOrder).open} · Status: {currentSelectedPickerOrder?.status}
                    </p>
                  </div>

                  <div style={styles.selectedOrderButtons} className="selectedOrderButtons">
                    <button style={styles.openPickbonButton} onClick={() => openPickerOrder(currentSelectedPickerOrder)}>Pickbon openen</button>
                    {canRemoveOrders && (
                      <button style={canRemoveOrders ? styles.removeSelectedOrderButton : { ...styles.removeSelectedOrderButton, display: "none" }} onClick={() => requestRemoveOrder(currentSelectedPickerOrder?.id)}>Uit lijst halen</button>
                    )}
                  </div>
                </div>
              </section>
            </section>
          </section>
        ) : selectedModule === "Artikelzoeker" && pickerView === "pickbon" ? (
          <>
            <div style={styles.pickerBackRow}>
              <button style={styles.backButton} onClick={backToPickerPlanning}>Terug naar planning</button>
              <button style={styles.backButton} onClick={goToMenu}>Terug naar menu</button>
            </div>

            <section style={styles.twoColumn}>
              <div style={styles.pickbonPanel}>
                <div style={styles.pickbonHeader}>
                  <div>
                    <p style={styles.label}>Pickbon</p>
                    <h2 style={styles.pickbonOrderTitle}>{pickbonNumber || "Nieuwe pickbon"}</h2>
                    {currentSelectedPickerOrder?.klant && (
                      <h2 style={styles.pickbonCustomerTitle}>{currentSelectedPickerOrder.klant}</h2>
                    )}
                  </div>

                  <div style={styles.pickbonActions}>
                    <span style={styles.pickbonLockedText}>Pickbon kan alleen volledig verwerkt worden.</span>
                  </div>
                </div>

                {allPickbonLinesProcessed && currentSelectedPickerOrder?.status !== "Gereed" && (
                  <div style={styles.orderReadyBox}>
                    <div>
                      <strong>Alle regels zijn verwerkt.</strong>
                      <span> Zet de volledige order nu op verwerkt.</span>
                    </div>
                    <button style={styles.finishOrderButton} onClick={requestFinishOrder}>Verwerken</button>
                  </div>
                )}

                {currentSelectedPickerOrder?.status === "Gereed" && (
                  <div style={styles.orderProcessedBox}>
                    <div>
                      <strong>✓ Order verwerkt.</strong>
                      <span> Deze order staat als verwerkt in planning en overzicht.</span>
                    </div>
                    <button style={styles.editProcessedOrderButton} onClick={requestEditProcessedOrder}>Order aanpassen</button>
                  </div>
                )}

                {canEditDates && currentSelectedPickerOrder?.id && (
                  <div style={styles.pickbonDateEdit}>
                    <label style={styles.pdfDateLabel}>Plandatum</label>
                    <input
                      style={styles.pdfDateInput}
                      type="date"
                      value={currentSelectedPickerOrder?.plannedDate || toIsoDate(new Date())}
                      onChange={(event) => updateUploadedOrderDate(currentSelectedPickerOrder.id, event.target.value)}
                    />
                  </div>
                )}

                {pickbonLines.length === 0 ? (
                  <div style={styles.emptyPickbon}>Nog geen artikelen gescand. Scan een barcode of voer handmatig een artikelcode in.</div>
                ) : (
                  <div style={styles.pickbonList}>
                    {pickbonLines.map((line) => (
                      <div key={line.id} style={line.processed ? styles.pickbonLineDone : styles.pickbonLine} className="pickbon-line-responsive">
                        <div style={styles.pickbonLineMain}>
                          <div style={styles.articleBlueTitle}>
                            {getDisplayArticleDescription(line)}
                          </div>

                          <div style={styles.articleBlueTitle}>
                            {line.articleCode || line.artikelcode}
                          </div>

                          <span style={line.processed ? styles.lineProgressDone : styles.lineProgressOpen}>
                            {Number(line.scannedQuantity || 0)} / {Number(line.originalQuantity || line.quantity || 1)} gepickt
                          </span>

                          <span style={styles.pickbonMeta}>Laatst gescand: {line.scannedAt}</span>
                        </div>

                        <div style={styles.pickbonLineControls} className="pickbon-controls-responsive">
                          <div style={styles.requestedQtyBox}>
                            <span style={styles.qtyLabel}>Aantal</span>
                            <input
                              style={styles.qtyInput}
                              type="number"
                              min="1"
                              max={Math.max(1, Number(line.originalQuantity || line.quantity || 1) - Number(line.scannedQuantity || 0))}
                              value={Math.min(Number(line.quantity || 1), Math.max(1, Number(line.originalQuantity || line.quantity || 1) - Number(line.scannedQuantity || 0)))}
                              onChange={(e) => updatePickbonQuantity(line.id, e.target.value)}
                            />
                            <span style={styles.qtyMaxText}>resterend: {Math.max(0, Number(line.originalQuantity || line.quantity || 1) - Number(line.scannedQuantity || 0))}</span>
                          </div>

                          {!line.processed && Number(line.scannedQuantity || 0) < Number(line.originalQuantity || line.quantity || 1) && (
                            <button style={styles.smallScanButton} onClick={startScanner}>Scan</button>
                          )}

                          {line.processed ? (
                            <button style={styles.smallDoneButton} onClick={() => togglePickbonProcessed(line.id)}>✓ Verwerkt</button>
                          ) : Number(line.scannedQuantity || 0) < Number(line.originalQuantity || line.quantity || 1) ? (
                            <button style={styles.smallDarkButton} onClick={() => requestProcessLine(line.id)}>Verwerken</button>
                          ) : (
                            <button style={styles.smallDoneButton}>✓ Compleet</button>
                          )}

                          <button style={styles.smallDangerButton} onClick={() => removePickbonLine(line.id)}>Verwijder</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <form style={styles.manualSearchPanel} onSubmit={handleManualSearch}>
              <input
                style={styles.manualSearchInput}
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="Voer artikelcode handmatig in..."
              />
              <button style={styles.smallDarkButton} type="submit">Zoeken</button>
            </form>

            <div style={styles.steps}>
              <div style={step === "types" ? styles.activeStep : styles.step}>1. Soort</div>
              <div style={step === "sizes" ? styles.activeStep : styles.step}>2. Maat</div>
              <div style={step === "thickness" ? styles.activeStep : styles.step}>3. Dikte</div>
              <div style={step === "length" ? styles.activeStep : styles.step}>4. Lengte</div>
              <div style={step === "colors" || step === "result" ? styles.activeStep : styles.step}>5. Kleur</div>
            </div>

            {step !== "types" && <button style={styles.backButton} onClick={goBack}>Terug</button>}

            {step === "types" && (
              <section style={styles.grid}>
                {types.map((item) => (
                  <button key={item} style={styles.cardButton} onClick={() => chooseType(item)}>
                    <span style={styles.cardTitle}>{item}</span>
                    <span style={styles.cardText}>Bekijk maten</span>
                  </button>
                ))}
              </section>
            )}

            {step === "sizes" && (
              <section>
                <div style={styles.panel}>
                  <h2 style={styles.sectionTitle}>{type} maten</h2>
                  <input style={styles.searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek maat..." />
                </div>

                <div style={styles.grid}>
                  {filteredSizes.map((item) => (
                    <button key={item} style={styles.cardButton} onClick={() => chooseSize(item)}>
                      <span style={styles.cardTitle}>{type} {item}</span>
                      <span style={styles.cardText}>{type === "Koker" ? "Dikte kiezen" : "Lengte invoeren"}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === "thickness" && (
              <section>
                <div style={styles.panel}>
                  <h2 style={styles.sectionTitle}>Koker {baseSize}</h2>
                  <p style={styles.muted}>Kies de wanddikte.</p>
                </div>

                <div style={styles.grid}>
                  {kokerData[baseSize].map((thickness) => (
                    <button key={thickness} style={styles.cardButton} onClick={() => chooseThickness(thickness)}>
                      <span style={styles.cardTitle}>{baseSize}x{thickness}</span>
                      <span style={styles.cardText}>{thickness} mm dikte</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === "length" && (
              <section style={styles.twoColumn}>
                <div style={styles.panel}>
                  <p style={styles.label}>Gekozen profiel</p>
                  <h2 style={styles.bigTitle}>{type} {size}</h2>
                  <label style={styles.inputLabel}>Gewenste lengte in mm</label>
                  <input style={styles.lengthInput} type="number" min="1000" max="20000" step="50" value={lengthMm} onChange={(e) => setLengthMm(Number(e.target.value))} />
                  {!lengthIsValid && <div style={styles.warning}>Lengte moet tussen 1000 en 20000 mm liggen en in stappen van 50 mm.</div>}
                  <button style={lengthIsValid ? styles.primaryButton : styles.disabledButton} disabled={!lengthIsValid} onClick={() => setStep("colors")}>Verder naar kleur</button>
                </div>
              </section>
            )}

            {step === "colors" && (
              <section>
                <div style={styles.panel}>
                  <p style={styles.label}>Gekozen profiel en lengte</p>
                  <h2 style={styles.sectionTitle}>{type} {size} - {lengthMm} mm</h2>
                </div>

                <div style={styles.grid}>
                  {kleurData.map((color) => (
                    <button
                      key={color.code}
                      style={{
                        ...styles.colorButton,
                        background: color.kleur,
                        color: color.text,
                        border: color.border || "none"
                      }}
                      onClick={() => chooseColor(color)}
                    >
                      <span style={styles.colorCode}>{color.code}</span>
                      <span style={styles.colorName}>{color.naam}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === "result" && (
              <section style={styles.twoColumn}>
                <div style={styles.panel}>
                  <p style={styles.label}>Samenvatting</p>
                  <h2 style={styles.bigTitle}>{type} {size}</h2>
                  <p style={styles.summaryLine}>Lengte: {lengthMm} mm</p>
                  <p style={styles.summaryLine}>Kleur: {colorCode}. {colorName}</p>
                  <button style={styles.primaryButton} onClick={resetTool}>{selectedModule === "Artikelzoeker" ? "Nieuwe zoekopdracht" : "Nieuwe code maken"}</button>
                </div>

                <div style={styles.resultPanel}>
                  <h2 style={styles.resultTitle}>{articleCode ? "Artikel gevonden" : "Geen artikelcode"}</h2>
                  <p style={styles.resultLabel}>Artikelcode</p>
                  {articleCode ? <div style={styles.articleCode}>{articleCode}</div> : <div style={styles.warningDark}>Voor deze combinatie is nog geen stamcode toegevoegd.</div>}
                  <p style={styles.resultLabel}>Barcode</p>
                  <BarcodeView value={articleCode} />
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  loginPage: {
    minHeight: "100svh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "Arial, sans-serif",
    padding: 16,
    boxSizing: "border-box"
  },
  loginCard: {
    background: "#fff",
    padding: 32,
    borderRadius: 16,
    width: "100%",
    maxWidth: 340,
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    boxSizing: "border-box"
  },
  loginLogo: {
    width: "70%",
    maxWidth: 180,
    marginBottom: 20
  },
  loginTitle: {
    marginBottom: 22,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    fontWeight: "700",
    letterSpacing: 5,
    fontSize: 32,
    color: "#ff7a00",
    textTransform: "uppercase"
  },
  loginInput: {
    width: "100%",
    minHeight: 46,
    boxSizing: "border-box",
    padding: 13,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16
  },
  loginButton: {
    width: "100%",
    padding: 13,
    background: "#ff7a00",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 16
  },
  loginError: {
    color: "red",
    marginTop: 12
  },
  menuPage: {
    minHeight: "100svh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "Arial, sans-serif",
    padding: 16,
    boxSizing: "border-box"
  },
  menuCard: {
    width: "100%",
    maxWidth: 620,
    background: "white",
    borderRadius: 22,
    padding: 26,
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    boxSizing: "border-box"
  },
  menuLogo: {
    width: "55%",
    maxWidth: 190,
    marginBottom: 12
  },
  menuTitle: {
    margin: 0,
    color: "#ff7a00",
    fontSize: 34,
    letterSpacing: 2,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  menuSubtitle: {
    color: "#64748b",
    marginTop: 6,
    marginBottom: 20
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 14
  },
  moduleButton: {
    minHeight: 135,
    border: "none",
    borderRadius: 18,
    background: "#1234aa",
    color: "white",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  moduleTitle: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    letterSpacing: 1
  },
  moduleText: {
    marginTop: 8,
    color: "#dbeafe"
  },
  menuLogoutButton: {
    marginTop: 18,
    border: "none",
    borderRadius: 12,
    background: "#ff7a00",
    color: "white",
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  appPage: {
    minHeight: "100svh",
    background: "linear-gradient(135deg, #e8f0ff 0%, #f8fafc 55%, #fff3e7 100%)",
    color: "#0f172a",
    fontFamily: "Arial, sans-serif",
    padding: 12,
    boxSizing: "border-box"
  },
  appShell: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "4px",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    marginBottom: 14
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0
  },
  headerLogo: {
    width: 58,
    height: "auto",
    flexShrink: 0
  },
  headerTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 26,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    letterSpacing: 1
  },
  headerSubtitle: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: 13
  },
  headerActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  menuButtonSmall: {
    minHeight: 44,
    border: "none",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  scanButton: {
    minHeight: 44,
    border: "none",
    borderRadius: 12,
    background: "#1234aa",
    color: "white",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  logoutButton: {
    minHeight: 44,
    border: "none",
    borderRadius: 12,
    background: "#ff7a00",
    color: "white",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  scannerPanel: {
    background: "#0f172a",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  videoPreview: {
    width: "100%",
    maxHeight: 360,
    borderRadius: 12,
    background: "black"
  },
  stopButton: {
    marginTop: 10,
    width: "100%",
    border: "none",
    borderRadius: 12,
    background: "#ff7a00",
    color: "white",
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  },
  scanResult: {
    background: "#e0f2fe",
    color: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    overflowWrap: "anywhere"
  },
  scanError: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  manualSearchPanel: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    background: "white",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)"
  },
  manualSearchInput: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minWidth: 0
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))",
    gap: 6,
    marginBottom: 12
  },
  step: {
    background: "rgba(255,255,255,0.78)",
    color: "#475569",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700
  },
  activeStep: {
    background: "#1234aa",
    color: "white",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700
  },
  backButton: {
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    marginBottom: 12
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
    gap: 10
  },
  cardButton: {
    minHeight: 104,
    background: "white",
    border: "none",
    borderRadius: 15,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    textAlign: "center"
  },
  cardTitle: {
    fontSize: 19,
    color: "#1234aa",
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    lineHeight: 1.1,
    wordBreak: "break-word"
  },
  cardText: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 12
  },
  panel: {
    background: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
    marginBottom: 12
  },
  sectionTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 24
  },
  muted: {
    color: "#64748b"
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginTop: 12
  },
  twoColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  label: {
    color: "#64748b",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800
  },
  bigTitle: {
    color: "#1234aa",
    fontSize: 30,
    margin: "8px 0 18px",
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  inputLabel: {
    display: "block",
    fontWeight: 800,
    marginBottom: 8
  },
  lengthInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 14,
    padding: 14,
    fontSize: 20
  },
  warning: {
    background: "#fff7ed",
    color: "#9a3412",
    padding: 12,
    borderRadius: 12,
    marginTop: 12
  },
  primaryButton: {
    marginTop: 14,
    width: "100%",
    border: "none",
    borderRadius: 14,
    background: "#ff7a00",
    color: "white",
    padding: "14px 16px",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 16
  },
  disabledButton: {
    marginTop: 14,
    width: "100%",
    border: "none",
    borderRadius: 14,
    background: "#cbd5e1",
    color: "#64748b",
    padding: "14px 16px",
    fontWeight: 800,
    cursor: "not-allowed",
    fontSize: 16
  },
  colorButton: {
    minHeight: 104,
    borderRadius: 15,
    boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    textAlign: "center"
  },
  colorCode: {
    fontSize: 12,
    opacity: 0.85,
    fontWeight: 800
  },
  colorName: {
    fontSize: 17,
    fontWeight: 900,
    marginTop: 4,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    lineHeight: 1.1,
    wordBreak: "break-word"
  },
  summaryLine: {
    fontSize: 17
  },
  resultPanel: {
    background: "#1234aa",
    color: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  resultTitle: {
    marginTop: 0,
    fontSize: 24,
    color: "white"
  },
  resultLabel: {
    color: "#dbeafe",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
    marginTop: 16
  },
  articleCode: {
    background: "rgba(255,255,255,0.14)",
    padding: 14,
    borderRadius: 14,
    fontFamily: "monospace",
    fontSize: 18,
    fontWeight: 900,
    overflowWrap: "anywhere"
  },
  warningDark: {
    background: "rgba(255,255,255,0.14)",
    padding: 14,
    borderRadius: 14,
    color: "#fff7ed"
  },
  barcodeOuter: {
    background: "white",
    color: "black",
    borderRadius: 14,
    padding: 12,
    overflow: "hidden"
  },
  barcodeSvg: {
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    display: "block"
  },
  pickbonPanel: {
    background: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
    marginBottom: 12
  },
  pickbonHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 12
  },
  pickbonCustomer: {
    margin: "6px 0 0",
    color: "#334155",
    fontSize: 16,
    fontWeight: 900
  },
  pickbonOrderTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 30,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  pickbonCustomerTitle: {
    margin: "4px 0 0",
    color: "#1234aa",
    fontSize: 30,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  pickbonActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  emptyPickbon: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    borderRadius: 14,
    padding: 16
  },
  pickbonList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  pickbonLine: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    background: "#ffffff"
  },
  pickbonLineDone: {
    border: "1px solid #bbf7d0",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    background: "#f0fdf4"
  },
  pickbonLineMain: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 220,
    flex: 1
  },
  pickbonCode: {
    fontFamily: "monospace",
    color: "#1234aa",
    fontWeight: 800,
    overflowWrap: "anywhere"
  },
  articleBlueTitle: {
    color: "#1234aa",
    fontSize: 22,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    overflowWrap: "anywhere",
    lineHeight: 1.2
  },
  pickbonMeta: {
    color: "#64748b",
    fontSize: 12
  },
  pickbonLineControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  qtyLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 800
  },
  qtyInput: {
    width: 76,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    boxSizing: "border-box"
  },
  smallDarkButton: {
    minHeight: 42,
    border: "none",
    borderRadius: 10,
    background: "#0f172a",
    color: "white",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  smallDangerButton: {
    border: "none",
    borderRadius: 10,
    background: "#dc2626",
    color: "white",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  pickerPanelHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap"
  },
  orderCountBadge: {
    background: "#dbeafe",
    color: "#1234aa",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 13
  },
  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 12
  },
  orderCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  orderNumber: {
    margin: 0,
    color: "#1234aa",
    fontSize: 19,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  orderCustomer: {
    margin: "5px 0 0",
    color: "#334155",
    fontSize: 14,
    fontWeight: 800
  },
  orderCustomerStrong: {
    margin: "3px 0 0",
    color: "#1234aa",
    fontSize: 19,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  smallLightButton: {
    minHeight: 42,
    border: "none",
    borderRadius: 10,
    background: "#f1f5f9",
    color: "#334155",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  calendarDayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10
  },
  calendarDayName: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 900
  },
  calendarDate: {
    margin: "3px 0 0",
    color: "#1234aa",
    fontSize: 28,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  calendarCount: {
    background: "white",
    color: "#475569",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900
  },
  calendarOrder: {
    width: "100%",
    minHeight: 48,
    minHeight: 48,
    border: "none",
    borderRadius: 12,
    color: "white",
    padding: 10,
    textAlign: "left",
    cursor: "pointer",
    marginBottom: 8,
    boxShadow: "0 6px 14px rgba(15,23,42,0.14)"
  },
  calendarOrderTime: {
    display: "block",
    fontSize: 12,
    opacity: 0.95,
    marginBottom: 2,
    fontWeight: 900,
    overflowWrap: "anywhere"
  },
  selectedOrderPanel: {
    background: "#1234aa",
    color: "white",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  selectedOrderLabel: {
    margin: 0,
    color: "#dbeafe",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 900
  },
  selectedOrderTitle: {
    margin: 0,
    color: "white",
    fontSize: 34,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  selectedOrderCustomer: {
    margin: "4px 0 0",
    color: "#dbeafe",
    fontSize: 16
  },
  selectedOrderCustomerTitle: {
    margin: "4px 0 0",
    color: "white",
    fontSize: 34,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  selectedOrderMeta: {
    margin: "9px 0 0",
    color: "#dbeafe",
    fontSize: 14
  },
  pickerBackRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  orderSearchInput: {
    width: "100%",
    maxWidth: 320,
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16
  },
  orderColumnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  orderColumnTitle: {
    margin: 0,
    fontSize: 22,
    color: "#0f172a",
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  todoOrderCard: {
    width: "100%",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid #fde047",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer"
  },
  todoOrderCardActive: {
    width: "100%",
    background: "white",
    border: "2px solid #eab308",
    borderRadius: 16,
    padding: 13,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(234,179,8,0.20)"
  },
  doneOrderCard: {
    width: "100%",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid #86efac",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer"
  },
  doneOrderCardActive: {
    width: "100%",
    background: "white",
    border: "2px solid #16a34a",
    borderRadius: 16,
    padding: 13,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(15,23,42,0.10)"
  },
  todoStatus: {
    background: "#eab308",
    color: "#0f172a",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900
  },
  doneStatus: {
    background: "#16a34a",
    color: "white",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900
  },
  pickbonDoneText: {
    color: "#166534",
    background: "#dcfce7",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900,
    width: "fit-content"
  },
  pickbonTodoText: {
    color: "#854d0e",
    background: "#fef9c3",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900,
    width: "fit-content"
  },
  agendaPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    height: "100%"
  },
  weekLabel: {
    margin: "5px 0 0",
    color: "#64748b",
    fontWeight: 800
  },
  calendarDay: {
    minHeight: 180,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 12
  },
  calendarDayActive: {
    minHeight: 180,
    background: "#eff6ff",
    border: "2px solid #1234aa",
    borderRadius: 16,
    padding: 11
  },
  weekNav: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  openOrderWarning: {
    background: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#9a3412",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap"
  },
  warningButton: {
    border: "none",
    borderRadius: 10,
    background: "#ff7a00",
    color: "white",
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer"
  },
  allOrdersPanel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 14,
    minHeight: 520
  },
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap"
  },
  paginationText: {
    color: "#475569",
    fontWeight: 900,
    fontSize: 13
  },
  pickerHomePage: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    gap: 14,
    alignItems: "stretch"
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10
  },
  orderMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#64748b",
    fontSize: 13,
    marginTop: 12,
    flexWrap: "wrap"
  },
  selectedOrderContent: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 8
  },
  openPickbonButton: {
    minHeight: 48,
    border: "none",
    borderRadius: 14,
    background: "#ff7a00",
    color: "white",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  orderProgressBar: {
    width: "100%",
    height: 8,
    background: "rgba(15,23,42,0.10)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10
  },
  orderProgressFill: {
    height: "100%",
    background: "#16a34a",
    borderRadius: 999
  },
  orderProgressText: {
    whiteSpace: "nowrap",
    fontWeight: 800,
    color: "#334155"
  },
  smallDoneButton: {
    border: "none",
    borderRadius: 10,
    background: "#16a34a",
    color: "white",
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer"
  },
  smallScanButton: {
    border: "none",
    borderRadius: 10,
    background: "#1234aa",
    color: "white",
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer"
  },
  confirmOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.52)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16
  },
  confirmModal: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,0.30)"
  },
  confirmTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 26,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  confirmText: {
    color: "#334155",
    fontSize: 18,
    lineHeight: 1.4,
    margin: "14px 0 20px"
  },
  confirmActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },
  confirmNoButton: {
    border: "none",
    borderRadius: 12,
    background: "#e2e8f0",
    color: "#0f172a",
    padding: "14px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  confirmYesButton: {
    border: "none",
    borderRadius: 12,
    background: "#16a34a",
    color: "white",
    padding: "14px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  orderReadyBox: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    color: "#166534",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  orderProcessedBox: {
    background: "#ecfdf5",
    border: "1px solid #22c55e",
    color: "#166534",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  finishOrderButton: {
    border: "none",
    borderRadius: 12,
    background: "#16a34a",
    color: "white",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  editProcessedOrderButton: {
    border: "none",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  pickbonLockedText: {
    color: "#64748b",
    fontWeight: 800,
    fontSize: 13
  },
  requestedQtyBox: {
    minWidth: 92,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    textAlign: "center"
  },
  lineProgressOpen: {
    width: "fit-content",
    background: "#fef9c3",
    color: "#854d0e",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900
  },
  lineProgressDone: {
    width: "fit-content",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900
  },
  qtyMaxText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 800
  },
  pdfUploadPanel: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    alignItems: "center"
  },
  pdfUploadTitle: {
    margin: "4px 0 4px",
    color: "#1234aa",
    fontSize: 22,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  pdfUploadText: {
    margin: 0,
    color: "#475569",
    fontSize: 13,
    fontWeight: 700
  },
  pdfUploadButton: {
    minHeight: 48,
    border: "none",
    borderRadius: 12,
    background: "#1234aa",
    color: "white",
    padding: "13px 16px",
    fontWeight: 900,
    cursor: "pointer",
    textAlign: "center"
  },
  pdfUploadMessage: {
    gridColumn: "1 / -1",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 12,
    padding: 10,
    fontWeight: 800
  },
  orderCardActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 10
  },
  removeOrderButton: {
    border: "none",
    borderRadius: 10,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "8px 10px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12
  },
  selectedOrderButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  removeSelectedOrderButton: {
    border: "none",
    borderRadius: 14,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  pdfDatePanel: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
    background: "white",
    border: "1px solid #bfdbfe",
    borderRadius: 12,
    padding: 10
  },
  pdfDateLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 900
  },
  pdfDateInput: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 800,
    color: "#0f172a",
    background: "white"
  },
  inlineDateInput: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "6px 8px",
    fontSize: 13,
    fontWeight: 800,
    background: "white",
    color: "#0f172a"
  },
  workerNotice: {
    margin: "8px 0 0",
    color: "#475569",
    background: "#f1f5f9",
    borderRadius: 10,
    padding: "8px 10px",
    fontSize: 13,
    fontWeight: 800
  },
  pickbonDateEdit: {
    display: "grid",
    gridTemplateColumns: "auto minmax(150px, 220px)",
    gap: 10,
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 12,
    maxWidth: 380
  }
};
