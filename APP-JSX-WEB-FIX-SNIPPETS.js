// APP.JSX WEB-FIX SNIPPETS
// Gebruik deze snippets in GitHub web in src/App.jsx.
// Dit bestand is GEEN App.jsx om direct te deployen.
// Volg LEESMIJ-GITHUB-WEB.txt exact.

// 1) PLAATS DIT DIRECT BOVEN function orderFromDb(row)

function normalizeOrderRow(row, index = 0) {
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

// 2) VERVANG HELE function orderFromDb(row) DOOR DIT:

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
}

// 3) IN function orderToDb(order), VERVANG:
// rows: order.rows || [],
// DOOR:
rows: (order.rows || []).map(normalizeOrderRow),

// 4) VERVANG HELE function addOrderRowsToPickbon(orderNumber, rows) DOOR DIT:

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
}

// 5) IN persistCurrentOrderRows, VERVANG DE REGELS:
// articleCode: line.articleCode,
// description: line.description,
// DOOR:
articleCode: line.articleCode || line.artikelcode || "",
artikelcode: line.articleCode || line.artikelcode || "",
artikel: line.description || line.artikel || "",
description: line.description || line.artikel || line.articleCode || line.artikelcode || "Onbekend artikel",

// 6) VERVANG:
// {canEditDates && currentSelectedPickerOrder?.source === "PDF" && (
// DOOR:
{canEditDates && currentSelectedPickerOrder?.id && (

// 7) IN PICKBON HEADER, VERVANG:
// <h2 style={styles.sectionTitle}>{pickbonNumber || "Nieuwe pickbon"}</h2>
// DOOR:
<h2 style={styles.sectionTitle}>{pickbonNumber || "Nieuwe pickbon"}</h2>
{currentSelectedPickerOrder?.klant && (
  <p style={styles.pickbonCustomer}>Klant: {currentSelectedPickerOrder.klant}</p>
)}

// 8) IN pickbonLines.map, VERVANG:
// <strong>{line.description}</strong>
// DOOR:
<strong>{line.description || line.artikel || line.articleCode || "Onbekend artikel"}</strong>

// 9) VERVANG:
// <span style={styles.pickbonCode}>{line.articleCode}</span>
// DOOR:
<span style={styles.pickbonCode}>{line.articleCode || line.artikelcode}</span>

// 10) VOEG BIJ const styles TOE, BIJVOORBEELD NA pickbonHeader:
pickbonCustomer: {
  margin: "6px 0 0",
  color: "#334155",
  fontSize: 16,
  fontWeight: 900
},

// 11) DATUM OP EERSTE PAGINA BIJ ORDERKAART TONEN/WIJZIGEN:
// Zoek in pagedPickerOrders.map naar deze regel:
// <span>{formatDutchDate(getOrderDate(order))}</span>
//
// VERVANG DIE REGEL DOOR:

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

// 12) VOEG BIJ const styles TOE:
inlineDateInput: {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "6px 8px",
  fontSize: 13,
  fontWeight: 800,
  background: "white",
  color: "#0f172a"
},
