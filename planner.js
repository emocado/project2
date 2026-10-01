// Pure trip-planning logic. No DOM, no fetch — so it can be unit tested.

const MIN = 60000;

// How you could reach a bus that arrives `minsAway` minutes from now.
export function reachability(minsAway, stop) {
  if (minsAway >= stop.walkMin) return "walk";
  if (minsAway >= stop.runMin) return "run";
  return "missed";
}

export function legsTotal(route) {
  return route.legs.reduce((sum, leg) => sum + leg.min, 0);
}

// arrivals: { [stopCode]: { [busNo]: [{ time: ms, live: bool }] } }
// Returns every catchable bus across all routes, earliest home arrival first.
export function options(routes, stops, arrivals, now) {
  const out = [];
  for (const route of routes) {
    const stop = stops[route.stop];
    for (const bus of arrivals[route.stop]?.[route.bus] ?? []) {
      const minsAway = (bus.time - now) / MIN;
      const reach = reachability(minsAway, stop);
      if (reach === "missed") continue;
      out.push({
        route,
        minsAway,
        reach,
        live: bus.live,
        busAt: bus.time,
        homeAt: bus.time + (route.rideMin + legsTotal(route)) * MIN,
      });
    }
  }
  return out.sort((a, b) => a.homeAt - b.homeAt);
}

// Decide what to do right now.
// Run only if the best option needs running AND missing it costs >= runThresholdMin.
export function recommend(opts, runThresholdMin) {
  const best = opts[0];
  if (!best) return { action: "none" };
  if (best.reach === "walk") return { action: "walk", pick: best };

  const bestWalk = opts.find((o) => o.reach === "walk");
  if (!bestWalk) return { action: "run", pick: best, savesMin: null, fallback: null };

  const savesMin = (bestWalk.homeAt - best.homeAt) / MIN;
  if (savesMin >= runThresholdMin) return { action: "run", pick: best, savesMin, fallback: bestWalk };
  return { action: "walk", pick: bestWalk, skipped: best, savesMin };
}
