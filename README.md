# DSTA → Home commute

Phone-friendly page that answers: **which bus should I take from DSTA (1 Depot Rd), and do I need to run for it?**

Live: https://emocado.github.io/project2/

## How it works

- Live bus arrivals for **Blk 1 (14249)** and **Opp Blk 1 (14241)**, Henderson Rd, from
  [arrivelah](https://github.com/cheeaun/arrivelah) (a CORS-enabled mirror of LTA DataMall Bus Arrival). Refreshes every 30 s.
- For each of the next 3 buses on each route, it estimates your time home = bus arrival + bus ride + MRT/walk legs.
- Each bus is tagged **walk** (arrives after your walk time), **run** (only catchable by running) or dropped (missed).
- Verdict: **RUN** only if the run-only bus gets you home ≥ 5 min sooner than the best walkable option; otherwise **Walk**.

Routes:
1. 145 from Opp Blk 1 → Redhill → EWL → Aljunied → walk
2. 145 from Blk 1 → HarbourFront → NEL → Outram Park → EWL → Aljunied → walk
3. 176 from Blk 1 → Telok Blangah → CCL → Paya Lebar → 134/155 from Exit C → Geylang Meth Pr Sch → walk
4. 195 from Blk 1 → Tiong Bahru → EWL → Aljunied → walk

## Tuning

All times are in [`config.js`](config.js): walk/run time to each stop, the run threshold, and every leg after
boarding. Only the first bus is live — MRT legs and the 134/155 wait are estimates (there is no public real-time train API).

## Run locally

```sh
npm start   # serves on http://localhost:3000
npm test    # planner unit tests
```
