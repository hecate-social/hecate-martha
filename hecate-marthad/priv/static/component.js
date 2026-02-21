import * as e from "svelte/internal/client";
import { tick as Xt, onMount as ws, onDestroy as ks } from "svelte";
const $s = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add($s);
const Zt = 1, es = 2, ht = 4, lt = 1, ct = 2, mt = 4;
function Be(s, r) {
  return (s & r) !== 0;
}
function wt(s, r) {
  switch (r) {
    case "dna":
      return s.dna_status ?? 0;
    case "anp":
      return s.anp_status ?? 0;
    case "tni":
      return s.tni_status ?? 0;
    case "dno":
      return s.dno_status ?? 0;
  }
}
function Cs(s, r) {
  const t = typeof s == "number" ? s : wt(s, r);
  return Be(t, mt) ? "Completed" : Be(t, ct) ? "Paused" : Be(t, lt) ? "Active" : "Pending";
}
function Wt(s) {
  return Be(s, mt) ? "text-health-ok" : Be(s, lt) ? "text-hecate-400" : Be(s, ct) ? "text-health-warn" : "text-surface-500";
}
let It;
function Ss(s) {
  It = s;
}
function Ve() {
  if (!It)
    throw new Error("Martha API not initialized. Call setApi() first.");
  return It;
}
const dt = () => {
};
function Ds(s) {
  for (var r = 0; r < s.length; r++)
    s[r]();
}
function As(s, r) {
  return s != s ? r == r : s !== r || s !== null && typeof s == "object" || typeof s == "function";
}
let Et = !1;
function Es(s) {
  var r = Et;
  try {
    return Et = !0, s();
  } finally {
    Et = r;
  }
}
function ts(s, r, t) {
  if (s == null)
    return r(void 0), t && t(void 0), dt;
  const a = Es(
    () => s.subscribe(
      r,
      // @ts-expect-error
      t
    )
  );
  return a.unsubscribe ? () => a.unsubscribe() : a;
}
const ot = [];
function Ps(s, r) {
  return {
    subscribe: Fe(s, r).subscribe
  };
}
function Fe(s, r = dt) {
  let t = null;
  const a = /* @__PURE__ */ new Set();
  function l(A) {
    if (As(s, A) && (s = A, t)) {
      const E = !ot.length;
      for (const H of a)
        H[1](), ot.push(H, s);
      if (E) {
        for (let H = 0; H < ot.length; H += 2)
          ot[H][0](ot[H + 1]);
        ot.length = 0;
      }
    }
  }
  function J(A) {
    l(A(
      /** @type {T} */
      s
    ));
  }
  function P(A, E = dt) {
    const H = [A, E];
    return a.add(H), a.size === 1 && (t = r(l, J) || dt), A(
      /** @type {T} */
      s
    ), () => {
      a.delete(H), a.size === 0 && t && (t(), t = null);
    };
  }
  return { set: l, update: J, subscribe: P };
}
function et(s, r, t) {
  const a = !Array.isArray(s), l = a ? [s] : s;
  if (!l.every(Boolean))
    throw new Error("derived() expects stores as input, got a falsy value");
  const J = r.length < 2;
  return Ps(t, (P, A) => {
    let E = !1;
    const H = [];
    let F = 0, w = dt;
    const ee = () => {
      if (F)
        return;
      w();
      const T = r(a ? H[0] : H, P, A);
      J ? P(T) : w = typeof T == "function" ? T : dt;
    }, j = l.map(
      (T, x) => ts(
        T,
        (I) => {
          H[x] = I, F &= ~(1 << x), E && ee();
        },
        () => {
          F |= 1 << x;
        }
      )
    );
    return E = !0, ee(), function() {
      Ds(j), w(), E = !1;
    };
  });
}
function Ye(s) {
  let r;
  return ts(s, (t) => r = t)(), r;
}
const bt = Fe([]), Ge = Fe(null), it = Fe([]), _t = Fe(null), je = Fe(!1), Ke = Fe(null), tt = et(
  [it, _t],
  ([s, r]) => s.find((t) => t.division_id === r) ?? null
), $t = et(
  Ge,
  (s) => s ? Be(s.status, ht) ? "archived" : Be(s.status, es) ? "discovery_paused" : Be(s.status, Zt) ? "discovering" : s.phase || "initiated" : "none"
);
function xt(s) {
  Ge.set(s);
}
function Mt() {
  Ge.set(null);
}
async function yt() {
  try {
    const r = await Ve().get("/api/ventures");
    bt.set(r.ventures);
  } catch {
    bt.set([]);
  }
}
async function Je() {
  try {
    const r = await Ve().get("/api/ventures/active");
    Ge.set(r.venture);
  } catch {
    Ge.set(null);
  }
}
async function ut(s) {
  try {
    const t = await Ve().get(
      `/api/ventures/${s}/divisions`
    );
    it.set(t.divisions);
  } catch {
    it.set([]);
  }
}
async function ss(s, r) {
  try {
    return je.set(!0), await Ve().post("/api/ventures", { name: s, vision: r }), await yt(), await Je(), !0;
  } catch (t) {
    const a = t;
    return Ke.set(a.message || "Failed to initiate venture"), !1;
  } finally {
    je.set(!1);
  }
}
async function rs(s, r, t, a, l) {
  try {
    return je.set(!0), await Ve().post(`/api/ventures/${s}/repo`, {
      repo_url: r,
      vision: t || void 0,
      name: a || void 0,
      brief: l || void 0
    }), await Je(), !0;
  } catch (J) {
    const P = J;
    return Ke.set(P.message || "Failed to scaffold venture repo"), !1;
  } finally {
    je.set(!1);
  }
}
async function Tt(s) {
  try {
    return je.set(!0), await Ve().post(`/api/ventures/${s}/discovery/start`, {}), await Je(), !0;
  } catch (r) {
    const t = r;
    return Ke.set(t.message || "Failed to start discovery"), !1;
  } finally {
    je.set(!1);
  }
}
async function as(s, r, t) {
  try {
    return je.set(!0), await Ve().post(`/api/ventures/${s}/discovery/identify`, {
      context_name: r,
      description: t || null,
      identified_by: "hecate-web"
    }), await ut(s), !0;
  } catch (a) {
    const l = a;
    return Ke.set(l.message || "Failed to identify division"), !1;
  } finally {
    je.set(!1);
  }
}
async function is(s, r) {
  try {
    return je.set(!0), await Ve().post(`/api/ventures/${s}/discovery/pause`, {
      reason: r || null
    }), await Je(), !0;
  } catch (t) {
    const a = t;
    return Ke.set(a.message || "Failed to pause discovery"), !1;
  } finally {
    je.set(!1);
  }
}
async function ns(s) {
  try {
    return je.set(!0), await Ve().post(`/api/ventures/${s}/discovery/resume`, {}), await Je(), !0;
  } catch (r) {
    const t = r;
    return Ke.set(t.message || "Failed to resume discovery"), !1;
  } finally {
    je.set(!1);
  }
}
async function os(s) {
  try {
    return je.set(!0), await Ve().post(`/api/ventures/${s}/discovery/complete`, {}), await Je(), !0;
  } catch (r) {
    const t = r;
    return Ke.set(t.message || "Failed to complete discovery"), !1;
  } finally {
    je.set(!1);
  }
}
const Is = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  activeVenture: Ge,
  clearActiveVenture: Mt,
  completeDiscovery: os,
  divisions: it,
  fetchActiveVenture: Je,
  fetchDivisions: ut,
  fetchVentures: yt,
  identifyDivision: as,
  initiateVenture: ss,
  isLoading: je,
  pauseDiscovery: is,
  resumeDiscovery: ns,
  scaffoldVentureRepo: rs,
  selectVenture: xt,
  selectedDivision: tt,
  selectedDivisionId: _t,
  startDiscovery: Tt,
  ventureError: Ke,
  ventureStep: $t,
  ventures: bt
}, Symbol.toStringTag, { value: "Module" })), vt = Fe("dna"), Ct = Fe(null), Ze = Fe(!1);
async function Ms(s, r) {
  try {
    Ze.set(!0), await Ve().post(`/api/divisions/${s}/phase/start`, { phase: r });
    const a = Ye(Ge);
    return a && await ut(a.venture_id), !0;
  } catch (t) {
    const a = t;
    return Ct.set(a.message || `Failed to start ${r} phase`), !1;
  } finally {
    Ze.set(!1);
  }
}
async function Ls(s, r, t) {
  try {
    Ze.set(!0), await Ve().post(`/api/divisions/${s}/phase/pause`, {
      phase: r,
      reason: t || null
    });
    const l = Ye(Ge);
    return l && await ut(l.venture_id), !0;
  } catch (a) {
    const l = a;
    return Ct.set(l.message || `Failed to pause ${r} phase`), !1;
  } finally {
    Ze.set(!1);
  }
}
async function Vs(s, r) {
  try {
    Ze.set(!0), await Ve().post(`/api/divisions/${s}/phase/resume`, { phase: r });
    const a = Ye(Ge);
    return a && await ut(a.venture_id), !0;
  } catch (t) {
    const a = t;
    return Ct.set(a.message || `Failed to resume ${r} phase`), !1;
  } finally {
    Ze.set(!1);
  }
}
async function Fs(s, r) {
  try {
    Ze.set(!0), await Ve().post(`/api/divisions/${s}/phase/complete`, { phase: r });
    const a = Ye(Ge);
    return a && await ut(a.venture_id), !0;
  } catch (t) {
    const a = t;
    return Ct.set(a.message || `Failed to complete ${r} phase`), !1;
  } finally {
    Ze.set(!1);
  }
}
const Nt = Fe(!1), ls = Fe(""), Rt = Fe(null), cs = Fe(null), Ts = Fe([]), ds = et(
  [cs, Ts],
  ([s, r]) => s ?? r[0] ?? null
), vs = "hecate-martha-phase-models";
function Ns() {
  try {
    const s = localStorage.getItem(vs);
    if (s) return JSON.parse(s);
  } catch {
  }
  return { dna: null, anp: null, tni: null, dno: null };
}
function Rs(s) {
  try {
    localStorage.setItem(vs, JSON.stringify(s));
  } catch {
  }
}
const us = Fe(Ns());
function Os(s) {
  return s === "tni" ? "code" : "general";
}
function Xe(s, r) {
  Rt.set(r ?? null), ls.set(s), Nt.set(!0);
}
function Bs() {
  Nt.set(!1), Rt.set(null);
}
function ps(s) {
  cs.set(s);
}
function zt(s, r) {
  us.update((t) => {
    const a = { ...t, [s]: r };
    return Rs(a), a;
  });
}
function js(s) {
  return s.split(`
`).map((r) => r.replace(/^[\s\-*\u2022\d.]+/, "").trim()).filter((r) => r.length > 0 && r.length < 80 && !r.includes(":")).map((r) => r.replace(/["`]/g, ""));
}
const at = [
  {
    code: "dna",
    name: "Discovery & Analysis",
    shortName: "DnA",
    description: "Understand the domain through event storming",
    role: "dna",
    color: "phase-dna"
  },
  {
    code: "anp",
    name: "Architecture & Planning",
    shortName: "AnP",
    description: "Plan desks, map dependencies, sequence work",
    role: "anp",
    color: "phase-anp"
  },
  {
    code: "tni",
    name: "Testing & Implementation",
    shortName: "TnI",
    description: "Generate code, run tests, validate criteria",
    role: "tni",
    color: "phase-tni"
  },
  {
    code: "dno",
    name: "Deployment & Operations",
    shortName: "DnO",
    description: "Deploy, monitor health, handle incidents",
    role: "dno",
    color: "phase-dno"
  }
], nt = Fe("ready"), pt = Fe([]), St = Fe([]), Ot = Fe([]), kt = Fe(600), Bt = Fe([]), Lt = Fe(!1), Ue = Fe(null), Vt = Fe(!1);
let rt = null;
const Hs = et(
  pt,
  (s) => s.filter((r) => !r.cluster_id)
), Ws = et(
  pt,
  (s) => {
    const r = /* @__PURE__ */ new Map();
    for (const t of s)
      if (t.stack_id) {
        const a = r.get(t.stack_id) || [];
        a.push(t), r.set(t.stack_id, a);
      }
    return r;
  }
), zs = et(
  pt,
  (s) => s.length
);
async function qe(s) {
  try {
    const a = (await Ve().get(
      `/api/ventures/${s}/storm/state`
    )).storm;
    nt.set(a.phase), pt.set(a.stickies), St.set(a.clusters), Ot.set(a.arrows);
  } catch {
    nt.set("ready");
  }
}
async function Gt(s, r = 0, t = 50) {
  try {
    const l = await Ve().get(
      `/api/ventures/${s}/events?offset=${r}&limit=${t}`
    );
    return Bt.set(l.events), { events: l.events, count: l.count };
  } catch {
    return { events: [], count: 0 };
  }
}
async function Gs(s) {
  try {
    return Vt.set(!0), await Ve().post(`/api/ventures/${s}/storm/start`, {}), nt.set("storm"), kt.set(600), rt = setInterval(() => {
      kt.update((t) => t <= 1 ? (rt && (clearInterval(rt), rt = null), 0) : t - 1);
    }, 1e3), !0;
  } catch (r) {
    const t = r;
    return Ue.set(t.message || "Failed to start storm"), !1;
  } finally {
    Vt.set(!1);
  }
}
async function Ft(s, r, t = "user") {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/sticky`, { text: r, author: t }), await qe(s), !0;
  } catch (a) {
    const l = a;
    return Ue.set(l.message || "Failed to post sticky"), !1;
  }
}
async function Us(s, r) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/sticky/${r}/pull`, {}), await qe(s), !0;
  } catch (t) {
    const a = t;
    return Ue.set(a.message || "Failed to pull sticky"), !1;
  }
}
async function Ut(s, r, t) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/sticky/${r}/stack`, {
      target_sticky_id: t
    }), await qe(s), !0;
  } catch (a) {
    const l = a;
    return Ue.set(l.message || "Failed to stack sticky"), !1;
  }
}
async function qs(s, r) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/sticky/${r}/unstack`, {}), await qe(s), !0;
  } catch (t) {
    const a = t;
    return Ue.set(a.message || "Failed to unstack sticky"), !1;
  }
}
async function Ys(s, r, t) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/stack/${r}/groom`, {
      canonical_sticky_id: t
    }), await qe(s), !0;
  } catch (a) {
    const l = a;
    return Ue.set(l.message || "Failed to groom stack"), !1;
  }
}
async function qt(s, r, t) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/sticky/${r}/cluster`, {
      target_cluster_id: t
    }), await qe(s), !0;
  } catch (a) {
    const l = a;
    return Ue.set(l.message || "Failed to cluster sticky"), !1;
  }
}
async function Ks(s, r) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/sticky/${r}/uncluster`, {}), await qe(s), !0;
  } catch (t) {
    const a = t;
    return Ue.set(a.message || "Failed to uncluster sticky"), !1;
  }
}
async function Js(s, r) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/cluster/${r}/dissolve`, {}), await qe(s), !0;
  } catch (t) {
    const a = t;
    return Ue.set(a.message || "Failed to dissolve cluster"), !1;
  }
}
async function Qs(s, r, t) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/cluster/${r}/name`, { name: t }), await qe(s), !0;
  } catch (a) {
    const l = a;
    return Ue.set(l.message || "Failed to name cluster"), !1;
  }
}
async function Xs(s, r, t, a) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/fact`, {
      from_cluster: r,
      to_cluster: t,
      fact_name: a
    }), await qe(s), !0;
  } catch (l) {
    const J = l;
    return Ue.set(J.message || "Failed to draw fact arrow"), !1;
  }
}
async function Zs(s, r) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/fact/${r}/erase`, {}), await qe(s), !0;
  } catch (t) {
    const a = t;
    return Ue.set(a.message || "Failed to erase fact arrow"), !1;
  }
}
async function er(s, r) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/cluster/${r}/promote`, {}), await qe(s), !0;
  } catch (t) {
    const a = t;
    return Ue.set(a.message || "Failed to promote cluster"), !1;
  }
}
async function gt(s, r) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/phase/advance`, {
      target_phase: r
    }), await qe(s), !0;
  } catch (t) {
    const a = t;
    return Ue.set(a.message || "Failed to advance phase"), !1;
  }
}
async function tr(s) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/shelve`, {}), nt.set("shelved"), !0;
  } catch (r) {
    const t = r;
    return Ue.set(t.message || "Failed to shelve storm"), !1;
  }
}
async function sr(s) {
  try {
    return await Ve().post(`/api/ventures/${s}/storm/resume`, {}), await qe(s), !0;
  } catch (r) {
    const t = r;
    return Ue.set(t.message || "Failed to resume storm"), !1;
  }
}
async function rr(s) {
  const r = Ye(St);
  let t = !0;
  for (const a of r) {
    if (a.status !== "active" || !a.name?.trim()) continue;
    await er(s, a.cluster_id) || (t = !1);
  }
  if (t) {
    const { fetchDivisions: a } = await Promise.resolve().then(() => Is);
    await a(s);
  }
  return t;
}
function ar() {
  rt && (clearInterval(rt), rt = null), nt.set("ready"), pt.set([]), St.set([]), Ot.set([]), Bt.set([]), kt.set(600);
}
const Yt = Fe(!1), ir = Fe(null), nr = Fe(null);
async function or(s, r) {
  try {
    Yt.set(!0);
    const a = await Ve().post(
      `/api/ventures/${s}/vision/refine`,
      { vision: r }
    );
    return ir.set(a.refined), await Je(), !0;
  } catch (t) {
    const a = t;
    return nr.set(a.message || "Failed to refine vision"), !1;
  } finally {
    Yt.set(!1);
  }
}
var lr = e.from_html('<div class="text-[10px] text-surface-400 truncate mt-0.5"> </div>'), cr = e.from_html('<button><div class="font-medium"> </div> <!></button>'), dr = e.from_html(`<div class="absolute top-full left-0 mt-1 z-20 min-w-[220px]
						bg-surface-700 border border-surface-600 rounded-lg shadow-lg overflow-hidden"><!> <button class="w-full text-left px-3 py-2 text-xs text-hecate-400
							hover:bg-hecate-600/20 transition-colors border-t border-surface-600">+ New Venture</button></div>`), vr = e.from_html('<span class="text-[11px] text-surface-400 truncate max-w-[300px]"> </span>'), ur = e.from_html('<span class="text-[10px] text-surface-400"> </span>'), pr = e.from_html('<span class="text-[10px] text-surface-400 italic">Oracle active</span>'), fr = e.from_html(`<button class="text-[11px] px-2.5 py-1 rounded bg-hecate-600/20 text-hecate-300
					hover:bg-hecate-600/30 transition-colors disabled:opacity-50">Start Discovery</button>`), gr = e.from_html(`<button class="text-[11px] px-2 py-1 rounded text-surface-400
						hover:text-health-ok hover:bg-surface-700 transition-colors disabled:opacity-50">Complete Discovery</button>`), hr = e.from_html(
  `<button class="text-[11px] px-2.5 py-1 rounded bg-hecate-600/20 text-hecate-300
					hover:bg-hecate-600/30 transition-colors disabled:opacity-50">+ Identify Division</button> <button class="text-[11px] px-2 py-1 rounded text-surface-400
					hover:text-health-warn hover:bg-surface-700 transition-colors disabled:opacity-50">Pause</button> <!>`,
  1
), _r = e.from_html(`<button class="text-[11px] px-2.5 py-1 rounded bg-health-warn/10 text-health-warn
					hover:bg-health-warn/20 transition-colors disabled:opacity-50">Resume Discovery</button>`), xr = e.from_html('<div class="mt-2 text-[11px] text-health-err bg-health-err/10 rounded px-3 py-1.5"> </div>'), mr = e.from_html(`<div class="mt-3 flex gap-2 items-end"><div class="flex-1"><label for="refine-brief" class="text-[10px] text-surface-400 block mb-1">Vision Brief</label> <textarea id="refine-brief" placeholder="Describe what this venture aims to achieve..." class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-2 text-xs
						text-surface-100 placeholder-surface-400 resize-none
						focus:outline-none focus:border-hecate-500"></textarea></div> <button class="px-3 py-2 rounded text-xs bg-hecate-600 text-surface-50
					hover:bg-hecate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Refine</button> <button class="px-3 py-2 rounded text-xs text-surface-400 hover:text-surface-100 transition-colors">Cancel</button></div>`), br = e.from_html(`<div class="mt-3 flex gap-2 items-end"><div class="flex-1"><label for="div-name" class="text-[10px] text-surface-400 block mb-1">Context Name</label> <input id="div-name" placeholder="e.g., authentication, billing, notifications" class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-1.5 text-xs
						text-surface-100 placeholder-surface-400
						focus:outline-none focus:border-hecate-500"/></div> <div class="flex-1"><label for="div-desc" class="text-[10px] text-surface-400 block mb-1">Description (optional)</label> <input id="div-desc" placeholder="Brief description of this bounded context" class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-1.5 text-xs
						text-surface-100 placeholder-surface-400
						focus:outline-none focus:border-hecate-500"/></div> <button class="px-3 py-1.5 rounded text-xs bg-hecate-600 text-surface-50
					hover:bg-hecate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Identify</button> <button class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100 transition-colors">Cancel</button></div>`), yr = e.from_html(`<div class="border-b border-surface-600 bg-surface-800/50 px-4 py-3 shrink-0"><div class="flex items-center gap-3"><button class="flex items-center gap-1 text-xs text-surface-400 hover:text-hecate-300
				transition-colors shrink-0 -ml-1 px-1.5 py-1 rounded hover:bg-surface-700"><span class="text-sm"></span> <span>Ventures</span></button> <span class="text-surface-600 text-xs">|</span> <div class="relative flex items-center gap-2"><span class="text-hecate-400 text-lg"></span> <button class="flex items-center gap-1.5 text-sm font-semibold text-surface-100
					hover:text-hecate-300 transition-colors"> <span class="text-[9px] text-surface-400"></span></button> <!></div> <span> </span> <!> <div class="flex-1"></div> <!> <!></div> <!> <!> <!></div>`);
function wr(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(Ge, "$activeVenture", E), a = () => e.store_get(bt, "$ventures", E), l = () => e.store_get($t, "$ventureStep", E), J = () => e.store_get(it, "$divisions", E), P = () => e.store_get(je, "$isLoading", E), A = () => e.store_get(Ke, "$ventureError", E), [E, H] = e.setup_stores();
  let F = e.state(!1), w = e.state(!1), ee = e.state(!1), j = e.state(""), T = e.state(""), x = e.state("");
  async function I() {
    if (!t() || !e.get(j).trim()) return;
    await or(t().venture_id, e.get(j).trim()) && (e.set(F, !1), e.set(j, ""));
  }
  async function we() {
    t() && await Tt(t().venture_id);
  }
  async function ke() {
    if (!t() || !e.get(T).trim()) return;
    await as(t().venture_id, e.get(T).trim(), e.get(x).trim() || void 0) && (e.set(w, !1), e.set(T, ""), e.set(x, ""));
  }
  function pe(b) {
    switch (b) {
      case "discovering":
        return "bg-hecate-600/20 text-hecate-300 border-hecate-600/40";
      case "discovery_completed":
        return "bg-health-ok/10 text-health-ok border-health-ok/30";
      case "discovery_paused":
        return "bg-health-warn/10 text-health-warn border-health-warn/30";
      default:
        return "bg-surface-700 text-surface-300 border-surface-600";
    }
  }
  var fe = yr(), xe = e.child(fe), U = e.child(xe);
  U.__click = () => Mt();
  var Te = e.child(U);
  Te.textContent = "←", e.next(2), e.reset(U);
  var q = e.sibling(U, 4), Ie = e.child(q);
  Ie.textContent = "◆";
  var le = e.sibling(Ie, 2);
  le.__click = () => e.set(ee, !e.get(ee));
  var de = e.child(le), W = e.sibling(de);
  W.textContent = "▾", e.reset(le);
  var ve = e.sibling(le, 2);
  {
    var Me = (b) => {
      var _ = dr(), B = e.child(_);
      e.each(B, 1, () => a().filter((Ce) => !(Ce.status & ht)), e.index, (Ce, ne) => {
        var Y = cr();
        Y.__click = () => {
          xt(e.get(ne)), e.set(ee, !1);
        };
        var me = e.child(Y), f = e.child(me, !0);
        e.reset(me);
        var y = e.sibling(me, 2);
        {
          var h = (o) => {
            var c = lr(), V = e.child(c, !0);
            e.reset(c), e.template_effect(() => e.set_text(V, e.get(ne).brief)), e.append(o, c);
          };
          e.if(y, (o) => {
            e.get(ne).brief && o(h);
          });
        }
        e.reset(Y), e.template_effect(() => {
          e.set_class(Y, 1, `w-full text-left px-3 py-2 text-xs transition-colors
								${e.get(ne).venture_id === t()?.venture_id ? "bg-hecate-600/20 text-hecate-300" : "text-surface-200 hover:bg-surface-600"}`), e.set_text(f, e.get(ne).name);
        }), e.append(Ce, Y);
      });
      var Q = e.sibling(B, 2);
      Q.__click = () => {
        Mt(), e.set(ee, !1);
      }, e.reset(_), e.append(b, _);
    };
    e.if(ve, (b) => {
      e.get(ee) && b(Me);
    });
  }
  e.reset(q);
  var Ae = e.sibling(q, 2), g = e.child(Ae, !0);
  e.reset(Ae);
  var C = e.sibling(Ae, 2);
  {
    var re = (b) => {
      var _ = vr(), B = e.child(_, !0);
      e.reset(_), e.template_effect(() => e.set_text(B, t().brief)), e.append(b, _);
    };
    e.if(C, (b) => {
      t()?.brief && b(re);
    });
  }
  var he = e.sibling(C, 4);
  {
    var $e = (b) => {
      var _ = ur(), B = e.child(_);
      e.reset(_), e.template_effect(() => e.set_text(B, `${J().length ?? ""} division${J().length !== 1 ? "s" : ""}`)), e.append(b, _);
    };
    e.if(he, (b) => {
      J().length > 0 && b($e);
    });
  }
  var k = e.sibling(he, 2);
  {
    var R = (b) => {
      var _ = pr();
      e.append(b, _);
    }, z = (b) => {
      var _ = fr();
      _.__click = we, e.template_effect(() => _.disabled = P()), e.append(b, _);
    }, N = (b) => {
      var _ = hr(), B = e.first_child(_);
      B.__click = () => e.set(w, !e.get(w));
      var Q = e.sibling(B, 2);
      Q.__click = () => t() && is(t().venture_id);
      var Ce = e.sibling(Q, 2);
      {
        var ne = (Y) => {
          var me = gr();
          me.__click = () => t() && os(t().venture_id), e.template_effect(() => me.disabled = P()), e.append(Y, me);
        };
        e.if(Ce, (Y) => {
          J().length > 0 && Y(ne);
        });
      }
      e.template_effect(() => {
        B.disabled = P(), Q.disabled = P();
      }), e.append(b, _);
    }, ge = (b) => {
      var _ = _r();
      _.__click = () => t() && ns(t().venture_id), e.template_effect(() => _.disabled = P()), e.append(b, _);
    };
    e.if(k, (b) => {
      l() === "initiated" || l() === "vision_refined" ? b(R) : l() === "vision_submitted" ? b(z, 1) : l() === "discovering" ? b(N, 2) : l() === "discovery_paused" && b(ge, 3);
    });
  }
  e.reset(xe);
  var Le = e.sibling(xe, 2);
  {
    var L = (b) => {
      var _ = xr(), B = e.child(_, !0);
      e.reset(_), e.template_effect(() => e.set_text(B, A())), e.append(b, _);
    };
    e.if(Le, (b) => {
      A() && b(L);
    });
  }
  var ae = e.sibling(Le, 2);
  {
    var be = (b) => {
      var _ = mr(), B = e.child(_), Q = e.sibling(e.child(B), 2);
      e.remove_textarea_child(Q), e.set_attribute(Q, "rows", 2), e.reset(B);
      var Ce = e.sibling(B, 2);
      Ce.__click = I;
      var ne = e.sibling(Ce, 2);
      ne.__click = () => e.set(F, !1), e.reset(_), e.template_effect((Y) => Ce.disabled = Y, [() => !e.get(j).trim() || P()]), e.bind_value(Q, () => e.get(j), (Y) => e.set(j, Y)), e.append(b, _);
    };
    e.if(ae, (b) => {
      e.get(F) && b(be);
    });
  }
  var Ee = e.sibling(ae, 2);
  {
    var _e = (b) => {
      var _ = br(), B = e.child(_), Q = e.sibling(e.child(B), 2);
      e.remove_input_defaults(Q), e.reset(B);
      var Ce = e.sibling(B, 2), ne = e.sibling(e.child(Ce), 2);
      e.remove_input_defaults(ne), e.reset(Ce);
      var Y = e.sibling(Ce, 2);
      Y.__click = ke;
      var me = e.sibling(Y, 2);
      me.__click = () => e.set(w, !1), e.reset(_), e.template_effect((f) => Y.disabled = f, [() => !e.get(T).trim() || P()]), e.bind_value(Q, () => e.get(T), (f) => e.set(T, f)), e.bind_value(ne, () => e.get(x), (f) => e.set(x, f)), e.append(b, _);
    };
    e.if(Ee, (b) => {
      e.get(w) && b(_e);
    });
  }
  e.reset(fe), e.template_effect(
    (b) => {
      e.set_text(de, `${t()?.name ?? "Venture" ?? ""} `), e.set_class(Ae, 1, `text-[10px] px-2 py-0.5 rounded-full border ${b ?? ""}`), e.set_text(g, t()?.status_label ?? "New");
    },
    [() => pe(l())]
  ), e.append(s, fe), e.pop(), H();
}
e.delegate(["click"]);
var kr = e.from_html('<p class="text-xs text-surface-300 mt-1.5 max-w-md mx-auto"> </p>'), $r = e.from_html("<span></span>"), Cr = e.from_html('<div class="flex items-center gap-1"><div class="flex flex-col items-center gap-0.5 px-2"><span> </span> <span> </span></div> <!></div>'), Sr = e.from_html('<div class="rounded-lg border border-surface-600 bg-surface-800 p-3 col-span-2"><div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Repository</div> <div class="text-xs text-surface-200 font-mono"> </div></div>'), Dr = e.from_html('<div class="rounded-lg border border-hecate-600/30 bg-hecate-600/5 p-5 text-center"><div class="text-xs text-surface-200 mb-3">Your venture repo has been scaffolded. The next step is <strong class="text-hecate-300">Big Picture Event Storming</strong> </div> <button> </button></div>'), Ar = e.from_html(`<div class="rounded-lg border border-surface-600 bg-surface-800 p-5 text-center"><div class="text-xs text-surface-200 mb-2">Discovery is complete. Identify divisions (bounded contexts)
						from the events you discovered.</div> <div class="text-[10px] text-surface-400">Use the header controls to identify divisions.</div></div>`), Er = e.from_html('<div class="rounded-lg border border-surface-600 bg-surface-800 p-5 text-center"><div class="text-xs text-surface-200">Continue from the header controls to advance through the lifecycle.</div></div>'), Pr = e.from_html('<div class="text-center"><div class="text-3xl mb-3 text-hecate-400"></div> <h2 class="text-lg font-semibold text-surface-100"> </h2> <!></div> <div class="flex items-center justify-center gap-1 py-4"></div> <div class="grid grid-cols-2 gap-3"><div class="rounded-lg border border-surface-600 bg-surface-800 p-3"><div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Status</div> <div class="text-xs text-surface-100"> </div></div> <div class="rounded-lg border border-surface-600 bg-surface-800 p-3"><div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Initiated</div> <div class="text-xs text-surface-100"> </div></div> <!></div> <!>', 1), Ir = e.from_html('<div class="flex flex-col h-full overflow-y-auto"><div class="max-w-2xl mx-auto w-full p-8 space-y-6"><!></div></div>');
