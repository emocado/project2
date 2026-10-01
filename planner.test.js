import { test } from "node:test";
import assert from "node:assert/strict";
import { reachability, options, recommend } from "./planner.js";

const MIN = 60000;
const now = 1_000_000_000_000;
const stops = { A: { walkMin: 3, runMin: 1.5 } };
const fast = { id: "fast", stop: "A", bus: "1", rideMin: 5, legs: [{ text: "mrt", min: 20 }] };
const slow = { id: "slow", stop: "A", bus: "2", rideMin: 5, legs: [{ text: "mrt", min: 40 }] };
const at = (m) => ({ time: now + m * MIN, live: true });

test("reachability: walk / run / missed", () => {
  assert.equal(reachability(5, stops.A), "walk");
  assert.equal(reachability(2, stops.A), "run");
  assert.equal(reachability(1, stops.A), "missed");
});

test("options drop missed buses and sort by home arrival", () => {
  const arr = { A: { 1: [at(1), at(10)], 2: [at(4)] } };
  const opts = options([fast, slow], stops, arr, now);
  assert.deepEqual(opts.map((o) => [o.route.id, o.minsAway]), [["fast", 10], ["slow", 4]]);
  assert.equal(opts[0].homeAt, now + 35 * MIN);
});

test("run when the run-only bus saves at least the threshold", () => {
  const arr = { A: { 1: [at(2), at(20)] } };
  const r = recommend(options([fast], stops, arr, now), 5);
  assert.equal(r.action, "run");
  assert.equal(r.savesMin, 18);
});

test("walk when running saves less than the threshold", () => {
  const arr = { A: { 1: [at(2), at(5)] } };
  const r = recommend(options([fast], stops, arr, now), 5);
  assert.equal(r.action, "walk");
  assert.equal(r.pick.minsAway, 5);
  assert.equal(r.skipped.minsAway, 2);
});

test("walk straight away when the best option is walkable", () => {
  const arr = { A: { 1: [at(6)], 2: [at(2)] } };
  assert.equal(recommend(options([fast, slow], stops, arr, now), 5).action, "walk");
});

test("run with no fallback when nothing is walkable", () => {
  const arr = { A: { 1: [at(2)] } };
  const r = recommend(options([fast], stops, arr, now), 5);
  assert.equal(r.action, "run");
  assert.equal(r.fallback, null);
});

test("none when there are no buses", () => {
  assert.equal(recommend(options([fast], stops, {}, now), 5).action, "none");
});
