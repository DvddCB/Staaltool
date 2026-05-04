import { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (
      username === "Circulaire-Bouwmaterialen" &&
      password === "Houthandel18"
    ) {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Onjuiste gegevens");
    }
  };

  // Dashboard na login
  if (loggedIn) {
    return (
      <div style={styles.dashboard}>
        <h1>Welkom 👋</h1>
        <p>Je bent succesvol ingelogd</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* LOGO */}
        <img src="/logo.png" alt="logo" style={styles.logo} />

        {/* TITEL */}
       <h2 style={styles.title}>CB LOGIN</h2>

        {/* INPUTS */}
        <input
          type="text"
          placeholder="Gebruikersnaam"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Wachtwoord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* BUTTON */}
        <button onClick={handleLogin} style={styles.button}>
          Inloggen
        </button>

        {/* ERROR */}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
  },
  card: {
    background: "#fff",
    padding: "35px",
    borderRadius: "14px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
  },
  logo: {
    width: "110px",
    marginBottom: "15px",
  },
  title: {
    marginBottom: "20px",
    fontWeight: "900",
    letterSpacing: "3px",
    color: "#ff7a00", // ORANJE
    fontSize: "26px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#ff7a00", // ORANJE BUTTON
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  error: {
    color: "red",
    marginTop: "10px",
    fontSize: "14px",
  },
  dashboard: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};
