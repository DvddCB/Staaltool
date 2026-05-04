import React, { useMemo, useState } from "react";

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
  { code: "3", naam: "Geel", kleur: "#eab308", text: "#111827" },
  { code: "4", naam: "Gegalvaniseerd", kleur: "#9ca3af", text: "#111827" },
  { code: "5", naam: "Gemenied", kleur: "#7f1d1d", text: "white" },
  { code: "6", naam: "Grijs", kleur: "#6b7280", text: "white" },
  { code: "7", naam: "Groen", kleur: "#16a34a", text: "white" },
  { code: "8", naam: "Lichte corrosie", kleur: "#b45309", text: "white" },
  { code: "9", naam: "Onbehandeld", kleur: "#d1d5db", text: "#111827" },
  { code: "10", naam: "Oranje", kleur: "#ff7a00", text: "white" },
  { code: "11", naam: "Rood", kleur: "#dc2626", text: "white" },
  { code: "12", naam: "Roze", kleur: "#ec4899", text: "white" },
  { code: "13", naam: "Wit", kleur: "#ffffff", text: "#111827", border: "1px solid #cbd5e1" },
  { code: "14", naam: "Zwart", kleur: "#000000", text: "white" }
];

function getArticleCode(type, size, lengthMm, colorCode) {
  const length = Number(lengthMm);
  if (!type || !size || !length || !colorCode) return "";

  const baseMaps = {
    HEA: {
      "100": "24010110096",
      "120": "240102120110",
      "140": "240103140135",
      "160": "240104160155",
      "180": "240105180175",
      "200": "240106200195",
      "220": "240107220215",
      "240": "240108240235",
      "260": "240109260255",
      "280": "240110280275",
      "300": "240111300295",
      "320": "240112320300",
      "340": "240113340300"
    },
    HEB: {
      "100": "240202100100",
      "120": "240203120120",
      "140": "240204140140",
      "160": "240205160160",
      "180": "240206180180",
      "200": "240207200200",
      "220": "240208220220",
      "240": "240209240240",
      "260": "240210260260",
      "280": "240211280280",
      "300": "240212300300",
      "320": "240213320300",
      "340": "240214340300"
    },
    IPE: {
      "100": "24040210050",
      "120": "24040312060",
      "140": "24040414070",
      "160": "24040516080",
      "180": "24040618090",
      "200": "240407200100",
      "220": "240408220110",
      "240": "240409240120",
      "270": "240410270135",
      "300": "240411300150",
      "330": "240412330165",
      "360": "240413360180",
      "400": "240414400200"
    },
    UNP: {
      "100": "24050210050",
      "120": "24050312060",
      "140": "24050414070",
      "160": "24050516080",
      "180": "24050618090",
      "200": "240507200100",
      "220": "240508220110",
      "240": "240509240120",
      "260": "240510260130",
      "280": "240511280140",
      "300": "240512300150",
      "330": "240513300165"
    }
  };

  if (!baseMaps[type]) return "";
  const base = baseMaps[type][String(size)];
  if (!base) return "";

  const code = base + String(length) + "9" + String(colorCode);
  const pos9 = code.length - String(colorCode).length - 1;
  const lengthEnd = code.slice(pos9 - 2, pos9);

  if (lengthEnd !== "00" && lengthEnd !== "50") return "";
  return code;
}

