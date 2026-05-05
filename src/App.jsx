import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import JsBarcode from "jsbarcode";

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

const demoPickerOrders = [
  {
    id: "ORD-10482",
    klant: "Bouwbedrijf De Vries",
    tijd: "08:30",
    status: "Open",
    regels: 6,
    kleur: "#f97316",
    rows: [
      {
        articleCode: "24010110096300092",
        description: "HEA 100 - 3000 mm - 2. Bruin",
        type: "HEA",
        size: "100",
        length: 3000,
        colorCode: "2",
        colorName: "Bruin",
        quantity: 2
      },
      {
        articleCode: "240402100504000914",
        description: "IPE 100 - 4000 mm - 14. Zwart",
        type: "IPE",
        size: "100",
        length: 4000,
        colorCode: "14",
        colorName: "Zwart",
        quantity: 1
      }
    ]
  },
  {
    id: "ORD-10483",
    klant: "Jansen Constructie",
    tijd: "10:00",
    status: "Bezig",
    regels: 12,
    kleur: "#2563eb",
    rows: [
      {
        articleCode: "2402021001003500911",
        description: "HEB 100 - 3500 mm - 11. Rood",
        type: "HEB",
        size: "100",
        length: 3500,
        colorCode: "11",
        colorName: "Rood",
        quantity: 1
      },
      {
        articleCode: "24050210050450091",
        description: "UNP 100 - 4500 mm - 1. Blauw",
        type: "UNP",
        size: "100",
        length: 4500,
        colorCode: "1",
        colorName: "Blauw",
        quantity: 2
      }
    ]
  },
  {
    id: "ORD-10484",
    klant: "Circulair Project Noord",
    tijd: "12:45",
    status: "Open",
    regels: 4,
    kleur: "#16a34a",
    rows: [
      {
        articleCode: "240103140135300097",
        description: "HEA 140 - 3000 mm - 7. Groen",
        type: "HEA",
        size: "140",
        length: 3000,
        colorCode: "7",
        colorName: "Groen",
        quantity: 1
      }
    ]
  },
  {
    id: "ORD-10485",
    klant: "Van Dijk Montage",
    tijd: "15:15",
    status: "Gereed",
    regels: 9,
    kleur: "#64748b",
    rows: [
      {
        articleCode: "2404113001506000914",
        description: "IPE 300 - 6000 mm - 14. Zwart",
        type: "IPE",
        size: "300",
        length: 6000,
        colorCode: "14",
        colorName: "Zwart",
        quantity: 1
      }
    ]
  }
];

const demoPickerDays = [
  { dag: "Ma", datum: "6", orders: 2 },
  { dag: "Di", datum: "7", orders: 4 },
  { dag: "Wo", datum: "8", orders: 1 },
  { dag: "Do", datum: "9", orders: 3 },
  { dag: "Vr", datum: "10", orders: 5 }
];

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
      plannedDate: toIsoDate(plannedDates[index] || today)
    };
  });
}