function Pt(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(Ge, "$activeVenture", J), a = () => e.store_get($t, "$ventureStep", J), l = () => e.store_get(je, "$isLoading", J), [J, P] = e.setup_stores();
  function A(x) {
    return x ? new Date(x * 1e3).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "";
  }
  async function E() {
    if (!t()) return;
    await Tt(t().venture_id) && (await Je(), await yt());
  }
  const H = [
    { key: "vision", label: "Vision", icon: "◇" },
    { key: "discovery", label: "Discovery", icon: "○" },
    { key: "design", label: "Design", icon: "△" },
    { key: "plan", label: "Plan", icon: "□" },
    { key: "implement", label: "Implement", icon: "⚙" },
    { key: "deploy", label: "Deploy", icon: "▲" },
    { key: "monitor", label: "Monitor", icon: "◉" },
    { key: "rescue", label: "Rescue", icon: "↺" }
  ];
  let F = e.derived(() => {
    const x = a();
    return x === "initiated" || x === "vision_refined" || x === "vision_submitted" ? 0 : x === "discovering" || x === "discovery_paused" || x === "discovery_completed" ? 1 : 0;
  });
  var w = Ir(), ee = e.child(w), j = e.child(ee);
  {
    var T = (x) => {
      var I = Pr(), we = e.first_child(I), ke = e.child(we);
      ke.textContent = "◆";
      var pe = e.sibling(ke, 2), fe = e.child(pe, !0);
      e.reset(pe);
      var xe = e.sibling(pe, 2);
      {
        var U = (k) => {
          var R = kr(), z = e.child(R, !0);
          e.reset(R), e.template_effect(() => e.set_text(z, t().brief)), e.append(k, R);
        };
        e.if(xe, (k) => {
          t().brief && k(U);
        });
      }
      e.reset(we);
      var Te = e.sibling(we, 2);
      e.each(Te, 21, () => H, e.index, (k, R, z) => {
        const N = e.derived(() => z < e.get(F)), ge = e.derived(() => z === e.get(F)), Le = e.derived(() => z === e.get(F) + 1);
        var L = Cr(), ae = e.child(L), be = e.child(ae), Ee = e.child(be, !0);
        e.reset(be);
        var _e = e.sibling(be, 2), b = e.child(_e, !0);
        e.reset(_e), e.reset(ae);
        var _ = e.sibling(ae, 2);
        {
          var B = (Q) => {
            var Ce = $r();
            Ce.textContent = "→", e.template_effect(() => e.set_class(Ce, 1, `text-[10px]
									${e.get(N) ? "text-health-ok/40" : "text-surface-700"}`)), e.append(Q, Ce);
          };
          e.if(_, (Q) => {
            z < H.length - 1 && Q(B);
          });
        }
        e.reset(L), e.template_effect(() => {
          e.set_attribute(ae, "title", e.get(R).label), e.set_class(be, 1, `text-sm transition-colors
									${e.get(N) ? "text-health-ok" : e.get(ge) ? "text-hecate-400" : "text-surface-600"}`), e.set_text(Ee, e.get(N) ? "✓" : e.get(R).icon), e.set_class(_e, 1, `text-[9px] transition-colors
									${e.get(N) ? "text-health-ok/70" : e.get(ge) ? "text-hecate-300" : e.get(Le) ? "text-surface-400" : "text-surface-600"}`), e.set_text(b, e.get(R).label);
        }), e.append(k, L);
      }), e.reset(Te);
      var q = e.sibling(Te, 2), Ie = e.child(q), le = e.sibling(e.child(Ie), 2), de = e.child(le, !0);
      e.reset(le), e.reset(Ie);
      var W = e.sibling(Ie, 2), ve = e.sibling(e.child(W), 2), Me = e.child(ve, !0);
      e.reset(ve), e.reset(W);
      var Ae = e.sibling(W, 2);
      {
        var g = (k) => {
          var R = Sr(), z = e.sibling(e.child(R), 2), N = e.child(z, !0);
          e.reset(z), e.reset(R), e.template_effect(() => e.set_text(N, t().repos[0])), e.append(k, R);
        };
        e.if(Ae, (k) => {
          t().repos && t().repos.length > 0 && k(g);
        });
      }
      e.reset(q);
      var C = e.sibling(q, 2);
      {
        var re = (k) => {
          var R = Dr(), z = e.child(R), N = e.sibling(e.child(z), 2);
          N.nodeValue = " — discover the domain events that define your system.", e.reset(z);
          var ge = e.sibling(z, 2);
          ge.__click = E;
          var Le = e.child(ge, !0);
          e.reset(ge), e.reset(R), e.template_effect(() => {
            ge.disabled = l(), e.set_class(ge, 1, `px-5 py-2.5 rounded-lg text-sm font-medium transition-colors
							${l() ? "bg-surface-600 text-surface-400 cursor-not-allowed" : "bg-hecate-600 text-surface-50 hover:bg-hecate-500"}`), e.set_text(Le, l() ? "Starting..." : "Start Discovery");
          }), e.append(k, R);
        }, he = (k) => {
          var R = Ar();
          e.append(k, R);
        }, $e = (k) => {
          var R = Er();
          e.append(k, R);
        };
        e.if(C, (k) => {
          r.nextAction === "discovery" && a() === "vision_submitted" ? k(re) : r.nextAction === "identify" ? k(he, 1) : k($e, !1);
        });
      }
      e.template_effect(
        (k) => {
          e.set_text(fe, t().name), e.set_text(de, t().status_label), e.set_text(Me, k);
        },
        [() => A(t().initiated_at ?? 0)]
      ), e.append(x, I);
    };
    e.if(j, (x) => {
      t() && x(T);
    });
  }
  e.reset(ee), e.reset(w), e.append(s, w), e.pop(), P();
}
e.delegate(["click"]);
var Mr = e.from_html("<button><span> </span> <span> </span> <span> </span></button>"), Lr = e.from_html('<div class="ml-2 mt-1 space-y-0.5"></div>'), Vr = e.from_html('<div class="mb-2"><button><span class="font-medium"> </span></button> <!></div>'), Fr = e.from_html('<div class="text-[10px] text-surface-400 px-2 py-4 text-center">No divisions yet. <br/> Start discovery to identify them.</div>'), Tr = e.from_html('<div class="w-48 border-r border-surface-600 bg-surface-800/30 overflow-y-auto shrink-0"><div class="p-3"><div class="text-[10px] text-surface-400 uppercase tracking-wider mb-2">Divisions</div> <!> <!></div></div>');
function Nr(s, r) {
  e.push(r, !1);
  const t = () => e.store_get(it, "$divisions", J), a = () => e.store_get(_t, "$selectedDivisionId", J), l = () => e.store_get(vt, "$selectedPhase", J), [J, P] = e.setup_stores();
  function A(x) {
    _t.set(x);
  }
  function E(x, I) {
    _t.set(x), vt.set(I);
  }
  function H(x) {
    return Be(x, mt) ? "●" : Be(x, lt) ? "◐" : (Be(x, ct), "○");
  }
  e.init();
  var F = Tr(), w = e.child(F), ee = e.sibling(e.child(w), 2);
  e.each(ee, 1, t, e.index, (x, I) => {
    const we = e.derived_safe_equal(() => a() === e.get(I).division_id);
    var ke = Vr(), pe = e.child(ke);
    pe.__click = () => A(e.get(I).division_id);
    var fe = e.child(pe), xe = e.child(fe, !0);
    e.reset(fe), e.reset(pe);
    var U = e.sibling(pe, 2);
    {
      var Te = (q) => {
        var Ie = Lr();
        e.each(Ie, 5, () => at, e.index, (le, de) => {
          const W = e.derived_safe_equal(() => wt(e.get(I), e.get(de).code));
          var ve = Mr();
          ve.__click = () => E(e.get(I).division_id, e.get(de).code);
          var Me = e.child(ve), Ae = e.child(Me, !0);
          e.reset(Me);
          var g = e.sibling(Me, 2), C = e.child(g, !0);
          e.reset(g);
          var re = e.sibling(g, 2), he = e.child(re, !0);
          e.reset(re), e.reset(ve), e.template_effect(
            ($e, k, R, z) => {
              e.set_class(ve, 1, `w-full flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px]
									transition-colors
									${l() === e.get(de).code ? "bg-surface-600/50 text-surface-100" : "text-surface-400 hover:text-surface-300"}`), e.set_class(Me, 1, $e), e.set_text(Ae, k), e.set_text(C, e.get(de).shortName), e.set_class(re, 1, `ml-auto text-[9px] ${R ?? ""}`), e.set_text(he, z);
            },
            [
              () => e.clsx(Wt(e.get(W))),
              () => H(e.get(W)),
              () => Wt(e.get(W)),
              () => Cs(e.get(W))
            ]
          ), e.append(le, ve);
        }), e.reset(Ie), e.append(q, Ie);
      };
      e.if(U, (q) => {
        e.get(we) && q(Te);
      });
    }
    e.reset(ke), e.template_effect(() => {
      e.set_class(pe, 1, `w-full text-left px-2 py-1.5 rounded text-xs transition-colors
						${e.get(we) ? "bg-surface-700 text-surface-100" : "text-surface-300 hover:bg-surface-700/50 hover:text-surface-100"}`), e.set_text(xe, e.get(I).context_name);
    }), e.append(x, ke);
  });
  var j = e.sibling(ee, 2);
  {
    var T = (x) => {
      var I = Fr();
      e.append(x, I);
    };
    e.if(j, (x) => {
      t().length === 0 && x(T);
    });
  }
  e.reset(w), e.reset(F), e.append(s, F), e.pop(), P();
}
e.delegate(["click"]);
const fs = Fe(
  "You are Martha, an AI assistant specializing in software architecture and domain-driven design."
), Rr = `You are The Oracle, a vision architect. You interview the user about their venture and build a vision document.

RULES:
1. Ask ONE question per response. Keep it short (2-3 sentences + question).
2. After EVERY response, include a vision draft inside a \`\`\`markdown code fence.
3. Cover 5 topics: Problem, Users, Capabilities, Constraints, Success Criteria.

Be warm but direct. Push for specifics when answers are vague.`, Or = "Be concise and practical. Suggest specific, actionable items. When suggesting domain elements, use snake_case naming. When suggesting events, use the format: {subject}_{verb_past}_v{N}.", Br = [
  {
    id: "oracle",
    name: "The Oracle",
    role: "Domain Expert",
    icon: "◇",
    description: "Rapid-fires domain events from the vision document",
    prompt: "You are The Oracle, a domain expert participating in a Big Picture Event Storming session. Your job is to rapidly identify domain events. Output ONLY event names in past tense business language. One per line. Be fast, be prolific."
  },
  {
    id: "architect",
    name: "The Architect",
    role: "Boundary Spotter",
    icon: "△",
    description: "Identifies natural context boundaries between event clusters",
    prompt: "You are The Architect, a DDD strategist. Given the events on the board, identify BOUNDED CONTEXT BOUNDARIES. Name the candidate contexts (divisions) and list which events belong to each."
  },
  {
    id: "advocate",
    name: "The Advocate",
    role: "Devil's Advocate",
    icon: "★",
    description: "Challenges context boundaries and finds missing events",
    prompt: "You are The Advocate. Identify MISSING events and challenge proposed boundaries. Be specific and constructive."
  },
  {
    id: "scribe",
    name: "The Scribe",
    role: "Integration Mapper",
    icon: "□",
    description: "Maps how contexts communicate via integration facts",
    prompt: 'You are The Scribe. Map INTEGRATION FACTS between contexts. Use: "Context A publishes fact_name -> Context B".'
  }
], jr = [
  {
    id: "oracle",
    name: "The Oracle",
    role: "Domain Expert",
    icon: "◇",
    description: "Identifies domain events and business processes",
    prompt: "You are The Oracle for Design-Level Event Storming. Identify business events in past tense snake_case_v1 format with one-line rationale each."
  },
  {
    id: "architect",
    name: "The Architect",
    role: "Technical Lead",
    icon: "△",
    description: "Identifies aggregates and structural patterns",
    prompt: "You are The Architect for Design-Level Event Storming. Identify aggregate boundaries and explain which events cluster around them."
  },
  {
    id: "advocate",
    name: "The Advocate",
    role: "Devil's Advocate",
    icon: "★",
    description: "Questions assumptions and identifies edge cases",
    prompt: "You are The Advocate. Find problems, edge cases, and hotspots. Challenge every assumption."
  },
  {
    id: "scribe",
    name: "The Scribe",
    role: "Process Analyst",
    icon: "□",
    description: "Organizes discoveries and identifies read models",
    prompt: "You are The Scribe. Identify read models and policies. Focus on queryable information and domain rules."
  }
], Hr = Fe(Br), Wr = Fe(jr), zr = Fe(Rr), Gr = Fe(Or);
function Ur(s, r) {
  return s.replace(/\{\{(\w+)\}\}/g, (t, a) => r[a] ?? `{{${a}}}`);
}
function qr(s, r) {
  let t = null, a = null, l = null, J = !1;
  const P = {
    onChunk(A) {
      return t = A, P;
    },
    onDone(A) {
      return a = A, P;
    },
    onError(A) {
      return l = A, P;
    },
    async start() {
      if (!J)
        try {
          const E = await Ve().post("/api/llm/chat", {
            model: s,
            messages: r
          });
          if (J) return;
          t && t({ content: E.content }), a && a({ content: "", done: !0 });
        } catch (A) {
          if (J) return;
          l && l(A.message || "LLM request failed");
        }
    },
    cancel() {
      J = !0;
    }
  };
  return P;
}
function gs() {
  return {
    stream: {
      chat: qr
    }
  };
}
var Yr = e.from_html(`<button class="text-[10px] px-2 py-0.5 rounded bg-surface-700 text-surface-300
		hover:bg-surface-600 transition-colors truncate max-w-[120px]"> </button>`);
function hs(s, r) {
  e.prop(r, "showPhaseInfo", 3, !1), e.prop(r, "phasePreference", 3, null), e.prop(r, "phaseAffinity", 3, "general"), e.prop(r, "phaseName", 3, "");
  var t = Yr(), a = e.child(t, !0);
  e.reset(t), e.template_effect(() => {
    e.set_attribute(t, "title", r.currentModel ?? "No model selected"), e.set_text(a, r.currentModel ?? "No model");
  }), e.append(s, t);
}
var Kr = e.from_html(`<div class="flex justify-end"><div class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
							bg-hecate-600/20 text-surface-100 border border-hecate-600/20"><div class="whitespace-pre-wrap break-words"> </div></div></div>`), Jr = e.from_html(`<details class="mb-1.5 group"><summary class="text-[10px] text-surface-400 cursor-pointer hover:text-surface-300
											select-none flex items-center gap-1"><span class="text-[9px] transition-transform group-open:rotate-90"></span> Reasoning</summary> <div class="mt-1 pl-2 border-l-2 border-surface-600 text-[10px] text-surface-400
											whitespace-pre-wrap break-words max-h-32 overflow-y-auto"> </div></details>`), Qr = e.from_html('<div class="whitespace-pre-wrap break-words"> </div>'), Xr = e.from_html('<div class="flex justify-start"><div></div></div>'), Zr = e.from_html(`<details class="group"><summary class="text-[10px] text-surface-500 cursor-pointer hover:text-surface-400
										select-none flex items-center gap-1"><span class="text-[9px] transition-transform group-open:rotate-90"></span> Show reasoning</summary> <div class="mt-1 pl-2 border-l-2 border-surface-600 text-[10px] text-surface-400
										whitespace-pre-wrap break-words max-h-32 overflow-y-auto"> <span class="inline-block w-1 h-3 bg-accent-400/50 animate-pulse ml-0.5"></span></div></details>`), ea = e.from_html('<div class="flex items-center gap-2 text-surface-400 mb-1"><span class="flex gap-1"><span class="w-1.5 h-1.5 rounded-full bg-accent-500/60 animate-bounce" style="animation-delay: 0ms"></span> <span class="w-1.5 h-1.5 rounded-full bg-accent-500/60 animate-bounce" style="animation-delay: 150ms"></span> <span class="w-1.5 h-1.5 rounded-full bg-accent-500/60 animate-bounce" style="animation-delay: 300ms"></span></span> <span class="text-[10px] text-accent-400/70">Reasoning...</span></div> <!>', 1), ta = e.from_html(`<details class="mb-1.5 group"><summary class="text-[10px] text-surface-400 cursor-pointer hover:text-surface-300
										select-none flex items-center gap-1"><span class="text-[9px] transition-transform group-open:rotate-90"></span> Reasoning</summary> <div class="mt-1 pl-2 border-l-2 border-surface-600 text-[10px] text-surface-400
										whitespace-pre-wrap break-words max-h-32 overflow-y-auto"> </div></details>`), sa = e.from_html('<!> <div class="whitespace-pre-wrap break-words"> <span class="inline-block w-1.5 h-3 bg-hecate-400 animate-pulse ml-0.5"></span></div>', 1), ra = e.from_html('<div class="flex items-center gap-1.5 text-surface-400"><span class="animate-bounce" style="animation-delay: 0ms">.</span> <span class="animate-bounce" style="animation-delay: 150ms">.</span> <span class="animate-bounce" style="animation-delay: 300ms">.</span></div>'), aa = e.from_html(`<div class="flex justify-start"><div class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
						bg-surface-700 text-surface-200 border border-surface-600"><!></div></div>`), ia = e.from_html('<div class="flex items-center justify-center h-full"><div class="text-center text-surface-400"><div class="text-2xl mb-2"></div> <div class="text-[11px]">The Oracle is preparing...</div></div></div>'), na = e.from_html('<span class="text-[10px] text-health-ok"></span>'), oa = e.from_html('<span class="text-[10px] text-accent-400"></span>'), la = e.from_html('<span class="text-[10px] text-surface-400"></span>'), ca = e.from_html('<span class="text-[10px] text-surface-400">Waiting for Oracle...</span>'), da = e.from_html('<div class="mt-4 p-2 rounded bg-surface-700 border border-surface-600"><div class="text-[9px] text-surface-400 uppercase tracking-wider mb-1">Brief</div> <div class="text-[11px] text-surface-200"> </div></div>'), va = e.from_html('<div class="prose prose-sm prose-invert"><!></div> <!>', 1), ua = e.from_html(`<div class="flex items-center justify-center h-full"><div class="text-center text-surface-400 max-w-[220px]"><div class="text-2xl mb-2"></div> <div class="text-[11px]">Your vision will take shape here as the Oracle
							gathers context about your venture.</div></div></div>`), pa = e.from_html('<div class="text-[10px] text-health-err bg-health-err/10 rounded px-2 py-1"> </div>'), fa = e.from_html(`<div class="space-y-2"><div><label for="repo-path" class="text-[10px] text-surface-400 block mb-1">Repository Path</label> <input id="repo-path" placeholder="~/ventures/my-venture" class="w-full bg-surface-700 border border-surface-600 rounded px-3 py-1.5
								text-[11px] text-surface-100 placeholder-surface-400
								focus:outline-none focus:border-hecate-500"/></div> <!> <button> </button></div>`), ga = e.from_html('<div class="text-center text-[10px] text-surface-400 py-2"></div>'), ha = e.from_html('<div class="text-center text-[10px] text-surface-400 py-2">The Oracle will guide you through defining your venture</div>'), _a = e.from_html(`<div class="flex h-full overflow-hidden"><div class="flex flex-col overflow-hidden"><div class="flex items-center gap-2 px-4 py-2.5 border-b border-surface-600 shrink-0"><span class="text-hecate-400"></span> <span class="text-xs font-semibold text-surface-100">The Oracle</span> <span class="text-[10px] text-surface-400">Vision Architect</span> <div class="flex-1"></div> <!></div> <div class="flex-1 overflow-y-auto p-4 space-y-3"><!> <!> <!></div> <div class="border-t border-surface-600 p-3 shrink-0"><div class="flex gap-2"><textarea class="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-3 py-2
						text-[11px] text-surface-100 placeholder-surface-400 resize-none
						focus:outline-none focus:border-hecate-500
						disabled:opacity-50 disabled:cursor-not-allowed"></textarea> <button>Send</button></div></div></div>  <div></div> <div class="flex flex-col overflow-hidden flex-1"><div class="flex items-center gap-2 px-4 py-2.5 border-b border-surface-600 shrink-0"><span class="text-surface-400 text-xs"></span> <span class="text-xs font-semibold text-surface-100">Vision Preview</span> <div class="flex-1"></div> <!></div> <div class="flex-1 overflow-y-auto p-4"><!></div> <div class="border-t border-surface-600 p-3 shrink-0"><!></div></div></div>`);
