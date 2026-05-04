import { useState } from "react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (
      loginName === "Circulaire-Bouwmaterialen" &&
      loginPassword === "Houthandel18"
    ) {
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Onjuiste inloggegevens");
    }
  }

  // LOGIN SCHERM
  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <form style={styles.loginCard} onSubmit={handleLogin}>
          
          <img src="/logo.png" alt="CB Logo" style={styles.logo} />

          <h1 style={styles.title}>Staaltool</h1>
          <p style={styles.subtitle}>
            Log in om artikelcodes te genereren
          </p>

          <input
            style={styles.input}
            placeholder="Inlog"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Wachtwoord"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          {loginError && (
            <div style={styles.error}>{loginError}</div>
          )}

          <button style={styles.button}>
            Inloggen
          </button>
        </form>
      </div>
    );
  }

  // NA LOGIN (HIER KOMT JE TOOL)
  return (
    <div style={styles.app}>
      <h1>✅ Ingelogd</h1>
      <p>Hier komt straks de staaltool.</p>
    </div>
  );
}

const styles = {
  loginPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #dbeafe, #f8fafc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif"
  },

  loginCard: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 24,
    padding: 40,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 15
  },

  logo: {
    width: 160,
    height: "auto",
    marginBottom: 10
  },

  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a"
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    marginBottom: 10,
    textAlign: "center"
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 16
  },

  button: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    border: "none",
    background: "#1234aa",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer"
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    textAlign: "center"
  },

  app: {
    padding: 40,
    fontFamily: "Arial"
  }
};