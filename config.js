// Everything you might want to tune lives here. Times are in minutes.
// Bus arrivals are live; everything after you board the first bus is an estimate.

// Walk/run time from the DSTA (1 Depot Rd) building exit to the bus stop.
export const STOPS = {
  "14249": { name: "Blk 1", walkMin: 3, runMin: 1.5 },
  "14241": { name: "Opp Blk 1", walkMin: 3, runMin: 1.5 },
};

// Only run if it gets you home at least this many minutes sooner than the best walking option.
export const RUN_THRESHOLD_MIN = 5;

export const ROUTES = [
  {
    id: "redhill",
    name: "145 → Redhill → Aljunied",
    stop: "14241",
    bus: "145",
    rideMin: 9, // 6 stops to Opp Redhill Stn
    legs: [
      { text: "Walk to EWL platform", min: 2 },
      { text: "Wait for train (avg)", min: 3 },
      { text: "EWL Redhill → Aljunied (9 stops)", min: 19 },
      { text: "Walk home from Aljunied", min: 8 },
    ],
  },
  {
    id: "harbourfront",
    name: "145 → HarbourFront → Outram → Aljunied",
    stop: "14249",
    bus: "145",
    rideMin: 8, // 5 stops to HarbourFront Stn Exit A
    legs: [
      { text: "Walk to NEL platform", min: 4 },
      { text: "Wait for train (avg)", min: 3 },
      { text: "NEL HarbourFront → Outram Park (2 stops)", min: 4 },
      { text: "Transfer to EWL + wait", min: 6 },
      { text: "EWL Outram Park → Aljunied (7 stops)", min: 15 },
      { text: "Walk home from Aljunied", min: 8 },
    ],
  },
  {
    id: "telokblangah",
    name: "176 → Telok Blangah → Paya Lebar → 134/155",
    stop: "14249",
    bus: "176",
    rideMin: 5, // 3 stops to Telok Blangah Stn
    legs: [
      { text: "Walk to CCL platform", min: 2 },
      { text: "Wait for train (avg)", min: 4 },
      { text: "CCL Telok Blangah → Paya Lebar (via Keppel/Marina Bay, 12 stops)", min: 26 },
      { text: "Walk to Exit C bus stop", min: 3 },
      { text: "Wait for 134 or 155 (avg)", min: 4 },
      { text: "Bus to Geylang Meth Pr Sch (3 stops)", min: 5 },
      { text: "Walk home", min: 2 },
    ],
  },
  {
    id: "tiongbahru",
    name: "195 → Tiong Bahru → Aljunied",
    stop: "14249",
    bus: "195",
    rideMin: 9, // 6 stops to Tiong Bahru Stn/Plaza
    legs: [
      { text: "Walk to EWL platform", min: 2 },
      { text: "Wait for train (avg)", min: 3 },
      { text: "EWL Tiong Bahru → Aljunied (8 stops)", min: 17 },
      { text: "Walk home from Aljunied", min: 8 },
    ],
  },
];