function xa(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(Ge, "$activeVenture", J), a = () => e.store_get(ds, "$aiModel", J), l = () => e.store_get(je, "$isLoading", J), [J, P] = e.setup_stores(), A = gs();
  let E = e.state(e.proxy([])), H = e.state(""), F = e.state(!1), w = e.state(""), ee = e.state(void 0), j = e.state(!1), T = e.state(""), x = e.state(""), I = e.state(null), we = e.state(null), ke = e.state(65), pe = e.state(!1), fe = e.state(void 0);
  function xe(i) {
    let n = i.replace(/```markdown\n[\s\S]*?```/g, "◇ Vision updated ↗");
    return n = n.replace(/```markdown\n[\s\S]*$/, "◇ Synthesizing vision... ↗"), n;
  }
  function U(i) {
    const n = xe(i), u = [];
    let v = n;
    for (; v.length > 0; ) {
      const m = v.indexOf("<think>");
      if (m === -1) {
        v.trim() && u.push({ type: "text", content: v });
        break;
      }
      if (m > 0) {
        const d = v.slice(0, m);
        d.trim() && u.push({ type: "text", content: d });
      }
      const M = v.indexOf("</think>", m);
      if (M === -1) {
        const d = v.slice(m + 7);
        d.trim() && u.push({ type: "think", content: d });
        break;
      }
      const S = v.slice(m + 7, M);
      S.trim() && u.push({ type: "think", content: S }), v = v.slice(M + 8);
    }
    return u.length > 0 ? u : [{ type: "text", content: n }];
  }
  function Te(i) {
    return i.includes("<think>") && !i.includes("</think>");
  }
  function q(i) {
    const n = xe(i);
    return n.includes("</think>") ? (n.split("</think>").pop() || "").trim() : n.includes("<think>") ? "" : n;
  }
  function Ie(i) {
    const n = xe(i), u = n.indexOf("<think>");
    if (u === -1) return "";
    const v = n.indexOf("</think>");
    return v === -1 ? n.slice(u + 7) : n.slice(u + 7, v);
  }
  let le = e.derived(() => {
    for (let i = e.get(E).length - 1; i >= 0; i--)
      if (e.get(E)[i].role === "assistant") {
        const n = e.get(E)[i].content.match(/```markdown\n([\s\S]*?)```/);
        if (n) return n[1].trim();
      }
    if (e.get(w)) {
      const i = e.get(w).match(/```markdown\n([\s\S]*?)```/);
      if (i) return i[1].trim();
      const n = e.get(w).match(/```markdown\n([\s\S]*)$/);
      if (n) return n[1].trim();
    }
    return null;
  }), de = e.derived(() => e.get(le) !== null && !e.get(le).includes("(Not yet explored)") && !e.get(le).includes("*(Hypothetical)*")), W = e.derived(() => {
    if (!e.get(le)) return null;
    const i = e.get(le).match(/<!--\s*brief:\s*(.*?)\s*-->/);
    return i ? i[1].trim() : null;
  }), ve = e.state(null);
  e.user_effect(() => {
    const i = t(), n = i?.venture_id ?? null;
    if (n !== e.get(ve) && (e.set(E, [], !0), e.set(w, ""), e.set(F, !1), e.set(T, ""), e.set(x, ""), e.set(ve, n, !0)), i && !e.get(x)) {
      const u = "~/ventures", v = i.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      e.set(x, `${u}/${v}`);
    }
  }), e.user_effect(() => {
    const i = a();
    e.get(we) !== null && e.get(we) !== i && (e.get(I) && (e.get(I).cancel(), e.set(I, null)), e.set(E, [], !0), e.set(w, ""), e.set(F, !1)), e.set(we, i, !0);
  }), e.user_effect(() => {
    const i = t();
    if (i && e.get(E).length === 0 && !e.get(F)) {
      const n = `I just initiated a new venture called "${i.name}". ${i.brief ? `Here's what I know so far: ${i.brief}` : "I need help defining the vision for this venture."}`;
      Ae(n);
    }
  });
  function Me() {
    const i = [], n = Ye(fs);
    n && i.push(n);
    const u = Ye(zr);
    if (i.push(Ur(u, { venture_name: t()?.name ?? "Unnamed" })), t()) {
      let v = `The venture is called "${t().name}"`;
      t().brief && (v += `. Initial brief: ${t().brief}`), i.push(v);
    }
    return i.join(`

---

`);
  }
  async function Ae(i) {
    const n = a();
    if (!n || !i.trim() || e.get(F)) return;
    const u = { role: "user", content: i.trim() };
    e.set(E, [...e.get(E), u], !0), e.set(H, "");
    const v = [], m = Me();
    m && v.push({ role: "system", content: m }), v.push(...e.get(E)), e.set(F, !0), e.set(w, "");
    let M = "";
    const S = A.stream.chat(n, v);
    e.set(I, S, !0), S.onChunk((d) => {
      d.content && (M += d.content, e.set(w, M, !0));
    }).onDone(async (d) => {
      d.content && (M += d.content);
      const p = {
        role: "assistant",
        content: M || "(empty response)"
      };
      e.set(E, [...e.get(E), p], !0), e.set(w, ""), e.set(F, !1), e.set(I, null);
    }).onError((d) => {
      const p = { role: "assistant", content: `Error: ${d}` };
      e.set(E, [...e.get(E), p], !0), e.set(w, ""), e.set(F, !1), e.set(I, null);
    });
    try {
      await S.start();
    } catch (d) {
      const p = { role: "assistant", content: `Error: ${String(d)}` };
      e.set(E, [...e.get(E), p], !0), e.set(F, !1);
    }
  }
  async function g() {
    if (!t() || !e.get(le) || !e.get(x).trim()) return;
    e.set(j, !0), e.set(T, ""), await rs(t().venture_id, e.get(x).trim(), e.get(le), t().name, e.get(W) ?? void 0) ? (await Je(), await yt()) : e.set(T, Ye(Ke) || "Failed to scaffold venture repo", !0), e.set(j, !1);
  }
  let C = e.state(void 0);
  function re(i) {
    i.key === "Enter" && !i.shiftKey && (i.preventDefault(), Ae(e.get(H)), e.get(C) && (e.get(C).style.height = "auto"));
  }
  function he(i) {
    const n = i.target;
    n.style.height = "auto", n.style.height = Math.min(n.scrollHeight, 150) + "px";
  }
  function $e(i) {
    e.set(pe, !0), i.preventDefault();
  }
  function k(i) {
    if (!e.get(pe) || !e.get(fe)) return;
    const n = e.get(fe).getBoundingClientRect(), v = (i.clientX - n.left) / n.width * 100;
    e.set(ke, Math.max(30, Math.min(80, v)), !0);
  }
  function R() {
    e.set(pe, !1);
  }
  e.user_effect(() => {
    e.get(E), e.get(w), Xt().then(() => {
      e.get(ee) && (e.get(ee).scrollTop = e.get(ee).scrollHeight);
    });
  });
  function z(i) {
    return i.replace(/<!--.*?-->/gs, "").replace(/^### (.*$)/gm, '<h3 class="text-xs font-semibold text-surface-100 mt-3 mb-1">$1</h3>').replace(/^## (.*$)/gm, '<h2 class="text-sm font-semibold text-hecate-300 mt-4 mb-1.5">$1</h2>').replace(/^# (.*$)/gm, '<h1 class="text-base font-bold text-surface-100 mb-2">$1</h1>').replace(/^(\d+)\.\s+(.*$)/gm, '<div class="text-[11px] text-surface-200 ml-3 mb-1"><span class="text-surface-400 mr-1.5">$1.</span>$2</div>').replace(/^\- (.*$)/gm, '<div class="text-[11px] text-surface-200 ml-3 mb-1"><span class="text-surface-400 mr-1.5">&bull;</span>$1</div>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-surface-100">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-surface-300">$1</em>').replace(/\n\n/g, "<br/><br/>").trim();
  }
  var N = _a();
  N.__mousemove = k, N.__mouseup = R;
  var ge = e.child(N), Le = e.child(ge), L = e.child(Le);
  L.textContent = "◇";
  var ae = e.sibling(L, 8);
  hs(ae, {
    get currentModel() {
      return a();
    },
    onSelect: (i) => ps(i)
  }), e.reset(Le);
  var be = e.sibling(Le, 2), Ee = e.child(be);
  e.each(Ee, 17, () => e.get(E), e.index, (i, n) => {
    var u = e.comment(), v = e.first_child(u);
    {
      var m = (S) => {
        var d = Kr(), p = e.child(d), D = e.child(p), se = e.child(D, !0);
        e.reset(D), e.reset(p), e.reset(d), e.template_effect(() => e.set_text(se, e.get(n).content)), e.append(S, d);
      }, M = (S) => {
        var d = Xr(), p = e.child(d);
        e.each(p, 21, () => U(e.get(n).content), e.index, (D, se) => {
          var ye = e.comment(), Se = e.first_child(ye);
          {
            var De = (Ne) => {
              var Re = Jr(), Oe = e.child(Re), We = e.child(Oe);
              We.textContent = "▶", e.next(), e.reset(Oe);
              var ze = e.sibling(Oe, 2), st = e.child(ze, !0);
              e.reset(ze), e.reset(Re), e.template_effect((ft) => e.set_text(st, ft), [() => e.get(se).content.trim()]), e.append(Ne, Re);
            }, Pe = (Ne) => {
              var Re = Qr(), Oe = e.child(Re, !0);
              e.reset(Re), e.template_effect((We) => e.set_text(Oe, We), [() => e.get(se).content.trim()]), e.append(Ne, Re);
            };
            e.if(Se, (Ne) => {
              e.get(se).type === "think" ? Ne(De) : Ne(Pe, !1);
            });
          }
          e.append(D, ye);
        }), e.reset(p), e.reset(d), e.template_effect(
          (D) => e.set_class(p, 1, `max-w-[85%] rounded-lg px-3 py-2 text-[11px]
							bg-surface-700 text-surface-200 border border-surface-600
							${D ?? ""}`),
          [
            () => e.get(n).content.startsWith("Error:") ? "border-health-err/30 text-health-err" : ""
          ]
        ), e.append(S, d);
      };
      e.if(v, (S) => {
        e.get(n).role === "user" ? S(m) : e.get(n).role === "assistant" && S(M, 1);
      });
    }
    e.append(i, u);
  });
  var _e = e.sibling(Ee, 2);
  {
    var b = (i) => {
      var n = aa(), u = e.child(n), v = e.child(u);
      {
        var m = (p) => {
          var D = ea(), se = e.sibling(e.first_child(D), 2);
          {
            var ye = (De) => {
              var Pe = Zr(), Ne = e.child(Pe), Re = e.child(Ne);
              Re.textContent = "▶", e.next(), e.reset(Ne);
              var Oe = e.sibling(Ne, 2), We = e.child(Oe, !0);
              e.next(), e.reset(Oe), e.reset(Pe), e.template_effect((ze) => e.set_text(We, ze), [
                () => Ie(e.get(w)).trim()
              ]), e.append(De, Pe);
            }, Se = e.derived(() => Ie(e.get(w)).trim());
            e.if(se, (De) => {
              e.get(Se) && De(ye);
            });
          }
          e.append(p, D);
        }, M = e.derived(() => e.get(w) && Te(e.get(w))), S = (p) => {
          var D = sa(), se = e.first_child(D);
          {
            var ye = (Ne) => {
              var Re = ta(), Oe = e.child(Re), We = e.child(Oe);
              We.textContent = "▶", e.next(), e.reset(Oe);
              var ze = e.sibling(Oe, 2), st = e.child(ze, !0);
              e.reset(ze), e.reset(Re), e.template_effect((ft) => e.set_text(st, ft), [
                () => Ie(e.get(w)).trim()
              ]), e.append(Ne, Re);
            }, Se = e.derived(() => Ie(e.get(w)).trim());
            e.if(se, (Ne) => {
              e.get(Se) && Ne(ye);
            });
          }
          var De = e.sibling(se, 2), Pe = e.child(De, !0);
          e.next(), e.reset(De), e.template_effect((Ne) => e.set_text(Pe, Ne), [() => q(e.get(w))]), e.append(p, D);
        }, d = (p) => {
          var D = ra();
          e.append(p, D);
        };
        e.if(v, (p) => {
          e.get(M) ? p(m) : e.get(w) ? p(S, 1) : p(d, !1);
        });
      }
      e.reset(u), e.reset(n), e.append(i, n);
    };
    e.if(_e, (i) => {
      e.get(F) && i(b);
    });
  }
  var _ = e.sibling(_e, 2);
  {
    var B = (i) => {
      var n = ia(), u = e.child(n), v = e.child(u);
      v.textContent = "◇", e.next(2), e.reset(u), e.reset(n), e.append(i, n);
    };
    e.if(_, (i) => {
      e.get(E).length === 0 && !e.get(F) && i(B);
    });
  }
  e.reset(be), e.bind_this(be, (i) => e.set(ee, i), () => e.get(ee));
  var Q = e.sibling(be, 2), Ce = e.child(Q), ne = e.child(Ce);
  e.remove_textarea_child(ne), ne.__keydown = re, ne.__input = he, e.set_attribute(ne, "rows", 1), e.bind_this(ne, (i) => e.set(C, i), () => e.get(C));
  var Y = e.sibling(ne, 2);
  Y.__click = () => Ae(e.get(H)), e.reset(Ce), e.reset(Q), e.reset(ge);
  var me = e.sibling(ge, 2);
  me.__mousedown = $e;
  var f = e.sibling(me, 2), y = e.child(f), h = e.child(y);
  h.textContent = "📄";
  var o = e.sibling(h, 6);
  {
    var c = (i) => {
      var n = na();
      n.textContent = "● Complete", e.append(i, n);
    }, V = (i) => {
      var n = oa();
      n.textContent = "◐ Drafting...", e.append(i, n);
    }, oe = (i) => {
      var n = la();
      n.textContent = "◐ Listening...", e.append(i, n);
    }, X = (i) => {
      var n = ca();
      e.append(i, n);
    };
    e.if(o, (i) => {
      e.get(de) ? i(c) : e.get(le) ? i(V, 1) : e.get(F) ? i(oe, 2) : i(X, !1);
    });
  }
  e.reset(y);
  var O = e.sibling(y, 2), $ = e.child(O);
  {
    var te = (i) => {
      var n = va(), u = e.first_child(n), v = e.child(u);
      e.html(v, () => z(e.get(le))), e.reset(u);
      var m = e.sibling(u, 2);
      {
        var M = (S) => {
          var d = da(), p = e.sibling(e.child(d), 2), D = e.child(p, !0);
          e.reset(p), e.reset(d), e.template_effect(() => e.set_text(D, e.get(W))), e.append(S, d);
        };
        e.if(m, (S) => {
          e.get(W) && S(M);
        });
      }
      e.append(i, n);
    }, ce = (i) => {
      var n = ua(), u = e.child(n), v = e.child(u);
      v.textContent = "📄", e.next(2), e.reset(u), e.reset(n), e.append(i, n);
    };
    e.if($, (i) => {
      e.get(le) ? i(te) : i(ce, !1);
    });
  }
  e.reset(O);
  var ue = e.sibling(O, 2), ie = e.child(ue);
  {
    var K = (i) => {
      var n = fa(), u = e.child(n), v = e.sibling(e.child(u), 2);
      e.remove_input_defaults(v), e.reset(u);
      var m = e.sibling(u, 2);
      {
        var M = (p) => {
          var D = pa(), se = e.child(D, !0);
          e.reset(D), e.template_effect(() => e.set_text(se, e.get(T))), e.append(p, D);
        };
        e.if(m, (p) => {
          e.get(T) && p(M);
        });
      }
      var S = e.sibling(m, 2);
      S.__click = g;
      var d = e.child(S, !0);
      e.reset(S), e.reset(n), e.template_effect(
        (p, D) => {
          S.disabled = p, e.set_class(S, 1, `w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors
							${D ?? ""}`), e.set_text(d, e.get(j) ? "Scaffolding..." : "Scaffold Venture");
        },
        [
          () => e.get(j) || l() || !e.get(x).trim(),
          () => e.get(j) || l() || !e.get(x).trim() ? "bg-surface-600 text-surface-400 cursor-not-allowed" : "bg-hecate-600 text-surface-50 hover:bg-hecate-500"
        ]
      ), e.bind_value(v, () => e.get(x), (p) => e.set(x, p)), e.append(i, n);
    }, G = (i) => {
      var n = ga();
      n.textContent = "Vision is taking shape — keep exploring with the Oracle", e.append(i, n);
    }, Z = (i) => {
      var n = ha();
      e.append(i, n);
    };
    e.if(ie, (i) => {
      e.get(de) ? i(K) : e.get(le) ? i(G, 1) : i(Z, !1);
    });
  }
  e.reset(ue), e.reset(f), e.reset(N), e.bind_this(N, (i) => e.set(fe, i), () => e.get(fe)), e.template_effect(
    (i, n) => {
      e.set_style(ge, `width: ${e.get(ke) ?? ""}%`), e.set_attribute(ne, "placeholder", e.get(F) ? "Oracle is thinking..." : "Describe your venture..."), ne.disabled = e.get(F) || !a(), Y.disabled = i, e.set_class(Y, 1, `px-3 rounded-lg text-[11px] transition-colors self-end
						${n ?? ""}`), e.set_class(me, 1, `w-1 cursor-col-resize shrink-0 transition-colors
			${e.get(pe) ? "bg-hecate-500" : "bg-surface-600 hover:bg-surface-500"}`);
    },
    [
      () => e.get(F) || !e.get(H).trim() || !a(),
      () => e.get(F) || !e.get(H).trim() || !a() ? "bg-surface-600 text-surface-400 cursor-not-allowed" : "bg-hecate-600 text-surface-50 hover:bg-hecate-500"
    ]
  ), e.event("mouseleave", N, R), e.bind_value(ne, () => e.get(H), (i) => e.set(H, i)), e.append(s, N), e.pop(), P();
}
e.delegate([
  "mousemove",
  "mouseup",
  "keydown",
  "input",
  "click",
  "mousedown"
]);
var ma = e.from_html("<div></div>"), ba = e.from_html("<!> <div><span> </span> <span> </span></div>", 1), ya = e.from_html('<span class="text-[10px] text-surface-400"> </span>'), wa = e.from_html("<span> </span>"), ka = e.from_html(
  `<button title="Toggle event stream viewer">Stream</button> <button class="text-[9px] px-2 py-0.5 rounded ml-1
						text-surface-400 hover:text-health-warn hover:bg-surface-700 transition-colors" title="Shelve storm">Shelve</button>`,
  1
), $a = e.from_html(`<button class="flex items-center gap-1 text-[10px] px-2 py-1 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"><span> </span> <span> </span></button>`), Ca = e.from_html(`<div class="flex items-center justify-center h-full"><div class="text-center max-w-lg mx-4"><div class="text-4xl mb-4 text-es-event"></div> <h2 class="text-lg font-semibold text-surface-100 mb-3">Big Picture Event Storming</h2> <p class="text-xs text-surface-400 leading-relaxed mb-6">Discover the domain landscape by storming events onto the board.
						Start with a 10-minute high octane phase where everyone
						(including AI agents) throws domain events as fast as possible. <br/><br/> Volume over quality. The thick stacks reveal what matters.
						Natural clusters become your divisions (bounded contexts).</p> <div class="flex flex-col items-center gap-4"><button class="px-6 py-3 rounded-lg text-sm font-medium
								bg-es-event text-surface-50 hover:bg-es-event/90
								transition-colors shadow-lg shadow-es-event/20"></button> <div class="flex gap-2"></div></div></div></div>`), Sa = e.from_html(`<div class="group relative px-3 py-2 rounded text-xs
									bg-es-event/15 border border-es-event/30 text-surface-100
									hover:border-es-event/50 transition-colors"><span> </span> <span class="text-[8px] text-es-event/60 ml-1.5"> </span> <button class="absolute -top-1 -right-1 w-4 h-4 rounded-full
										bg-surface-700 border border-surface-600
										text-surface-400 hover:text-health-err
										text-[8px] flex items-center justify-center
										opacity-0 group-hover:opacity-100 transition-opacity"></button></div>`), Da = e.from_html('<div class="text-surface-500 text-xs italic">Start throwing events! Type below or ask an AI agent...</div>'), Aa = e.from_html(`<button class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"><span> </span> <span> </span></button>`), Ea = e.from_html(`<div class="flex flex-col h-full"><div class="flex-1 overflow-y-auto p-4"><div class="flex flex-wrap gap-2 content-start"><!> <!></div></div> <div class="border-t border-surface-600 p-3 shrink-0"><div class="flex gap-2 mb-2"><input placeholder="Type a domain event (past tense)... e.g., order_placed" class="flex-1 bg-surface-700 border border-es-event/30 rounded px-3 py-2
								text-xs text-surface-100 placeholder-surface-400
								focus:outline-none focus:border-es-event"/> <button>Add</button></div> <div class="flex items-center justify-between"><div class="flex gap-1.5"></div> <button class="text-[10px] px-3 py-1 rounded
								bg-surface-700 text-surface-300
								hover:text-surface-100 hover:bg-surface-600 transition-colors"></button></div></div></div>`), Pa = e.from_html('<span class="text-[8px] px-1 rounded bg-es-event/20 text-es-event"> </span>'), Ia = e.from_html(`<div draggable="true" class="group flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px]
											bg-es-event/15 border border-es-event/30 text-surface-100
											cursor-grab active:cursor-grabbing hover:border-es-event/50"><span class="flex-1 truncate"> </span> <!></div>`), Ma = e.from_html(`<div class="group flex items-center gap-1 px-2 py-1 rounded text-[10px]
														bg-es-event/10 text-surface-200"><span class="flex-1 truncate"> </span> <button class="text-[8px] text-surface-500 hover:text-surface-300
															opacity-0 group-hover:opacity-100" title="Unstack"></button></div>`), La = e.from_html('<div><div class="flex items-center gap-2 mb-2"><span class="text-[10px] font-bold text-es-event"> </span> <span class="text-[9px] text-surface-500 font-mono"> </span></div> <div class="space-y-1"></div></div>'), Va = e.from_html(`<div class="col-span-2 text-center py-8 text-surface-500 text-xs
											border border-dashed border-surface-600 rounded-lg">Drag stickies onto each other to create stacks.</div>`), Fa = e.from_html(`<button class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"><span> </span> <span> </span></button>`), Ta = e.from_html(`<div class="flex flex-col h-full"><div class="flex-1 overflow-y-auto p-4"><p class="text-xs text-surface-400 mb-3">Drag duplicate or related stickies onto each other to form stacks.
						Thick stacks reveal what matters most.</p> <div class="flex gap-4"><div class="w-64 shrink-0"><h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider"> </h3> <div class="space-y-1 min-h-[200px] rounded-lg border border-dashed border-surface-600 p-2"></div></div> <div class="flex-1"><h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider"> </h3> <div class="grid grid-cols-2 gap-3"><!> <!></div></div></div></div> <div class="border-t border-surface-600 p-3 shrink-0"><div class="flex items-center justify-between"><div class="flex gap-1.5"></div> <button class="text-[10px] px-3 py-1 rounded transition-colors
								bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30"></button></div></div></div>`), Na = e.from_html('<button><span></span> <span class="flex-1"> </span> <span class="text-[8px] text-surface-400"> </span></button>'), Ra = e.from_html('<div class="rounded-lg border border-surface-600 bg-surface-800 p-4"><div class="flex items-center gap-2 mb-3"><span class="text-xs font-semibold text-surface-200"> </span> <div class="flex-1"></div> <button></button></div> <div class="space-y-1.5"></div></div>'), Oa = e.from_html('<div class="space-y-4 mb-6"></div>'), Ba = e.from_html(`<div class="text-center py-8 text-surface-500 text-xs
									border border-dashed border-surface-600 rounded-lg mb-6">No stacks to groom. All stickies are unique.</div>`), ja = e.from_html('<span class="text-[8px] text-es-event ml-1"> </span>'), Ha = e.from_html(`<span class="text-[10px] px-2 py-1 rounded
												bg-es-event/10 text-surface-200"> <!></span>`), Wa = e.from_html('<div><h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider"> </h3> <div class="flex flex-wrap gap-1.5"></div></div>'), za = e.from_html(`<div class="flex flex-col h-full"><div class="flex-1 overflow-y-auto p-4"><div class="max-w-2xl mx-auto"><p class="text-xs text-surface-400 mb-4">For each stack, select the best representative sticky. The winner
							gets the stack's weight (vote count). Other stickies are absorbed.</p> <!> <!></div></div> <div class="border-t border-surface-600 p-3 shrink-0"><div class="flex items-center justify-end"><button class="text-[10px] px-3 py-1 rounded transition-colors
								bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30"></button></div></div></div>`), Ga = e.from_html('<span class="text-[8px] px-1 rounded bg-es-event/20 text-es-event"> </span>'), Ua = e.from_html(`<div draggable="true" class="group flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px]
											bg-es-event/15 border border-es-event/30 text-surface-100
											cursor-grab active:cursor-grabbing hover:border-es-event/50"><span class="flex-1 truncate"> </span> <!></div>`), qa = e.from_html('<div class="text-[10px] text-surface-500 text-center py-4 italic">All events clustered</div>'), Ya = e.from_html('<span class="text-[8px] text-es-event/60"> </span>'), Ka = e.from_html(`<div draggable="true" class="group flex items-center gap-1 px-2 py-1 rounded text-[10px]
														bg-es-event/10 text-surface-200
														cursor-grab active:cursor-grabbing"><span class="flex-1 truncate"> </span> <!> <button class="text-[8px] text-surface-500 hover:text-surface-300
															opacity-0 group-hover:opacity-100" title="Remove from cluster"></button></div>`), Ja = e.from_html('<div><div class="flex items-center gap-2 mb-2"><div class="w-3 h-3 rounded-sm shrink-0"></div> <span class="flex-1 text-xs font-semibold text-surface-100 truncate"> </span> <span class="text-[9px] text-surface-400"> </span> <button class="text-[9px] text-surface-500 hover:text-health-err transition-colors" title="Dissolve cluster"></button></div> <div class="space-y-1"></div></div>'), Qa = e.from_html(`<div class="col-span-2 text-center py-8 text-surface-500 text-xs
											border border-dashed border-surface-600 rounded-lg">Drag stickies onto each other to create clusters.</div>`), Xa = e.from_html(`<button class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"><span> </span> <span> </span></button>`), Za = e.from_html(`<div class="flex flex-col h-full"><div class="flex-1 overflow-y-auto p-4"><p class="text-xs text-surface-400 mb-3">Drag related stickies onto each other to form clusters.
						Clusters become candidate divisions (bounded contexts).</p> <div class="flex gap-4"><div class="w-64 shrink-0"><h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider"> </h3> <div class="space-y-1 min-h-[200px] rounded-lg border border-dashed border-surface-600 p-2"><!> <!></div></div> <div class="flex-1"><h3 class="text-[10px] font-semibold text-surface-300 mb-2 uppercase tracking-wider"> </h3> <div class="grid grid-cols-2 gap-3"><!> <!></div></div></div></div> <div class="border-t border-surface-600 p-3 shrink-0"><div class="flex items-center justify-between"><div class="flex gap-1.5"></div> <button></button></div></div></div>`), ei = e.from_html(`<input class="flex-1 bg-surface-700 border border-surface-500 rounded px-3 py-1.5
													text-sm text-surface-100 focus:outline-none focus:border-hecate-500" placeholder="division_name (snake_case)"/>`), ti = e.from_html('<button title="Click to name"> </button>'), si = e.from_html('<span class="text-es-event/50"> </span>'), ri = e.from_html(`<span class="text-[9px] px-1.5 py-0.5 rounded
													bg-es-event/10 text-es-event/80"> <!></span>`), ai = e.from_html('<div class="rounded-lg border bg-surface-800 p-4"><div class="flex items-center gap-3 mb-2"><div class="w-4 h-4 rounded"></div> <!> <span class="text-[10px] text-surface-400"> </span></div> <div class="flex flex-wrap gap-1.5 ml-7"></div></div>'), ii = e.from_html(`<div class="flex flex-col h-full"><div class="flex-1 overflow-y-auto p-4"><div class="max-w-2xl mx-auto"><p class="text-xs text-surface-400 mb-4">Name each cluster as a bounded context (division). These become
							the divisions in your venture. Use snake_case naming.</p> <div class="space-y-3"></div></div></div> <div class="border-t border-surface-600 p-3 shrink-0"><div class="flex items-center justify-end"><button class="text-[10px] px-3 py-1 rounded
								bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30 transition-colors"></button></div></div></div>`), ni = e.from_html('<div class="px-4 py-2 rounded-lg border-2 text-xs font-semibold text-surface-100"> <span class="text-[9px] text-surface-400 ml-1"> </span></div>'), oi = e.from_html(`<div class="flex items-center gap-2 px-3 py-1.5 rounded
												bg-surface-800 border border-surface-600 text-xs"><span class="px-1.5 py-0.5 rounded text-[10px] font-medium"> </span> <span class="text-surface-400"></span> <span class="text-es-event font-mono text-[10px]"> </span> <span class="text-surface-400"></span> <span class="px-1.5 py-0.5 rounded text-[10px] font-medium"> </span> <div class="flex-1"></div> <button class="text-surface-500 hover:text-health-err text-[9px] transition-colors"></button></div>`), li = e.from_html('<div class="space-y-1.5 mb-4"></div>'), ci = e.from_html("<option> </option>"), di = e.from_html("<option> </option>"), vi = e.from_html(`<div class="rounded-lg border border-surface-600 bg-surface-800 p-4"><h4 class="text-[10px] font-semibold text-surface-300 uppercase tracking-wider mb-3">Add Integration Fact</h4> <div class="flex items-end gap-2"><div class="flex-1"><label class="text-[9px] text-surface-400 block mb-1">From (publishes)</label> <select class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1.5
												text-[10px] text-surface-100 focus:outline-none focus:border-hecate-500"><option>Select...</option><!></select></div> <div class="flex-1"><label class="text-[9px] text-surface-400 block mb-1">Fact name</label> <input placeholder="e.g., order_confirmed" class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1.5
												text-[10px] text-surface-100 placeholder-surface-400
												focus:outline-none focus:border-hecate-500"/></div> <div class="flex-1"><label class="text-[9px] text-surface-400 block mb-1">To (consumes)</label> <select class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1.5
												text-[10px] text-surface-100 focus:outline-none focus:border-hecate-500"><option>Select...</option><!></select></div> <button>Add</button></div></div>`), ui = e.from_html(`<button class="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
										text-surface-400 hover:text-hecate-300
										hover:bg-hecate-600/10 transition-colors"><span> </span> <span> </span></button>`), pi = e.from_html(`<div class="flex flex-col h-full"><div class="flex-1 overflow-y-auto p-4"><div class="max-w-3xl mx-auto"><p class="text-xs text-surface-400 mb-4">Map how divisions communicate. Each arrow represents an
							integration fact that flows from one context to another.
							This is your Context Map.</p> <div class="mb-6"><div class="flex flex-wrap gap-3 justify-center mb-4"></div> <!></div> <!></div></div> <div class="border-t border-surface-600 p-3 shrink-0"><div class="flex items-center justify-between"><div class="flex gap-2"></div> <button> </button></div></div></div>`), fi = e.from_html(`<div class="flex items-center justify-center h-full"><div class="text-center max-w-md mx-4"><div class="text-4xl mb-4 text-health-ok"></div> <h2 class="text-lg font-semibold text-surface-100 mb-2">Context Map Complete</h2> <p class="text-xs text-surface-400 mb-4"> </p> <p class="text-xs text-surface-400 mb-6">Select a division from the sidebar to begin Design-Level
						Event Storming in its DnA phase.</p> <button class="text-[10px] px-3 py-1 rounded
							text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors">Reset Board</button></div></div>`), gi = e.from_html(`<div class="flex items-center justify-center h-full"><div class="text-center max-w-md mx-4"><div class="text-4xl mb-4 text-health-warn"></div> <h2 class="text-lg font-semibold text-surface-100 mb-2">Storm Shelved</h2> <p class="text-xs text-surface-400 mb-6">This storm session has been shelved. You can resume it at any time
						to continue where you left off.</p> <button class="px-6 py-3 rounded-lg text-sm font-medium
							bg-hecate-600 text-surface-50 hover:bg-hecate-500
							transition-colors">Resume Storm</button></div></div>`), hi = e.from_html('<div class="flex flex-col h-full"><div class="border-b border-surface-600 bg-surface-800/50 px-4 py-2 shrink-0"><div class="flex items-center gap-1"><span class="text-xs text-surface-400 mr-2">Big Picture</span> <!> <div class="flex-1"></div> <!> <!> <!></div></div> <div class="flex-1 overflow-y-auto"><!></div></div>');
