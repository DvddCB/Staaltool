const fs = require("fs");
const path = require("path");

const appPath = path.join(process.cwd(), "src", "App.jsx");

if (!fs.existsSync(appPath)) {
  console.log("❌ src/App.jsx niet gevonden.");
  console.log("Zet deze bestanden in de hoofdmap van je project, naast package.json.");
  process.exit(1);
}

let code = fs.readFileSync(appPath, "utf8");
const backup = path.join(process.cwd(), "src", `App.backup-${Date.now()}.jsx`);
fs.writeFileSync(backup, code, "utf8");

console.log("✅ Backup gemaakt:", backup);

// 1. Voeg normalizeOrderRow toe en vervang orderFromDb
const oldOrderFromDb = `function orderFromDb(row) {
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
}`;

const newOrderFromDb = `function normalizeOrderRow(row, index = 0) {
  const articleCode = row.articleCode || row.artikelcode || row.code || "";
  const description = row.description || row.artikel || row.naam || articleCode || "Onbekend artikel";
  const quantity = Number(row.quantity || row.aantal || row.originalQuantity || 1);
  const originalQuantity = Number(row.originalQuantity || quantity || 1);
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
    tijd: row.tijd || "",
    status: row.status || "Open",
    regels: Number(row.regels || rows.length || 0),
    kleur: row.kleur || "#eab308",
    plannedDate: row.planned_date || row.plannedDate || "",
    source: row.source || "PDF",
    rows,
    rawPdfText: row.raw_pdf_text || row.rawPdfText || ""
  };
}`;

if (!code.includes("function normalizeOrderRow(")) {
  if (!code.includes(oldOrderFromDb)) {
    console.log("⚠️ orderFromDb exact blok niet gevonden. Ik probeer een bredere vervanging.");
    code = code.replace(/function orderFromDb\(row\) \{[\s\S]*?\n\}/, newOrderFromDb);
  } else {
    code = code.replace(oldOrderFromDb, newOrderFromDb);
  }
}

// 2. orderToDb rows ook normaliseren
code = code.replace(
  `rows: order.rows || [],`,
  `rows: (order.rows || []).map(normalizeOrderRow),`
);

// 3. addOrderRowsToPickbon robuust maken
code = code.replace(
`  function addOrderRowsToPickbon(orderNumber, rows) {
    setPickbonNumber(orderNumber || "Logic4 order");
    setPickbonLines(
      rows.map((row, index) => {
        const originalQuantity = Number(row.quantity || row.originalQuantity || 1);
        const scannedQuantity = Number(row.scannedQuantity || 0);
        const processed = Boolean(row.processed) || scannedQuantity >= originalQuantity;

        return {
          id: "logic4-" + Date.now() + "-" + index,
          articleCode: row.articleCode,
          description: row.description,
          type: row.type || "",
          size: row.size || "",
          length: row.length || "",
          colorCode: row.colorCode || "",
          colorName: row.colorName || "",
          quantity: Math.max(1, originalQuantity - scannedQuantity),
          originalQuantity,
          scannedQuantity,
          processed,
          scannedAt: row.scannedAt || "-"
        };
      })
    );
  }`,
`  function addOrderRowsToPickbon(orderNumber, rows) {
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
          description: row.description || row.artikel || row.articleCode || row.artikelcode || "Onbekend artikel",
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
  }`
);

// 4. persist rows robuust maken
code = code.replace(
`      articleCode: line.articleCode,
      description: line.description,`,
`      articleCode: line.articleCode || line.artikelcode || "",
      artikelcode: line.articleCode || line.artikelcode || "",
      artikel: line.description || line.artikel || "",
      description: line.description || line.artikel || line.articleCode || line.artikelcode || "Onbekend artikel",`
);

// 5. datum aanpassen zichtbaar maken voor admin bij alle orders
code = code.replace(
  `{canEditDates && currentSelectedPickerOrder?.source === "PDF" && (`,
  `{canEditDates && currentSelectedPickerOrder?.id && (`
);

// 6. klantnaam tonen op pickbon
code = code.replace(
`                    <h2 style={styles.sectionTitle}>{pickbonNumber || "Nieuwe pickbon"}</h2>
                  </div>`,
`                    <h2 style={styles.sectionTitle}>{pickbonNumber || "Nieuwe pickbon"}</h2>
                    {currentSelectedPickerOrder?.klant && (
                      <p style={styles.pickbonCustomer}>Klant: {currentSelectedPickerOrder.klant}</p>
                    )}
                  </div>`
);

// 7. styles toevoegen voor klantnaam op pickbon
if (!code.includes("pickbonCustomer:")) {
  code = code.replace(
`  pickbonHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 12
  },`,
`  pickbonHeader: {
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
  },`
  );
}

// 8. pickbon line display fallback
code = code.replace(
  `<strong>{line.description}</strong>`,
  `<strong>{line.description || line.artikel || line.articleCode || "Onbekend artikel"}</strong>`
);

code = code.replace(
  `<span style={styles.pickbonCode}>{line.articleCode}</span>`,
  `<span style={styles.pickbonCode}>{line.articleCode || line.artikelcode}</span>`
);

fs.writeFileSync(appPath, code, "utf8");

console.log("✅ src/App.jsx aangepast.");
console.log("");
console.log("Aangepast:");
console.log("- datum aanpassen zichtbaar voor beheerder");
console.log("- klantnaam zichtbaar bovenaan pickbon");
console.log("- artikelomschrijving zichtbaar met fallback");
console.log("- articleCode/artikelcode en quantity/aantal compatible");
console.log("");
console.log("Nu uploaden/committen naar GitHub en Vercel opnieuw laten deployen.");
