import React, { useState } from "react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (
      username === "Circulaire-Bouwmaterialen" &&
      password === "Houthandel18"
    ) {
      setLoggedIn(true);
    } else {
      alert("Onjuiste login");
    }
  };

  // ================= LOGIN =================
  if (!loggedIn) {
    return (
      <div style={styles.page}>
        <div style={styles.loginBox}>
          <img src="/logo.png" style={styles.logo} />

          <h2 style={styles.loginTitle}>LOGIN</h2>

          <input
            placeholder="Gebruikersnaam"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="Wachtwoord"
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleLogin}>
            Inloggen
          </button>
        </div>
      </div>
    );
  }

  // ================= TOOL =================
  return (
    <div style={styles.page}>
      <div style={styles.toolBox}>
        <img src="/logo.png" style={styles.logoTool} />

        <h1 style={styles.headerTitle}>Artikelzoeker</h1>

        {/* ===== STAP 1 ===== */}
        {step === 1 && (
          <>
            <h2 style={styles.stepTitle}>Stap 1 - Kies profiel</h2>

            <div style={styles.grid}>
              <button style={styles.cardButton} onClick={() => setStep(2)}>
                <div style={styles.cardTitle}>HEA</div>
              </button>

              <button style={styles.cardButton} onClick={() => setStep(2)}>
                <div style={styles.cardTitle}>HEB</div>
              </button>

              <button style={styles.cardButton} onClick={() => setStep(2)}>
                <div style={styles.cardTitle}>IPE</div>
              </button>

              <button style={styles.cardButton} onClick={() => setStep(2)}>
                <div style={styles.cardTitle}>Koker</div>
              </button>
            </div>
          </>
        )}

        {/* ===== STAP 5 ===== */}
        {step === 2 && (
          <>
            <h2 style={styles.stepTitle}>Stap 5 - Kies kleur</h2>

            <div style={styles.grid}>
              <button style={{ ...styles.colorButton, background: "#444" }}>
                <div style={styles.colorName}>Zwart</div>
              </button>

              <button style={{ ...styles.colorButton, background: "#888" }}>
                <div style={styles.colorName}>Grijs</div>
              </button>

              <button style={{ ...styles.colorButton, background: "#d4af37" }}>
                <div style={styles.colorName}>Goud</div>
              </button>

              <button style={{ ...styles.colorButton, background: "#fff" }}>
                <div style={{ ...styles.colorName, color: "#000" }}>
                  Wit
                </div>
              </button>
            </div>

            <button style={styles.backButton} onClick={() => setStep(1)}>
              ← Terug
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ================= STYLES =================

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1234aa, #1e3a8a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  loginBox: {
    width: 320,
    background: "white",
    padding: 30,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },

  logo: {
    width: 120,
    marginBottom: 10
  },

  logoTool: {
    width: 140,
    marginBottom: 10
  },

  loginTitle: {
    fontFamily: "'Oswald', sans-serif",
    color: "#ff6600",
    marginBottom: 15
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ccc"
  },

  button: {
    width: "100%",
    padding: 10,
    background: "#1234aa",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer"
  },

  toolBox: {
    width: 600,
    background: "white",
    padding: 30,
    borderRadius: 20,
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
  },

  headerTitle: {
    fontFamily: "'Oswald', sans-serif",
    color: "#ff6600",
    marginBottom: 20
  },

  stepTitle: {
    marginBottom: 20
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  },

  // ===== GROTER & NETTER =====
  cardButton: {
    minHeight: 140,
    background: "white",
    border: "none",
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },

  cardTitle: {
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "'Oswald', sans-serif",
    color: "#1234aa"
  },

  // ===== STAP 5 NETTER =====
  colorButton: {
    minHeight: 140,
    border: "none",
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },

  colorName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    fontFamily: "'Oswald', sans-serif"
  },

  backButton: {
    marginTop: 20,
    padding: 10,
    border: "none",
    borderRadius: 8,
    background: "#1234aa",
    color: "white",
    cursor: "pointer"
  }
};
