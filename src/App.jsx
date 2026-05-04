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

  if (loggedIn) {
    return (
      <div style={styles.dashboard}>
        <h1>Welkom 👋</h1>
        <p>Je bent ingelogd!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* LOGO */}
        <img
          src="/logo.png"
          alt="logo"
          style={styles.logo}
        />

        <h2 style={styles.title}>Login</h2>

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

        <button onClick={handleLogin} style={styles.button}>
          Inloggen
        </button>

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
    padding: "30px",
    borderRadius: "12px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  logo: {
    width: "120px",
    marginBottom: "15px",
  },
  title: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#2a5298",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  dashboard: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};
