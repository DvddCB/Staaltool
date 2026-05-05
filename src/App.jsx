import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import JsBarcode from "jsbarcode";
import styles from "./styles.js";
import { profielData, kokerData, kleurData, demoPickerOrders } from "./data.js";


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
function getOrderProgress(order) {
  const rows = order?.rows || [];
  const total = rows.length || Number(order?.regels || 0) || 0;
  if (order?.status === "Gereed") {
    return { done: total, open: 0, total };
  }
  const done = rows.filter((row) => row.processed || row.scannedQuantity >= row.quantity).length;
  return {
    done,
    open: Math.max(0, total - done),
    total
  };
}
async function loadPdfJsFromCdn() {
  if (window.pdfjsLib) {
    return window.pdfjsLib;
  }
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
  if (!window.pdfjsLib) {
    throw new Error("PDF.js kon niet worden geladen.");
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return window.pdfjsLib;
}
async function loadTesseractFromCdn() {
  if (window.Tesseract) {
    return window.Tesseract;
  }
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
  if (!window.Tesseract) {
    throw new Error("OCR kon niet worden geladen.");
  }
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
  // 1. Beste geval: "Voor:" staat op aparte regel.
  // Neem exact de eerste regel eronder.
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (/^Voor\s*:?\s*$/i.test(line)) {
      return cleanLogic4CustomerLine(lines[index + 1] || "");
    }
    const sameLineMatch = line.match(/^Voor\s*:\s*(.+)$/i);
    if (sameLineMatch?.[1]?.trim()) {
      return cleanLogic4CustomerLine(sameLineMatch[1]);
    }
  }
  // 2. OCR fallback: "Voor:" staat soms in één lange regel.
  // Dan pakken we alleen het eerste blok direct na Voor:
  const fallbackMatch = String(cleanText || "").match(/Voor\s*:\s*(.+)$/i);
  return cleanLogic4CustomerLine(fallbackMatch?.[1] || "");
}
function cleanLogic4CustomerLine(value) {
  let text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  // Stop bij bekende velden.
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
  // Stop bij postcode of telefoon.
  text = text
    .replace(/\b\d{4}\s?[A-Z]{2}\b.*$/i, "")
    .replace(/\b\d{2}[-\s]?\d{8}\b.*$/i, "")
    .trim();
  // Speciaal voor OCR waarbij adres achter klant op dezelfde regel komt:
  // "Balie eentweedrie 1 1234ab..." => "Balie"
  const beforeAddress = text.match(/^(.+?)\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9.'-]*\s+\d+\b/);
  if (beforeAddress?.[1]) {
    text = beforeAddress[1].trim();
  }
  // Als OCR nog steeds alles aan elkaar zet, neem alleen het eerste woord/blok.
  // Voor jullie voorbeeld wordt dit "Balie".
  if (text.includes(" ")) {
    const firstWord = text.split(" ")[0].trim();
    if (firstWord) return firstWord;
  }
  return text;
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
  // 1. Beste herkenning voor jullie Logic4 layout:
  // Art.nr staat soms als 14 cijfers op regel 1 en laatste 3 cijfers op regel 2.
  // Omschrijving en aantallen staan in de regels erna.
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
      const smallNumbers = qtyNumbers
        .map((value) => Number(value))
        .filter((value) => value > 0 && value <= 99);
      // Laatste kleine getal is meestal "Nu te picken".
      const quantity = smallNumbers.length ? smallNumbers[smallNumbers.length - 1] : 1;
      addArticleRow(combinedCode, quantity, windowText);
    }
  }
  // 2. Fallback: zoek alle volledige codes in samengevoegde tekst.
  const compactText = joinedLines.replace(/\s+/g, " ");
  const fullCodes = compactText.match(/\b\d{15,24}\b/g) || [];
  fullCodes.forEach((code) => {
    if (seenCodes.has(code)) return;
    const codeIndex = compactText.indexOf(code);
    const sourceWindow = compactText.slice(codeIndex, codeIndex + 180);
    const numbersAfterCode = sourceWindow
      .slice(code.length)
      .match(/\b\d+\b/g) || [];
    const smallNumbers = numbersAfterCode
      .map((value) => Number(value))
      .filter((value) => value > 0 && value <= 99);
    const quantity = smallNumbers.length ? smallNumbers[smallNumbers.length - 1] : 1;
    addArticleRow(code, quantity, sourceWindow);
  });
  // 3. Laatste fallback speciaal voor deze pickbon:
  // OCR kan de code splitsen of spaties zetten. Zoek "240..." + losse cijfers erachter in de buurt.
  for (let index = 0; index < lines.length; index++) {
    const windowText = lines.slice(index, index + 4).join(" ").replace(/\s+/g, " ");
    const looseMatch = windowText.match(/\b(24\d{10,14})\D+(\d{1,6})\b/);
    if (looseMatch) {
      const combinedCode = `${looseMatch[1]}${looseMatch[2]}`;
      const qtyNumbers = windowText.match(/\b\d+\b/g) || [];
      const smallNumbers = qtyNumbers
        .map((value) => Number(value))
        .filter((value) => value > 0 && value <= 99);
      const quantity = smallNumbers.length ? smallNumbers[smallNumbers.length - 1] : 1;
      addArticleRow(combinedCode, quantity, windowText);
    }
  }
  const fallbackId = fileName.replace(/\.pdf$/i, "") || `PDF-${Date.now()}`;
  const orderId = orderMatch?.[1] || fallbackId;
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
  return {
    pdf,
    text: pageTexts.join("\n")
  };
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
    await page.render({
      canvasContext: context,
      viewport
    }).promise;
    const result = await Tesseract.recognize(canvas, "nld+eng");
    pageTexts.push(result?.data?.text || "");
  }
  return pageTexts.join("\n");
}

