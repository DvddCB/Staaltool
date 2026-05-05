const styles = {
  loginPage: {
    minHeight: "100svh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "Arial, sans-serif",
    padding: 16,
    boxSizing: "border-box"
  },
  loginCard: {
    background: "#fff",
    padding: 32,
    borderRadius: 16,
    width: "100%",
    maxWidth: 340,
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    boxSizing: "border-box"
  },
  loginLogo: {
    width: "70%",
    maxWidth: 180,
    marginBottom: 20
  },
  loginTitle: {
    marginBottom: 22,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    fontWeight: "700",
    letterSpacing: 5,
    fontSize: 32,
    color: "#ff7a00",
    textTransform: "uppercase"
  },
  loginInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16
  },
  loginButton: {
    width: "100%",
    padding: 13,
    background: "#ff7a00",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 16
  },
  loginError: {
    color: "red",
    marginTop: 12
  },
  menuPage: {
    minHeight: "100svh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    fontFamily: "Arial, sans-serif",
    padding: 16,
    boxSizing: "border-box"
  },
  menuCard: {
    width: "100%",
    maxWidth: 620,
    background: "white",
    borderRadius: 22,
    padding: 26,
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    boxSizing: "border-box"
  },
  menuLogo: {
    width: "55%",
    maxWidth: 190,
    marginBottom: 12
  },
  menuTitle: {
    margin: 0,
    color: "#ff7a00",
    fontSize: 34,
    letterSpacing: 2,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  menuSubtitle: {
    color: "#64748b",
    marginTop: 6,
    marginBottom: 20
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 14
  },
  moduleButton: {
    minHeight: 135,
    border: "none",
    borderRadius: 18,
    background: "#1234aa",
    color: "white",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  moduleTitle: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    letterSpacing: 1
  },
  moduleText: {
    marginTop: 8,
    color: "#dbeafe"
  },
  menuLogoutButton: {
    marginTop: 18,
    border: "none",
    borderRadius: 12,
    background: "#ff7a00",
    color: "white",
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  appPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f0ff 0%, #f8fafc 55%, #fff3e7 100%)",
    color: "#0f172a",
    fontFamily: "Arial, sans-serif",
    padding: 12,
    boxSizing: "border-box"
  },
  appShell: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "6px",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    background: "white",
    borderRadius: 18,
    padding: 14,
    gap: 10,
    boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
    marginBottom: 14
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0
  },
  headerLogo: {
    width: 58,
    height: "auto",
    flexShrink: 0
  },
  headerTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 26,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    letterSpacing: 1
  },
  headerSubtitle: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: 13
  },
  headerActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  menuButtonSmall: {
    border: "none",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  scanButton: {
    border: "none",
    borderRadius: 12,
    background: "#1234aa",
    color: "white",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer"
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
  scannerPanel: {
    background: "#0f172a",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  videoPreview: {
    width: "100%",
    maxHeight: 360,
    borderRadius: 12,
    background: "black"
  },
  stopButton: {
    marginTop: 10,
    width: "100%",
    border: "none",
    borderRadius: 12,
    background: "#ff7a00",
    color: "white",
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer"
  },
  scanResult: {
    background: "#e0f2fe",
    color: "#0f172a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    overflowWrap: "anywhere"
  },
  scanError: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))",
    gap: 6,
    marginBottom: 12
  },
  step: {
    background: "rgba(255,255,255,0.78)",
    color: "#475569",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700
  },
  activeStep: {
    background: "#1234aa",
    color: "white",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700
  },
  backButton: {
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    marginBottom: 12
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
    gap: 10
  },
  cardButton: {
    minHeight: 104,
    background: "white",
    border: "none",
    borderRadius: 15,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    textAlign: "center"
  },
  cardTitle: {
    fontSize: 19,
    color: "#1234aa",
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    lineHeight: 1.1,
    wordBreak: "break-word"
  },
  cardText: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 12
  },
  panel: {
    background: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
    marginBottom: 12
  },
  sectionTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 24
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
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  label: {
    color: "#64748b",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800
  },
  bigTitle: {
    color: "#1234aa",
    fontSize: 30,
    margin: "8px 0 18px",
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
    cursor: "pointer",
    fontSize: 16
  },
  secondaryButton: {
    marginTop: 10,
    width: "100%",
    border: "none",
    borderRadius: 14,
    background: "#1234aa",
    color: "white",
    padding: "14px 16px",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 16
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
    cursor: "not-allowed",
    fontSize: 16
  },
  colorButton: {
    minHeight: 104,
    borderRadius: 15,
    boxShadow: "0 6px 16px rgba(0,0,0,0.10)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    textAlign: "center"
  },
  colorCode: {
    fontSize: 12,
    opacity: 0.85,
    fontWeight: 800
  },
  colorName: {
    fontSize: 17,
    fontWeight: 900,
    marginTop: 4,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif",
    lineHeight: 1.1,
    wordBreak: "break-word"
  },
  summaryLine: {
    fontSize: 17
  },
  resultPanel: {
    background: "#1234aa",
    color: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  resultTitle: {
    marginTop: 0,
    fontSize: 24,
    color: "white"
  },
  resultLabel: {
    color: "#dbeafe",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
    marginTop: 16
  },
  articleCode: {
    background: "rgba(255,255,255,0.14)",
    padding: 14,
    borderRadius: 14,
    fontFamily: "monospace",
    fontSize: 18,
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
    borderRadius: 14,
    padding: 12,
    overflow: "hidden"
  },
  barcodeSvg: {
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    display: "block"
  },
  pickbonPanel: {
    background: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
    marginBottom: 12
  },
  pickbonHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 12
  },
  pickbonActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  emptyPickbon: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    borderRadius: 14,
    padding: 16
  },
  pickbonList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  pickbonLine: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    background: "#ffffff"
  },
  pickbonLineDone: {
    border: "1px solid #bbf7d0",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    background: "#f0fdf4"
  },
  pickbonLineMain: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 220,
    flex: 1
  },
  pickbonCode: {
    fontFamily: "monospace",
    color: "#1234aa",
    fontWeight: 800,
    overflowWrap: "anywhere"
  },
  pickbonMeta: {
    color: "#64748b",
    fontSize: 12
  },
  pickbonLineControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  qtyLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 800
  },
  qtyInput: {
    width: 76,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    boxSizing: "border-box"
  },
  smallDarkButton: {
    border: "none",
    borderRadius: 10,
    background: "#0f172a",
    color: "white",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  smallOrangeButton: {
    border: "none",
    borderRadius: 10,
    background: "#ff7a00",
    color: "white",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  smallDangerButton: {
    border: "none",
    borderRadius: 10,
    background: "#dc2626",
    color: "white",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  logic4Box: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16
  },
  logic4Actions: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 8
  },
  logic4Message: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    fontWeight: 700
  },
  pickerLayout: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: 14,
    alignItems: "start"
  },
  orderListPanel: {
    background: "white",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)"
  },
  pickerPanelHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12
  },
  orderCountBadge: {
    background: "#dbeafe",
    color: "#1234aa",
    borderRadius: 999,
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 13
  },
  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 12
  },
  orderCard: {
    width: "100%",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer"
  },
  orderCardActive: {
    width: "100%",
    background: "#eff6ff",
    border: "1px solid #1234aa",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(18,52,170,0.12)"
  },
  orderCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10
  },
  orderNumber: {
    margin: 0,
    color: "#1234aa",
    fontSize: 19,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  orderCustomer: {
    margin: "5px 0 0",
    color: "#334155",
    fontSize: 14,
    fontWeight: 800
  },
  orderStatus: {
    color: "white",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900
  },
  agendaToggle: {
    display: "flex",
    gap: 8
  },
  smallLightButton: {
    border: "none",
    borderRadius: 10,
    background: "#f1f5f9",
    color: "#334155",
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer"
  },
  calendarDayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10
  },
  calendarDayName: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 900
  },
  calendarDate: {
    margin: "3px 0 0",
    color: "#1234aa",
    fontSize: 28,
    fontWeight: 900,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  calendarCount: {
    background: "white",
    color: "#475569",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 12,
    fontWeight: 900
  },
  calendarOrder: {
    width: "100%",
    border: "none",
    borderRadius: 12,
    color: "white",
    padding: 10,
    textAlign: "left",
    cursor: "pointer",
    marginBottom: 8,
    boxShadow: "0 6px 14px rgba(15,23,42,0.14)"
  },
  calendarOrderTime: {
    display: "block",
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 2
  },
  selectedOrderPanel: {
    background: "#1234aa",
    color: "white",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 8px 24px rgba(15,23,42,0.18)"
  },
  selectedOrderLabel: {
    margin: 0,
    color: "#dbeafe",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 900
  },
  selectedOrderTitle: {
    margin: 0,
    color: "white",
    fontSize: 34,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  selectedOrderCustomer: {
    margin: "4px 0 0",
    color: "#dbeafe",
    fontSize: 16
  },
  selectedOrderMeta: {
    margin: "9px 0 0",
    color: "#dbeafe",
    fontSize: 14
  },
  pickerBackRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  orderSearchInput: {
    width: "100%",
    maxWidth: 320,
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    fontSize: 16
  },
  orderColumnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  orderColumnTitle: {
    margin: 0,
    fontSize: 22,
    color: "#0f172a",
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  todoBadge: {
    background: "#eab308",
    color: "#0f172a",
    borderRadius: 999,
    padding: "6px 11px",
    fontWeight: 900
  },
  doneBadge: {
    background: "#16a34a",
    color: "white",
    borderRadius: 999,
    padding: "6px 11px",
    fontWeight: 900
  },
  todoOrderCard: {
    width: "100%",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid #fde047",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer"
  },
  todoOrderCardActive: {
    width: "100%",
    background: "white",
    border: "2px solid #eab308",
    borderRadius: 16,
    padding: 13,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(234,179,8,0.20)"
  },
  doneOrderCard: {
    width: "100%",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid #86efac",
    borderRadius: 16,
    padding: 14,
    textAlign: "left",
    cursor: "pointer"
  },
  doneOrderCardActive: {
    width: "100%",
    background: "white",
    border: "2px solid #16a34a",
    borderRadius: 16,
    padding: 13,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(22,163,74,0.20)"
  },
  todoStatus: {
    background: "#eab308",
    color: "#0f172a",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900
  },
  doneStatus: {
    background: "#16a34a",
    color: "white",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 900
  },
  pickbonDoneText: {
    color: "#166534",
    background: "#dcfce7",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900,
    width: "fit-content"
  },
  pickbonTodoText: {
    color: "#854d0e",
    background: "#fef9c3",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900,
    width: "fit-content"
  },
  orderSplitGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    minHeight: 520
  },
  todoOrdersPanel: {
    background: "#fef9c3",
    border: "1px solid #fde047",
    borderRadius: 18,
    padding: 14,
    minHeight: 520
  },
  doneOrdersPanel: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    borderRadius: 18,
    padding: 14,
    minHeight: 520
  },
  agendaPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    height: "100%"
  },
  weekLabel: {
    margin: "5px 0 0",
    color: "#64748b",
    fontWeight: 800
  },
  calendarDay: {
    minHeight: 250,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 12
  },
  calendarDayActive: {
    minHeight: 250,
    background: "#eff6ff",
    border: "2px solid #1234aa",
    borderRadius: 16,
    padding: 11
  },
  weekNav: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  openOrderWarning: {
    background: "#fff7ed",
    border: "1px solid #fdba74",
    color: "#9a3412",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap"
  },
  warningButton: {
    border: "none",
    borderRadius: 10,
    background: "#ff7a00",
    color: "white",
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer"
  },
  allOrdersPanel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 14,
    minHeight: 520
  },
  paginationRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap"
  },
  paginationText: {
    color: "#475569",
    fontWeight: 900,
    fontSize: 13
  },
  pickerHomePage: {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    gap: 14,
    alignItems: "stretch"
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10
  },
  orderMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#64748b",
    fontSize: 13,
    marginTop: 12,
    flexWrap: "wrap"
  },
  selectedOrderContent: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 8
  },
  openPickbonButton: {
    border: "none",
    borderRadius: 14,
    background: "#ff7a00",
    color: "white",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  orderProgressBar: {
    width: "100%",
    height: 8,
    background: "rgba(15,23,42,0.10)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10
  },
  orderProgressFill: {
    height: "100%",
    background: "#16a34a",
    borderRadius: 999
  },
  orderProgressText: {
    whiteSpace: "nowrap",
    fontWeight: 800,
    color: "#334155"
  },
  scanUnderPickbonPanel: {
    background: "white",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
    marginBottom: 12
  },
  scanUnderPickbonTitle: {
    margin: "6px 0 16px",
    color: "#1234aa",
    fontSize: 24,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  smallDoneButton: {
    border: "none",
    borderRadius: 10,
    background: "#16a34a",
    color: "white",
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer"
  },
  smallScanButton: {
    border: "none",
    borderRadius: 10,
    background: "#1234aa",
    color: "white",
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer"
  },
  confirmOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.52)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16
  },
  confirmModal: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 20px 60px rgba(0,0,0,0.30)"
  },
  confirmTitle: {
    margin: 0,
    color: "#1234aa",
    fontSize: 26,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  confirmText: {
    color: "#334155",
    fontSize: 18,
    lineHeight: 1.4,
    margin: "14px 0 20px"
  },
  confirmActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },
  confirmNoButton: {
    border: "none",
    borderRadius: 12,
    background: "#e2e8f0",
    color: "#0f172a",
    padding: "14px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  confirmYesButton: {
    border: "none",
    borderRadius: 12,
    background: "#16a34a",
    color: "white",
    padding: "14px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  orderReadyBox: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    color: "#166534",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  orderProcessedBox: {
    background: "#ecfdf5",
    border: "1px solid #22c55e",
    color: "#166534",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  finishOrderButton: {
    border: "none",
    borderRadius: 12,
    background: "#16a34a",
    color: "white",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  editProcessedOrderButton: {
    border: "none",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  pickbonLockedText: {
    color: "#64748b",
    fontWeight: 800,
    fontSize: 13
  },
  requestedQtyBox: {
    minWidth: 92,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "8px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    textAlign: "center"
  },
  lineProgressOpen: {
    width: "fit-content",
    background: "#fef9c3",
    color: "#854d0e",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900
  },
  lineProgressDone: {
    width: "fit-content",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 999,
    padding: "5px 9px",
    fontSize: 13,
    fontWeight: 900
  },
  qtyMaxText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 800
  },
  pdfUploadPanel: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    alignItems: "center"
  },
  pdfUploadTitle: {
    margin: "4px 0 4px",
    color: "#1234aa",
    fontSize: 22,
    fontFamily: "'Oswald', Arial Black, Impact, sans-serif"
  },
  pdfUploadText: {
    margin: 0,
    color: "#475569",
    fontSize: 13,
    fontWeight: 700
  },
  pdfUploadButton: {
    border: "none",
    borderRadius: 12,
    background: "#1234aa",
    color: "white",
    padding: "13px 16px",
    fontWeight: 900,
    cursor: "pointer",
    textAlign: "center"
  },
  pdfUploadMessage: {
    gridColumn: "1 / -1",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 12,
    padding: 10,
    fontWeight: 800
  },
  orderCardActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 10
  },
  removeOrderButton: {
    border: "none",
    borderRadius: 10,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "8px 10px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 12
  },
  selectedOrderButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  removeSelectedOrderButton: {
    border: "none",
    borderRadius: 14,
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16
  },
  pdfDatePanel: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
    background: "white",
    border: "1px solid #bfdbfe",
    borderRadius: 12,
    padding: 10
  },
  pdfDateLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 900
  },
  pdfDateInput: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 800,
    color: "#0f172a",
    background: "white"
  },
  selectedDateEdit: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
    background: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12
  },
  pickbonDateEdit: {
    display: "grid",
    gridTemplateColumns: "auto minmax(150px, 220px)",
    gap: 10,
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    marginBottom: 12,
    maxWidth: 380
  },
};

export default styles;