function BarcodeView({ value }) {
  const bars = useMemo(() => {
    const text = String(value || "");
    const list = [];

    for (let i = 0; i < text.length; i++) {
      const n = text.charCodeAt(i);
      list.push({ width: 2 + (n % 3), space: false });
      list.push({ width: 1 + (n % 2), space: true });
      list.push({ width: 1 + ((n + i) % 4), space: false });
      list.push({ width: 2, space: true });
    }

    return list;
  }, [value]);

  if (!value) return null;

  return (
    <div style={styles.barcodeOuter}>
      <div style={styles.barcodeBars}>
        {bars.map((bar, index) => (
          <div
            key={index}
            style={{
              width: bar.width,
              height: 88,
              background: bar.space ? "transparent" : "black"
            }}
          />
        ))}
      </div>
      <div style={styles.barcodeText}>{value}</div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
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

  const types = Object.keys(profielData);
  const sizes = type === "Koker" ? Object.keys(kokerData) : type ? profielData[type] || [] : [];
  const filteredSizes = sizes.filter((item) =>
    String(item).toLowerCase().includes(query.toLowerCase())
  );

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

  function resetTool() {
    setStep("types");
    setType("");
    setSize("");
    setBaseSize("");
    setLengthMm(3000);
    setColorCode("");
    setColorName("");
    setQuery("");
  }

  function logout() {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setError("");
    resetTool();
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

  function goBack() {
    if (step === "result") {
      setStep("colors");
      setColorCode("");
      setColorName("");
    } else if (step === "colors") {
      setStep("length");
    } else if (step === "length") {
      if (type === "Koker") {
        setStep("thickness");
      } else {
        setStep("sizes");
      }
      setSize("");
    } else if (step === "thickness") {
      setStep("sizes");
      setBaseSize("");
    } else if (step === "sizes") {
      resetTool();
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

  return (
    <div style={styles.appPage}>
      <div style={styles.appShell}>
        <header style={styles.header}>
          <div style={styles.brandRow}>
            <img src="/logo.png" alt="logo" style={styles.headerLogo} />
            <div>
              <h1 style={styles.headerTitle}>Artikelzoeker</h1>
              <p style={styles.headerSubtitle}>Artikelcodes voor circulaire bouwmaterialen</p>
            </div>
          </div>

          <button style={styles.logoutButton} onClick={logout}>
            Uitloggen
          </button>
        </header>

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
                  <span style={styles.cardTitle}>
                    {type} {item}
                  </span>
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
                <button
                  key={thickness}
                  style={styles.cardButton}
                  onClick={() => chooseThickness(thickness)}
                >
                  <span style={styles.cardTitle}>
                    {baseSize}x{thickness}
                  </span>
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
              <h2 style={styles.bigTitle}>
                {type} {size}
              </h2>

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
                  Lengte moet tussen 1000 en 20000 mm liggen en in stappen van 50 mm worden ingevoerd.
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
              <h2 style={styles.sectionTitle}>
                {type} {size} - {lengthMm} mm
              </h2>
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
              <h2 style={styles.bigTitle}>
                {type} {size}
              </h2>

              <p style={styles.summaryLine}>Lengte: {lengthMm} mm</p>
              <p style={styles.summaryLine}>
                Kleur: {colorCode}. {colorName}
              </p>

              <button style={styles.primaryButton} onClick={resetTool}>
                Nieuwe code maken
              </button>
            </div>

            <div style={styles.resultPanel}>
              <h2 style={styles.resultTitle}>
                {articleCode ? "Artikel gevonden" : "Geen artikelcode"}
              </h2>

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
      </div>
    </div>
  );
}

const styles = {
  loginPage: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "Arial, sans-serif"
  },
  loginCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    width: "330px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
  },
  loginLogo: {
    width: "180px",
    marginBottom: "22px"
  },
  loginTitle: {
    marginBottom: "24px",
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    fontWeight: "700",
    letterSpacing: "6px",
    fontSize: "34px",
    color: "#ff7a00",
    textTransform: "uppercase"
  },
  loginInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  loginButton: {
    width: "100%",
    padding: "12px",
    background: "#ff7a00",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px"
  },
  loginError: {
    color: "red",
    marginTop: "12px"
  },

  appPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0ff 0%, #f8fafc 55%, #fff3e7 100%)",
    color: "#0f172a",
    fontFamily: "Arial, sans-serif",
    padding: 20
  },
  appShell: {
    maxWidth: 1180,
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    marginBottom: 18
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 14
  },
  headerLogo: {
    width: 72,
    height: "auto"
  },
  headerTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 30,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    letterSpacing: 1
  },
  headerSubtitle: {
    margin: "4px 0 0",
    color: "#64748b"
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

  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 8,
    marginBottom: 14
  },
  step: {
    background: "rgba(255,255,255,0.78)",
    color: "#475569",
    padding: 11,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 14,
    fontWeight: 700
  },
  activeStep: {
    background: "#1234aa",
    color: "white",
    padding: 11,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 14,
    fontWeight: 700
  },
  backButton: {
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    marginBottom: 16
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12
  },
  cardButton: {
    minHeight: 120,
    background: "white",
    border: "none",
    borderRadius: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    textAlign: "center"
  },
  cardTitle: {
    fontSize: 20,
    color: "#1234aa",
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    lineHeight: 1.1,
    wordBreak: "break-word"
  },
  cardText: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 13
  },

  panel: {
    background: "white",
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
    marginBottom: 16
  },
  sectionTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 28
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 18
  },
  label: {
    color: "#64748b",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800
  },
  bigTitle: {
    color: "#1234aa",
    fontSize: 40,
    margin: "8px 0 20px",
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
    cursor: "pointer"
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
    cursor: "not-allowed"
  },

  colorButton: {
    minHeight: 120,
    borderRadius: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    textAlign: "center"
  },
  colorCode: {
    fontSize: 13,
    opacity: 0.85,
    fontWeight: 800
  },
  colorName: {
    fontSize: 18,
    fontWeight: 900,
    marginTop: 4,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    lineHeight: 1.1,
    wordBreak: "break-word"
  },

  summaryLine: {
    fontSize: 18
  },
  resultPanel: {
    background: "#1234aa",
    color: "white",
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  resultTitle: {
    marginTop: 0,
    fontSize: 28,
    color: "white"
  },
  resultLabel: {
    color: "#dbeafe",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
    marginTop: 18
  },
  articleCode: {
    background: "rgba(255,255,255,0.14)",
    padding: 16,
    borderRadius: 16,
    fontFamily: "monospace",
    fontSize: 24,
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
    borderRadius: 16,
    padding: 14
  },
  barcodeBars: {
    height: 88,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 1,
    overflow: "hidden"
  },
  barcodeText: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: 18,
    letterSpacing: 1
  }
};