function Kt(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(Ge, "$activeVenture", T), a = () => e.store_get(pt, "$bigPictureEvents", T), l = () => e.store_get(St, "$eventClusters", T), J = () => e.store_get(Ot, "$factArrows", T), P = () => e.store_get(nt, "$bigPicturePhase", T), A = () => e.store_get(zs, "$bigPictureEventCount", T), E = () => e.store_get(kt, "$highOctaneRemaining", T), H = () => e.store_get(Lt, "$showEventStream", T), F = () => e.store_get(Hr, "$bigPictureAgents", T), w = () => e.store_get(Ws, "$stickyStacks", T), ee = () => e.store_get(Hs, "$unclusteredEvents", T), j = () => e.store_get(Vt, "$isLoading", T), [T, x] = e.setup_stores();
  let I = e.state(""), we = e.state(null), ke = e.state(""), pe = e.state(null), fe = e.state(null), xe = e.state(""), U = e.state(null), Te = e.state(e.proxy({}));
  function q() {
    return t()?.venture_id ?? "";
  }
  function Ie(f) {
    const y = Math.floor(f / 60), h = f % 60;
    return `${y}:${h.toString().padStart(2, "0")}`;
  }
  async function le(f) {
    f.key === "Enter" && !f.shiftKey && e.get(I).trim() && (f.preventDefault(), await Ft(q(), e.get(I)), e.set(I, ""));
  }
  async function de(f, y) {
    f.key === "Enter" && e.get(ke).trim() ? (await Qs(q(), y, e.get(ke).trim()), e.set(we, null), e.set(ke, "")) : f.key === "Escape" && e.set(we, null);
  }
  function W(f) {
    e.set(we, f.cluster_id, !0), e.set(ke, f.name ?? "", !0);
  }
  async function ve() {
    e.get(pe) && e.get(fe) && e.get(pe) !== e.get(fe) && e.get(xe).trim() && (await Xs(q(), e.get(pe), e.get(fe), e.get(xe).trim()), e.set(xe, ""));
  }
  async function Me() {
    await rr(q());
  }
  function Ae(f) {
    return a().filter((y) => y.cluster_id === f);
  }
  let g = e.derived(() => a().filter((f) => !f.stack_id));
  function C(f) {
    const y = t(), h = a(), o = l(), c = J();
    let V = f + `

---

`;
    if (y && (V += `Venture: "${y.name}"`, y.brief && (V += ` — ${y.brief}`), V += `

`), h.length > 0 && (V += `Events on the board:
`, V += h.map((oe) => `- ${oe.text}${oe.weight > 1 ? ` (x${oe.weight})` : ""}`).join(`
`), V += `

`), o.length > 0) {
      V += `Current clusters (candidate divisions):
`;
      for (const oe of o) {
        const X = h.filter((O) => O.cluster_id === oe.cluster_id);
        V += `- ${oe.name ?? "(unnamed)"}: ${X.map((O) => O.text).join(", ") || "(empty)"}
`;
      }
      V += `
`;
    }
    if (c.length > 0) {
      V += `Integration fact arrows:
`;
      for (const oe of c) {
        const X = o.find(($) => $.cluster_id === oe.from_cluster)?.name ?? "?", O = o.find(($) => $.cluster_id === oe.to_cluster)?.name ?? "?";
        V += `- ${X} → ${oe.fact_name} → ${O}
`;
      }
    }
    return V;
  }
  const re = [
    { phase: "storm", label: "Storm", icon: "⚡" },
    { phase: "stack", label: "Stack", icon: "≡" },
    { phase: "groom", label: "Groom", icon: "✂" },
    { phase: "cluster", label: "Cluster", icon: "⭐" },
    { phase: "name", label: "Name", icon: "⬡" },
    { phase: "map", label: "Map", icon: "→" },
    { phase: "promoted", label: "Done", icon: "✓" }
  ];
  e.user_effect(() => {
    const f = t();
    f && qe(f.venture_id);
  });
  var he = hi(), $e = e.child(he), k = e.child($e), R = e.sibling(e.child(k), 2);
  e.each(R, 17, () => re, e.index, (f, y, h) => {
    const o = e.derived(() => P() === e.get(y).phase), c = e.derived(() => re.findIndex((ie) => ie.phase === P()) > h);
    var V = ba(), oe = e.first_child(V);
    {
      var X = (ie) => {
        var K = ma();
        e.template_effect(() => e.set_class(K, 1, `w-6 h-px ${e.get(c) ? "bg-hecate-400/60" : "bg-surface-600"}`)), e.append(ie, K);
      };
      e.if(oe, (ie) => {
        h > 0 && ie(X);
      });
    }
    var O = e.sibling(oe, 2), $ = e.child(O), te = e.child($, !0);
    e.reset($);
    var ce = e.sibling($, 2), ue = e.child(ce, !0);
    e.reset(ce), e.reset(O), e.template_effect(() => {
      e.set_class(O, 1, `flex items-center gap-1 px-2 py-1 rounded text-[10px]
						${e.get(o) ? "bg-surface-700 border border-hecate-500/40 text-hecate-300" : e.get(c) ? "text-hecate-400/60" : "text-surface-500"}`), e.set_text(te, e.get(y).icon), e.set_text(ue, e.get(y).label);
    }), e.append(f, V);
  });
  var z = e.sibling(R, 4);
  {
    var N = (f) => {
      var y = ya(), h = e.child(y);
      e.reset(y), e.template_effect(() => e.set_text(h, `${A() ?? ""} events`)), e.append(f, y);
    };
    e.if(z, (f) => {
      P() !== "ready" && P() !== "promoted" && P() !== "shelved" && f(N);
    });
  }
  var ge = e.sibling(z, 2);
  {
    var Le = (f) => {
      var y = wa(), h = e.child(y, !0);
      e.reset(y), e.template_effect(
        (o) => {
          e.set_class(y, 1, `text-sm font-bold tabular-nums ml-2
						${E() <= 60 ? "text-health-err animate-pulse" : E() <= 180 ? "text-health-warn" : "text-es-event"}`), e.set_text(h, o);
        },
        [() => Ie(E())]
      ), e.append(f, y);
    };
    e.if(ge, (f) => {
      P() === "storm" && f(Le);
    });
  }
  var L = e.sibling(ge, 2);
  {
    var ae = (f) => {
      var y = ka(), h = e.first_child(y);
      h.__click = () => Lt.update((c) => !c);
      var o = e.sibling(h, 2);
      o.__click = () => tr(q()), e.template_effect(() => e.set_class(h, 1, `text-[9px] px-2 py-0.5 rounded ml-1
						${H() ? "text-hecate-300 bg-hecate-600/20" : "text-surface-400 hover:text-surface-200 hover:bg-surface-700"} transition-colors`)), e.append(f, y);
    };
    e.if(L, (f) => {
      P() !== "ready" && P() !== "promoted" && P() !== "shelved" && f(ae);
    });
  }
  e.reset(k), e.reset($e);
  var be = e.sibling($e, 2), Ee = e.child(be);
  {
    var _e = (f) => {
      var y = Ca(), h = e.child(y), o = e.child(h);
      o.textContent = "⚡";
      var c = e.sibling(o, 6), V = e.child(c);
      V.__click = () => Gs(q()), V.textContent = "⚡ Start High Octane (10 min)";
      var oe = e.sibling(V, 2);
      e.each(oe, 5, F, e.index, (X, O) => {
        var $ = $a();
        $.__click = () => Xe(C(e.get(O).prompt), e.get(O).id);
        var te = e.child($), ce = e.child(te, !0);
        e.reset(te);
        var ue = e.sibling(te, 2), ie = e.child(ue, !0);
        e.reset(ue), e.reset($), e.template_effect(() => {
          e.set_attribute($, "title", e.get(O).description), e.set_text(ce, e.get(O).icon), e.set_text(ie, e.get(O).name);
        }), e.append(X, $);
      }), e.reset(oe), e.reset(c), e.reset(h), e.reset(y), e.append(f, y);
    }, b = (f) => {
      var y = Ea(), h = e.child(y), o = e.child(h), c = e.child(o);
      e.each(c, 1, a, (K) => K.sticky_id, (K, G) => {
        var Z = Sa(), i = e.child(Z), n = e.child(i, !0);
        e.reset(i);
        var u = e.sibling(i, 2), v = e.child(u, !0);
        e.reset(u);
        var m = e.sibling(u, 2);
        m.__click = () => Us(q(), e.get(G).sticky_id), m.textContent = "✕", e.reset(Z), e.template_effect(() => {
          e.set_text(n, e.get(G).text), e.set_text(v, e.get(G).author === "user" ? "" : e.get(G).author);
        }), e.append(K, Z);
      });
      var V = e.sibling(c, 2);
      {
        var oe = (K) => {
          var G = Da();
          e.append(K, G);
        };
        e.if(V, (K) => {
          a().length === 0 && K(oe);
        });
      }
      e.reset(o), e.reset(h);
      var X = e.sibling(h, 2), O = e.child(X), $ = e.child(O);
      e.remove_input_defaults($), $.__keydown = le;
      var te = e.sibling($, 2);
      te.__click = async () => {
        e.get(I).trim() && (await Ft(q(), e.get(I)), e.set(I, ""));
      }, e.reset(O);
      var ce = e.sibling(O, 2), ue = e.child(ce);
      e.each(ue, 5, F, e.index, (K, G) => {
        var Z = Aa();
        Z.__click = () => Xe(C(e.get(G).prompt), e.get(G).id);
        var i = e.child(Z), n = e.child(i, !0);
        e.reset(i);
        var u = e.sibling(i, 2), v = e.child(u, !0);
        e.reset(u), e.reset(Z), e.template_effect(() => {
          e.set_attribute(Z, "title", e.get(G).description), e.set_text(n, e.get(G).icon), e.set_text(v, e.get(G).role);
        }), e.append(K, Z);
      }), e.reset(ue);
      var ie = e.sibling(ue, 2);
      ie.__click = () => gt(q(), "stack"), ie.textContent = "End Storm → Stack", e.reset(ce), e.reset(X), e.reset(y), e.template_effect(
        (K, G) => {
          te.disabled = K, e.set_class(te, 1, `px-3 py-2 rounded text-xs transition-colors
								${G ?? ""}`);
        },
        [
          () => !e.get(I).trim(),
          () => e.get(I).trim() ? "bg-es-event text-surface-50 hover:bg-es-event/80" : "bg-surface-600 text-surface-400 cursor-not-allowed"
        ]
      ), e.bind_value($, () => e.get(I), (K) => e.set(I, K)), e.append(f, y);
    }, _ = (f) => {
      var y = Ta(), h = e.child(y), o = e.sibling(e.child(h), 2), c = e.child(o), V = e.child(c), oe = e.child(V);
      e.reset(V);
      var X = e.sibling(V, 2);
      e.each(X, 21, () => e.get(g), (u) => u.sticky_id, (u, v) => {
        var m = Ia(), M = e.child(m), S = e.child(M, !0);
        e.reset(M);
        var d = e.sibling(M, 2);
        {
          var p = (D) => {
            var se = Pa(), ye = e.child(se);
            e.reset(se), e.template_effect(() => e.set_text(ye, `x${e.get(v).weight ?? ""}`)), e.append(D, se);
          };
          e.if(d, (D) => {
            e.get(v).weight > 1 && D(p);
          });
        }
        e.reset(m), e.template_effect(() => e.set_text(S, e.get(v).text)), e.event("dragstart", m, () => e.set(U, e.get(v).sticky_id, !0)), e.event("dragend", m, () => e.set(U, null)), e.event("dragover", m, (D) => D.preventDefault()), e.event("drop", m, () => {
          e.get(U) && e.get(U) !== e.get(v).sticky_id && (Ut(q(), e.get(U), e.get(v).sticky_id), e.set(U, null));
        }), e.append(u, m);
      }), e.reset(X), e.reset(c);
      var O = e.sibling(c, 2), $ = e.child(O), te = e.child($);
      e.reset($);
      var ce = e.sibling($, 2), ue = e.child(ce);
      e.each(ue, 1, () => [...w().entries()], ([u, v]) => u, (u, v) => {
        var m = e.derived(() => e.to_array(e.get(v), 2));
        let M = () => e.get(m)[0], S = () => e.get(m)[1];
        var d = La(), p = e.child(d), D = e.child(p), se = e.child(D);
        e.reset(D);
        var ye = e.sibling(D, 2), Se = e.child(ye, !0);
        e.reset(ye), e.reset(p);
        var De = e.sibling(p, 2);
        e.each(De, 21, S, (Pe) => Pe.sticky_id, (Pe, Ne) => {
          var Re = Ma(), Oe = e.child(Re), We = e.child(Oe, !0);
          e.reset(Oe);
          var ze = e.sibling(Oe, 2);
          ze.__click = () => qs(q(), e.get(Ne).sticky_id), ze.textContent = "↩", e.reset(Re), e.template_effect(() => e.set_text(We, e.get(Ne).text)), e.append(Pe, Re);
        }), e.reset(De), e.reset(d), e.template_effect(
          (Pe) => {
            e.set_class(d, 1, `rounded-lg border-2 p-3 min-h-[80px] transition-colors
											${e.get(U) ? "border-dashed border-hecate-500/50 bg-hecate-600/5" : "border-surface-600 bg-surface-800"}`), e.set_text(se, `${S().length ?? ""}x`), e.set_text(Se, Pe);
          },
          [() => M().slice(0, 8)]
        ), e.event("dragover", d, (Pe) => Pe.preventDefault()), e.event("drop", d, () => {
          e.get(U) && S().length > 0 && (Ut(q(), e.get(U), S()[0].sticky_id), e.set(U, null));
        }), e.append(u, d);
      });
      var ie = e.sibling(ue, 2);
      {
        var K = (u) => {
          var v = Va();
          e.append(u, v);
        };
        e.if(ie, (u) => {
          w().size === 0 && u(K);
        });
      }
      e.reset(ce), e.reset(O), e.reset(o), e.reset(h);
      var G = e.sibling(h, 2), Z = e.child(G), i = e.child(Z);
      e.each(i, 5, () => F().slice(0, 2), e.index, (u, v) => {
        var m = Fa();
        m.__click = () => Xe(C(e.get(v).prompt), e.get(v).id);
        var M = e.child(m), S = e.child(M, !0);
        e.reset(M);
        var d = e.sibling(M, 2), p = e.child(d);
        e.reset(d), e.reset(m), e.template_effect(() => {
          e.set_text(S, e.get(v).icon), e.set_text(p, `Ask ${e.get(v).name ?? ""}`);
        }), e.append(u, m);
      }), e.reset(i);
      var n = e.sibling(i, 2);
      n.__click = () => gt(q(), "groom"), n.textContent = "Groom Stacks →", e.reset(Z), e.reset(G), e.reset(y), e.template_effect(() => {
        e.set_text(oe, `Stickies (${e.get(g).length ?? ""})`), e.set_text(te, `Stacks (${w().size ?? ""})`);
      }), e.append(f, y);
    }, B = (f) => {
      var y = za(), h = e.child(y), o = e.child(h), c = e.sibling(e.child(o), 2);
      {
        var V = (ue) => {
          var ie = Oa();
          e.each(ie, 5, () => [...w().entries()], ([K, G]) => K, (K, G) => {
            var Z = e.derived(() => e.to_array(e.get(G), 2));
            let i = () => e.get(Z)[0], n = () => e.get(Z)[1];
            const u = e.derived(() => e.get(Te)[i()]);
            var v = Ra(), m = e.child(v), M = e.child(m), S = e.child(M);
            e.reset(M);
            var d = e.sibling(M, 4);
            d.__click = () => {
              e.get(u) && Ys(q(), i(), e.get(u));
            }, d.textContent = "Groom ✂", e.reset(m);
            var p = e.sibling(m, 2);
            e.each(p, 21, n, (D) => D.sticky_id, (D, se) => {
              var ye = Na();
              ye.__click = () => e.set(Te, { ...e.get(Te), [i()]: e.get(se).sticky_id }, !0);
              var Se = e.child(ye), De = e.sibling(Se, 2), Pe = e.child(De, !0);
              e.reset(De);
              var Ne = e.sibling(De, 2), Re = e.child(Ne, !0);
              e.reset(Ne), e.reset(ye), e.template_effect(() => {
                e.set_class(ye, 1, `w-full text-left flex items-center gap-2 px-3 py-2 rounded text-[11px]
														transition-colors
														${e.get(u) === e.get(se).sticky_id ? "bg-hecate-600/20 border border-hecate-500/40 text-hecate-200" : "bg-surface-700/50 border border-transparent text-surface-200 hover:border-surface-500"}`), e.set_class(Se, 1, `w-3 h-3 rounded-full border-2 shrink-0
															${e.get(u) === e.get(se).sticky_id ? "border-hecate-400 bg-hecate-400" : "border-surface-500"}`), e.set_text(Pe, e.get(se).text), e.set_text(Re, e.get(se).author === "user" ? "" : e.get(se).author);
              }), e.append(D, ye);
            }), e.reset(p), e.reset(v), e.template_effect(() => {
              e.set_text(S, `Stack (${n().length ?? ""} stickies)`), d.disabled = !e.get(u), e.set_class(d, 1, `text-[10px] px-2 py-1 rounded transition-colors
													${e.get(u) ? "bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30" : "bg-surface-700 text-surface-500 cursor-not-allowed"}`);
            }), e.append(K, v);
          }), e.reset(ie), e.append(ue, ie);
        }, oe = (ue) => {
          var ie = Ba();
          e.append(ue, ie);
        };
        e.if(c, (ue) => {
          w().size > 0 ? ue(V) : ue(oe, !1);
        });
      }
      var X = e.sibling(c, 2);
      {
        var O = (ue) => {
          var ie = Wa(), K = e.child(ie), G = e.child(K);
          e.reset(K);
          var Z = e.sibling(K, 2);
          e.each(Z, 21, () => e.get(g), (i) => i.sticky_id, (i, n) => {
            var u = Ha(), v = e.child(u), m = e.sibling(v);
            {
              var M = (S) => {
                var d = ja(), p = e.child(d);
                e.reset(d), e.template_effect(() => e.set_text(p, `x${e.get(n).weight ?? ""}`)), e.append(S, d);
              };
              e.if(m, (S) => {
                e.get(n).weight > 1 && S(M);
              });
            }
            e.reset(u), e.template_effect(() => e.set_text(v, `${e.get(n).text ?? ""} `)), e.append(i, u);
          }), e.reset(Z), e.reset(ie), e.template_effect(() => e.set_text(G, `Standalone Stickies (${e.get(g).length ?? ""})`)), e.append(ue, ie);
        };
        e.if(X, (ue) => {
          e.get(g).length > 0 && ue(O);
        });
      }
      e.reset(o), e.reset(h);
      var $ = e.sibling(h, 2), te = e.child($), ce = e.child(te);
      ce.__click = () => gt(q(), "cluster"), ce.textContent = "Cluster Events →", e.reset(te), e.reset($), e.reset(y), e.append(f, y);
    }, Q = (f) => {
      var y = Za(), h = e.child(y), o = e.sibling(e.child(h), 2), c = e.child(o), V = e.child(c), oe = e.child(V);
      e.reset(V);
      var X = e.sibling(V, 2), O = e.child(X);
      e.each(O, 1, ee, (M) => M.sticky_id, (M, S) => {
        var d = Ua(), p = e.child(d), D = e.child(p, !0);
        e.reset(p);
        var se = e.sibling(p, 2);
        {
          var ye = (Se) => {
            var De = Ga(), Pe = e.child(De);
            e.reset(De), e.template_effect(() => e.set_text(Pe, `x${e.get(S).weight ?? ""}`)), e.append(Se, De);
          };
          e.if(se, (Se) => {
            e.get(S).weight > 1 && Se(ye);
          });
        }
        e.reset(d), e.template_effect(() => e.set_text(D, e.get(S).text)), e.event("dragstart", d, () => e.set(U, e.get(S).sticky_id, !0)), e.event("dragend", d, () => e.set(U, null)), e.event("dragover", d, (Se) => Se.preventDefault()), e.event("drop", d, () => {
          e.get(U) && e.get(U) !== e.get(S).sticky_id && (qt(q(), e.get(U), e.get(S).sticky_id), e.set(U, null));
        }), e.append(M, d);
      });
      var $ = e.sibling(O, 2);
      {
        var te = (M) => {
          var S = qa();
          e.append(M, S);
        };
        e.if($, (M) => {
          ee().length === 0 && M(te);
        });
      }
      e.reset(X), e.reset(c);
      var ce = e.sibling(c, 2), ue = e.child(ce), ie = e.child(ue);
      e.reset(ue);
      var K = e.sibling(ue, 2), G = e.child(K);
      e.each(G, 1, l, (M) => M.cluster_id, (M, S) => {
        const d = e.derived(() => Ae(e.get(S).cluster_id));
        var p = Ja(), D = e.child(p), se = e.child(D), ye = e.sibling(se, 2), Se = e.child(ye, !0);
        e.reset(ye);
        var De = e.sibling(ye, 2), Pe = e.child(De, !0);
        e.reset(De);
        var Ne = e.sibling(De, 2);
        Ne.__click = () => Js(q(), e.get(S).cluster_id), Ne.textContent = "✕", e.reset(D);
        var Re = e.sibling(D, 2);
        e.each(Re, 21, () => e.get(d), (Oe) => Oe.sticky_id, (Oe, We) => {
          var ze = Ka(), st = e.child(ze), ft = e.child(st, !0);
          e.reset(st);
          var jt = e.sibling(st, 2);
          {
            var bs = (Dt) => {
              var At = Ya(), ys = e.child(At);
              e.reset(At), e.template_effect(() => e.set_text(ys, `x${e.get(We).weight ?? ""}`)), e.append(Dt, At);
            };
            e.if(jt, (Dt) => {
              e.get(We).weight > 1 && Dt(bs);
            });
          }
          var Ht = e.sibling(jt, 2);
          Ht.__click = () => Ks(q(), e.get(We).sticky_id), Ht.textContent = "↩", e.reset(ze), e.template_effect(() => e.set_text(ft, e.get(We).text)), e.event("dragstart", ze, () => e.set(U, e.get(We).sticky_id, !0)), e.event("dragend", ze, () => e.set(U, null)), e.append(Oe, ze);
        }), e.reset(Re), e.reset(p), e.template_effect(() => {
          e.set_class(p, 1, `rounded-lg border-2 p-3 min-h-[120px] transition-colors
											${e.get(U) ? "border-dashed border-hecate-500/50 bg-hecate-600/5" : "border-surface-600 bg-surface-800"}`), e.set_style(p, `border-color: ${e.get(U) ? "" : e.get(S).color + "40"}`), e.set_style(se, `background-color: ${e.get(S).color ?? ""}`), e.set_text(Se, e.get(S).name ?? "Unnamed"), e.set_text(Pe, e.get(d).length);
        }), e.event("dragover", p, (Oe) => Oe.preventDefault()), e.event("drop", p, () => {
          e.get(U) && e.get(d).length > 0 && (qt(q(), e.get(U), e.get(d)[0].sticky_id), e.set(U, null));
        }), e.append(M, p);
      });
      var Z = e.sibling(G, 2);
      {
        var i = (M) => {
          var S = Qa();
          e.append(M, S);
        };
        e.if(Z, (M) => {
          l().length === 0 && M(i);
        });
      }
      e.reset(K), e.reset(ce), e.reset(o), e.reset(h);
      var n = e.sibling(h, 2), u = e.child(n), v = e.child(u);
      e.each(v, 5, () => F().slice(0, 2), e.index, (M, S) => {
        var d = Xa();
        d.__click = () => Xe(C(e.get(S).prompt), e.get(S).id);
        var p = e.child(d), D = e.child(p, !0);
        e.reset(p);
        var se = e.sibling(p, 2), ye = e.child(se);
        e.reset(se), e.reset(d), e.template_effect(() => {
          e.set_text(D, e.get(S).icon), e.set_text(ye, `Ask ${e.get(S).name ?? ""}`);
        }), e.append(M, d);
      }), e.reset(v);
      var m = e.sibling(v, 2);
      m.__click = () => gt(q(), "name"), m.textContent = "Name Divisions →", e.reset(u), e.reset(n), e.reset(y), e.template_effect(() => {
        e.set_text(oe, `Unclustered (${ee().length ?? ""})`), e.set_text(ie, `Clusters (${l().length ?? ""})`), m.disabled = l().length === 0, e.set_class(m, 1, `text-[10px] px-3 py-1 rounded transition-colors
								${l().length === 0 ? "bg-surface-700 text-surface-500 cursor-not-allowed" : "bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30"}`);
      }), e.append(f, y);
    }, Ce = (f) => {
      var y = ii(), h = e.child(y), o = e.child(h), c = e.sibling(e.child(o), 2);
      e.each(c, 5, l, (O) => O.cluster_id, (O, $) => {
        const te = e.derived(() => Ae(e.get($).cluster_id));
        var ce = ai(), ue = e.child(ce), ie = e.child(ue), K = e.sibling(ie, 2);
        {
          var G = (v) => {
            var m = ei();
            e.remove_input_defaults(m), m.__keydown = (M) => de(M, e.get($).cluster_id), e.event("blur", m, () => e.set(we, null)), e.bind_value(m, () => e.get(ke), (M) => e.set(ke, M)), e.append(v, m);
          }, Z = (v) => {
            var m = ti();
            m.__click = () => W(e.get($));
            var M = e.child(m, !0);
            e.reset(m), e.template_effect(() => {
              e.set_class(m, 1, `flex-1 text-left text-sm font-semibold transition-colors
													${e.get($).name ? "text-surface-100 hover:text-hecate-300" : "text-surface-400 italic hover:text-hecate-300"}`), e.set_text(M, e.get($).name ?? "Click to name...");
            }), e.append(v, m);
          };
          e.if(K, (v) => {
            e.get(we) === e.get($).cluster_id ? v(G) : v(Z, !1);
          });
        }
        var i = e.sibling(K, 2), n = e.child(i);
        e.reset(i), e.reset(ue);
        var u = e.sibling(ue, 2);
        e.each(u, 21, () => e.get(te), (v) => v.sticky_id, (v, m) => {
          var M = ri(), S = e.child(M), d = e.sibling(S);
          {
            var p = (D) => {
              var se = si(), ye = e.child(se);
              e.reset(se), e.template_effect(() => e.set_text(ye, `x${e.get(m).weight ?? ""}`)), e.append(D, se);
            };
            e.if(d, (D) => {
              e.get(m).weight > 1 && D(p);
            });
          }
          e.reset(M), e.template_effect(() => e.set_text(S, `${e.get(m).text ?? ""} `)), e.append(v, M);
        }), e.reset(u), e.reset(ce), e.template_effect(() => {
          e.set_style(ce, `border-color: ${e.get($).color ?? ""}40`), e.set_style(ie, `background-color: ${e.get($).color ?? ""}`), e.set_text(n, `${e.get(te).length ?? ""} events`);
        }), e.append(O, ce);
      }), e.reset(c), e.reset(o), e.reset(h);
      var V = e.sibling(h, 2), oe = e.child(V), X = e.child(oe);
      X.__click = () => gt(q(), "map"), X.textContent = "Map Integration Facts →", e.reset(oe), e.reset(V), e.reset(y), e.append(f, y);
    }, ne = (f) => {
      var y = pi(), h = e.child(y), o = e.child(h), c = e.sibling(e.child(o), 2), V = e.child(c);
      e.each(V, 5, l, (G) => G.cluster_id, (G, Z) => {
        var i = ni(), n = e.child(i), u = e.sibling(n), v = e.child(u);
        e.reset(u), e.reset(i), e.template_effect(
          (m) => {
            e.set_style(i, `border-color: ${e.get(Z).color ?? ""}; background-color: ${e.get(Z).color ?? ""}15`), e.set_text(n, `${e.get(Z).name ?? "Unnamed" ?? ""} `), e.set_text(v, `(${m ?? ""})`);
          },
          [() => Ae(e.get(Z).cluster_id).length]
        ), e.append(G, i);
      }), e.reset(V);
      var oe = e.sibling(V, 2);
      {
        var X = (G) => {
          var Z = li();
          e.each(Z, 5, J, (i) => i.arrow_id, (i, n) => {
            const u = e.derived(() => l().find((Pe) => Pe.cluster_id === e.get(n).from_cluster)), v = e.derived(() => l().find((Pe) => Pe.cluster_id === e.get(n).to_cluster));
            var m = oi(), M = e.child(m), S = e.child(M, !0);
            e.reset(M);
            var d = e.sibling(M, 2);
            d.textContent = "→";
            var p = e.sibling(d, 2), D = e.child(p, !0);
            e.reset(p);
            var se = e.sibling(p, 2);
            se.textContent = "→";
            var ye = e.sibling(se, 2), Se = e.child(ye, !0);
            e.reset(ye);
            var De = e.sibling(ye, 4);
            De.__click = () => Zs(q(), e.get(n).arrow_id), De.textContent = "✕", e.reset(m), e.template_effect(() => {
              e.set_style(M, `color: ${e.get(u)?.color ?? "#888" ?? ""}; background-color: ${e.get(u)?.color ?? "#888" ?? ""}15`), e.set_text(S, e.get(u)?.name ?? "?"), e.set_text(D, e.get(n).fact_name), e.set_style(ye, `color: ${e.get(v)?.color ?? "#888" ?? ""}; background-color: ${e.get(v)?.color ?? "#888" ?? ""}15`), e.set_text(Se, e.get(v)?.name ?? "?");
            }), e.append(i, m);
          }), e.reset(Z), e.append(G, Z);
        };
        e.if(oe, (G) => {
          J().length > 0 && G(X);
        });
      }
      e.reset(c);
      var O = e.sibling(c, 2);
      {
        var $ = (G) => {
          var Z = vi(), i = e.sibling(e.child(Z), 2), n = e.child(i), u = e.sibling(e.child(n), 2), v = e.child(u);
          v.value = (v.__value = null) ?? "";
          var m = e.sibling(v);
          e.each(m, 1, l, e.index, (Se, De) => {
            var Pe = ci(), Ne = e.child(Pe, !0);
            e.reset(Pe);
            var Re = {};
            e.template_effect(() => {
              e.set_text(Ne, e.get(De).name ?? "Unnamed"), Re !== (Re = e.get(De).cluster_id) && (Pe.value = (Pe.__value = e.get(De).cluster_id) ?? "");
            }), e.append(Se, Pe);
          }), e.reset(u), e.reset(n);
          var M = e.sibling(n, 2), S = e.sibling(e.child(M), 2);
          e.remove_input_defaults(S), e.reset(M);
          var d = e.sibling(M, 2), p = e.sibling(e.child(d), 2), D = e.child(p);
          D.value = (D.__value = null) ?? "";
          var se = e.sibling(D);
          e.each(se, 1, l, e.index, (Se, De) => {
            var Pe = di(), Ne = e.child(Pe, !0);
            e.reset(Pe);
            var Re = {};
            e.template_effect(() => {
              e.set_text(Ne, e.get(De).name ?? "Unnamed"), Re !== (Re = e.get(De).cluster_id) && (Pe.value = (Pe.__value = e.get(De).cluster_id) ?? "");
            }), e.append(Se, Pe);
          }), e.reset(p), e.reset(d);
          var ye = e.sibling(d, 2);
          ye.__click = ve, e.reset(i), e.reset(Z), e.template_effect(
            (Se, De) => {
              ye.disabled = Se, e.set_class(ye, 1, `px-3 py-1.5 rounded text-[10px] transition-colors shrink-0
											${De ?? ""}`);
            },
            [
              () => !e.get(pe) || !e.get(fe) || e.get(pe) === e.get(fe) || !e.get(xe).trim(),
              () => e.get(pe) && e.get(fe) && e.get(pe) !== e.get(fe) && e.get(xe).trim() ? "bg-hecate-600/20 text-hecate-300 hover:bg-hecate-600/30" : "bg-surface-700 text-surface-500 cursor-not-allowed"
            ]
          ), e.bind_select_value(u, () => e.get(pe), (Se) => e.set(pe, Se)), e.bind_value(S, () => e.get(xe), (Se) => e.set(xe, Se)), e.bind_select_value(p, () => e.get(fe), (Se) => e.set(fe, Se)), e.append(G, Z);
        };
        e.if(O, (G) => {
          l().length >= 2 && G($);
        });
      }
      e.reset(o), e.reset(h);
      var te = e.sibling(h, 2), ce = e.child(te), ue = e.child(ce);
      e.each(ue, 5, () => F().slice(2), e.index, (G, Z) => {
        var i = ui();
        i.__click = () => Xe(C(e.get(Z).prompt), e.get(Z).id);
        var n = e.child(i), u = e.child(n, !0);
        e.reset(n);
        var v = e.sibling(n, 2), m = e.child(v);
        e.reset(v), e.reset(i), e.template_effect(() => {
          e.set_text(u, e.get(Z).icon), e.set_text(m, `Ask ${e.get(Z).name ?? ""}`);
        }), e.append(G, i);
      }), e.reset(ue);
      var ie = e.sibling(ue, 2);
      ie.__click = Me;
      var K = e.child(ie, !0);
      e.reset(ie), e.reset(ce), e.reset(te), e.reset(y), e.template_effect(() => {
        ie.disabled = j(), e.set_class(ie, 1, `text-[10px] px-4 py-1.5 rounded font-medium transition-colors
								${j() ? "bg-surface-700 text-surface-500 cursor-not-allowed" : "bg-hecate-600 text-surface-50 hover:bg-hecate-500"}`), e.set_text(K, j() ? "Promoting..." : "Promote to Divisions");
      }), e.append(f, y);
    }, Y = (f) => {
      var y = fi(), h = e.child(y), o = e.child(h);
      o.textContent = "✓";
      var c = e.sibling(o, 4), V = e.child(c);
      e.reset(c);
      var oe = e.sibling(c, 4);
      oe.__click = function(...X) {
        ar?.apply(this, X);
      }, e.reset(h), e.reset(y), e.template_effect(() => e.set_text(V, `${l().length ?? ""} divisions identified from
						${A() ?? ""} domain events, with
						${J().length ?? ""} integration fact${J().length !== 1 ? "s" : ""} mapped.`)), e.append(f, y);
    }, me = (f) => {
      var y = gi(), h = e.child(y), o = e.child(h);
      o.textContent = "⏸";
      var c = e.sibling(o, 6);
      c.__click = () => sr(q()), e.reset(h), e.reset(y), e.append(f, y);
    };
    e.if(Ee, (f) => {
      P() === "ready" ? f(_e) : P() === "storm" ? f(b, 1) : P() === "stack" ? f(_, 2) : P() === "groom" ? f(B, 3) : P() === "cluster" ? f(Q, 4) : P() === "name" ? f(Ce, 5) : P() === "map" ? f(ne, 6) : P() === "promoted" ? f(Y, 7) : P() === "shelved" && f(me, 8);
    });
  }
  e.reset(be), e.reset(he), e.append(s, he), e.pop(), x();
}
e.delegate(["click", "keydown"]);
const Qe = Fe([]), _s = Fe(null), _i = et(Qe, (s) => {
  const r = /* @__PURE__ */ new Set();
  for (const t of s)
    t.aggregate && r.add(t.aggregate);
  return Array.from(r).sort();
}), xi = et(Qe, (s) => {
  const r = /* @__PURE__ */ new Map(), t = [];
  for (const a of s)
    if (a.aggregate) {
      const l = r.get(a.aggregate) || [];
      l.push(a), r.set(a.aggregate, l);
    } else
      t.push(a);
  return { grouped: r, ungrouped: t };
});
function mi(s, r, t = "human") {
  const a = crypto.randomUUID(), l = {
    id: a,
    name: s.trim(),
    aggregate: r?.trim() || void 0,
    execution: t,
    policies: [],
    events: []
  };
  return Qe.update((J) => [...J, l]), a;
}
function bi(s) {
  Qe.update((r) => r.filter((t) => t.id !== s));
}
function yi(s, r) {
  Qe.update(
    (t) => t.map((a) => a.id === s ? { ...a, ...r } : a)
  );
}
function wi(s, r) {
  Qe.update(
    (t) => t.map((a) => a.id === s ? { ...a, execution: r } : a)
  );
}
function ki(s, r) {
  const t = { id: crypto.randomUUID(), text: r.trim() };
  Qe.update(
    (a) => a.map(
      (l) => l.id === s ? { ...l, policies: [...l.policies, t] } : l
    )
  );
}
function $i(s, r) {
  Qe.update(
    (t) => t.map(
      (a) => a.id === s ? { ...a, policies: a.policies.filter((l) => l.id !== r) } : a
    )
  );
}
function Ci(s, r) {
  const t = { id: crypto.randomUUID(), text: r.trim() };
  Qe.update(
    (a) => a.map(
      (l) => l.id === s ? { ...l, events: [...l.events, t] } : l
    )
  );
}
function Si(s, r) {
  Qe.update(
    (t) => t.map(
      (a) => a.id === s ? { ...a, events: a.events.filter((l) => l.id !== r) } : a
    )
  );
}
async function Di(s, r) {
  try {
    return await Ve().post(`/api/divisions/${s}/design/aggregates`, r), !0;
  } catch (t) {
    const a = t;
    return _s.set(a.message || "Failed to design aggregate"), !1;
  }
}
async function Ai(s, r) {
  try {
    return await Ve().post(`/api/divisions/${s}/design/events`, r), !0;
  } catch (t) {
    const a = t;
    return _s.set(a.message || "Failed to design event"), !1;
  }
}
const Ei = Fe(null);
async function xs(s, r) {
  try {
    return await Ve().post(`/api/divisions/${s}/plan/desks`, r), !0;
  } catch (t) {
    const a = t;
    return Ei.set(a.message || "Failed to plan desk"), !1;
  }
}
var Pi = e.from_html(`<button class="text-[10px] px-2.5 py-1 rounded bg-hecate-600/20 text-hecate-300
					hover:bg-hecate-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"> </button>`), Ii = e.from_html(`<button class="text-[10px] px-2 py-1 rounded text-surface-400
					hover:text-hecate-300 hover:bg-hecate-600/10 transition-colors" title="Get AI assistance"></button>`), Mi = e.from_html('<div><div class="flex items-start gap-2"><span class="text-hecate-400 text-sm mt-0.5"> </span> <div class="flex-1 min-w-0"><div class="flex items-center gap-2"><h3 class="text-xs font-semibold text-surface-100"> </h3> <span> </span></div> <p class="text-[11px] text-surface-400 mt-1"> </p></div></div> <div class="flex items-center gap-2 mt-1"><!> <!></div></div>');
