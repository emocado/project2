import { STOPS, ROUTES, RUN_THRESHOLD_MIN } from "./config.js";
import { options, recommend, legsTotal } from "./planner.js";

// Community mirror of LTA DataMall bus arrivals; no API key, CORS-enabled.
const API = "https://arrivelah2.busrouter.sg/?id=";
const FETCH_EVERY_MS = 30000;
const RENDER_EVERY_MS = 5000;

let arrivals = {};
let fetchedAt = null;
let error = null;
const openRoutes = new Set(); // route ids whose breakdown is expanded; survives re-renders

async function fetchStop(code) {
  const res = await fetch(API + code);
  if (!res.ok) throw new Error(`Stop ${code}: HTTP ${res.status}`);
  const data = await res.json();
  const byBus = {};
  for (const s of data.services) {
    byBus[s.no] = [s.next, s.next2, s.next3]
      .filter((b) => b?.time)
      .map((b) => ({ time: Date.parse(b.time), live: b.monitored === 1 }));
  }
  return byBus;
}

async function refresh() {
  try {
    const codes = Object.keys(STOPS);
    const results = await Promise.all(codes.map(fetchStop));
    arrivals = Object.fromEntries(codes.map((c, i) => [c, results[i]]));
    fetchedAt = Date.now();
    error = null;
  } catch (e) {
    error = e.message;
  }
  render();
}

const clock = (ms) =>
  new Date(ms).toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", hour12: false });
const mins = (m) => (m < 1 ? "Arr" : `${Math.floor(m)} min`);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function verdictHtml(rec) {
  if (rec.action === "none") {
    return `<div class="verdict none"><div class="big">No buses</div><p>No catchable buses right now.</p></div>`;
  }
  const p = rec.pick;
  const where = `${p.route.bus} at ${STOPS[p.route.stop].name}`;
  if (rec.action === "run") {
    const why = rec.fallback
      ? `Saves ${Math.round(rec.savesMin)} min vs next walkable option (${esc(rec.fallback.route.name)}, home ${clock(rec.fallback.homeAt)}).`
      : "Nothing else is catchable at walking pace.";
    return `<div class="verdict run"><div class="big">RUN 🏃</div>
      <p><b>${esc(where)}</b> in ${mins(p.minsAway)} · home ~${clock(p.homeAt)}</p><p class="sub">${why}</p></div>`;
  }
  const slack = Math.max(0, Math.floor(p.minsAway - STOPS[p.route.stop].walkMin));
  const skip = rec.skipped
    ? `<p class="sub">Not worth running for the ${esc(rec.skipped.route.bus)} in ${mins(rec.skipped.minsAway)}: it saves only ${Math.round(rec.savesMin)} min.</p>`
    : "";
  return `<div class="verdict walk"><div class="big">Walk 🚶</div>
    <p><b>${esc(where)}</b> in ${mins(p.minsAway)} · home ~${clock(p.homeAt)}</p>
    <p class="sub">${slack ? `Leave within ${slack} min.` : "Leave now."}</p>${skip}</div>`;
}

function routeHtml(route, opts, rec) {
  const mine = opts.filter((o) => o.route === route);
  const best = mine[0];
  const isPick = rec.pick?.route === route;
  const chips = mine.length
    ? mine
        .map((o) => `<span class="chip ${o.reach}">${mins(o.minsAway)}${o.live ? "" : "*"}${o.reach === "run" ? " 🏃" : ""}</span>`)
        .join("")
    : `<span class="chip missed">none catchable</span>`;
  const legs = [
    { text: `Bus ${route.bus} from ${STOPS[route.stop].name} (${route.stop})`, min: route.rideMin },
    ...route.legs,
  ]
    .map((l) => `<li><span>${esc(l.text)}</span><span>${l.min}</span></li>`)
    .join("");
  return `<section class="route ${isPick ? "pick" : ""}">
    <div class="head"><h2>${esc(route.name)}</h2><div class="eta">${best ? clock(best.homeAt) : "—"}</div></div>
    <div class="chips">${chips}</div>
    <details data-route="${route.id}"${openRoutes.has(route.id) ? " open" : ""}><summary>~${route.rideMin + legsTotal(route)} min after boarding</summary><ul>${legs}</ul></details>
  </section>`;
}

function render() {
  const now = Date.now();
  const opts = options(ROUTES, STOPS, arrivals, now);
  const rec = recommend(opts, RUN_THRESHOLD_MIN);
  const ranked = [...ROUTES].sort((a, b) => {
    const ea = opts.find((o) => o.route === a)?.homeAt ?? Infinity;
    const eb = opts.find((o) => o.route === b)?.homeAt ?? Infinity;
    return ea - eb;
  });
  document.getElementById("app").innerHTML =
    (fetchedAt ? verdictHtml(rec) : `<div class="verdict none"><div class="big">Loading…</div></div>`) +
    ranked.map((r) => routeHtml(r, opts, rec)).join("");
  document.getElementById("status").textContent = error
    ? `⚠ ${error}`
    : fetchedAt
      ? `Updated ${clock(fetchedAt)} · * = scheduled, not GPS-tracked`
      : "";
}

document.getElementById("refresh").addEventListener("click", refresh);
// "toggle" doesn't bubble, so listen in the capture phase.
document.getElementById("app").addEventListener(
  "toggle",
  (e) => (e.target.open ? openRoutes.add(e.target.dataset.route) : openRoutes.delete(e.target.dataset.route)),
  true,
);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && refresh());
refresh();
setInterval(refresh, FETCH_EVERY_MS);
setInterval(render, RENDER_EVERY_MS);
