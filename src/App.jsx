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
        <p>Je bent ingelogd in de staaltool</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <img src="/logo.png" alt="logo" style={styles.logo} />

        <h2 style={styles.title}>LOGIN</h2>

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
    padding: "40px",
    borderRadius: "16px",
    width: "320px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  logo: {
    width: "160px",
    marginBottom: "20px",
  },

  // 🔥 LOGIN STIJL (logo look)
  title: {
    marginBottom: "25px",
    fontFamily: "'Oswald', sans-serif",
    fontWeight: "700",
    letterSpacing: "6px",
    fontSize: "34px",
    color: "#ff7a00",
    textTransform: "uppercase",
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
    background: "#ff7a00",
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
  },

  dashboard: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};