function He(s, r) {
  e.push(r, !0);
  let t = e.prop(r, "icon", 3, "■"), a = e.prop(r, "status", 3, "pending"), l = e.prop(r, "actionLabel", 3, "Execute"), J = e.prop(r, "disabled", 3, !1), P = e.derived(() => E(a()));
  function A(le) {
    switch (le) {
      case "active":
        return "border-hecate-600/40";
      case "done":
        return "border-health-ok/30";
      default:
        return "border-surface-600";
    }
  }
  function E(le) {
    switch (le) {
      case "active":
        return { text: "Active", cls: "bg-hecate-600/20 text-hecate-300" };
      case "done":
        return { text: "Done", cls: "bg-health-ok/10 text-health-ok" };
      default:
        return { text: "Pending", cls: "bg-surface-700 text-surface-400" };
    }
  }
  var H = Mi(), F = e.child(H), w = e.child(F), ee = e.child(w, !0);
  e.reset(w);
  var j = e.sibling(w, 2), T = e.child(j), x = e.child(T), I = e.child(x, !0);
  e.reset(x);
  var we = e.sibling(x, 2), ke = e.child(we, !0);
  e.reset(we), e.reset(T);
  var pe = e.sibling(T, 2), fe = e.child(pe, !0);
  e.reset(pe), e.reset(j), e.reset(F);
  var xe = e.sibling(F, 2), U = e.child(xe);
  {
    var Te = (le) => {
      var de = Pi();
      de.__click = function(...ve) {
        r.onaction?.apply(this, ve);
      };
      var W = e.child(de, !0);
      e.reset(de), e.template_effect(() => {
        de.disabled = J(), e.set_text(W, l());
      }), e.append(le, de);
    };
    e.if(U, (le) => {
      r.onaction && le(Te);
    });
  }
  var q = e.sibling(U, 2);
  {
    var Ie = (le) => {
      var de = Ii();
      de.__click = () => Xe(r.aiContext), de.textContent = "✦ AI", e.append(le, de);
    };
    e.if(q, (le) => {
      r.aiContext && le(Ie);
    });
  }
  e.reset(xe), e.reset(H), e.template_effect(
    (le) => {
      e.set_class(H, 1, `rounded-lg bg-surface-800 border ${le ?? ""} p-4 flex flex-col gap-2 transition-colors hover:border-surface-500`), e.set_text(ee, t()), e.set_text(I, r.title), e.set_class(we, 1, `text-[9px] px-1.5 py-0.5 rounded ${e.get(P).cls ?? ""}`), e.set_text(ke, e.get(P).text), e.set_text(fe, r.description);
    },
    [() => A(a())]
  ), e.append(s, H), e.pop();
}
e.delegate(["click"]);
var Li = e.from_html(`<div class="group/policy flex items-center gap-1 px-2 py-1 rounded-l rounded-r-sm
						bg-es-policy/15 border border-es-policy/30 text-[9px] text-surface-200
						max-w-[160px]"><span class="truncate flex-1"> </span> <button class="text-[7px] text-surface-500 hover:text-health-err
							opacity-0 group-hover/policy:opacity-100 transition-opacity shrink-0"></button></div>`), Vi = e.from_html(`<input class="flex-1 bg-surface-700 border border-es-command/30 rounded px-2 py-0.5
							text-xs font-semibold text-surface-100
							focus:outline-none focus:border-es-command"/>`), Fi = e.from_html(`<button class="flex-1 text-left text-xs font-semibold text-surface-100
							hover:text-es-command transition-colors" title="Double-click to rename"> </button>`), Ti = e.from_html('<span class="text-[9px] text-es-aggregate/70"> </span>'), Ni = e.from_html(`<div class="group/event flex items-center gap-1 px-2 py-1 rounded-r rounded-l-sm
						bg-es-event/15 border border-es-event/30 text-[9px] text-surface-200
						max-w-[200px]"><span class="truncate flex-1"> </span> <button class="text-[7px] text-surface-500 hover:text-health-err
							opacity-0 group-hover/event:opacity-100 transition-opacity shrink-0"></button></div>`), Ri = e.from_html(`<div class="flex items-stretch gap-0 group/card"><div class="flex flex-col items-end gap-1 -mr-2 z-10 pt-1 min-w-[100px]"><!> <input placeholder="+ policy" class="w-24 bg-transparent border border-dashed border-es-policy/20 rounded
					px-1.5 py-0.5 text-[8px] text-surface-400 placeholder-surface-500
					focus:outline-none focus:border-es-policy/40
					opacity-0 group-hover/card:opacity-100 transition-opacity"/></div> <div class="relative flex-1 rounded-lg border-2 border-es-command/40 bg-es-command/10
				px-4 py-3 min-h-[72px] z-20"><div class="flex items-center gap-2 mb-1"><button> </button> <!> <div class="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity"><button class="text-[8px] px-1.5 py-0.5 rounded text-health-ok
							hover:bg-health-ok/10 transition-colors" title="Promote to daemon"></button> <button class="text-[8px] px-1 py-0.5 rounded text-surface-500
							hover:text-health-err hover:bg-health-err/10 transition-colors" title="Remove desk"></button></div></div> <!></div> <div class="flex flex-col items-start gap-1 -ml-2 z-10 pt-1 min-w-[100px]"><!> <input placeholder="+ event" class="w-32 bg-transparent border border-dashed border-es-event/20 rounded
					px-1.5 py-0.5 text-[8px] text-surface-400 placeholder-surface-500
					focus:outline-none focus:border-es-event/40
					opacity-0 group-hover/card:opacity-100 transition-opacity"/></div></div>`), Oi = e.from_html("<option></option>"), Bi = e.from_html('<div class="space-y-2"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-sm bg-es-aggregate/40"></div> <span class="text-[10px] font-semibold text-es-aggregate uppercase tracking-wider"> </span> <div class="flex-1 h-px bg-es-aggregate/20"></div> <span class="text-[9px] text-surface-400"> </span></div> <div class="space-y-3 ml-5"></div></div>'), ji = e.from_html('<div class="flex items-center gap-2"><span class="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">No Aggregate</span> <div class="flex-1 h-px bg-surface-600"></div></div>'), Hi = e.from_html("<!> <div></div>", 1), Wi = e.from_html("<!> <!>", 1), zi = e.from_html(`<div class="text-center py-8 text-surface-500 text-xs border border-dashed border-surface-600 rounded-lg">No desk cards yet. Add your first command desk above,
			or ask an AI agent for suggestions.</div>`), Gi = e.from_html(`<button class="rounded-lg border border-surface-600 bg-surface-800/50
						p-3 text-left transition-all hover:border-hecate-500/40
						hover:bg-surface-700/50 group"><div class="flex items-center gap-2 mb-1.5"><span class="text-hecate-400 group-hover:text-hecate-300 transition-colors"> </span> <span class="text-[11px] font-semibold text-surface-100"> </span></div> <div class="text-[10px] text-surface-400 mb-1"> </div> <div class="text-[9px] text-surface-500"> </div></button>`), Ui = e.from_html(`<div class="p-4 space-y-6"><div class="flex items-center justify-between"><div><h3 class="text-sm font-semibold text-surface-100">Design-Level Event Storming</h3> <p class="text-[11px] text-surface-400 mt-0.5">Model desks as command cards with policies (left) and events (right)</p></div> <div class="text-[10px] text-surface-400"> </div></div> <div class="rounded-lg border border-es-command/20 bg-es-command/5 p-3"><div class="flex items-end gap-2"><div class="flex-1"><label class="text-[9px] text-surface-400 block mb-1">Desk Name (command)</label> <input placeholder="e.g., register_user, process_order" class="w-full bg-surface-700 border border-surface-600 rounded px-2.5 py-1.5
						text-xs text-surface-100 placeholder-surface-400
						focus:outline-none focus:border-es-command/50"/></div> <div class="w-40"><label class="text-[9px] text-surface-400 block mb-1">Aggregate</label> <input placeholder="e.g., user, order" list="existing-aggregates" class="w-full bg-surface-700 border border-surface-600 rounded px-2.5 py-1.5
						text-xs text-surface-100 placeholder-surface-400
						focus:outline-none focus:border-surface-500"/> <datalist id="existing-aggregates"></datalist></div> <div class="w-24"><label class="text-[9px] text-surface-400 block mb-1">Execution</label> <select class="w-full bg-surface-700 border border-surface-600 rounded px-2 py-1.5
						text-xs text-surface-100
						focus:outline-none focus:border-surface-500"><option>Human</option><option>Agent</option><option>Both</option></select></div> <button>+ Desk</button></div></div> <!> <div class="rounded-lg border border-hecate-600/20 bg-hecate-950/20 p-4"><div class="flex items-center gap-2 mb-3"><span class="text-hecate-400"></span> <h4 class="text-xs font-semibold text-surface-100">AI Domain Experts</h4> <span class="text-[10px] text-surface-400">Ask a virtual agent to analyze the domain and suggest desk cards</span></div> <div class="grid grid-cols-2 md:grid-cols-4 gap-2"></div></div> <div><h4 class="text-xs font-semibold text-surface-100 mb-3">Design Tasks</h4> <div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!> <!> <!> <!></div></div></div>`);