export default function App() {
  const controlsRef = useRef(null);
  const scanLockRef = useRef(false);

  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("staaltoolLoggedIn") === "true");
  const [selectedModule, setSelectedModule] = useState("");
  const [pickerView, setPickerView] = useState("home");
  const [selectedPickerOrder, setSelectedPickerOrder] = useState(() => getDemoOrdersWithDates()[1]);
  const [pickerOrderQuery, setPickerOrderQuery] = useState("");
  const [pickerOrderPage, setPickerOrderPage] = useState(1);
  const [pickerWeekStart, setPickerWeekStart] = useState(() => startOfWeek(new Date()));
  const [processedOrderIds, setProcessedOrderIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("staaltoolProcessedOrderIds") || "[]");
    } catch {
      return [];
    }
  });
  const [uploadedPdfOrders, setUploadedPdfOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("staaltoolUploadedPdfOrders") || "[]");
    } catch {
      return [];
    }
  });
  const [hiddenDemoOrderIds, setHiddenDemoOrderIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("staaltoolHiddenDemoOrderIds") || "[]");
    } catch {
      return [];
    }
  });
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

  const [pickbonLines, setPickbonLines] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("staaltoolPickbonLines") || "[]");
    } catch {
      return [];
    }
  });
  const [pickbonNumber, setPickbonNumber] = useState(() => localStorage.getItem("staaltoolPickbonNumber") || "");

  const [logic4OrderNumber, setLogic4OrderNumber] = useState("");
  const [logic4Message, setLogic4Message] = useState("");

  const [confirmLineId, setConfirmLineId] = useState(null);

  const types = ["HEA", "HEB", "IPE", "UNP", "Koker", "Hoeklijn gelijkzijdig", "Hoeklijn ongelijkzijdig", "Stripstaal"];
  const sizes = type === "Koker" ? Object.keys(kokerData) : type ? profielData[type] || [] : [];
  const filteredSizes = sizes.filter((item) =>
    String(item).toLowerCase().includes(query.toLowerCase())
  );
  const pickerWeekDays = getWeekDays(pickerWeekStart);
  const today = new Date();
  const datedPickerOrders = [
    ...getDemoOrdersWithDates().filter((order) => !hiddenDemoOrderIds.includes(order.id)),
    ...uploadedPdfOrders
  ];
  const effectivePickerOrders = datedPickerOrders.map((order) => ({
    ...order,
    status: processedOrderIds.includes(order.id) ? "Gereed" : order.status
  }));
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
    localStorage.setItem("staaltoolUploadedPdfOrders", JSON.stringify(uploadedPdfOrders));
  }, [uploadedPdfOrders]);

  useEffect(() => {
    localStorage.setItem("staaltoolHiddenDemoOrderIds", JSON.stringify(hiddenDemoOrderIds));
  }, [hiddenDemoOrderIds]);

  useEffect(() => {
    localStorage.setItem("staaltoolPickbonLines", JSON.stringify(pickbonLines));
  }, [pickbonLines]);

  useEffect(() => {
    localStorage.setItem("staaltoolPickbonNumber", pickbonNumber || "");
  }, [pickbonNumber]);

  async function handlePdfUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfUploadMessage("PDF wordt gelezen...");
    setSearchError("");

    try {
      const { pdf, text } = await readPdfTextWithPdfJs(file);
      let fullText = text || "";
      let order = parseLogic4PickbonTextToOrder(fullText, file.name);

      if (!order.rows.length) {
        setPdfUploadMessage("PDF bevat geen tekst. OCR wordt gestart...");
        const ocrText = await readPdfTextWithOcr(pdf);
        fullText = `${fullText}\n${ocrText}`;
        order = parseLogic4PickbonTextToOrder(fullText, file.name);
      }

      if (!order.rows.length) {
        console.log("PDF tekst/OCR tekst:", fullText);
        setPdfUploadMessage("");
        setSearchError("PDF gelezen, maar er zijn geen herkenbare artikelregels gevonden. Open de browser-console om de OCR tekst te controleren.");
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
      setPdfUploadMessage(`PDF-order ${order.id} geladen met ${order.rows.length} regel(s). Kies eventueel direct een plandatum.`);
      event.target.value = "";
    } catch (err) {
      console.error(err);
      setPdfUploadMessage("");
      setSearchError("PDF kon niet worden gelezen. Probeer opnieuw of stuur een voorbeeld-PDF om de herkenning te verbeteren.");
      event.target.value = "";
    }
  }


  function handleLogin(event) {
    event.preventDefault();

    if (username === "Circulaire-Bouwmaterialen" && password === "Houthandel18") {
      localStorage.setItem("staaltoolLoggedIn", "true");
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
        originalQuantity: row.quantity,
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

  function confirmProcessLine() {
    if (!confirmLineId) return;

    setPickbonLines((currentLines) =>
      currentLines.map((line) => {
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
      })
    );

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
      setProcessedOrderIds((currentIds) =>
        currentIds.includes(selectedPickerOrder.id)
          ? currentIds
          : [...currentIds, selectedPickerOrder.id]
      );

      setSelectedPickerOrder((currentOrder) =>
        currentOrder ? { ...currentOrder, status: "Gereed" } : currentOrder
      );
    }

    if (confirmOrderAction === "edit") {
      setProcessedOrderIds((currentIds) =>
        currentIds.filter((orderId) => orderId !== selectedPickerOrder.id)
      );

      setSelectedPickerOrder((currentOrder) =>
        currentOrder ? { ...currentOrder, status: "Open" } : currentOrder
      );

      setPickbonLines((currentLines) =>
        currentLines.map((line) => ({
          ...line,
          processed: false,
          scannedQuantity: line.scannedQuantity !== undefined ? 0 : line.scannedQuantity
        }))
      );
    }

    setConfirmOrderAction(null);
  }

  function cancelOrderAction() {
    setConfirmOrderAction(null);
  }

  function requestRemoveOrder(orderId) {
    setConfirmRemoveOrderId(orderId);
  }

  function confirmRemoveOrder() {
    if (!confirmRemoveOrderId) return;

    const isUploadedOrder = uploadedPdfOrders.some((order) => order.id === confirmRemoveOrderId);

    if (isUploadedOrder) {
      setUploadedPdfOrders((currentOrders) =>
        currentOrders.filter((order) => order.id !== confirmRemoveOrderId)
      );
    } else {
      setHiddenDemoOrderIds((currentIds) =>
        currentIds.includes(confirmRemoveOrderId)
          ? currentIds
          : [...currentIds, confirmRemoveOrderId]
      );
    }

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
    if (!orderId || !nextDate) return;

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
    const effectiveOrder = order
      ? {
          ...order,
          status: processedOrderIds.includes(order.id) ? "Gereed" : order.status
        }
      : order;

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
              scannedQuantity: line.scannedQuantity !== undefined ? line.quantity : line.scannedQuantity
            }))
          );
        }, 0);
      }
    } else {
      setPickbonNumber(effectiveOrder?.id || "");
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
          .mobile-agenda-panel {
            padding: 12px !important;
          }

          .mobile-agenda-panel h2 {
            font-size: 20px !important;
          }

          .mobile-agenda-panel .week-nav-responsive {
            margin-top: 8px !important;
          }

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

          .calendar-grid-responsive > div {
            min-height: 92px !important;
            padding: 10px !important;
          }

          .calendar-grid-responsive button {
            padding: 8px !important;
            margin-bottom: 6px !important;
          }

          .calendar-grid-responsive p {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
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

        {confirmLineId && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmModal}>
              <h2 style={styles.confirmTitle}>Controle artikel</h2>
              <p style={styles.confirmText}>
                Weet u zeker dat u het juiste artikel heeft?
              </p>

              <div style={styles.confirmActions}>
                <button style={styles.confirmNoButton} onClick={cancelProcessLine}>
                  Nee
                </button>
                <button style={styles.confirmYesButton} onClick={confirmProcessLine}>
                  Ja
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmOrderAction && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmModal}>
              <h2 style={styles.confirmTitle}>
                {confirmOrderAction === "finish" ? "Order verwerken" : "Order aanpassen"}
              </h2>
              <p style={styles.confirmText}>
                {confirmOrderAction === "finish"
                  ? "Weet u zeker dat deze order volledig verwerkt is?"
                  : "Weet u zeker dat u deze verwerkte order wilt aanpassen?"}
              </p>

              <div style={styles.confirmActions}>
                <button style={styles.confirmNoButton} onClick={cancelOrderAction}>
                  Nee
                </button>
                <button style={styles.confirmYesButton} onClick={confirmOrderActionNow}>
                  Ja
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmRemoveOrderId && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmModal}>
              <h2 style={styles.confirmTitle}>Order uit lijst halen</h2>
              <p style={styles.confirmText}>
                Weet u zeker dat u deze order uit het overzicht wilt halen?
              </p>

              <div style={styles.confirmActions}>
                <button style={styles.confirmNoButton} onClick={cancelRemoveOrder}>
                  Nee
                </button>
                <button style={styles.confirmYesButton} onClick={confirmRemoveOrder}>
                  Ja
                </button>
              </div>
            </div>
          </div>
        )}

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

              <div style={styles.pdfUploadPanel}>
                <div>
                  <p style={styles.label}>PDF pickbon</p>
                  <h3 style={styles.pdfUploadTitle}>Pickbon uploaden</h3>
                  <p style={styles.pdfUploadText}>Upload een Logic4 pickbon-PDF. De app leest tekst of gebruikt OCR en zet de order direct in de lijst.</p>
                </div>

                <label style={styles.pdfUploadButton}>
                  PDF kiezen
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={handlePdfUpload}
                  />
                </label>

                {pdfUploadMessage && <div style={styles.pdfUploadMessage}>{pdfUploadMessage}</div>}

                {lastUploadedOrderId && (
                  <div style={styles.pdfDatePanel}>
                    <label style={styles.pdfDateLabel}>
                      Plandatum voor order {lastUploadedOrderId}
                    </label>
                    <input
                      style={styles.pdfDateInput}
                      type="date"
                      value={
                        uploadedPdfOrders.find((order) => order.id === lastUploadedOrderId)?.plannedDate ||
                        toIsoDate(new Date())
                      }
                      onChange={(event) =>
                        updateUploadedOrderDate(lastUploadedOrderId, event.target.value, {
                          clearUploadDatePicker: true
                        })
                      }
                    />
                  </div>
                )}
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
                      onDoubleClick={() => openPickerOrder(order)}
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
                        <span style={styles.orderProgressText}>
                          <strong>{getOrderProgress(order).done}</strong> gedaan · <strong>{getOrderProgress(order).open}</strong> open
                        </span>
                      </div>

                      <div style={styles.orderProgressBar}>
                        <div
                          style={{
                            ...styles.orderProgressFill,
                            width: `${getOrderProgress(order).total
                              ? (getOrderProgress(order).done / getOrderProgress(order).total) * 100
                              : 0}%`
                          }}
                        />
                      </div>

                      <div style={styles.orderCardActions}>
                        <button
                          type="button"
                          style={styles.removeOrderButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            requestRemoveOrder(order.id);
                          }}
                        >
                          Uit lijst halen
                        </button>
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
              <section style={styles.panel} className="mobile-agenda-panel">
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
                              onClick={() => openPickerOrder(order)}
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
                    <h2 style={styles.selectedOrderTitle}>{currentSelectedPickerOrder?.id}</h2>
                    <p style={styles.selectedOrderCustomer}>{currentSelectedPickerOrder?.klant}</p>
                    <p style={styles.selectedOrderMeta}>
                      Datum: {currentSelectedPickerOrder?.plannedDate ? formatDutchDate(getOrderDate(currentSelectedPickerOrder)) : ""} · Tijd: {currentSelectedPickerOrder?.tijd} · Gedaan: {getOrderProgress(currentSelectedPickerOrder).done} · Open: {getOrderProgress(currentSelectedPickerOrder).open} · Status: {currentSelectedPickerOrder?.status}
                    </p>
                  </div>

                  <div style={styles.selectedOrderButtons}>
                    <button style={styles.openPickbonButton} onClick={() => openPickerOrder(currentSelectedPickerOrder)}>
                      Pickbon openen
                    </button>
                    <button
                      style={styles.removeSelectedOrderButton}
                      onClick={() => requestRemoveOrder(currentSelectedPickerOrder?.id)}
                    >
                      Uit lijst halen
                    </button>
                  </div>
                </div>
              </section>
            </section>
          </section>
        ) : selectedModule === "Artikelzoeker" && step !== "result" ? (
          <>
            <div style={styles.pickerBackRow}>
              <button style={styles.backButton} onClick={backToPickerPlanning}>
                Terug naar planning
              </button>
              <button style={styles.backButton} onClick={goToMenu}>
                Terug naar menu
              </button>
            </div>

            <section style={styles.twoColumn}>
              <div style={styles.pickbonPanel}>
                <div style={styles.pickbonHeader}>
                  <div>
                    <p style={styles.label}>Pickbon</p>
                    <h2 style={styles.sectionTitle}>
                      {pickbonNumber || "Nieuwe pickbon"}
                    </h2>
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
                    <button style={styles.finishOrderButton} onClick={requestFinishOrder}>
                      Verwerken
                    </button>
                  </div>
                )}

                {currentSelectedPickerOrder?.status === "Gereed" && (
                  <div style={styles.orderProcessedBox}>
                    <div>
                      <strong>✓ Order verwerkt.</strong>
                      <span> Deze order staat als verwerkt in planning en overzicht.</span>
                    </div>
                    <button style={styles.editProcessedOrderButton} onClick={requestEditProcessedOrder}>
                      Order aanpassen
                    </button>
                  </div>
                )}

                {currentSelectedPickerOrder?.source === "PDF" && (
                  <div style={styles.pickbonDateEdit}>
                    <label style={styles.pdfDateLabel}>Plandatum</label>
                    <input
                      style={styles.pdfDateInput}
                      type="date"
                      value={currentSelectedPickerOrder?.plannedDate || toIsoDate(new Date())}
                      onChange={(event) =>
                        updateUploadedOrderDate(currentSelectedPickerOrder.id, event.target.value)
                      }
                    />
                  </div>
                )}

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
                          <span style={line.processed ? styles.lineProgressDone : styles.lineProgressOpen}>
                            {Number(line.scannedQuantity || 0)} / {Number(line.originalQuantity || line.quantity || 1)} gepickt
                          </span>
                          <span style={styles.pickbonCode}>{line.articleCode}</span>
                          {line.scannedQuantity !== undefined && (
                            <span style={line.processed ? styles.pickbonDoneText : styles.pickbonTodoText}>
                              {line.processed ? "✓ Verwerkt" : `Nog te verwerken: ${Number(line.originalQuantity || line.quantity || 0) - Number(line.scannedQuantity || 0)}`}
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
                          <div style={styles.requestedQtyBox}>
                            <span style={styles.qtyLabel}>Aantal</span>
                            <input
                              style={styles.qtyInput}
                              type="number"
                              min="1"
                              max={Math.max(1, Number(line.originalQuantity || line.quantity || 1) - Number(line.scannedQuantity || 0))}
                              value={Math.min(
                                Number(line.quantity || 1),
                                Math.max(1, Number(line.originalQuantity || line.quantity || 1) - Number(line.scannedQuantity || 0))
                              )}
                              onChange={(e) => updatePickbonQuantity(line.id, e.target.value)}
                            />
                            <span style={styles.qtyMaxText}>
                              resterend: {Math.max(0, Number(line.originalQuantity || line.quantity || 1) - Number(line.scannedQuantity || 0))}
                            </span>
                          </div>

                          {!line.processed && Number(line.scannedQuantity || 0) < Number(line.originalQuantity || line.quantity || 1) && (
                            <button style={styles.smallScanButton} onClick={startScanner}>
                              Scan
                            </button>
                          )}

                          {line.processed ? (
                            <button style={styles.smallDoneButton} onClick={() => togglePickbonProcessed(line.id)}>
                              ✓ Verwerkt
                            </button>
                          ) : Number(line.scannedQuantity || 0) < Number(line.originalQuantity || line.quantity || 1) ? (
                            <button style={styles.smallDarkButton} onClick={() => requestProcessLine(line.id)}>
                              Verwerken
                            </button>
                          ) : (
                            <button style={styles.smallDoneButton}>
                              ✓ Compleet
                            </button>
                          )}

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
