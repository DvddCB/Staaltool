export const profielData = {
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

export const kokerData = {
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

export const kleurData = [
  { code: "1", naam: "Blauw", kleur: "#2563eb", text: "white" },
  { code: "2", naam: "Bruin", kleur: "#8b5a2b", text: "white" },
  { code: "3", naam: "Geel", kleur: "#eab308", text: "#0f172a" },
  { code: "4", naam: "Gegalvaniseerd", kleur: "#9ca3af", text: "#0f172a" },
  { code: "5", naam: "Gemenied", kleur: "#7f1d1d", text: "white" },
  { code: "6", naam: "Grijs", kleur: "#6b7280", text: "white" },
  { code: "7", naam: "Groen", kleur: "#16a34a", text: "white" },
  { code: "8", naam: "Lichte corrosie", kleur: "#b45309", text: "white" },
  { code: "9", naam: "Onbehandeld", kleur: "#d1d5db", text: "#0f172a" },
  { code: "10", naam: "Oranje", kleur: "#ff7a00", text: "white" },
  { code: "11", naam: "Rood", kleur: "#dc2626", text: "white" },
  { code: "12", naam: "Roze", kleur: "#ec4899", text: "white" },
  { code: "13", naam: "Wit", kleur: "#ffffff", text: "#0f172a", border: "1px solid #cbd5e1" },
  { code: "14", naam: "Zwart", kleur: "#000000", text: "white" }
];

export const demoPickerOrders = [
  {
    id: "ORD-10482",
    klant: "Bouwbedrijf De Vries",
    tijd: "08:30",
    status: "Open",
    regels: 6,
    kleur: "#f97316",
    rows: [
      {
        articleCode: "24010110096300092",
        description: "HEA 100 - 3000 mm - 2. Bruin",
        type: "HEA",
        size: "100",
        length: 3000,
        colorCode: "2",
        colorName: "Bruin",
        quantity: 2
      },
      {
        articleCode: "240402100504000914",
        description: "IPE 100 - 4000 mm - 14. Zwart",
        type: "IPE",
        size: "100",
        length: 4000,
        colorCode: "14",
        colorName: "Zwart",
        quantity: 1
      }
    ]
  },
  {
    id: "ORD-10483",
    klant: "Jansen Constructie",
    tijd: "10:00",
    status: "Bezig",
    regels: 12,
    kleur: "#2563eb",
    rows: [
      {
        articleCode: "2402021001003500911",
        description: "HEB 100 - 3500 mm - 11. Rood",
        type: "HEB",
        size: "100",
        length: 3500,
        colorCode: "11",
        colorName: "Rood",
        quantity: 1
      },
      {
        articleCode: "24050210050450091",
        description: "UNP 100 - 4500 mm - 1. Blauw",
        type: "UNP",
        size: "100",
        length: 4500,
        colorCode: "1",
        colorName: "Blauw",
        quantity: 2
      }
    ]
  },
  {
    id: "ORD-10484",
    klant: "Circulair Project Noord",
    tijd: "12:45",
    status: "Open",
    regels: 4,
    kleur: "#16a34a",
    rows: [
      {
        articleCode: "240103140135300097",
        description: "HEA 140 - 3000 mm - 7. Groen",
        type: "HEA",
        size: "140",
        length: 3000,
        colorCode: "7",
        colorName: "Groen",
        quantity: 1
      }
    ]
  },
  {
    id: "ORD-10485",
    klant: "Van Dijk Montage",
    tijd: "15:15",
    status: "Gereed",
    regels: 9,
    kleur: "#64748b",
    rows: [
      {
        articleCode: "2404113001506000914",
        description: "IPE 300 - 6000 mm - 14. Zwart",
        type: "IPE",
        size: "300",
        length: 6000,
        colorCode: "14",
        colorName: "Zwart",
        quantity: 1
      }
    ]
  }
];

export const demoPickerDays = [
  { dag: "Ma", datum: "6", orders: 2 },
  { dag: "Di", datum: "7", orders: 4 },
  { dag: "Wo", datum: "8", orders: 1 },
  { dag: "Do", datum: "9", orders: 3 },
  { dag: "Vr", datum: "10", orders: 5 }
];