function qi(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(tt, "$selectedDivision", A), a = () => e.store_get(Qe, "$deskCards", A), l = () => e.store_get(_i, "$deskAggregates", A), J = () => e.store_get(xi, "$deskCardsByAggregate", A), P = () => e.store_get(Wr, "$designLevelAgents", A), [A, E] = e.setup_stores(), H = (o, c = e.noop) => {
    var V = Ri(), oe = e.child(V), X = e.child(oe);
    e.each(X, 17, () => c().policies, (d) => d.id, (d, p) => {
      var D = Li(), se = e.child(D), ye = e.child(se, !0);
      e.reset(se);
      var Se = e.sibling(se, 2);
      Se.__click = () => $i(c().id, e.get(p).id), Se.textContent = "✕", e.reset(D), e.template_effect(() => e.set_text(ye, e.get(p).text)), e.append(d, D);
    });
    var O = e.sibling(X, 2);
    e.remove_input_defaults(O), O.__keydown = (d) => pe(d, c().id), e.reset(oe);
    var $ = e.sibling(oe, 2), te = e.child($), ce = e.child(te);
    ce.__click = () => Te(c());
    var ue = e.child(ce, !0);
    e.reset(ce);
    var ie = e.sibling(ce, 2);
    {
      var K = (d) => {
        var p = Vi();
        e.remove_input_defaults(p), p.__keydown = (D) => {
          D.key === "Enter" && U(c().id), D.key === "Escape" && e.set(x, null);
        }, e.event("blur", p, () => U(c().id)), e.bind_value(p, () => e.get(I), (D) => e.set(I, D)), e.append(d, p);
      }, G = (d) => {
        var p = Fi();
        p.__dblclick = () => xe(c());
        var D = e.child(p, !0);
        e.reset(p), e.template_effect(() => e.set_text(D, c().name)), e.append(d, p);
      };
      e.if(ie, (d) => {
        e.get(x) === c().id ? d(K) : d(G, !1);
      });
    }
    var Z = e.sibling(ie, 2), i = e.child(Z);
    i.__click = () => de(c()), i.textContent = "↑ promote";
    var n = e.sibling(i, 2);
    n.__click = () => bi(c().id), n.textContent = "✕", e.reset(Z), e.reset(te);
    var u = e.sibling(te, 2);
    {
      var v = (d) => {
        var p = Ti(), D = e.child(p);
        e.reset(p), e.template_effect(() => e.set_text(D, `■ ${c().aggregate ?? ""}`)), e.append(d, p);
      };
      e.if(u, (d) => {
        c().aggregate && d(v);
      });
    }
    e.reset($);
    var m = e.sibling($, 2), M = e.child(m);
    e.each(M, 17, () => c().events, (d) => d.id, (d, p) => {
      var D = Ni(), se = e.child(D), ye = e.child(se, !0);
      e.reset(se);
      var Se = e.sibling(se, 2);
      Se.__click = () => Si(c().id, e.get(p).id), Se.textContent = "✕", e.reset(D), e.template_effect(() => e.set_text(ye, e.get(p).text)), e.append(d, D);
    });
    var S = e.sibling(M, 2);
    e.remove_input_defaults(S), S.__keydown = (d) => fe(d, c().id), e.reset(m), e.reset(V), e.template_effect(
      (d, p, D) => {
        e.set_class(ce, 1, `text-sm ${d ?? ""}
						hover:scale-110 transition-transform`), e.set_attribute(ce, "title", `${p ?? ""} — click to cycle`), e.set_text(ue, D);
      },
      [
        () => le(c().execution),
        () => Ie(c().execution),
        () => q(c().execution)
      ]
    ), e.bind_value(O, () => j[c().id], (d) => j[c().id] = d), e.bind_value(S, () => T[c().id], (d) => T[c().id] = d), e.append(o, V);
  };
  let F = e.state(""), w = e.state(""), ee = e.state("human"), j = e.proxy({}), T = e.proxy({}), x = e.state(null), I = e.state("");
  function we() {
    e.get(F).trim() && (mi(e.get(F), e.get(w) || void 0, e.get(ee)), e.set(F, ""), e.set(w, ""), e.set(ee, "human"));
  }
  function ke(o) {
    o.key === "Enter" && !o.shiftKey && e.get(F).trim() && (o.preventDefault(), we());
  }
  function pe(o, c) {
    o.key === "Enter" && j[c]?.trim() && (o.preventDefault(), ki(c, j[c]), j[c] = "");
  }
  function fe(o, c) {
    o.key === "Enter" && T[c]?.trim() && (o.preventDefault(), Ci(c, T[c]), T[c] = "");
  }
  function xe(o) {
    e.set(x, o.id, !0), e.set(I, o.name, !0);
  }
  function U(o) {
    e.get(I).trim() && yi(o, { name: e.get(I).trim() }), e.set(x, null);
  }
  function Te(o) {
    const c = ["human", "agent", "both"], V = c.indexOf(o.execution);
    wi(o.id, c[(V + 1) % c.length]);
  }
  function q(o) {
    switch (o) {
      case "human":
        return "𝗨";
      case // mathematical sans-serif capital U (person-like)
      "agent":
        return "⚙";
      case // gear
      "both":
      case "pair":
        return "✦";
    }
  }
  function Ie(o) {
    switch (o) {
      case "human":
        return "Interactive (human)";
      case "agent":
        return "Automated (AI agent)";
      case "both":
      case "pair":
        return "Assisted (human + AI)";
    }
  }
  function le(o) {
    switch (o) {
      case "human":
        return "text-es-command";
      case "agent":
        return "text-hecate-400";
      case "both":
      case "pair":
        return "text-phase-tni";
    }
  }
  async function de(o) {
    if (!t()) return;
    const c = t().division_id;
    await xs(c, {
      desk_name: o.name,
      description: [
        o.execution === "agent" ? "AI-automated" : o.execution === "both" ? "Human+AI assisted" : "Interactive",
        o.policies.length > 0 ? `Policies: ${o.policies.map((V) => V.text).join(", ")}` : "",
        o.events.length > 0 ? `Emits: ${o.events.map((V) => V.text).join(", ")}` : ""
      ].filter(Boolean).join(". "),
      department: "CMD"
    });
    for (const V of o.events)
      await Ai(c, {
        event_name: V.text,
        aggregate_type: o.aggregate || o.name
      });
    o.aggregate && await Di(c, { aggregate_name: o.aggregate });
  }
  function W(o) {
    const c = t()?.context_name ?? "this division", V = a(), oe = V.map((te) => te.name).join(", "), X = V.flatMap((te) => te.events.map((ce) => ce.text)).join(", "), O = V.flatMap((te) => te.policies.map((ce) => ce.text)).join(", ");
    let $ = `We are doing Design-Level Event Storming for the "${c}" division.

`;
    return $ += `Our board uses command-centric desk cards:
`, $ += `- Each card = a desk (command/slice)
`, $ += `- Left side: policies (grey) = filter/guard conditions
`, $ += `- Right side: events (orange) = what the desk emits
`, $ += `- Cards can be human (interactive), agent (AI), or both

`, oe && ($ += `Desks so far: ${oe}
`), X && ($ += `Events so far: ${X}
`), O && ($ += `Policies so far: ${O}
`), $ += `
${o.prompt}

Please analyze and suggest items for the board.`, $;
  }
  var ve = Ui(), Me = e.child(ve), Ae = e.sibling(e.child(Me), 2), g = e.child(Ae);
  e.reset(Ae), e.reset(Me);
  var C = e.sibling(Me, 2), re = e.child(C), he = e.child(re), $e = e.sibling(e.child(he), 2);
  e.remove_input_defaults($e), $e.__keydown = ke, e.reset(he);
  var k = e.sibling(he, 2), R = e.sibling(e.child(k), 2);
  e.remove_input_defaults(R);
  var z = e.sibling(R, 2);
  e.each(z, 5, l, e.index, (o, c) => {
    var V = Oi(), oe = {};
    e.template_effect(() => {
      oe !== (oe = e.get(c)) && (V.value = (V.__value = e.get(c)) ?? "");
    }), e.append(o, V);
  }), e.reset(z), e.reset(k);
  var N = e.sibling(k, 2), ge = e.sibling(e.child(N), 2), Le = e.child(ge);
  Le.value = Le.__value = "human";
  var L = e.sibling(Le);
  L.value = L.__value = "agent";
  var ae = e.sibling(L);
  ae.value = ae.__value = "both", e.reset(ge), e.reset(N);
  var be = e.sibling(N, 2);
  be.__click = we, e.reset(re), e.reset(C);
  var Ee = e.sibling(C, 2);
  {
    var _e = (o) => {
      const c = e.derived(() => {
        const { grouped: $, ungrouped: te } = J();
        return { grouped: $, ungrouped: te };
      });
      var V = Wi(), oe = e.first_child(V);
      e.each(oe, 17, () => [...e.get(c).grouped.entries()], e.index, ($, te) => {
        var ce = e.derived(() => e.to_array(e.get(te), 2));
        let ue = () => e.get(ce)[0], ie = () => e.get(ce)[1];
        var K = Bi(), G = e.child(K), Z = e.sibling(e.child(G), 2), i = e.child(Z, !0);
        e.reset(Z);
        var n = e.sibling(Z, 4), u = e.child(n);
        e.reset(n), e.reset(G);
        var v = e.sibling(G, 2);
        e.each(v, 21, ie, (m) => m.id, (m, M) => {
          H(m, () => e.get(M));
        }), e.reset(v), e.reset(K), e.template_effect(() => {
          e.set_text(i, ue()), e.set_text(u, `${ie().length ?? ""} desk${ie().length !== 1 ? "s" : ""}`);
        }), e.append($, K);
      });
      var X = e.sibling(oe, 2);
      {
        var O = ($) => {
          var te = Hi(), ce = e.first_child(te);
          {
            var ue = (K) => {
              var G = ji();
              e.append(K, G);
            };
            e.if(ce, (K) => {
              e.get(c).grouped.size > 0 && K(ue);
            });
          }
          var ie = e.sibling(ce, 2);
          e.each(ie, 21, () => e.get(c).ungrouped, (K) => K.id, (K, G) => {
            H(K, () => e.get(G));
          }), e.reset(ie), e.template_effect(() => e.set_class(ie, 1, `space-y-3 ${e.get(c).grouped.size > 0 ? "ml-5" : ""}`)), e.append($, te);
        };
        e.if(X, ($) => {
          e.get(c).ungrouped.length > 0 && $(O);
        });
      }
      e.append(o, V);
    }, b = (o) => {
      var c = zi();
      e.append(o, c);
    };
    e.if(Ee, (o) => {
      a().length > 0 ? o(_e) : o(b, !1);
    });
  }
  var _ = e.sibling(Ee, 2), B = e.child(_), Q = e.child(B);
  Q.textContent = "✦", e.next(4), e.reset(B);
  var Ce = e.sibling(B, 2);
  e.each(Ce, 5, P, e.index, (o, c) => {
    var V = Gi();
    V.__click = () => Xe(W(e.get(c)));
    var oe = e.child(V), X = e.child(oe), O = e.child(X, !0);
    e.reset(X);
    var $ = e.sibling(X, 2), te = e.child($, !0);
    e.reset($), e.reset(oe);
    var ce = e.sibling(oe, 2), ue = e.child(ce, !0);
    e.reset(ce);
    var ie = e.sibling(ce, 2), K = e.child(ie, !0);
    e.reset(ie), e.reset(V), e.template_effect(() => {
      e.set_text(O, e.get(c).icon), e.set_text(te, e.get(c).name), e.set_text(ue, e.get(c).role), e.set_text(K, e.get(c).description);
    }), e.append(o, V);
  }), e.reset(Ce), e.reset(_);
  var ne = e.sibling(_, 2), Y = e.sibling(e.child(ne), 2), me = e.child(Y);
  {
    let o = e.derived(() => `Help me design aggregates for the "${t()?.context_name}" division. What are the natural consistency boundaries? What entities accumulate history over time?`);
    He(me, {
      title: "Design Aggregates",
      description: "Identify aggregate boundaries, define stream patterns and status flags",
      icon: "■",
      get aiContext() {
        return e.get(o);
      }
    });
  }
  var f = e.sibling(me, 2);
  {
    let o = e.derived(() => `Help me define status bit flags for aggregates in the "${t()?.context_name}" division. Each aggregate needs lifecycle states as bit flags (powers of 2).`);
    He(f, {
      title: "Define Status Flags",
      description: "Design bit flag status fields for each aggregate lifecycle",
      icon: "⚑",
      get aiContext() {
        return e.get(o);
      }
    });
  }
  var y = e.sibling(f, 2);
  {
    let o = e.derived(() => `Help me identify read models for the "${t()?.context_name}" division. What queries will users run? What data views are needed?`);
    He(y, {
      title: "Map Read Models",
      description: "Identify what queries users will run and what data they need",
      icon: "▶",
      get aiContext() {
        return e.get(o);
      }
    });
  }
  var h = e.sibling(y, 2);
  {
    let o = e.derived(() => `Help me create a domain glossary for the "${t()?.context_name}" division. Define key terms, bounded context boundaries, and ubiquitous language.`);
    He(h, {
      title: "Domain Glossary",
      description: "Document ubiquitous language and bounded context definitions",
      icon: "✎",
      get aiContext() {
        return e.get(o);
      }
    });
  }
  e.reset(Y), e.reset(ne), e.reset(ve), e.template_effect(
    (o, c) => {
      e.set_text(g, `${a().length ?? ""} desk${a().length !== 1 ? "s" : ""}`), be.disabled = o, e.set_class(be, 1, `px-3 py-1.5 rounded text-xs transition-colors shrink-0
					${c ?? ""}`);
    },
    [
      () => !e.get(F).trim(),
      () => e.get(F).trim() ? "bg-es-command/20 text-es-command hover:bg-es-command/30" : "bg-surface-700 text-surface-500 cursor-not-allowed"
    ]
  ), e.bind_value($e, () => e.get(F), (o) => e.set(F, o)), e.bind_value(R, () => e.get(w), (o) => e.set(w, o)), e.bind_select_value(ge, () => e.get(ee), (o) => e.set(ee, o)), e.append(s, ve), e.pop(), E();
}
e.delegate(["click", "keydown", "dblclick"]);
var Yi = e.from_html(`<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30"><div class="flex-1"><label for="desk-name" class="text-[10px] text-surface-400 block mb-1">Desk Name</label> <input id="desk-name" placeholder="e.g., register_user" class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-anp/50"/></div> <div class="flex-1"><label for="desk-desc" class="text-[10px] text-surface-400 block mb-1">Description</label> <input id="desk-desc" placeholder="Brief purpose of this desk" class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-anp/50"/></div> <div><label for="desk-dept" class="text-[10px] text-surface-400 block mb-1">Dept</label> <select id="desk-dept" class="bg-surface-700 border border-surface-600 rounded
							px-2 py-1.5 text-xs text-surface-100
							focus:outline-none focus:border-phase-anp/50 cursor-pointer"><option>CMD</option><option>QRY</option><option>PRJ</option></select></div> <button class="px-3 py-1.5 rounded text-xs bg-phase-anp/20 text-phase-anp
						hover:bg-phase-anp/30 transition-colors disabled:opacity-50">Plan</button> <button class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100">Cancel</button></div>`), Ki = e.from_html(`<div class="p-4 space-y-6"><div><h3 class="text-sm font-semibold text-surface-100">Architecture & Planning</h3> <p class="text-[11px] text-surface-400 mt-0.5">Plan desks, map dependencies, and sequence implementation for <span class="text-surface-200"> </span></p></div> <div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4"><div class="flex items-center justify-between mb-3"><h4 class="text-xs font-semibold text-surface-100">Desk Inventory</h4> <button class="text-[10px] px-2 py-0.5 rounded bg-phase-anp/10 text-phase-anp
					hover:bg-phase-anp/20 transition-colors">+ Plan Desk</button></div> <!> <p class="text-[10px] text-surface-400">Desks are individual capabilities within a department. Each desk owns a
			vertical slice: command + event + handler + projection.</p></div> <div><h4 class="text-xs font-semibold text-surface-100 mb-3">Planning Tasks</h4> <div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!> <!> <!> <!></div></div></div>`);
function Ji(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(tt, "$selectedDivision", l), a = () => e.store_get(je, "$isLoading", l), [l, J] = e.setup_stores();
  let P = e.state(!1), A = e.state(""), E = e.state(""), H = e.state("cmd");
  async function F() {
    if (!t() || !e.get(A).trim()) return;
    await xs(t().division_id, {
      desk_name: e.get(A).trim(),
      description: e.get(E).trim() || void 0,
      department: e.get(H)
    }) && (e.set(A, ""), e.set(E, ""), e.set(P, !1));
  }
  var w = Ki(), ee = e.child(w), j = e.sibling(e.child(ee), 2), T = e.sibling(e.child(j)), x = e.child(T, !0);
  e.reset(T), e.reset(j), e.reset(ee);
  var I = e.sibling(ee, 2), we = e.child(I), ke = e.sibling(e.child(we), 2);
  ke.__click = () => e.set(P, !e.get(P)), e.reset(we);
  var pe = e.sibling(we, 2);
  {
    var fe = (de) => {
      var W = Yi(), ve = e.child(W), Me = e.sibling(e.child(ve), 2);
      e.remove_input_defaults(Me), e.reset(ve);
      var Ae = e.sibling(ve, 2), g = e.sibling(e.child(Ae), 2);
      e.remove_input_defaults(g), e.reset(Ae);
      var C = e.sibling(Ae, 2), re = e.sibling(e.child(C), 2), he = e.child(re);
      he.value = he.__value = "cmd";
      var $e = e.sibling(he);
      $e.value = $e.__value = "qry";
      var k = e.sibling($e);
      k.value = k.__value = "prj", e.reset(re), e.reset(C);
      var R = e.sibling(C, 2);
      R.__click = F;
      var z = e.sibling(R, 2);
      z.__click = () => e.set(P, !1), e.reset(W), e.template_effect((N) => R.disabled = N, [() => !e.get(A).trim() || a()]), e.bind_value(Me, () => e.get(A), (N) => e.set(A, N)), e.bind_value(g, () => e.get(E), (N) => e.set(E, N)), e.bind_select_value(re, () => e.get(H), (N) => e.set(H, N)), e.append(de, W);
    };
    e.if(pe, (de) => {
      e.get(P) && de(fe);
    });
  }
  e.next(2), e.reset(I);
  var xe = e.sibling(I, 2), U = e.sibling(e.child(xe), 2), Te = e.child(U);
  {
    let de = e.derived(() => `Help me create a desk inventory for the "${t()?.context_name}" division. Each desk is a vertical slice (command + event + handler). Organize by CMD (write), QRY (read), and PRJ (projection) departments.`);
    He(Te, {
      title: "Desk Inventory",
      description: "Create a complete inventory of desks needed for this division, organized by department (CMD, QRY, PRJ)",
      icon: "▣",
      get aiContext() {
        return e.get(de);
      }
    });
  }
  var q = e.sibling(Te, 2);
  {
    let de = e.derived(() => `Help me map dependencies between desks in the "${t()?.context_name}" division. Which desks depend on which? What's the optimal implementation order?`);
    He(q, {
      title: "Dependency Mapping",
      description: "Map dependencies between desks to determine implementation order",
      icon: "⇄",
      get aiContext() {
        return e.get(de);
      }
    });
  }
  var Ie = e.sibling(q, 2);
  {
    let de = e.derived(() => `Help me sequence the implementation of desks in the "${t()?.context_name}" division into logical sprints. Consider dependencies, walking skeleton principles, and the "initiate + archive" first rule.`);
    He(Ie, {
      title: "Sprint Sequencing",
      description: "Prioritize and sequence desks into implementation sprints",
      icon: "☰",
      get aiContext() {
        return e.get(de);
      }
    });
  }
  var le = e.sibling(Ie, 2);
  {
    let de = e.derived(() => `Help me design REST API endpoints for the "${t()?.context_name}" division. Follow the pattern: POST /api/{resource}/{action} for commands, GET /api/{resource} for queries.`);
    He(le, {
      title: "API Design",
      description: "Design REST API endpoints for each desk's capabilities",
      icon: "↔",
      get aiContext() {
        return e.get(de);
      }
    });
  }
  e.reset(U), e.reset(xe), e.reset(w), e.template_effect(() => e.set_text(x, t()?.context_name)), e.append(s, w), e.pop(), J();
}
e.delegate(["click"]);
const Qi = Fe(null);
async function Xi(s, r) {
  try {
    return await Ve().post(`/api/divisions/${s}/generate/modules`, r), !0;
  } catch (t) {
    const a = t;
    return Qi.set(a.message || "Failed to generate module"), !1;
  }
}
var Zi = e.from_html(`<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30"><div class="flex-1"><label for="mod-name" class="text-[10px] text-surface-400 block mb-1">Module Name</label> <input id="mod-name" placeholder="e.g., register_user_v1" class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-tni/50"/></div> <div class="flex-1"><label for="mod-template" class="text-[10px] text-surface-400 block mb-1">Template (optional)</label> <input id="mod-template" placeholder="e.g., command, event, handler" class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-tni/50"/></div> <button class="px-3 py-1.5 rounded text-xs bg-phase-tni/20 text-phase-tni
						hover:bg-phase-tni/30 transition-colors disabled:opacity-50">Generate</button> <button class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100">Cancel</button></div>`), en = e.from_html(`<div class="p-4 space-y-6"><div><h3 class="text-sm font-semibold text-surface-100">Testing & Implementation</h3> <p class="text-[11px] text-surface-400 mt-0.5">Generate code, execute tests, and validate acceptance criteria for <span class="text-surface-200"> </span></p></div> <div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4"><div class="flex items-center justify-between mb-3"><h4 class="text-xs font-semibold text-surface-100">Code Generation</h4> <button class="text-[10px] px-2 py-0.5 rounded bg-phase-tni/10 text-phase-tni
					hover:bg-phase-tni/20 transition-colors">+ Generate Module</button></div> <!> <p class="text-[10px] text-surface-400">Generate Erlang modules from templates based on planned desks and design
			artifacts.</p></div> <div><h4 class="text-xs font-semibold text-surface-100 mb-3">Implementation Tasks</h4> <div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!> <!> <!> <!> <!> <!></div></div></div>`);
function tn(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(tt, "$selectedDivision", l), a = () => e.store_get(je, "$isLoading", l), [l, J] = e.setup_stores();
  let P = e.state(!1), A = e.state(""), E = e.state("");
  async function H() {
    if (!t() || !e.get(A).trim()) return;
    await Xi(t().division_id, {
      module_name: e.get(A).trim(),
      template: e.get(E).trim() || void 0
    }) && (e.set(A, ""), e.set(E, ""), e.set(P, !1));
  }
  var F = en(), w = e.child(F), ee = e.sibling(e.child(w), 2), j = e.sibling(e.child(ee)), T = e.child(j, !0);
  e.reset(j), e.reset(ee), e.reset(w);
  var x = e.sibling(w, 2), I = e.child(x), we = e.sibling(e.child(I), 2);
  we.__click = () => e.set(P, !e.get(P)), e.reset(I);
  var ke = e.sibling(I, 2);
  {
    var pe = (W) => {
      var ve = Zi(), Me = e.child(ve), Ae = e.sibling(e.child(Me), 2);
      e.remove_input_defaults(Ae), e.reset(Me);
      var g = e.sibling(Me, 2), C = e.sibling(e.child(g), 2);
      e.remove_input_defaults(C), e.reset(g);
      var re = e.sibling(g, 2);
      re.__click = H;
      var he = e.sibling(re, 2);
      he.__click = () => e.set(P, !1), e.reset(ve), e.template_effect(($e) => re.disabled = $e, [() => !e.get(A).trim() || a()]), e.bind_value(Ae, () => e.get(A), ($e) => e.set(A, $e)), e.bind_value(C, () => e.get(E), ($e) => e.set(E, $e)), e.append(W, ve);
    };
    e.if(ke, (W) => {
      e.get(P) && W(pe);
    });
  }
  e.next(2), e.reset(x);
  var fe = e.sibling(x, 2), xe = e.sibling(e.child(fe), 2), U = e.child(xe);
  {
    let W = e.derived(() => `Help me implement the walking skeleton for the "${t()?.context_name}" division. We need initiate_{aggregate} and archive_{aggregate} desks first. Generate the Erlang module structure for each.`);
    He(U, {
      title: "Walking Skeleton",
      description: "Generate initiate + archive desks first, establishing the aggregate lifecycle foundation",
      icon: "⚲",
      get aiContext() {
        return e.get(W);
      }
    });
  }
  var Te = e.sibling(U, 2);
  {
    let W = e.derived(() => `Help me generate Erlang command modules for the "${t()?.context_name}" division. Each command needs: module, record, to_map/1, from_map/1. Use the evoq command pattern.`);
    He(Te, {
      title: "Generate Commands",
      description: "Create command modules from the desk inventory with proper versioning",
      icon: "▶",
      get aiContext() {
        return e.get(W);
      }
    });
  }
  var q = e.sibling(Te, 2);
  {
    let W = e.derived(() => `Help me generate Erlang event modules for the "${t()?.context_name}" division. Each event needs: module, record, to_map/1, from_map/1. Follow the event naming convention: {subject}_{verb_past}_v{N}.`);
    He(q, {
      title: "Generate Events",
      description: "Create event modules matching the designed domain events",
      icon: "◆",
      get aiContext() {
        return e.get(W);
      }
    });
  }
  var Ie = e.sibling(q, 2);
  {
    let W = e.derived(() => `Help me write EUnit tests for the "${t()?.context_name}" division. Cover aggregate behavior (execute + apply), handler dispatch, and projection state updates.`);
    He(Ie, {
      title: "Write Tests",
      description: "Generate EUnit test modules for aggregates, handlers, and projections",
      icon: "✓",
      get aiContext() {
        return e.get(W);
      }
    });
  }
  var le = e.sibling(Ie, 2);
  {
    let W = e.derived(() => `Help me analyze test results for the "${t()?.context_name}" division. What patterns should I look for? How do I ensure adequate coverage of the aggregate lifecycle?`);
    He(le, {
      title: "Run Test Suite",
      description: "Execute all tests and review results for quality gates",
      icon: "▷",
      get aiContext() {
        return e.get(W);
      }
    });
  }
  var de = e.sibling(le, 2);
  {
    let W = e.derived(() => `Help me define acceptance criteria for the "${t()?.context_name}" division. What must be true before we can say this division is implemented correctly?`);
    He(de, {
      title: "Acceptance Criteria",
      description: "Validate that implementation meets the design specifications",
      icon: "☑",
      get aiContext() {
        return e.get(W);
      }
    });
  }
  e.reset(xe), e.reset(fe), e.reset(F), e.template_effect(() => e.set_text(T, t()?.context_name)), e.append(s, F), e.pop(), J();
}
e.delegate(["click"]);
const ms = Fe(null);
async function sn(s, r) {
  try {
    return await Ve().post(`/api/divisions/${s}/deploy/releases`, { version: r }), !0;
  } catch (t) {
    const a = t;
    return ms.set(a.message || "Failed to deploy release"), !1;
  }
}
async function rn(s, r) {
  try {
    return await Ve().post(`/api/divisions/${s}/rescue/incidents`, r), !0;
  } catch (t) {
    const a = t;
    return ms.set(a.message || "Failed to raise incident"), !1;
  }
}
var an = e.from_html(`<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30"><div class="flex-1"><label for="rel-version" class="text-[10px] text-surface-400 block mb-1">Version</label> <input id="rel-version" placeholder="e.g., 0.1.0" class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-phase-dno/50"/></div> <button class="px-3 py-1.5 rounded text-xs bg-phase-dno/20 text-phase-dno
						hover:bg-phase-dno/30 transition-colors disabled:opacity-50">Deploy</button> <button class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100">Cancel</button></div>`), nn = e.from_html(`<div class="flex gap-2 items-end mb-4 p-3 rounded bg-surface-700/30"><div class="flex-1"><label for="inc-title" class="text-[10px] text-surface-400 block mb-1">Title</label> <input id="inc-title" placeholder="Brief description of the incident" class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-health-err/50"/></div> <div><label for="inc-severity" class="text-[10px] text-surface-400 block mb-1">Severity</label> <select id="inc-severity" class="bg-surface-700 border border-surface-600 rounded
							px-2 py-1.5 text-xs text-surface-100
							focus:outline-none cursor-pointer"><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div> <div class="flex-1"><label for="inc-desc" class="text-[10px] text-surface-400 block mb-1">Description</label> <input id="inc-desc" placeholder="Details about what happened" class="w-full bg-surface-700 border border-surface-600 rounded
							px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-400
							focus:outline-none focus:border-health-err/50"/></div> <button class="px-3 py-1.5 rounded text-xs bg-health-err/10 text-health-err
						hover:bg-health-err/20 transition-colors disabled:opacity-50">Raise</button> <button class="px-3 py-1.5 rounded text-xs text-surface-400 hover:text-surface-100">Cancel</button></div>`), on = e.from_html(`<div class="p-4 space-y-6"><div><h3 class="text-sm font-semibold text-surface-100">Deployment & Operations</h3> <p class="text-[11px] text-surface-400 mt-0.5">Deploy releases, monitor health, and handle incidents for <span class="text-surface-200"> </span></p></div> <div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4"><div class="flex items-center justify-between mb-3"><h4 class="text-xs font-semibold text-surface-100">Releases</h4> <button class="text-[10px] px-2 py-0.5 rounded bg-phase-dno/10 text-phase-dno
					hover:bg-phase-dno/20 transition-colors">+ Deploy Release</button></div> <!> <p class="text-[10px] text-surface-400">Deploy through GitOps: version bump, git tag, CI/CD builds, Flux
			reconciles.</p></div> <div class="rounded-lg border border-surface-600 bg-surface-800/50 p-4"><div class="flex items-center justify-between mb-3"><h4 class="text-xs font-semibold text-surface-100">Incidents</h4> <button class="text-[10px] px-2 py-0.5 rounded bg-health-err/10 text-health-err
					hover:bg-health-err/20 transition-colors">+ Raise Incident</button></div> <!></div> <div><h4 class="text-xs font-semibold text-surface-100 mb-3">Operations Tasks</h4> <div class="grid grid-cols-1 md:grid-cols-2 gap-3"><!> <!> <!> <!> <!> <!></div></div></div>`);