function getOrderDate(order) {
  const date = new Date(order.plannedDate + "T00:00:00");
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


export default function App() {
  const controlsRef = useRef(null);
  const scanLockRef = useRef(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [pickerView, setPickerView] = useState("home");
  const [selectedPickerOrder, setSelectedPickerOrder] = useState(() => getDemoOrdersWithDates()[1]);
  const [pickerOrderQuery, setPickerOrderQuery] = useState("");
  const [pickerOrderPage, setPickerOrderPage] = useState(1);
  const [pickerWeekStart, setPickerWeekStart] = useState(() => startOfWeek(new Date()));

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

  const [pickbonLines, setPickbonLines] = useState([]);
  const [pickbonNumber, setPickbonNumber] = useState("");

  const [logic4OrderNumber, setLogic4OrderNumber] = useState("");
  const [logic4Message, setLogic4Message] = useState("");

  const types = ["HEA", "HEB", "IPE", "UNP", "Koker", "Hoeklijn gelijkzijdig", "Hoeklijn ongelijkzijdig", "Stripstaal"];
  const sizes = type === "Koker" ? Object.keys(kokerData) : type ? profielData[type] || [] : [];
  const filteredSizes = sizes.filter((item) =>
    String(item).toLowerCase().includes(query.toLowerCase())
  );
  const pickerWeekDays = getWeekDays(pickerWeekStart);
  const today = new Date();
  const datedPickerOrders = getDemoOrdersWithDates();
  const allPickerOrdersSorted = datedPickerOrders
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
  const visiblePickerOrders = datedPickerOrders.filter((order) => isOrderInWeek(order, pickerWeekStart));
  const oldestOpenOrderOutsideWeek = datedPickerOrders
    .filter((order) => isOrderOpen(order) && !isOrderInWeek(order, pickerWeekStart))
    .sort((a, b) => getOrderDate(a) - getOrderDate(b))[0];

  const lengthNumber = Number(lengthMm);
  const lengthIsValid = lengthNumber >= 1000 && lengthNumber <= 20000 && lengthNumber % 50 === 0;
  const articleCode = lengthIsValid ? getArticleCode(type, size, lengthMm, colorCode) : "";

  function handleLogin(event) {
    event.preventDefault();

    if (username === "Circulaire-Bouwmaterialen" && password === "Houthandel18") {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Onjuiste gegevens");
    }
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
    setLogic4OrderNumber("");
    setLogic4Message("");
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

  function chooseModule(moduleName) {
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
          const orderedQuantity = Number(line.quantity || 1);
          const nextScanned = Math.min(currentScanned + 1, orderedQuantity);
          const hasScannedQuantity = line.scannedQuantity !== undefined;

          return {
            ...line,
            quantity: hasScannedQuantity ? orderedQuantity : line.quantity + 1,
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
      rows.map((row, index) => ({
        id: "logic4-" + Date.now() + "-" + index,
        articleCode: row.articleCode,
        description: row.description,
        type: row.type || "",
        size: row.size || "",
        length: row.length || "",
        colorCode: row.colorCode || "",
        colorName: row.colorName || "",
        quantity: row.quantity,
        scannedQuantity: 0,
        processed: false,
        scannedAt: "-"
      }))
    );
  }

  function loadMockLogic4Order() {
    const orderNumber = logic4OrderNumber.trim() || "L4-TEST-001";

    const mockRows = [
      {
        articleCode: "24010110096300092",
        description: "HEA 100 - 3000 mm - 2. Bruin",
        type: "HEA",
        size: "100",
        length: 3000,
        colorCode: "2",
        colorName: "Bruin",
        quantity: 2
      },
      {
        articleCode: "2402021001003500911",
        description: "HEB 100 - 3500 mm - 11. Rood",
        type: "HEB",
        size: "100",
        length: 3500,
        colorCode: "11",
        colorName: "Rood",
        quantity: 1
      },
      {
        articleCode: "240402100504000914",
        description: "IPE 100 - 4000 mm - 14. Zwart",
        type: "IPE",
        size: "100",
        length: 4000,
        colorCode: "14",
        colorName: "Zwart",
        quantity: 3
      }
    ];

    addOrderRowsToPickbon(orderNumber, mockRows);
    setLogic4Message("Testorder geladen. Scan de artikelen om de pickbon te verwerken.");
    setSearchError("");
  }

  async function loadLogic4Order() {
    const orderNumber = logic4OrderNumber.trim();

    if (!orderNumber) {
      setSearchError("Vul eerst een Logic4 ordernummer in.");
      return;
    }

    try {
      setLogic4Message("Order ophalen...");

      const response = await fetch(`/api/logic4-order?orderNumber=${encodeURIComponent(orderNumber)}`);

      if (!response.ok) {
        throw new Error("Order kon niet worden opgehaald.");
      }

      const data = await response.json();

      if (!data.rows || data.rows.length === 0) {
        setSearchError("Geen orderregels gevonden voor deze Logic4 order.");
        setLogic4Message("");
        return;
      }

      addOrderRowsToPickbon(data.orderNumber || orderNumber, data.rows);
      setLogic4Message("Logic4 order geladen.");
      setSearchError("");
    } catch (err) {
      setLogic4Message("");
      setSearchError("Logic4 order ophalen lukt nog niet. Gebruik nu de testorder of sluit later de API aan.");
    }
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
    const quantity = Math.max(1, Number(nextQuantity) || 1);

    setPickbonLines((currentLines) =>
      currentLines.map((line) =>
        line.id === lineId ? { ...line, quantity } : line
      )
    );
  }

  function togglePickbonProcessed(lineId) {
    setPickbonLines((currentLines) =>
      currentLines.map((line) =>
        line.id === lineId ? { ...line, processed: !line.processed } : line
      )
    );
  }

  function removePickbonLine(lineId) {
    setPickbonLines((currentLines) => currentLines.filter((line) => line.id !== lineId));
  }

  function clearPickbon() {
    setPickbonLines([]);
    setPickbonNumber("");
    setScanResult("");
    setSearchError("");
  }

  function finishPickbon() {
    setPickbonLines((currentLines) =>
      currentLines.map((line) => ({ ...line, processed: true }))
    );
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
    setSelectedPickerOrder(order);
    setPickerView("pickbon");

    if (order?.rows?.length) {
      addOrderRowsToPickbon(order.id, order.rows);
    } else {
      setPickbonNumber(order?.id || "");
    }

    setLogic4Message("");
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

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        "video-preview",
        (result) => {
          if (!result) return;

          if (scanLockRef.current) return;
          scanLockRef.current = true;

          const text = result.getText();
          setScanResult(text);

          const found = selectedModule === "Artikelzoeker"
            ? addCodeToPickbon(text)
            : fillArticleFromCode(text);

          if (!found) {
            setSearchError("Barcode gelezen, maar artikelcode niet herkend: " + text);
          }

          if (controlsRef.current) {
            controlsRef.current.stop();
            controlsRef.current = null;
          }

          setScanning(false);

          window.setTimeout(() => {
            scanLockRef.current = false;
          }, 800);
        }
      );

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

          <input
            style={styles.loginInput}
            placeholder="Gebruikersnaam"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={styles.loginInput}
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.loginButton} type="submit">
            Inloggen
          </button>

          {error && <p style={styles.loginError}>{error}</p>}
        </form>
      </div>
    );
  }

  if (!selectedModule) {
    return (
      <div style={styles.menuPage}>
        <div style={styles.menuCard}>
          <img src="/logo.png" alt="logo" style={styles.menuLogo} />

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

          <button style={styles.menuLogoutButton} onClick={logout}>
            Uitloggen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appPage}>
      <style>{`
        @media (max-width: 980px) {
          .picker-home-responsive {
            grid-template-columns: 1fr !important;
          }

          .calendar-grid-responsive {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .app-header-responsive {
            align-items: stretch !important;
          }

          .app-brand-responsive {
            width: 100% !important;
          }

          .app-actions-responsive {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }

          .app-actions-responsive button {
            width: 100% !important;
          }

          .picker-home-responsive {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }

          .calendar-grid-responsive {
            grid-template-columns: 1fr !important;
          }

          .week-nav-responsive {
            width: 100% !important;
            justify-content: stretch !important;
            display: grid !important;
            grid-template-columns: 1fr !important;
          }

          .week-nav-responsive button {
            width: 100% !important;
          }

          .selected-order-responsive {
            align-items: stretch !important;
          }

          .selected-order-responsive button {
            width: 100% !important;
          }

          .pickbon-line-responsive {
            flex-direction: column !important;
          }

          .pickbon-controls-responsive {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }

          .pickbon-controls-responsive input {
            width: 100% !important;
          }
        }
      `}</style>
      <div style={styles.appShell}>
        <header style={styles.header} className="app-header-responsive">
          <div style={styles.brandRow} className="app-brand-responsive">
            <img src="/logo.png" alt="logo" style={styles.headerLogo} />
            <div>
              <h1 style={styles.headerTitle}>{getModuleDisplayName(selectedModule)}</h1>
              <p style={styles.headerSubtitle}>Artikelcodes voor circulaire bouwmaterialen</p>
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
            <video
              id="video-preview"
              style={styles.videoPreview}
              autoPlay
              muted
              playsInline
            ></video>
            <button style={styles.stopButton} onClick={stopScanner}>Scanner stoppen</button>
          </div>
        )}

        {scanResult && (
          <div style={styles.scanResult}>
            Gescande / ingevoerde code: <strong>{scanResult}</strong>
          </div>
        )}

        {scanError && <div style={styles.scanError}>{scanError}</div>}
        {searchError && <div style={styles.scanError}>{searchError}</div>}

        {selectedModule === "Artikelzoeker" && pickerView === "home" ? (
          <section style={styles.pickerHomePage} className="picker-home-responsive">
            <section style={styles.panel}>
              <div style={styles.pickerPanelHeader}>
                <div>
                  <p style={styles.label}>Artikel Picker</p>
                  <h2 style={styles.sectionTitle}>Orders verwerken</h2>
                </div>

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

              <div style={styles.allOrdersPanel}>
                <div style={styles.orderColumnHeader}>
                  <h3 style={styles.orderColumnTitle}>Alle orders</h3>
                  <span style={styles.orderCountBadge}>
                    {allFilteredPickerOrders.length}
                  </span>
                </div>

                <div style={styles.orderList}>
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
                    >
                      <div style={styles.orderCardTop}>
                        <div>
                          <p style={styles.orderNumber}>{order.id}</p>
                          <p style={styles.orderCustomer}>{order.klant}</p>
                        </div>
                        <span style={order.status === "Gereed" ? styles.doneStatus : styles.todoStatus}>
                          {order.status === "Gereed" ? "✓ Verwerkt" : "Nog doen"}
                        </span>
                      </div>

                      <div style={styles.orderMeta}>
                        <span>{formatDutchDate(getOrderDate(order))}</span>
                        <span>{order.tijd}</span>
                        <span>{order.regels} regels</span>
                      </div>
                    </button>
                  ))}
                </div>

                {pickerOrderPageCount > 1 && (
                  <div style={styles.paginationRow}>
                    <button
                      style={styles.smallLightButton}
                      disabled={safePickerOrderPage <= 1}
                      onClick={() => setPickerOrderPage((page) => Math.max(1, page - 1))}
                    >
                      Vorige
                    </button>

                    <span style={styles.paginationText}>
                      Pagina {safePickerOrderPage} van {pickerOrderPageCount}
                    </span>

                    <button
                      style={styles.smallLightButton}
                      disabled={safePickerOrderPage >= pickerOrderPageCount}
                      onClick={() => setPickerOrderPage((page) => Math.min(pickerOrderPageCount, page + 1))}
                    >
                      Volgende
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section style={styles.agendaPanel}>
              <section style={styles.panel}>
                <div style={styles.pickerPanelHeader}>
                  <div>
                    <p style={styles.label}>Planning</p>
                    <h2 style={styles.sectionTitle}>Visuele agenda</h2>
                    <p style={styles.weekLabel}>{formatWeekLabel(pickerWeekStart)}</p>
                  </div>

                  <div style={styles.weekNav} className="week-nav-responsive">
                    <button
                      style={styles.smallLightButton}
                      onClick={() => setPickerWeekStart((current) => addWeeks(current, -1))}
                    >
                      Vorige week
                    </button>
                    <button
                      style={styles.smallDarkButton}
                      onClick={() => setPickerWeekStart(startOfWeek(new Date()))}
                    >
                      Deze week
                    </button>
                    <button
                      style={styles.smallLightButton}
                      onClick={() => setPickerWeekStart((current) => addWeeks(current, 1))}
                    >
                      Volgende week
                    </button>
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
                  {pickerWeekDays.map((day, index) => {
                    const isToday = isSameDate(day.date, today);
                    const showOrders = isToday || index === 0;

                    return (
                      <div
                        key={day.label}
                        style={isToday ? styles.calendarDayActive : styles.calendarDay}
                      >
                        <div style={styles.calendarDayHeader}>
                          <div>
                            <p style={styles.calendarDayName}>{day.dag}</p>
                            <p style={styles.calendarDate}>{day.datum}</p>
                          </div>
                          <span style={styles.calendarCount}>
                            {visiblePickerOrders.filter((order) => isSameDate(getOrderDate(order), day.date)).length}
                          </span>
                        </div>

                        {visiblePickerOrders
                          .filter((order) => isSameDate(getOrderDate(order), day.date))
                          .map((order) => (
                            <button
                              key={order.id}
                              style={{
                                ...styles.calendarOrder,
                                background: order.status === "Gereed" ? "#16a34a" : "#eab308",
                                color: order.status === "Gereed" ? "white" : "#0f172a"
                              }}
                              onClick={() => setSelectedPickerOrder(order)}
                            >
                              <span style={styles.calendarOrderTime}>{order.tijd}</span>
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
                    <h2 style={styles.selectedOrderTitle}>{selectedPickerOrder?.id}</h2>
                    <p style={styles.selectedOrderCustomer}>{selectedPickerOrder?.klant}</p>
                    <p style={styles.selectedOrderMeta}>
                      Datum: {selectedPickerOrder?.plannedDate ? formatDutchDate(getOrderDate(selectedPickerOrder)) : ""} · Tijd: {selectedPickerOrder?.tijd} · Regels: {selectedPickerOrder?.regels} · Status: {selectedPickerOrder?.status}
                    </p>
                  </div>

                  <button style={styles.openPickbonButton} onClick={() => openPickerOrder(selectedPickerOrder)}>
                    Pickbon openen
                  </button>
                </div>
              </section>
            </section>
          </section>
        ) : selectedModule === "Artikelzoeker" && step !== "result" ? (
          <>
            <div style={styles.steps}>
              <div style={styles.activeStep}>1. Zoeken</div>
              <div style={styles.step}>2. Resultaat</div>
            </div>

            <div style={styles.pickerBackRow}>
              <button style={styles.backButton} onClick={backToPickerPlanning}>
                Terug naar planning
              </button>
              <button style={styles.backButton} onClick={goToMenu}>
                Terug naar menu
              </button>
            </div>

            <section style={styles.twoColumn}>
              <div style={styles.panel}>
                <p style={styles.label}>Artikelzoeker / pickbon</p>
                <h2 style={styles.bigTitle}>Pickbon verwerken</h2>

                <label style={styles.inputLabel}>Pickbonnummer / ordernummer</label>
                <input
                  style={styles.lengthInput}
                  value={pickbonNumber}
                  onChange={(e) => setPickbonNumber(e.target.value)}
                  placeholder="Bijv. PB-2026-001"
                />

                <form onSubmit={handleManualSearch}>
                  <label style={{ ...styles.inputLabel, marginTop: 14 }}>Artikelcode of barcode</label>
                  <input
                    style={styles.lengthInput}
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Bijv. 24010110096300092"
                    inputMode="numeric"
                  />

                  <button style={styles.primaryButton} type="submit">
                    Toevoegen aan pickbon
                  </button>
                </form>

                <button style={styles.secondaryButton} onClick={startScanner}>
                  Artikel barcode scannen
                </button>
              </div>

              <div style={styles.pickbonPanel}>
                <div style={styles.pickbonHeader}>
                  <div>
                    <p style={styles.label}>Pickbon</p>
                    <h2 style={styles.sectionTitle}>
                      {pickbonNumber || "Nieuwe pickbon"}
                    </h2>
                  </div>

                  <div style={styles.pickbonActions}>
                    <button style={styles.smallDarkButton} onClick={finishPickbon} disabled={pickbonLines.length === 0}>
                      Alles verwerkt
                    </button>
                    <button style={styles.smallOrangeButton} onClick={clearPickbon} disabled={pickbonLines.length === 0}>
                      Leegmaken
                    </button>
                  </div>
                </div>

                {pickbonLines.length === 0 ? (
                  <div style={styles.emptyPickbon}>
                    Nog geen artikelen gescand. Scan een barcode of voer handmatig een artikelcode in.
                  </div>
                ) : (
                  <div style={styles.pickbonList}>
                    {pickbonLines.map((line) => (
                      <div key={line.id} style={line.processed ? styles.pickbonLineDone : styles.pickbonLine} className="pickbon-line-responsive">
                        <div style={styles.pickbonLineMain}>
                          <strong>{line.description}</strong>
                          <span style={styles.pickbonCode}>{line.articleCode}</span>
                          {line.scannedQuantity !== undefined && (
                            <span style={line.processed ? styles.pickbonDoneText : styles.pickbonTodoText}>
                              {line.processed ? "✓ Verwerkt" : `Nog te verwerken: ${Number(line.quantity || 0) - Number(line.scannedQuantity || 0)}`}
                            </span>
                          )}
                          {line.scannedQuantity !== undefined && (
                            <span style={styles.pickbonMeta}>
                              Gescand: {line.scannedQuantity} / {line.quantity}
                            </span>
                          )}
                          <span style={styles.pickbonMeta}>Laatst gescand: {line.scannedAt}</span>
                        </div>

                        <div style={styles.pickbonLineControls} className="pickbon-controls-responsive">
                          <label style={styles.qtyLabel}>Aantal</label>
                          <input
                            style={styles.qtyInput}
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updatePickbonQuantity(line.id, e.target.value)}
                          />

                          <button style={styles.smallDarkButton} onClick={() => togglePickbonProcessed(line.id)}>
                            {line.processed ? "Open" : "Verwerkt"}
                          </button>

                          <button style={styles.smallDangerButton} onClick={() => removePickbonLine(line.id)}>
                            Verwijder
                          </button>
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
            <div style={styles.steps}>
              <div style={step === "types" ? styles.activeStep : styles.step}>1. Soort</div>
              <div style={step === "sizes" ? styles.activeStep : styles.step}>2. Maat</div>
              <div style={step === "thickness" ? styles.activeStep : styles.step}>3. Dikte</div>
              <div style={step === "length" ? styles.activeStep : styles.step}>4. Lengte</div>
              <div style={step === "colors" || step === "result" ? styles.activeStep : styles.step}>5. Kleur</div>
            </div>

            {step !== "types" && (
              <button style={styles.backButton} onClick={goBack}>
                Terug
              </button>
            )}

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
                  <input
                    style={styles.searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Zoek maat..."
                  />
                </div>

                <div style={styles.grid}>
                  {filteredSizes.map((item) => (
                    <button key={item} style={styles.cardButton} onClick={() => chooseSize(item)}>
                      <span style={styles.cardTitle}>{type} {item}</span>
                      <span style={styles.cardText}>
                        {type === "Koker" ? "Dikte kiezen" : "Lengte invoeren"}
                      </span>
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
                  <input
                    style={styles.lengthInput}
                    type="number"
                    min="1000"
                    max="20000"
                    step="50"
                    value={lengthMm}
                    onChange={(e) => setLengthMm(Number(e.target.value))}
                  />

                  {!lengthIsValid && (
                    <div style={styles.warning}>
                      Lengte moet tussen 1000 en 20000 mm liggen en in stappen van 50 mm.
                    </div>
                  )}

                  <button
                    style={lengthIsValid ? styles.primaryButton : styles.disabledButton}
                    disabled={!lengthIsValid}
                    onClick={() => setStep("colors")}
                  >
                    Verder naar kleur
                  </button>
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

                  <button style={styles.primaryButton} onClick={resetTool}>
                    {selectedModule === "Artikelzoeker" ? "Nieuwe zoekopdracht" : "Nieuwe code maken"}
                  </button>
                </div>

                <div style={styles.resultPanel}>
                  <h2 style={styles.resultTitle}>{articleCode ? "Artikel gevonden" : "Geen artikelcode"}</h2>

                  <p style={styles.resultLabel}>Artikelcode</p>

                  {articleCode ? (
                    <div style={styles.articleCode}>{articleCode}</div>
                  ) : (
                    <div style={styles.warningDark}>
                      Voor deze combinatie is nog geen stamcode toegevoegd.
                    </div>
                  )}

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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0ff 0%, #f8fafc 55%, #fff3e7 100%)",
    color: "#0f172a",
    fontFamily: "Arial, sans-serif",
    padding: 12,
    boxSizing: "border-box"
  },
  appShell: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "6px",
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
    border: "none",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  scanButton: {
    border: "none",
    borderRadius: 12,
    background: "#1234aa",
    color: "white",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  logoutButton: {
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
  secondaryButton: {
    marginTop: 10,
    width: "100%",
    border: "none",
    borderRadius: 14,
    background: "#1234aa",
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
    border: "none",
    borderRadius: 10,
    background: "#0f172a",
    color: "white",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  smallOrangeButton: {
    border: "none",
    borderRadius: 10,
    background: "#ff7a00",
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
  logic4Box: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16
  },
  logic4Actions: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8
  },
  logic4Message: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    fontWeight: 700
  },
  pickerLayout: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 14,
    alignItems: "start"
  },
  orderListPanel: {
    background: "white",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)"
  },
  agendaPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  pickerPanelHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12
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
  orderCard: {
    width: "100%",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer"
  },
  orderCardActive: {
    width: "100%",
    background: "#eff6ff",
    border: "1px solid #1234aa",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(18,52,170,0.12)"
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
  orderStatus: {
    color: "white",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900
  },
  orderMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#64748b",
    fontSize: 13,
    marginTop: 12
  },
  agendaToggle: {
    display: "flex",
    gap: 8
  },
  smallLightButton: {
    border: "none",
    borderRadius: 10,
    background: "#f1f5f9",
    color: "#334155",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10
  },
  calendarDay: {
    minHeight: 210,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 12
  },
  calendarDayActive: {
    minHeight: 210,
    background: "#eff6ff",
    border: "1px solid #1234aa",
    borderRadius: 16,
    padding: 12
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
    opacity: 0.9,
    marginBottom: 2
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
  selectedOrderContent: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 8
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
  selectedOrderMeta: {
    margin: "9px 0 0",
    color: "#dbeafe",
    fontSize: 14
  },
  openPickbonButton: {
    border: "none",
    borderRadius: 14,
    background: "#ff7a00",
    color: "white",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  pickerBackRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  pickerHomePage: {
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    gap: 14,
    alignItems: "start"
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
  orderSplitGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14
  },
  todoOrdersPanel: {
    background: "#fef9c3",
    border: "1px solid #fde047",
    borderRadius: 18,
    padding: 14
  },
  doneOrdersPanel: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    borderRadius: 18,
    padding: 14
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
  todoBadge: {
    background: "#eab308",
    color: "#0f172a",
    borderRadius: 999,
    padding: "6px 11px",
    fontWeight: 900
  },
  doneBadge: {
    background: "#16a34a",
    color: "white",
    borderRadius: 999,
    padding: "6px 11px",
    fontWeight: 900
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
    boxShadow: "0 8px 20px rgba(22,163,74,0.20)"
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
  pickerHomePage: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    gap: 14,
    alignItems: "stretch"
  },
  orderSplitGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    minHeight: 520
  },
  todoOrdersPanel: {
    background: "#fef9c3",
    border: "1px solid #fde047",
    borderRadius: 18,
    padding: 14,
    minHeight: 520
  },
  doneOrdersPanel: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    borderRadius: 18,
    padding: 14,
    minHeight: 520
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
  weekNav: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10
  },
  calendarDay: {
    minHeight: 250,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 12
  },
  calendarDayActive: {
    minHeight: 250,
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
    border: "none",
    borderRadius: 14,
    background: "#ff7a00",
    color: "white",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
};
