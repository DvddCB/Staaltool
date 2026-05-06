const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");

if (!fs.existsSync(appPath)) {
  console.log("❌ Kan src/App.jsx niet vinden.");
  console.log("Zet deze bestanden in de hoofdmap van je project, dus naast package.json.");
  process.exit(1);
}

let code = fs.readFileSync(appPath, "utf8");

const backupPath = path.join(process.cwd(), "src", `App.backup-${Date.now()}.jsx`);
fs.writeFileSync(backupPath, code, "utf8");
console.log("✅ Backup gemaakt:", backupPath);

// 1) orderFromDb rows normaliseren
code = code.replace(
`function orderFromDb(row) {
  return {
    id: row.id,
    klant: row.klant || "",
    tijd: row.tijd || "",
    status: row.status || "Open",
    regels: Number(row.regels || 0),
    kleur: row.kleur || "#eab308",
    plannedDate: row.planned_date || "",
    source: row.source || "",
    rows: Array.isArray(row.rows) ? row.rows : [],
    rawPdfText: row.raw_pdf_text || ""
  };
}`,
`function normalizeOrderRow(row, index = 0) {
  const articleCode = row.articleCode || row.artikelcode || row.code || "";
  const description = row.description || row.artikel || row.naam || articleCode || "Onbekend artikel";
  const quantity = Number(row.quantity || row.aantal || row.originalQuantity || 1);
  const scannedQuantity = Number(row.scannedQuantity || 0);

  return {
    id: row.id || "row-" + index + "-" + articleCode,
    articleCode,
    artikelcode: articleCode,
    artikel: description,
    description,
    type: row.type || "",
    size: row.size || "",
    length: row.length || "",
    colorCode: row.colorCode || "",
    colorName: row.colorName || "",
    quantity,
    originalQuantity: Number(row.originalQuantity || quantity || 1),
    aantal: quantity,
    scannedQuantity,
    processed: Boolean(row.processed) || scannedQuantity >= Number(row.originalQuantity || quantity || 1),
    status: row.status || "open",
    scannedAt: row.scannedAt || "-"
  };
}

function orderFromDb(row) {
  const rows = Array.isArray(row.rows) ? row.rows.map(normalizeOrderRow) : [];

  return {
    id: row.id,
    klant: row.klant || row.customer || row.naam || "",
    tijd: row.tijd || "",
    status: row.status || "Open",
    regels: Number(row.regels || rows.length || 0),
    kleur: row.kleur || "#eab308",
    plannedDate: row.planned_date || row.plannedDate || "",
    source: row.source || "PDF",
    rows,
    rawPdfText: row.raw_pdf_text || row.rawPdfText || ""
  };
}`
);

// 2) addOrderRowsToPickbon robuust maken
code = code.replace(
`          articleCode: row.articleCode,
          description: row.description,
          type: row.type || "",
          size: row.size || "",
          length: row.length || "",
          colorCode: row.colorCode || "",
          colorName: row.colorName || "",`,
`          articleCode: row.articleCode || row.artikelcode || row.code || "",
          description: row.description || row.artikel || row.naam || row.articleCode || row.artikelcode || "Onbekend artikel",
          type: row.type || "",
          size: row.size || "",
          length: row.length || "",
          colorCode: row.colorCode || "",
          colorName: row.colorName || "",`
);

// 3) datum wijzigen zichtbaar maken voor beheerder bij elke order
code = code.replace(
`{canEditDates && currentSelectedPickerOrder?.source === "PDF" && (`,
`{canEditDates && currentSelectedPickerOrder?.id && (`
);

// 4) klantnaam tonen bovenaan pickbon
code = code.replace(
`<h2 style={styles.sectionTitle}>{pickbonNumber || "Nieuwe pickbon"}</h2>`,
`<h2 style={styles.sectionTitle}>{pickbonNumber || "Nieuwe pickbon"}</h2>
                    {currentSelectedPickerOrder?.klant && (
                      <p style={styles.selectedOrderCustomer}>Klant: {currentSelectedPickerOrder.klant}</p>
                    )}`
);

// 5) persist rows ook compatible houden
code = code.replace(
`      articleCode: line.articleCode,
      description: line.description,`,
`      articleCode: line.articleCode || line.artikelcode || "",
      artikelcode: line.articleCode || line.artikelcode || "",
      artikel: line.description || line.artikel || "",
      description: line.description || line.artikel || line.articleCode || "",`
);

fs.writeFileSync(appPath, code, "utf8");

console.log("✅ App.jsx aangepast.");
console.log("");
console.log("Wat is aangepast:");
console.log("- datum wijzigen zichtbaar voor beheerder");
console.log("- klantnaam zichtbaar bovenaan pickbon");
console.log("- artikelomschrijving fallback op artikel/artikelcode");
console.log("- quantity/aantal wordt goed gelezen");
console.log("");
console.log("Nu committen/uploaden naar GitHub en Vercel opnieuw laten deployen.");