function ln(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(tt, "$selectedDivision", l), a = () => e.store_get(je, "$isLoading", l), [l, J] = e.setup_stores();
  let P = e.state(!1), A = e.state(!1), E = e.state(""), H = e.state(""), F = e.state("medium"), w = e.state("");
  async function ee() {
    if (!t() || !e.get(E).trim()) return;
    await sn(t().division_id, e.get(E).trim()) && (e.set(E, ""), e.set(P, !1));
  }
  async function j() {
    if (!t() || !e.get(H).trim()) return;
    await rn(t().division_id, {
      incident_title: e.get(H).trim(),
      severity: e.get(F),
      description: e.get(w).trim() || void 0
    }) && (e.set(H, ""), e.set(w, ""), e.set(A, !1));
  }
  var T = on(), x = e.child(T), I = e.sibling(e.child(x), 2), we = e.sibling(e.child(I)), ke = e.child(we, !0);
  e.reset(we), e.reset(I), e.reset(x);
  var pe = e.sibling(x, 2), fe = e.child(pe), xe = e.sibling(e.child(fe), 2);
  xe.__click = () => e.set(P, !e.get(P)), e.reset(fe);
  var U = e.sibling(fe, 2);
  {
    var Te = (k) => {
      var R = an(), z = e.child(R), N = e.sibling(e.child(z), 2);
      e.remove_input_defaults(N), e.reset(z);
      var ge = e.sibling(z, 2);
      ge.__click = ee;
      var Le = e.sibling(ge, 2);
      Le.__click = () => e.set(P, !1), e.reset(R), e.template_effect((L) => ge.disabled = L, [() => !e.get(E).trim() || a()]), e.bind_value(N, () => e.get(E), (L) => e.set(E, L)), e.append(k, R);
    };
    e.if(U, (k) => {
      e.get(P) && k(Te);
    });
  }
  e.next(2), e.reset(pe);
  var q = e.sibling(pe, 2), Ie = e.child(q), le = e.sibling(e.child(Ie), 2);
  le.__click = () => e.set(A, !e.get(A)), e.reset(Ie);
  var de = e.sibling(Ie, 2);
  {
    var W = (k) => {
      var R = nn(), z = e.child(R), N = e.sibling(e.child(z), 2);
      e.remove_input_defaults(N), e.reset(z);
      var ge = e.sibling(z, 2), Le = e.sibling(e.child(ge), 2), L = e.child(Le);
      L.value = L.__value = "critical";
      var ae = e.sibling(L);
      ae.value = ae.__value = "high";
      var be = e.sibling(ae);
      be.value = be.__value = "medium";
      var Ee = e.sibling(be);
      Ee.value = Ee.__value = "low", e.reset(Le), e.reset(ge);
      var _e = e.sibling(ge, 2), b = e.sibling(e.child(_e), 2);
      e.remove_input_defaults(b), e.reset(_e);
      var _ = e.sibling(_e, 2);
      _.__click = j;
      var B = e.sibling(_, 2);
      B.__click = () => e.set(A, !1), e.reset(R), e.template_effect((Q) => _.disabled = Q, [() => !e.get(H).trim() || a()]), e.bind_value(N, () => e.get(H), (Q) => e.set(H, Q)), e.bind_select_value(Le, () => e.get(F), (Q) => e.set(F, Q)), e.bind_value(b, () => e.get(w), (Q) => e.set(w, Q)), e.append(k, R);
    };
    e.if(de, (k) => {
      e.get(A) && k(W);
    });
  }
  e.reset(q);
  var ve = e.sibling(q, 2), Me = e.sibling(e.child(ve), 2), Ae = e.child(Me);
  {
    let k = e.derived(() => `Help me prepare a release for the "${t()?.context_name}" division. Walk me through the GitOps flow: version bump, CHANGELOG update, git tag, and CI/CD pipeline.`);
    He(Ae, {
      title: "Release Management",
      description: "Prepare release: version bump, changelog, git tag, push for CI/CD",
      icon: "🚀",
      get aiContext() {
        return e.get(k);
      }
    });
  }
  var g = e.sibling(Ae, 2);
  {
    let k = e.derived(() => `Help me plan a staged rollout for the "${t()?.context_name}" division. How should we structure canary deployments with health gates on the beam cluster?`);
    He(g, {
      title: "Staged Rollout",
      description: "Plan a staged rollout with canary deployment and health gates",
      icon: "▤",
      get aiContext() {
        return e.get(k);
      }
    });
  }
  var C = e.sibling(g, 2);
  {
    let k = e.derived(() => `Help me set up health monitoring for the "${t()?.context_name}" division. What health checks should we configure? What SLA thresholds make sense?`);
    He(C, {
      title: "Health Monitoring",
      description: "Configure health checks and SLA thresholds",
      icon: "♥",
      get aiContext() {
        return e.get(k);
      }
    });
  }
  var re = e.sibling(C, 2);
  {
    let k = e.derived(() => `Help me diagnose an incident in the "${t()?.context_name}" division. What diagnostic steps should I follow? How do I determine root cause and plan a fix?`);
    He(re, {
      title: "Incident Response",
      description: "Diagnose issues, determine root cause, plan and execute fixes",
      icon: "⚠",
      get aiContext() {
        return e.get(k);
      }
    });
  }
  var he = e.sibling(re, 2);
  {
    let k = e.derived(() => `A critical issue in the "${t()?.context_name}" division may require a design change. Help me determine if this is a bug fix (stay in DnO) or a design flaw (escalate back to DnA). The lifecycle is circular: rescue can escalate to design.`);
    He(he, {
      title: "Rescue Escalation",
      description: "When monitoring detects critical issues, escalate back to design if needed",
      icon: "↺",
      get aiContext() {
        return e.get(k);
      }
    });
  }
  var $e = e.sibling(he, 2);
  {
    let k = e.derived(() => `Help me set up observability for the "${t()?.context_name}" division. What should we log? What metrics should we track? How do we set up distributed tracing on the beam cluster?`);
    He($e, {
      title: "Observability",
      description: "Set up logging, metrics, and tracing for production visibility",
      icon: "◎",
      get aiContext() {
        return e.get(k);
      }
    });
  }
  e.reset(Me), e.reset(ve), e.reset(T), e.template_effect(() => e.set_text(ke, t()?.context_name)), e.append(s, T), e.pop(), J();
}
e.delegate(["click"]);
var cn = e.from_html("<div></div>"), dn = e.from_html('<span class="text-health-ok text-[10px]"></span>'), vn = e.from_html('<span class="text-hecate-400 text-[10px] animate-pulse"></span>'), un = e.from_html('<span class="text-health-warn text-[10px]"></span>'), pn = e.from_html('<span class="text-surface-500 text-[10px]"></span>'), fn = e.from_html("<!> <button><!> <span> </span></button>", 1), gn = e.from_html(`<button class="text-[10px] px-2 py-0.5 rounded bg-hecate-600/20 text-hecate-300
						hover:bg-hecate-600/30 transition-colors disabled:opacity-50">Start Phase</button>`), hn = e.from_html(
  `<button class="text-[10px] px-2 py-0.5 rounded text-surface-400
						hover:text-health-warn hover:bg-surface-700 transition-colors disabled:opacity-50">Pause</button> <button class="text-[10px] px-2 py-0.5 rounded text-surface-400
						hover:text-health-ok hover:bg-surface-700 transition-colors disabled:opacity-50">Complete</button>`,
  1
), _n = e.from_html(`<button class="text-[10px] px-2 py-0.5 rounded bg-health-warn/10 text-health-warn
						hover:bg-health-warn/20 transition-colors disabled:opacity-50">Resume</button>`), xn = e.from_html(`<div class="border-b border-surface-600 bg-surface-800/30 px-4 py-2 shrink-0"><div class="flex items-center gap-1"><!> <div class="flex-1"></div> <span class="text-[10px] text-surface-400 mr-2"> </span> <!> <button class="text-[10px] px-2 py-0.5 rounded text-hecate-400
					hover:bg-hecate-600/20 transition-colors ml-1" title="Open AI Assistant"></button></div></div>`);
function mn(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(tt, "$selectedDivision", J), a = () => e.store_get(vt, "$selectedPhase", J), l = () => e.store_get(Ze, "$isLoading", J), [J, P] = e.setup_stores();
  let A = e.derived(() => t() ? wt(t(), a()) : 0);
  function E(T) {
    vt.set(T);
  }
  function H(T, x) {
    switch (T) {
      case "dna":
        return "border-phase-dna text-phase-dna";
      case "anp":
        return "border-phase-anp text-phase-anp";
      case "tni":
        return "border-phase-tni text-phase-tni";
      case "dno":
        return "border-phase-dno text-phase-dno";
    }
  }
  async function F(T) {
    if (!t()) return;
    const x = t().division_id, I = a();
    switch (T) {
      case "start":
        await Ms(x, I);
        break;
      case "pause":
        await Ls(x, I);
        break;
      case "resume":
        await Vs(x, I);
        break;
      case "complete":
        await Fs(x, I);
        break;
    }
  }
  var w = e.comment(), ee = e.first_child(w);
  {
    var j = (T) => {
      var x = xn(), I = e.child(x), we = e.child(I);
      e.each(we, 17, () => at, e.index, (W, ve, Me) => {
        const Ae = e.derived(() => wt(t(), e.get(ve).code)), g = e.derived(() => a() === e.get(ve).code), C = e.derived(() => Be(e.get(Ae), mt));
        var re = fn(), he = e.first_child(re);
        {
          var $e = (_e) => {
            var b = cn();
            e.template_effect(() => e.set_class(b, 1, `w-4 h-px ${e.get(C) ? "bg-health-ok/40" : "bg-surface-600"}`)), e.append(_e, b);
          };
          e.if(he, (_e) => {
            Me > 0 && _e($e);
          });
        }
        var k = e.sibling(he, 2);
        k.__click = () => E(e.get(ve).code);
        var R = e.child(k);
        {
          var z = (_e) => {
            var b = dn();
            b.textContent = "✓", e.append(_e, b);
          }, N = (_e) => {
            var b = vn();
            b.textContent = "●", e.append(_e, b);
          }, ge = e.derived(() => Be(e.get(Ae), lt)), Le = (_e) => {
            var b = un();
            b.textContent = "◐", e.append(_e, b);
          }, L = e.derived(() => Be(e.get(Ae), ct)), ae = (_e) => {
            var b = pn();
            b.textContent = "○", e.append(_e, b);
          };
          e.if(R, (_e) => {
            e.get(C) ? _e(z) : e.get(ge) ? _e(N, 1) : e.get(L) ? _e(Le, 2) : _e(ae, !1);
          });
        }
        var be = e.sibling(R, 2), Ee = e.child(be, !0);
        e.reset(be), e.reset(k), e.template_effect(
          (_e) => {
            e.set_class(k, 1, `flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all
						border
						${_e ?? ""}`), e.set_text(Ee, e.get(ve).shortName);
          },
          [
            () => e.get(g) ? `bg-surface-700 border-current ${H(e.get(ve).code)}` : "border-transparent text-surface-400 hover:text-surface-200 hover:bg-surface-700/50"
          ]
        ), e.append(W, re);
      });
      var ke = e.sibling(we, 4), pe = e.child(ke, !0);
      e.reset(ke);
      var fe = e.sibling(ke, 2);
      {
        var xe = (W) => {
          var ve = gn();
          ve.__click = () => F("start"), e.template_effect(() => ve.disabled = l()), e.append(W, ve);
        }, U = e.derived(() => !Be(e.get(A), lt) && !Be(e.get(A), mt) && !Be(e.get(A), ct)), Te = (W) => {
          var ve = hn(), Me = e.first_child(ve);
          Me.__click = () => F("pause");
          var Ae = e.sibling(Me, 2);
          Ae.__click = () => F("complete"), e.template_effect(() => {
            Me.disabled = l(), Ae.disabled = l();
          }), e.append(W, ve);
        }, q = e.derived(() => Be(e.get(A), lt)), Ie = (W) => {
          var ve = _n();
          ve.__click = () => F("resume"), e.template_effect(() => ve.disabled = l()), e.append(W, ve);
        }, le = e.derived(() => Be(e.get(A), ct));
        e.if(fe, (W) => {
          e.get(U) ? W(xe) : e.get(q) ? W(Te, 1) : e.get(le) && W(Ie, 2);
        });
      }
      var de = e.sibling(fe, 2);
      de.__click = () => Xe(`Help with ${at.find((W) => W.code === a())?.name} phase for division "${t()?.context_name}"`), de.textContent = "✦ AI Assist", e.reset(I), e.reset(x), e.template_effect((W) => e.set_text(pe, W), [() => at.find((W) => W.code === a())?.name]), e.append(T, x);
    };
    e.if(ee, (T) => {
      t() && T(j);
    });
  }
  e.append(s, w), e.pop(), P();
}
e.delegate(["click"]);
var bn = e.from_html('<span class="text-[9px] text-surface-500"> </span>'), yn = e.from_html('<div class="flex items-center justify-center h-full"><div class="text-center text-surface-400"><div class="text-sm mb-2 animate-pulse">...</div> <div class="text-[10px]">Loading events</div></div></div>'), wn = e.from_html('<div class="flex items-center justify-center h-full"><div class="text-center text-surface-500 text-xs">Select a venture to view its event stream.</div></div>'), kn = e.from_html('<div class="flex items-center justify-center h-full"><div class="text-center text-surface-500"><div class="text-lg mb-2"></div> <div class="text-xs">No events recorded yet.</div> <div class="text-[10px] mt-1">Events will appear here as the venture progresses.</div></div></div>'), $n = e.from_html('<span class="text-[9px] px-1 py-0.5 rounded bg-surface-700 text-surface-400 shrink-0"> </span>'), Cn = e.from_html('<span class="text-[9px] text-surface-500 shrink-0 tabular-nums"> </span>'), Sn = e.from_html(`<div class="px-4 pb-3 pt-0 ml-5"><pre class="text-[10px] text-surface-300 bg-surface-800 border border-surface-600
									rounded p-3 overflow-x-auto whitespace-pre-wrap break-words
									font-mono leading-relaxed"> </pre></div>`), Dn = e.from_html(`<div class="group"><button class="w-full text-left px-4 py-2 flex items-start gap-2
								hover:bg-surface-700/30 transition-colors"><span class="text-[9px] text-surface-500 mt-0.5 shrink-0 w-3"> </span> <span> </span> <!> <!></button> <!></div>`), An = e.from_html('<div class="p-3 border-t border-surface-700/50"><button> </button></div>'), En = e.from_html('<div class="divide-y divide-surface-700/50"></div> <!>', 1), Pn = e.from_html('<div class="flex flex-col h-full"><div class="border-b border-surface-600 bg-surface-800/50 px-4 py-2 shrink-0"><div class="flex items-center gap-2"><span class="text-xs text-surface-400">Event Stream</span> <!> <div class="flex-1"></div> <button title="Refresh events"> </button></div></div> <div class="flex-1 overflow-y-auto"><!></div></div>');
function Jt(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(Bt, "$ventureRawEvents", l), a = () => e.store_get(Ge, "$activeVenture", l), [l, J] = e.setup_stores(), P = 50;
  let A = e.state(!1), E = e.state(0), H = e.state(0), F = e.state(e.proxy(/* @__PURE__ */ new Set())), w = e.derived(() => e.get(H) + P < e.get(E)), ee = e.derived(t);
  async function j(g, C = !0) {
    e.set(A, !0), C && (e.set(H, 0), e.set(F, /* @__PURE__ */ new Set(), !0));
    try {
      const re = await Gt(g, e.get(H), P);
      e.set(E, re.count, !0);
    } finally {
      e.set(A, !1);
    }
  }
  async function T() {
    const g = a();
    if (!(!g || e.get(A))) {
      e.set(H, e.get(H) + P), e.set(A, !0);
      try {
        const C = await Gt(g.venture_id, e.get(H), P);
        e.set(E, C.count, !0);
      } finally {
        e.set(A, !1);
      }
    }
  }
  function x(g) {
    const C = new Set(e.get(F));
    C.has(g) ? C.delete(g) : C.add(g), e.set(F, C, !0);
  }
  function I(g) {
    return g.startsWith("venture_") || g.startsWith("big_picture_storm_") ? "text-hecate-400" : g.startsWith("event_sticky_") ? "text-es-event" : g.startsWith("event_stack_") || g.startsWith("event_cluster_") ? "text-success-400" : g.startsWith("fact_arrow_") ? "text-sky-400" : g.startsWith("storm_phase_") ? "text-accent-400" : "text-surface-400";
  }
  function we(g) {
    if (!g) return "";
    const C = typeof g == "string" ? Number(g) || new Date(g).getTime() : g;
    if (isNaN(C)) return "";
    const re = new Date(C), $e = Date.now() - C, k = Math.floor($e / 1e3);
    if (k < 60) return `${k}s ago`;
    const R = Math.floor(k / 60);
    if (R < 60) return `${R}m ago`;
    const z = Math.floor(R / 60);
    if (z < 24) return `${z}h ago`;
    const N = Math.floor(z / 24);
    return N < 7 ? `${N}d ago` : re.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  function ke(g) {
    try {
      return JSON.stringify(g, null, 2);
    } catch {
      return String(g);
    }
  }
  e.user_effect(() => {
    const g = a();
    g && j(g.venture_id);
  });
  var pe = Pn(), fe = e.child(pe), xe = e.child(fe), U = e.sibling(e.child(xe), 2);
  {
    var Te = (g) => {
      var C = bn(), re = e.child(C);
      e.reset(C), e.template_effect(() => e.set_text(re, `${e.get(ee).length ?? ""}${e.get(E) > e.get(ee).length ? ` / ${e.get(E)}` : ""} events`)), e.append(g, C);
    };
    e.if(U, (g) => {
      e.get(ee).length > 0 && g(Te);
    });
  }
  var q = e.sibling(U, 4);
  q.__click = () => {
    const g = a();
    g && j(g.venture_id);
  };
  var Ie = e.child(q, !0);
  e.reset(q), e.reset(xe), e.reset(fe);
  var le = e.sibling(fe, 2), de = e.child(le);
  {
    var W = (g) => {
      var C = yn();
      e.append(g, C);
    }, ve = (g) => {
      var C = wn();
      e.append(g, C);
    }, Me = (g) => {
      var C = kn(), re = e.child(C), he = e.child(re);
      he.textContent = "○", e.next(4), e.reset(re), e.reset(C), e.append(g, C);
    }, Ae = (g) => {
      var C = En(), re = e.first_child(C);
      e.each(re, 21, () => e.get(ee), e.index, (k, R, z) => {
        const N = e.derived(() => e.get(F).has(z)), ge = e.derived(() => I(e.get(R).event_type));
        var Le = Dn(), L = e.child(Le);
        L.__click = () => x(z);
        var ae = e.child(L), be = e.child(ae, !0);
        e.reset(ae);
        var Ee = e.sibling(ae, 2), _e = e.child(Ee, !0);
        e.reset(Ee);
        var b = e.sibling(Ee, 2);
        {
          var _ = (Y) => {
            var me = $n(), f = e.child(me);
            e.reset(me), e.template_effect(() => e.set_text(f, `v${e.get(R).version ?? ""}`)), e.append(Y, me);
          };
          e.if(b, (Y) => {
            e.get(R).version !== void 0 && Y(_);
          });
        }
        var B = e.sibling(b, 2);
        {
          var Q = (Y) => {
            var me = Cn(), f = e.child(me, !0);
            e.reset(me), e.template_effect((y) => e.set_text(f, y), [() => we(e.get(R).timestamp)]), e.append(Y, me);
          };
          e.if(B, (Y) => {
            e.get(R).timestamp && Y(Q);
          });
        }
        e.reset(L);
        var Ce = e.sibling(L, 2);
        {
          var ne = (Y) => {
            var me = Sn(), f = e.child(me), y = e.child(f, !0);
            e.reset(f), e.reset(me), e.template_effect((h) => e.set_text(y, h), [() => ke(e.get(R).data)]), e.append(Y, me);
          };
          e.if(Ce, (Y) => {
            e.get(N) && Y(ne);
          });
        }
        e.reset(Le), e.template_effect(() => {
          e.set_text(be, e.get(N) ? "▾" : "▸"), e.set_class(Ee, 1, `text-[11px] font-mono ${e.get(ge) ?? ""} flex-1 min-w-0 truncate`), e.set_text(_e, e.get(R).event_type);
        }), e.append(k, Le);
      }), e.reset(re);
      var he = e.sibling(re, 2);
      {
        var $e = (k) => {
          var R = An(), z = e.child(R);
          z.__click = T;
          var N = e.child(z, !0);
          e.reset(z), e.reset(R), e.template_effect(() => {
            z.disabled = e.get(A), e.set_class(z, 1, `w-full text-[10px] py-1.5 rounded transition-colors
							${e.get(A) ? "bg-surface-700 text-surface-500 cursor-not-allowed" : "bg-surface-700 text-surface-300 hover:text-surface-100 hover:bg-surface-600"}`), e.set_text(N, e.get(A) ? "Loading..." : `Load More (${e.get(E) - e.get(ee).length} remaining)`);
          }), e.append(k, R);
        };
        e.if(he, (k) => {
          e.get(w) && k($e);
        });
      }
      e.append(g, C);
    };
    e.if(de, (g) => {
      e.get(A) && e.get(ee).length === 0 ? g(W) : a() ? e.get(ee).length === 0 ? g(Me, 2) : g(Ae, !1) : g(ve, 1);
    });
  }
  e.reset(le), e.reset(pe), e.template_effect(() => {
    q.disabled = e.get(A) || !a(), e.set_class(q, 1, `text-[10px] px-2 py-0.5 rounded transition-colors
					${e.get(A) || !a() ? "text-surface-500 cursor-not-allowed" : "text-surface-400 hover:text-surface-200 hover:bg-surface-700"}`), e.set_text(Ie, e.get(A) ? "Loading..." : "Refresh");
  }), e.append(s, pe), e.pop(), J();
}
e.delegate(["click"]);
var In = e.from_html(`<div class="flex justify-end"><div class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
						bg-hecate-600/20 text-surface-100 border border-hecate-600/20"> </div></div>`), Mn = e.from_html('<div class="flex justify-start"><div><div class="whitespace-pre-wrap break-words"> </div></div></div>'), Ln = e.from_html('<div class="whitespace-pre-wrap break-words"> <span class="inline-block w-1.5 h-3 bg-hecate-400 animate-pulse ml-0.5"></span></div>'), Vn = e.from_html('<div class="flex items-center gap-1.5 text-surface-400"><span class="animate-bounce" style="animation-delay: 0ms">.</span> <span class="animate-bounce" style="animation-delay: 150ms">.</span> <span class="animate-bounce" style="animation-delay: 300ms">.</span></div>'), Fn = e.from_html(`<div class="flex justify-start"><div class="max-w-[85%] rounded-lg px-3 py-2 text-[11px]
					bg-surface-700 text-surface-200 border border-surface-600"><!></div></div>`), Tn = e.from_html('<span class="text-[9px] text-phase-tni ml-1">(code-optimized)</span>'), Nn = e.from_html('<span class="text-hecate-400"> </span> <!>', 1), Rn = e.from_html('<span class="text-health-warn">No model available</span>'), On = e.from_html('<div class="flex items-center justify-center h-full"><div class="text-center text-surface-400"><div class="text-xl mb-2"></div> <div class="text-[11px]">AI Assistant ready <br/> <!></div></div></div>'), Bn = e.from_html(`<div class="w-[380px] border-l border-surface-600 bg-surface-800 flex flex-col shrink-0 overflow-hidden"><div class="flex items-center gap-2 px-3 py-2 border-b border-surface-600 shrink-0"><span class="text-hecate-400"></span> <span class="text-xs font-semibold text-surface-100">AI</span> <!> <div class="flex-1"></div> <span class="text-[9px] text-surface-400"> </span> <button class="text-surface-400 hover:text-surface-100 transition-colors px-1" title="Close AI Assistant"></button></div> <div class="flex-1 overflow-y-auto p-3 space-y-3"><!> <!> <!></div> <div class="border-t border-surface-600 p-2 shrink-0"><div class="flex gap-1.5"><textarea class="flex-1 bg-surface-700 border border-surface-600 rounded px-2.5 py-1.5
					text-[11px] text-surface-100 placeholder-surface-400 resize-none
					focus:outline-none focus:border-hecate-500
					disabled:opacity-50 disabled:cursor-not-allowed"></textarea> <button>Send</button></div></div></div>`);
function Qt(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(vt, "$selectedPhase", E), a = () => e.store_get(us, "$phaseModelPrefs", E), l = () => e.store_get(ds, "$aiModel", E), J = () => e.store_get(ls, "$aiAssistContext", E), P = () => e.store_get(Ge, "$activeVenture", E), A = () => e.store_get(tt, "$selectedDivision", E), [E, H] = e.setup_stores(), F = gs();
  let w = e.state(e.proxy([])), ee = e.state(""), j = e.state(!1), T = e.state(""), x = e.state(void 0), I = e.state(null), we = e.state(null), ke = e.derived(() => Os(t())), pe = e.derived(() => a()[t()]);
  e.user_effect(() => {
    const L = l();
    e.get(we) !== null && e.get(we) !== L && (e.get(I) && (e.get(I).cancel(), e.set(I, null)), e.set(w, [], !0), e.set(T, ""), e.set(j, !1)), e.set(we, L, !0);
  }), e.user_effect(() => {
    const L = J();
    L && e.get(w).length === 0 && xe(L);
  });
  function fe() {
    const L = [], ae = Ye(fs);
    ae && L.push(ae);
    const be = at.find((Ee) => Ee.code === t());
    if (be && L.push(`You are currently assisting with the ${be.name} phase. ${be.description}.`), P()) {
      let Ee = `Venture: "${P().name}"`;
      P().brief && (Ee += ` — ${P().brief}`), L.push(Ee);
    }
    return A() && L.push(`Division: "${A().context_name}" (bounded context)`), L.push(Ye(Gr)), L.join(`

---

`);
  }
  async function xe(L) {
    const ae = l();
    if (!ae || !L.trim() || e.get(j)) return;
    const be = { role: "user", content: L.trim() };
    e.set(w, [...e.get(w), be], !0), e.set(ee, "");
    const Ee = [], _e = fe();
    _e && Ee.push({ role: "system", content: _e }), Ee.push(...e.get(w)), e.set(j, !0), e.set(T, "");
    let b = "";
    const _ = F.stream.chat(ae, Ee);
    e.set(I, _, !0), _.onChunk((B) => {
      B.content && (b += B.content, e.set(T, b, !0));
    }).onDone(async (B) => {
      e.set(I, null), B.content && (b += B.content);
      const Q = {
        role: "assistant",
        content: b || "(empty response)"
      };
      if (e.set(w, [...e.get(w), Q], !0), e.set(T, ""), e.set(j, !1), Ye(Rt) === "oracle" && b) {
        const ne = Ye(Ge)?.venture_id;
        if (ne) {
          const Y = js(b);
          for (const me of Y)
            await Ft(ne, me, "oracle");
        }
      }
    }).onError((B) => {
      e.set(I, null);
      const Q = { role: "assistant", content: `Error: ${B}` };
      e.set(w, [...e.get(w), Q], !0), e.set(T, ""), e.set(j, !1);
    });
    try {
      await _.start();
    } catch (B) {
      const Q = { role: "assistant", content: `Error: ${String(B)}` };
      e.set(w, [...e.get(w), Q], !0), e.set(j, !1);
    }
  }
  let U = e.state(void 0);
  function Te(L) {
    L.key === "Enter" && !L.shiftKey && (L.preventDefault(), xe(e.get(ee)), e.get(U) && (e.get(U).style.height = "auto"));
  }
  function q(L) {
    const ae = L.target;
    ae.style.height = "auto", ae.style.height = Math.min(ae.scrollHeight, 120) + "px";
  }
  function Ie() {
    Bs(), e.set(w, [], !0), e.set(T, "");
  }
  e.user_effect(() => {
    e.get(w), e.get(T), Xt().then(() => {
      e.get(x) && (e.get(x).scrollTop = e.get(x).scrollHeight);
    });
  });
  var le = Bn(), de = e.child(le), W = e.child(de);
  W.textContent = "✦";
  var ve = e.sibling(W, 4);
  {
    let L = e.derived(() => at.find((ae) => ae.code === t())?.shortName ?? "");
    hs(ve, {
      get currentModel() {
        return l();
      },
      onSelect: (ae) => ps(ae),
      showPhaseInfo: !0,
      get phasePreference() {
        return e.get(pe);
      },
      get phaseAffinity() {
        return e.get(ke);
      },
      onPinModel: (ae) => zt(t(), ae),
      onClearPin: () => zt(t(), null),
      get phaseName() {
        return e.get(L);
      }
    });
  }
  var Me = e.sibling(ve, 4), Ae = e.child(Me, !0);
  e.reset(Me);
  var g = e.sibling(Me, 2);
  g.__click = Ie, g.textContent = "✕", e.reset(de);
  var C = e.sibling(de, 2), re = e.child(C);
  e.each(re, 17, () => e.get(w), e.index, (L, ae) => {
    var be = e.comment(), Ee = e.first_child(be);
    {
      var _e = (_) => {
        var B = In(), Q = e.child(B), Ce = e.child(Q, !0);
        e.reset(Q), e.reset(B), e.template_effect(() => e.set_text(Ce, e.get(ae).content)), e.append(_, B);
      }, b = (_) => {
        var B = Mn(), Q = e.child(B), Ce = e.child(Q), ne = e.child(Ce, !0);
        e.reset(Ce), e.reset(Q), e.reset(B), e.template_effect(
          (Y) => {
            e.set_class(Q, 1, `max-w-[85%] rounded-lg px-3 py-2 text-[11px]
						bg-surface-700 text-surface-200 border border-surface-600
						${Y ?? ""}`), e.set_text(ne, e.get(ae).content);
          },
          [
            () => e.get(ae).content.startsWith("Error:") ? "border-health-err/30 text-health-err" : ""
          ]
        ), e.append(_, B);
      };
      e.if(Ee, (_) => {
        e.get(ae).role === "user" ? _(_e) : e.get(ae).role === "assistant" && _(b, 1);
      });
    }
    e.append(L, be);
  });
  var he = e.sibling(re, 2);
  {
    var $e = (L) => {
      var ae = Fn(), be = e.child(ae), Ee = e.child(be);
      {
        var _e = (_) => {
          var B = Ln(), Q = e.child(B, !0);
          e.next(), e.reset(B), e.template_effect(() => e.set_text(Q, e.get(T))), e.append(_, B);
        }, b = (_) => {
          var B = Vn();
          e.append(_, B);
        };
        e.if(Ee, (_) => {
          e.get(T) ? _(_e) : _(b, !1);
        });
      }
      e.reset(be), e.reset(ae), e.append(L, ae);
    };
    e.if(he, (L) => {
      e.get(j) && L($e);
    });
  }
  var k = e.sibling(he, 2);
  {
    var R = (L) => {
      var ae = On(), be = e.child(ae), Ee = e.child(be);
      Ee.textContent = "✦";
      var _e = e.sibling(Ee, 2), b = e.sibling(e.child(_e), 3);
      {
        var _ = (Q) => {
          var Ce = Nn(), ne = e.first_child(Ce), Y = e.child(ne, !0);
          e.reset(ne);
          var me = e.sibling(ne, 2);
          {
            var f = (y) => {
              var h = Tn();
              e.append(y, h);
            };
            e.if(me, (y) => {
              e.get(ke) === "code" && y(f);
            });
          }
          e.template_effect(() => e.set_text(Y, l())), e.append(Q, Ce);
        }, B = (Q) => {
          var Ce = Rn();
          e.append(Q, Ce);
        };
        e.if(b, (Q) => {
          l() ? Q(_) : Q(B, !1);
        });
      }
      e.reset(_e), e.reset(be), e.reset(ae), e.append(L, ae);
    };
    e.if(k, (L) => {
      e.get(w).length === 0 && !e.get(j) && L(R);
    });
  }
  e.reset(C), e.bind_this(C, (L) => e.set(x, L), () => e.get(x));
  var z = e.sibling(C, 2), N = e.child(z), ge = e.child(N);
  e.remove_textarea_child(ge), ge.__keydown = Te, ge.__input = q, e.set_attribute(ge, "rows", 1), e.bind_this(ge, (L) => e.set(U, L), () => e.get(U));
  var Le = e.sibling(ge, 2);
  Le.__click = () => xe(e.get(ee)), e.reset(N), e.reset(z), e.reset(le), e.template_effect(
    (L, ae, be) => {
      e.set_text(Ae, L), e.set_attribute(ge, "placeholder", e.get(j) ? "Waiting..." : "Ask about this phase..."), ge.disabled = e.get(j) || !l(), Le.disabled = ae, e.set_class(Le, 1, `px-2.5 rounded text-[11px] transition-colors self-end
					${be ?? ""}`);
    },
    [
      () => at.find((L) => L.code === t())?.shortName ?? "",
      () => e.get(j) || !e.get(ee).trim() || !l(),
      () => e.get(j) || !e.get(ee).trim() || !l() ? "bg-surface-600 text-surface-400 cursor-not-allowed" : "bg-hecate-600 text-surface-50 hover:bg-hecate-500"
    ]
  ), e.bind_value(ge, () => e.get(ee), (L) => e.set(ee, L)), e.append(s, le), e.pop(), H();
}
e.delegate(["click", "keydown", "input"]);
var jn = e.from_html('<div class="flex items-center justify-center h-full"><div class="text-center text-surface-400"><div class="text-2xl mb-2 animate-pulse"></div> <div class="text-sm">Loading venture...</div></div></div>'), Hn = e.from_html('<div class="text-[11px] text-health-err bg-health-err/10 rounded px-3 py-2"> </div>'), Wn = e.from_html(`<div class="rounded-xl border border-hecate-600/30 bg-surface-800/80 p-5 space-y-4"><h3 class="text-xs font-medium text-hecate-300 uppercase tracking-wider">New Venture</h3> <div class="grid grid-cols-[1fr_2fr] gap-4"><div><label for="venture-name" class="text-[11px] text-surface-300 block mb-1.5">Name</label> <input id="venture-name" placeholder="e.g., my-saas-app" class="w-full bg-surface-700 border border-surface-600 rounded-lg
										px-3 py-2 text-sm text-surface-100 placeholder-surface-500
										focus:outline-none focus:border-hecate-500"/></div> <div><label for="venture-brief" class="text-[11px] text-surface-300 block mb-1.5">Brief (optional)</label> <input id="venture-brief" placeholder="What does this venture aim to achieve?" class="w-full bg-surface-700 border border-surface-600 rounded-lg
										px-3 py-2 text-sm text-surface-100 placeholder-surface-500
										focus:outline-none focus:border-hecate-500"/></div></div> <!> <div class="flex gap-3"><button> </button> <button class="px-4 py-2 rounded-lg text-xs text-hecate-400 border border-hecate-600/30
									hover:bg-hecate-600/10 transition-colors"></button></div></div>`), zn = e.from_html(`<div class="flex flex-col items-center justify-center py-20 text-center"><div class="text-4xl mb-4 text-hecate-400"></div> <h2 class="text-lg font-semibold text-surface-100 mb-2">No Ventures Yet</h2> <p class="text-xs text-surface-400 leading-relaxed max-w-sm mb-6">A venture is the umbrella for your software endeavor. It houses
							divisions (bounded contexts) and guides them through the development
							lifecycle.</p> <button class="px-5 py-2.5 rounded-lg text-sm font-medium bg-hecate-600 text-surface-50
								hover:bg-hecate-500 transition-colors">+ Create Your First Venture</button></div>`), Gn = e.from_html('<div class="text-[11px] text-surface-400 truncate mt-1.5 ml-5"> </div>'), Un = e.from_html(`<button class="group text-left p-4 rounded-xl bg-surface-800/80 border border-surface-600
												hover:border-hecate-500 hover:bg-hecate-600/5 transition-all"><div class="flex items-center gap-2"><span class="text-hecate-400 group-hover:text-hecate-300"></span> <span class="font-medium text-sm text-surface-100 truncate"> </span> <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-700 text-surface-300 border border-surface-600 shrink-0"> </span></div> <!></button>`), qn = e.from_html('<div><h3 class="text-[11px] text-surface-400 uppercase tracking-wider mb-3">Recently Updated</h3> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div></div>'), Yn = e.from_html('<div class="text-[11px] text-surface-500 truncate mt-1.5 ml-5"> </div>'), Kn = e.from_html(`<button class="group text-left p-4 rounded-xl bg-surface-800/40 border border-surface-700
													hover:border-surface-500 transition-all opacity-60 hover:opacity-80"><div class="flex items-center gap-2"><span class="text-surface-500"></span> <span class="font-medium text-sm text-surface-300 truncate"> </span> <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-700 text-surface-400 border border-surface-600 shrink-0">Archived</span></div> <!></button>`), Jn = e.from_html('<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>'), Qn = e.from_html(`<div><button class="flex items-center gap-2 text-[11px] text-surface-500 uppercase tracking-wider
										hover:text-surface-300 transition-colors mb-3"><span class="text-[9px]"> </span> <span class="text-surface-600"> </span></button> <!></div>`), Xn = e.from_html('<div class="text-[11px] text-surface-400 truncate mt-1.5 ml-5"> </div>'), Zn = e.from_html(`<button class="group text-left p-4 rounded-xl bg-surface-800/80 border border-surface-600
												hover:border-hecate-500 hover:bg-hecate-600/5 transition-all"><div class="flex items-center gap-2"><span class="text-hecate-400 group-hover:text-hecate-300"></span> <span class="font-medium text-sm text-surface-100 truncate"> </span> <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-700 text-surface-300 border border-surface-600 shrink-0"> </span></div> <!></button>`), eo = e.from_html('<div><h3 class="text-[11px] text-surface-400 uppercase tracking-wider mb-3"> </h3> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div></div>'), to = e.from_html('<div class="text-center py-12 text-surface-400 text-sm"> </div>'), so = e.from_html("<!>  <!> <!>", 1), ro = e.from_html('<div class="absolute top-0 right-0 bottom-0 z-10"><!></div>'), ao = e.from_html(
  `<div class="flex flex-col h-full overflow-hidden"><div class="border-b border-surface-600 bg-surface-800/50 px-4 py-3 shrink-0"><div class="flex items-center gap-3"><span class="text-hecate-400 text-lg"></span> <h1 class="text-sm font-semibold text-surface-100">Martha Studio</h1> <div class="flex items-center gap-1.5 text-[10px]"><span></span> <span class="text-surface-500"> </span></div> <div class="flex-1"></div> <input placeholder="Search ventures..." class="w-48 bg-surface-700 border border-surface-600 rounded-lg
							px-3 py-1.5 text-xs text-surface-100 placeholder-surface-500
							focus:outline-none focus:border-hecate-500"/> <button> </button></div></div> <div class="flex-1 overflow-y-auto p-4 space-y-6"><!> <!></div></div> <!>`,
  1
), io = e.from_html('<!> <div class="flex-1 overflow-y-auto"><!></div>', 1), no = e.from_html('<div class="w-80 border-l border-surface-600 overflow-hidden shrink-0"><!></div>'), oo = e.from_html('<div class="flex h-full"><div class="flex-1 overflow-hidden"><!></div> <!></div>'), lo = e.from_html('<div class="w-80 border-l border-surface-600 overflow-hidden shrink-0"><!></div>'), co = e.from_html('<div class="flex h-full"><div class="flex-1 overflow-hidden"><!></div> <!></div>'), vo = e.from_html('<div class="flex items-center justify-center h-full text-surface-400 text-sm">Select a division from the sidebar</div>'), uo = e.from_html('<!> <div class="absolute top-2 right-2 flex items-center gap-1.5 text-[10px] z-10"><span></span> <span class="text-surface-500"> </span></div> <div class="flex flex-1 overflow-hidden relative"><!> <div class="flex-1 flex flex-col overflow-hidden"><!></div> <!></div>', 1), po = e.from_html('<div class="flex flex-col h-full"><!></div>');
function go(s, r) {
  e.push(r, !0);
  const t = () => e.store_get(je, "$isLoading", j), a = () => e.store_get(Ge, "$activeVenture", j), l = () => e.store_get(Ke, "$ventureError", j), J = () => e.store_get(bt, "$ventures", j), P = () => e.store_get(Nt, "$showAIAssist", j), A = () => e.store_get(it, "$divisions", j), E = () => e.store_get(tt, "$selectedDivision", j), H = () => e.store_get(vt, "$selectedPhase", j), F = () => e.store_get($t, "$ventureStep", j), w = () => e.store_get(nt, "$bigPicturePhase", j), ee = () => e.store_get(Lt, "$showEventStream", j), [j, T] = e.setup_stores();
  let x = e.state(null), I = e.state("connecting"), we, ke = e.state(""), pe = e.state(""), fe = e.state(""), xe = e.state(!1), U = e.state(!1);
  function Te(g, C) {
    let re = g;
    if (C.trim()) {
      const N = C.toLowerCase();
      re = g.filter((ge) => ge.name.toLowerCase().includes(N) || ge.brief && ge.brief.toLowerCase().includes(N));
    }
    const he = [], $e = [], k = [], R = [];
    for (const N of re)
      Be(N.status, ht) ? R.push(N) : Be(N.status, Zt) || Be(N.status, es) ? $e.push(N) : N.phase === "initiated" || N.phase === "vision_refined" || N.phase === "vision_submitted" ? he.push(N) : N.phase === "discovery_completed" || N.phase === "designing" || N.phase === "planning" || N.phase === "crafting" || N.phase === "deploying" ? k.push(N) : he.push(N);
    const z = [];
    return he.length > 0 && z.push({ label: "Setup", ventures: he }), $e.length > 0 && z.push({ label: "Discovery", ventures: $e }), k.length > 0 && z.push({ label: "Building", ventures: k }), R.length > 0 && z.push({ label: "Archived", ventures: R }), z;
  }
  function q(g) {
    return g.filter((C) => !Be(C.status, ht)).sort((C, re) => (re.updated_at ?? "").localeCompare(C.updated_at ?? "")).slice(0, 5);
  }
  async function Ie() {
    try {
      e.set(x, await r.api.get("/health"), !0), e.set(I, "connected");
    } catch {
      e.set(x, null), e.set(I, "disconnected");
    }
  }
  ws(() => {
    Ss(r.api), Ie(), we = setInterval(Ie, 5e3), Je(), yt();
  }), ks(() => {
    we && clearInterval(we);
  });
  async function le() {
    if (!e.get(ke).trim()) return;
    await ss(e.get(ke).trim(), e.get(pe).trim() || "") && (e.set(ke, ""), e.set(pe, ""), e.set(xe, !1));
  }
  var de = po(), W = e.child(de);
  {
    var ve = (g) => {
      var C = jn(), re = e.child(C), he = e.child(re);
      he.textContent = "◆", e.next(2), e.reset(re), e.reset(C), e.append(g, C);
    }, Me = (g) => {
      var C = ao(), re = e.first_child(C), he = e.child(re), $e = e.child(he), k = e.child($e);
      k.textContent = "◆";
      var R = e.sibling(k, 4), z = e.child(R), N = e.sibling(z, 2), ge = e.child(N, !0);
      e.reset(N), e.reset(R);
      var Le = e.sibling(R, 4);
      e.remove_input_defaults(Le);
      var L = e.sibling(Le, 2);
      L.__click = () => e.set(xe, !e.get(xe));
      var ae = e.child(L, !0);
      e.reset(L), e.reset($e), e.reset(he);
      var be = e.sibling(he, 2), Ee = e.child(be);
      {
        var _e = (ne) => {
          var Y = Wn(), me = e.sibling(e.child(Y), 2), f = e.child(me), y = e.sibling(e.child(f), 2);
          e.remove_input_defaults(y), e.reset(f);
          var h = e.sibling(f, 2), o = e.sibling(e.child(h), 2);
          e.remove_input_defaults(o), e.reset(h), e.reset(me);
          var c = e.sibling(me, 2);
          {
            var V = (te) => {
              var ce = Hn(), ue = e.child(ce, !0);
              e.reset(ce), e.template_effect(() => e.set_text(ue, l())), e.append(te, ce);
            };
            e.if(c, (te) => {
              l() && te(V);
            });
          }
          var oe = e.sibling(c, 2), X = e.child(oe);
          X.__click = le;
          var O = e.child(X, !0);
          e.reset(X);
          var $ = e.sibling(X, 2);
          $.__click = () => Xe("Help me define a new venture. What should I consider? Ask me about the problem domain, target users, and core functionality."), $.textContent = "✦ AI Help", e.reset(oe), e.reset(Y), e.template_effect(
            (te, ce) => {
              X.disabled = te, e.set_class(X, 1, `px-4 py-2 rounded-lg text-xs font-medium transition-colors
									${ce ?? ""}`), e.set_text(O, t() ? "Initiating..." : "Initiate Venture");
            },
            [
              () => !e.get(ke).trim() || t(),
              () => !e.get(ke).trim() || t() ? "bg-surface-600 text-surface-400 cursor-not-allowed" : "bg-hecate-600 text-surface-50 hover:bg-hecate-500"
            ]
          ), e.bind_value(y, () => e.get(ke), (te) => e.set(ke, te)), e.bind_value(o, () => e.get(pe), (te) => e.set(pe, te)), e.append(ne, Y);
        };
        e.if(Ee, (ne) => {
          e.get(xe) && ne(_e);
        });
      }
      var b = e.sibling(Ee, 2);
      {
        var _ = (ne) => {
          var Y = zn(), me = e.child(Y);
          me.textContent = "◆";
          var f = e.sibling(me, 6);
          f.__click = () => e.set(xe, !0), e.reset(Y), e.append(ne, Y);
        }, B = (ne) => {
          const Y = e.derived(() => Te(J(), e.get(fe)));
          var me = so(), f = e.first_child(me);
          {
            var y = (X) => {
              const O = e.derived(() => q(J()));
              var $ = e.comment(), te = e.first_child($);
              {
                var ce = (ue) => {
                  var ie = qn(), K = e.sibling(e.child(ie), 2);
                  e.each(K, 21, () => e.get(O), e.index, (G, Z) => {
                    var i = Un();
                    i.__click = () => xt(e.get(Z));
                    var n = e.child(i), u = e.child(n);
                    u.textContent = "◆";
                    var v = e.sibling(u, 2), m = e.child(v, !0);
                    e.reset(v);
                    var M = e.sibling(v, 2), S = e.child(M, !0);
                    e.reset(M), e.reset(n);
                    var d = e.sibling(n, 2);
                    {
                      var p = (D) => {
                        var se = Gn(), ye = e.child(se, !0);
                        e.reset(se), e.template_effect(() => e.set_text(ye, e.get(Z).brief)), e.append(D, se);
                      };
                      e.if(d, (D) => {
                        e.get(Z).brief && D(p);
                      });
                    }
                    e.reset(i), e.template_effect(() => {
                      e.set_text(m, e.get(Z).name), e.set_text(S, e.get(Z).status_label ?? e.get(Z).phase);
                    }), e.append(G, i);
                  }), e.reset(K), e.reset(ie), e.append(ue, ie);
                };
                e.if(te, (ue) => {
                  e.get(O).length > 0 && ue(ce);
                });
              }
              e.append(X, $);
            }, h = e.derived(() => !e.get(fe).trim() && J().filter((X) => !Be(X.status, ht)).length > 3);
            e.if(f, (X) => {
              e.get(h) && X(y);
            });
          }
          var o = e.sibling(f, 2);
          e.each(o, 17, () => e.get(Y), e.index, (X, O) => {
            var $ = e.comment(), te = e.first_child($);
            {
              var ce = (ie) => {
                var K = Qn(), G = e.child(K);
                G.__click = () => e.set(U, !e.get(U));
                var Z = e.child(G), i = e.child(Z, !0);
                e.reset(Z);
                var n = e.sibling(Z), u = e.sibling(n), v = e.child(u);
                e.reset(u), e.reset(G);
                var m = e.sibling(G, 2);
                {
                  var M = (S) => {
                    var d = Jn();
                    e.each(d, 21, () => e.get(O).ventures, e.index, (p, D) => {
                      var se = Kn();
                      se.__click = () => xt(e.get(D));
                      var ye = e.child(se), Se = e.child(ye);
                      Se.textContent = "◆";
                      var De = e.sibling(Se, 2), Pe = e.child(De, !0);
                      e.reset(De), e.next(2), e.reset(ye);
                      var Ne = e.sibling(ye, 2);
                      {
                        var Re = (Oe) => {
                          var We = Yn(), ze = e.child(We, !0);
                          e.reset(We), e.template_effect(() => e.set_text(ze, e.get(D).brief)), e.append(Oe, We);
                        };
                        e.if(Ne, (Oe) => {
                          e.get(D).brief && Oe(Re);
                        });
                      }
                      e.reset(se), e.template_effect(() => e.set_text(Pe, e.get(D).name)), e.append(p, se);
                    }), e.reset(d), e.append(S, d);
                  };
                  e.if(m, (S) => {
                    e.get(U) && S(M);
                  });
                }
                e.reset(K), e.template_effect(() => {
                  e.set_text(i, e.get(U) ? "▼" : "▶"), e.set_text(n, ` ${e.get(O).label ?? ""} `), e.set_text(v, `(${e.get(O).ventures.length ?? ""})`);
                }), e.append(ie, K);
              }, ue = (ie) => {
                var K = eo(), G = e.child(K), Z = e.child(G, !0);
                e.reset(G);
                var i = e.sibling(G, 2);
                e.each(i, 21, () => e.get(O).ventures, e.index, (n, u) => {
                  var v = Zn();
                  v.__click = () => xt(e.get(u));
                  var m = e.child(v), M = e.child(m);
                  M.textContent = "◆";
                  var S = e.sibling(M, 2), d = e.child(S, !0);
                  e.reset(S);
                  var p = e.sibling(S, 2), D = e.child(p, !0);
                  e.reset(p), e.reset(m);
                  var se = e.sibling(m, 2);
                  {
                    var ye = (Se) => {
                      var De = Xn(), Pe = e.child(De, !0);
                      e.reset(De), e.template_effect(() => e.set_text(Pe, e.get(u).brief)), e.append(Se, De);
                    };
                    e.if(se, (Se) => {
                      e.get(u).brief && Se(ye);
                    });
                  }
                  e.reset(v), e.template_effect(() => {
                    e.set_text(d, e.get(u).name), e.set_text(D, e.get(u).status_label ?? e.get(u).phase);
                  }), e.append(n, v);
                }), e.reset(i), e.reset(K), e.template_effect(() => e.set_text(Z, e.get(O).label)), e.append(ie, K);
              };
              e.if(te, (ie) => {
                e.get(O).label === "Archived" ? ie(ce) : ie(ue, !1);
              });
            }
            e.append(X, $);
          });
          var c = e.sibling(o, 2);
          {
            var V = (X) => {
              var O = to(), $ = e.child(O);
              e.reset(O), e.template_effect(() => e.set_text($, `No ventures matching "${e.get(fe) ?? ""}"`)), e.append(X, O);
            }, oe = e.derived(() => e.get(Y).length === 0 && e.get(fe).trim());
            e.if(c, (X) => {
              e.get(oe) && X(V);
            });
          }
          e.append(ne, me);
        };
        e.if(b, (ne) => {
          J().length === 0 && !e.get(xe) ? ne(_) : ne(B, !1);
        });
      }
      e.reset(be), e.reset(re);
      var Q = e.sibling(re, 2);
      {
        var Ce = (ne) => {
          var Y = ro(), me = e.child(Y);
          Qt(me, {}), e.reset(Y), e.append(ne, Y);
        };
        e.if(Q, (ne) => {
          P() && ne(Ce);
        });
      }
      e.template_effect(() => {
        e.set_class(z, 1, `inline-block w-1.5 h-1.5 rounded-full ${e.get(I) === "connected" ? "bg-success-400" : e.get(I) === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-danger-400"}`), e.set_text(ge, e.get(I) === "connected" ? `v${e.get(x)?.version ?? "?"}` : e.get(I)), e.set_class(L, 1, `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
							${e.get(xe) ? "bg-surface-600 text-surface-300" : "bg-hecate-600 text-surface-50 hover:bg-hecate-500"}`), e.set_text(ae, e.get(xe) ? "Cancel" : "+ New Venture");
      }), e.bind_value(Le, () => e.get(fe), (ne) => e.set(fe, ne)), e.append(g, C);
    }, Ae = (g) => {
      var C = uo(), re = e.first_child(C);
      wr(re, {});
      var he = e.sibling(re, 2), $e = e.child(he), k = e.sibling($e, 2), R = e.child(k, !0);
      e.reset(k), e.reset(he);
      var z = e.sibling(he, 2), N = e.child(z);
      {
        var ge = (_) => {
          Nr(_, {});
        };
        e.if(N, (_) => {
          A().length > 0 && _(ge);
        });
      }
      var Le = e.sibling(N, 2), L = e.child(Le);
      {
        var ae = (_) => {
          var B = io(), Q = e.first_child(B);
          mn(Q, {});
          var Ce = e.sibling(Q, 2), ne = e.child(Ce);
          {
            var Y = (h) => {
              qi(h, {});
            }, me = (h) => {
              Ji(h, {});
            }, f = (h) => {
              tn(h, {});
            }, y = (h) => {
              ln(h, {});
            };
            e.if(ne, (h) => {
              H() === "dna" ? h(Y) : H() === "anp" ? h(me, 1) : H() === "tni" ? h(f, 2) : H() === "dno" && h(y, 3);
            });
          }
          e.reset(Ce), e.append(_, B);
        }, be = (_) => {
          var B = e.comment(), Q = e.first_child(B);
          {
            var Ce = (h) => {
              var o = oo(), c = e.child(o), V = e.child(c);
              Kt(V, {}), e.reset(c);
              var oe = e.sibling(c, 2);
              {
                var X = (O) => {
                  var $ = no(), te = e.child($);
                  Jt(te, {}), e.reset($), e.append(O, $);
                };
                e.if(oe, (O) => {
                  ee() && O(X);
                });
              }
              e.reset(o), e.append(h, o);
            }, ne = (h) => {
              xa(h, {});
            }, Y = (h) => {
              Pt(h, { nextAction: "discovery" });
            }, me = (h) => {
              var o = co(), c = e.child(o), V = e.child(c);
              Kt(V, {}), e.reset(c);
              var oe = e.sibling(c, 2);
              {
                var X = (O) => {
                  var $ = lo(), te = e.child($);
                  Jt(te, {}), e.reset($), e.append(O, $);
                };
                e.if(oe, (O) => {
                  ee() && O(X);
                });
              }
              e.reset(o), e.append(h, o);
            }, f = (h) => {
              Pt(h, { nextAction: "identify" });
            }, y = (h) => {
              Pt(h, { nextAction: "discovery" });
            };
            e.if(Q, (h) => {
              F() === "discovering" || w() !== "ready" ? h(Ce) : F() === "initiated" || F() === "vision_refined" ? h(ne, 1) : F() === "vision_submitted" ? h(Y, 2) : F() === "discovery_paused" ? h(me, 3) : F() === "discovery_completed" ? h(f, 4) : h(y, !1);
            });
          }
          e.append(_, B);
        }, Ee = (_) => {
          var B = vo();
          e.append(_, B);
        };
        e.if(L, (_) => {
          E() ? _(ae) : A().length === 0 ? _(be, 1) : _(Ee, !1);
        });
      }
      e.reset(Le);
      var _e = e.sibling(Le, 2);
      {
        var b = (_) => {
          Qt(_, {});
        };
        e.if(_e, (_) => {
          P() && _(b);
        });
      }
      e.reset(z), e.template_effect(() => {
        e.set_class($e, 1, `inline-block w-1.5 h-1.5 rounded-full ${e.get(I) === "connected" ? "bg-success-400" : e.get(I) === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-danger-400"}`), e.set_text(R, e.get(I) === "connected" ? `v${e.get(x)?.version ?? "?"}` : e.get(I));
      }), e.append(g, C);
    };
    e.if(W, (g) => {
      t() && !a() ? g(ve) : a() ? g(Ae, !1) : g(Me, 1);
    });
  }
  e.reset(de), e.append(s, de), e.pop(), T();
}
e.delegate(["click"]);
export {
  go as default
};
