// src/pages/Arena.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabaseClient";
import "../pages/Arena.css";

/* ---------- Helpers & constants ---------- */
function uid(prefix = "s") { return `${prefix}_${Math.random().toString(36).slice(2, 9)}`; }
const HALOGEN_SYMBOLS = ["F", "Cl", "Br", "I"];
const METAL_SYMBOLS = ["Fe", "Mg", "Na", "K", "Li"]; // Na included

/* ---------- Minimal reactions (F removed) ---------- */
const REACTIONS = {
  "H+N": ({ applyHeal, pushLog }) => { applyHeal("ally", 10); pushLog(`Ammonia Boost -> allied healed +10`); },
  "H+Cl": ({ defender, applyStatus, pushLog }) => { applyStatus(defender.id, { id: uid("acid"), name: "Acid Strike", turns: 2, payload: { dot: 5 } }); pushLog(`Acid Strike applied to ${defender.name}`); },

  "O+C": ({ defender, applyStatus, pushLog }) => { applyStatus(defender.id, { id: uid("suff"), name: "Suffocation", turns: 2, payload: { tempDamageMod: -10 } }); pushLog(`${defender.name} suffers Suffocation`); },
  "O+Fe": ({ defender, applyStatus, pushLog }) => { applyStatus(defender.id, { id: uid("cor"), name: "Corrosion", turns: 3, payload: { dot: 5 } }); pushLog(`${defender.name} afflicted with Corrosion`); },
  "O+Mg": ({ applyAoE, pushLog }) => { applyAoE({ targetSide: "enemy", dmg: 10 }); pushLog(`Bright Flash -> AoE 10 dmg to enemy`); },

  "Na+Cl": ({ attacker, applyHeal, applyStatus, pushLog }) => { applyHeal(attacker.id, 20); applyStatus(attacker.id, { id: uid("salt"), name: "Stable Salt", turns: 2, payload: { shield: 10 } }); pushLog(`${attacker.name} gets Stable Salt`); },
  "Na+H2O": ({ attacker, applyStatus, applyDamageSelf, pushLog }) => { applyStatus(attacker.id, { id: uid("over"), name: "Overreact!", turns: 1, payload: { tempDamage: 20 } }); applyDamageSelf(attacker.id, 10); pushLog(`${attacker.name} Overreacts`); },
  "Na+O": ({ attacker, applyStatus, pushLog }) => { applyStatus(attacker.id, { id: uid("oxs"), name: "Oxide Shield", turns: 1, payload: { shield: 15 } }); pushLog(`${attacker.name} gets Oxide Shield`); },
};

/* ---------- Pause modal ---------- */
function PauseMenu({ onClose, onExit }) {
  return (
    <div className="arena-pause-overlay" role="dialog" aria-modal="true">
      <div className="arena-pause-card" role="document">
        <h3 className="pause-title">Game Paused</h3>
        <div className="arena-pause-actions">
          <button className="btn ghost" onClick={onClose}>Resume</button>
          <button className="btn primary" onClick={onExit}>Exit to Games</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Arena component (full) ---------- */
export default function Arena() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // loading + entities
  const [loadingBoss, setLoadingBoss] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [boss, setBoss] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);

  // battle states
  const [statuses, setStatuses] = useState({});
  const [logLines, setLogLines] = useState([]);
  const [turnNumber, setTurnNumber] = useState(0); // tracks last started turn number
  const [phase, setPhase] = useState("idle"); // idle | awaiting | player | resolving-player | boss
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [awaitingPlayerStart, setAwaitingPlayerStart] = useState(true);
  const [actionQueue, setActionQueue] = useState([]);
  const [animFlash, setAnimFlash] = useState({});
  const [paused, setPaused] = useState(false);

  // resolving state (stateful so renders can react)
  const [isResolving, setIsResolving] = useState(false);

  // boss-phase token to run boss exactly once when intended
  const [bossPhaseToken, setBossPhaseToken] = useState(0);

  // inside Arena() component, near other refs:
  const gameOverRef = useRef({ ended: false, timeoutId: null });

  // helper to navigate once
  const navigateToResultOnce = useCallback((outcome) => {
    if (gameOverRef.current.ended) return;
    gameOverRef.current.ended = true;

    // clear any prior scheduled timeout
    if (gameOverRef.current.timeoutId) {
      clearTimeout(gameOverRef.current.timeoutId);
      gameOverRef.current.timeoutId = null;
    }

    // schedule navigation (small delay for animations/log)
    const id = setTimeout(() => {
      // use replace to avoid stacking history
      navigate(`/result?outcome=${outcome}`, { replace: true });
      gameOverRef.current.timeoutId = null;
    }, 700);

    gameOverRef.current.timeoutId = id;
  }, [navigate]);

  // refs to avoid stale closures
  const bossRef = useRef(null);
  const playersRef = useRef([]);
  const phaseRef = useRef(phase);
  const resolvingRef = useRef(false);

  // animation timing / timeout refs
  const ANIM_DURATION_MS = 800; // adjust if your visual animation duration differs
  const bossPhaseTimeoutRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { bossRef.current = boss; }, [boss]);
  useEffect(() => { playersRef.current = playerCards; }, [playerCards]);

  useEffect(() => { document.body.classList.add("in-arena"); return () => document.body.classList.remove("in-arena"); }, []);

  /* ---------- Fetch boss ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingBoss(true);
      try {
        const resp = await fetch(`/api/bosses/${slug}`);
        if (!resp.ok) throw new Error("Failed loading boss");
        const data = await resp.json();
        if (!mounted) return;
        setBoss({
          id: data.slug || data.id || "fluorin",
          name: data.name || "Fluorin",
          image: data.image_url || data.image || "",
          hp: data.hp ?? data.health ?? 110,
          maxHp: data.hp ?? data.health ?? 110,
          dmg: data.dmg ?? data.damage ?? 40,
          powerups: data.powerups || ["Ultimate Reactivity"],
          symbol: data.symbol || "F",
          shield: 0,
        });
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setBoss({ id: "fluorin", name: "Fluorin", image: "", hp: 110, maxHp: 110, dmg: 40, powerups: ["Ultimate Reactivity"], symbol: "F", shield: 0 });
      } finally {
        if (mounted) setLoadingBoss(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  /* ---------- Fetch player cards ---------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCards(true);
      try {
        const prefer = ["H", "O", "Na"];
        let { data, error } = await supabase
          .from("cards")
          .select("id, name, symbol, health, damage, image_url, powerups")
          .in("symbol", prefer);

        if (error || !data || data.length === 0) {
          const { data: fallback, error: err2 } = await supabase
            .from("cards")
            .select("id, name, symbol, health, damage, image_url, powerups")
            .order("created_at", { ascending: true })
            .limit(3);
          if (err2) throw err2;
          data = fallback;
        }

        if (!data || data.length < 3) {
          const { data: more, error: e3 } = await supabase
            .from("cards")
            .select("id, name, symbol, health, damage, image_url, powerups")
            .order("created_at", { ascending: true })
            .limit(3);
          if (e3) throw e3;
          data = (data || []).concat(more || []);
        }

        if (!mounted) return;
        const cards = (data || []).slice(0, 3).map((c) => ({
          id: String(c.id),
          name: c.name,
          symbol: c.symbol,
          health: c.health ?? 0,
          maxHp: c.health ?? 0,
          damage: c.damage ?? 0,
          image: c.image_url || "/mnt/data/default.png",
          shield: 0,
          powerups: c.powerups || [],
        }));

        // Fallback placeholders; NOTE: example base damage values per request (H=5,O=7,Na=30)
        while (cards.length < 3) {
          const idx = cards.length;
          cards.push({
            id: `placeholder-${idx}`,
            name: idx === 0 ? "Hydrogen" : idx === 1 ? "Oxygen" : "Sodium",
            symbol: idx === 0 ? "H" : idx === 1 ? "O" : "Na",
            health: idx === 0 ? 80 : idx === 1 ? 100 : 70,
            maxHp: idx === 0 ? 80 : idx === 1 ? 100 : 70,
            damage: idx === 0 ? 5 : idx === 1 ? 7 : 30,
            image: "/mnt/data/default.png",
            shield: 0,
            powerups: [],
          });
        }
        setPlayerCards(cards.slice(0, 3));
      } catch (err) {
        console.error("load player cards:", err);
        if (!mounted) return;
        setPlayerCards([]);
      } finally {
        if (mounted) setLoadingCards(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  /* ---------- Logging helper ---------- */
  const pushLog = useCallback((txt) => { setLogLines((l) => [`${new Date().toLocaleTimeString()}: ${txt}`, ...l].slice(0, 120)); }, []);

  /* ---------- Status / heal / AoE helpers ---------- */
  const applyStatus = useCallback((entityId, statusObj) => { setStatuses((s) => ({ ...s, [entityId]: (s[entityId] || []).concat([statusObj]) })); }, []);
  const removeStatusById = useCallback((entityId, statusId) => { setStatuses((s) => ({ ...s, [entityId]: (s[entityId] || []).filter(st => st.id !== statusId) })); }, []);
  const clearStatusesFor = useCallback((entityId) => setStatuses((s) => ({ ...s, [entityId]: [] })), []);

  const applyHeal = useCallback((target, amount) => {
    if (target === "ally") {
      setPlayerCards((pcs) => {
        if (!pcs.length) return pcs;
        let idx = 0; let min = pcs[0].health;
        pcs.forEach((c, i) => { if (c.health < min) { min = c.health; idx = i; } });
        return pcs.map((c, i) => i === idx ? { ...c, health: Math.min(c.maxHp, c.health + amount) } : c);
      });
      pushLog(`Healed allied by ${amount}`);
      return;
    }
    if (bossRef.current && bossRef.current.id === target) {
      setBoss((b) => ({ ...b, hp: Math.min(b.maxHp, (b.hp || 0) + amount) }));
      pushLog(`${bossRef.current?.name || "Boss"} healed +${amount}`);
    } else {
      setPlayerCards((pcs) => pcs.map((c) => c.id === target ? { ...c, health: Math.min(c.maxHp, c.health + amount) } : c));
      pushLog(`${target} healed +${amount}`);
    }
  }, [pushLog]);

  const applyDamageSelf = useCallback((entityId, amount) => {
    if (bossRef.current && bossRef.current.id === entityId) {
      setBoss((b) => ({ ...b, hp: Math.max(0, (b.hp || 0) - amount) }));
      pushLog(`${bossRef.current?.name || "Boss"} takes ${amount} self-damage`);
    } else {
      setPlayerCards((pcs) => pcs.map((c) => c.id === entityId ? { ...c, health: Math.max(0, c.health - amount) } : c));
      pushLog(`Self-damage ${amount} applied to ${entityId}`);
    }
  }, [pushLog]);

  const applyAoE = useCallback(({ targetSide = "enemy", dmg = 10 }) => {
    if (targetSide === "enemy") {
      setBoss((b) => ({ ...b, hp: Math.max(0, (b.hp || 0) - dmg) }));
      pushLog(`AoE: boss takes ${dmg}`);
    } else {
      setPlayerCards((pcs) => pcs.map((c) => ({ ...c, health: Math.max(0, c.health - dmg) })));
      pushLog(`AoE: all players take ${dmg}`);
    }
  }, [pushLog]);

  /* ---------- applyDamage with detailed breakdown in log ---------- */
  const applyDamage = useCallback(async ({ attacker, defender, baseDamage }) => {
    const currentStatuses = statuses;
    const attackerSt = currentStatuses[attacker.id] || [];

    // extra from statuses (tempDamage)
    let extraFromStatus = 0;
    attackerSt.forEach(st => { if (st.payload?.tempDamage) extraFromStatus += st.payload.tempDamage; });

    const preMultDamage = baseDamage + extraFromStatus;
    let damage = preMultDamage;

    // powerups/multipliers
    if (attacker.symbol === "H" && attacker.powerups?.includes?.("Explosive Reactivity")) {
      if (HALOGEN_SYMBOLS.includes(defender.symbol) || METAL_SYMBOLS.includes(defender.symbol)) damage = Math.round(damage * 1.2);
    }
    if (attacker.symbol === "Na" && attacker.powerups?.includes?.("High Reactivity")) {
      if (HALOGEN_SYMBOLS.includes(defender.symbol)) damage = Math.round(damage * 1.3);
    }
    if (bossRef.current && attacker.id === bossRef.current.id && attacker.powerups?.includes?.("Ultimate Reactivity")) {
      if (METAL_SYMBOLS.includes(defender.symbol)) {
        damage = damage * 2;
        pushLog(`${attacker.name} Ultimate Reactivity -> double dmg to metal (${defender.symbol})`);
      }
    }

    let ignoreShieldAmount = 0;
    attackerSt.forEach(st => { if (st.payload?.ignoreShield) ignoreShieldAmount += st.payload.ignoreShield; });

    const defenderShield = (bossRef.current && defender.id === bossRef.current.id) ? (bossRef.current.shield || 0) : (playersRef.current.find(p => p.id === defender.id)?.shield || 0);
    const effectiveShield = Math.max(0, defenderShield - ignoreShieldAmount);

    let damageToHp = damage;
    let shieldAbsorbed = 0;
    if (effectiveShield > 0) {
      if (damageToHp <= effectiveShield) { shieldAbsorbed = damageToHp; damageToHp = 0; }
      else { shieldAbsorbed = effectiveShield; damageToHp = damageToHp - effectiveShield; }
    }

    if (bossRef.current && defender.id === bossRef.current.id) {
      setBoss((b) => ({ ...b, shield: Math.max(0, (b.shield || 0) - Math.max(0, ignoreShieldAmount) - shieldAbsorbed), hp: Math.max(0, (b.hp || 0) - damageToHp) }));
    } else {
      setPlayerCards((pcs) => pcs.map((c) => {
        if (c.id !== defender.id) return c;
        return { ...c, shield: Math.max(0, (c.shield || 0) - Math.max(0, ignoreShieldAmount) - shieldAbsorbed), health: Math.max(0, c.health - damageToHp) };
      }));
    }

    flashEntity(defender.id, "hit");
    pushLog(`${attacker.name} deals ${damage} (base ${baseDamage} + status ${extraFromStatus} => pre-mult ${preMultDamage}) (${shieldAbsorbed} shield) -> ${damageToHp} HP to ${defender.name}`);

    // remove single-use statuses (e.g., doubleDamageOnce)
    attackerSt.forEach(st => { if (st.payload?.doubleDamageOnce) removeStatusById(attacker.id, st.id); });
  }, [removeStatusById, statuses, pushLog]);

  /* ---------- flash helper ---------- */
  const flashEntity = useCallback((entityId, type) => {
    setAnimFlash((a) => ({ ...a, [entityId]: type }));
    setTimeout(() => setAnimFlash((a) => { const c = { ...a }; delete c[entityId]; return c; }), 700);
  }, []);

  /* ---------- tick statuses (DoT/heal) ---------- */
  const tickStatuses = useCallback(() => {
    setStatuses((s) => {
      const copy = { ...s };
      Object.keys(copy).forEach((entityId) => {
        copy[entityId] = copy[entityId].map((st) => ({ ...st }));
        copy[entityId].forEach((st) => {
          if (st.payload?.dot) {
            const dmg = st.payload.dot;
            if (bossRef.current && entityId === bossRef.current.id) setBoss((b) => ({ ...b, hp: Math.max(0, (b.hp || 0) - dmg) }));
            else setPlayerCards((pcs) => pcs.map((c) => c.id === entityId ? { ...c, health: Math.max(0, c.health - dmg) } : c));
            flashEntity(entityId, "dot");
            pushLog(`${st.name}: ${entityId} takes ${st.payload.dot} DoT`);
          }
          if (st.payload?.healPerTurn) {
            applyHeal(entityId, st.payload.healPerTurn);
            flashEntity(entityId, "heal");
            pushLog(`${st.name}: ${entityId} healed ${st.payload.healPerTurn}`);
          }
          st.turns = st.turns - 1;
        });
        copy[entityId] = copy[entityId].filter((st) => st.turns > 0);
      });
      return copy;
    });
  }, [applyHeal, flashEntity, pushLog]);

  /* ---------- runReaction (minimal) ---------- */
  const runReaction = useCallback(({ attacker, defender }) => {
    const key = `${attacker.symbol}+${defender.symbol}`;
    const rev = `${defender.symbol}+${attacker.symbol}`;
    if (REACTIONS[key]) REACTIONS[key]({ attacker, defender, applyStatus, applyHeal, applyAoE, applyDamageSelf, pushLog });
    else if (REACTIONS[rev]) REACTIONS[rev]({ attacker: defender, defender: attacker, applyStatus, applyHeal, applyAoE, applyDamageSelf, pushLog });
  }, [applyAoE, applyDamageSelf, applyHeal, applyStatus, pushLog]);

  /* ---------- handleAttack ---------- */
  const handleAttack = useCallback(async ({ attacker, defender }) => {
    if (!attacker || !defender) return;
    runReaction({ attacker, defender });
    await applyDamage({ attacker, defender, baseDamage: attacker.damage || attacker.dmg || 0 });
    tickStatuses();
  }, [applyDamage, runReaction, tickStatuses]);

  /* ---------- Turn init (awaiting) ---------- */
  useEffect(() => {
    if (loadingBoss || loadingCards) return;
    if (!boss || playerCards.length === 0) return;
    // Start with awaiting modal (first load) but only if not resolving
    setAwaitingPlayerStart(true);
    setPhase("awaiting");
    setShowTurnModal(true);
  }, [loadingBoss, loadingCards, boss, playerCards]);

  /* ---------- Enqueue rules: 1 per card per turn, max 3, unique symbols ---------- */
  const enqueuePlayerAction = useCallback((card) => {
    if (phaseRef.current !== "player") { pushLog("Cannot queue: not player phase"); return; }
    if (!card || card.health <= 0) { pushLog(`${card?.name || "Card"} cannot act`); return; }
    if (actionQueue.some(a => a.actorId === card.id)) { pushLog(`${card.name} already queued this turn`); return; }
    const queuedSymbols = actionQueue.map(a => playersRef.current.find(pp => pp.id === a.actorId)?.symbol).filter(Boolean);
    if (queuedSymbols.includes(card.symbol)) { pushLog(`A card with symbol ${card.symbol} already queued this turn`); return; }
    if (actionQueue.length >= 3) { pushLog("Queue full (max 3 actions per turn)"); return; }

    setActionQueue(q => q.concat([{ actorId: card.id, targetId: bossRef.current?.id }]));
    pushLog(`${card.name} queued to attack`);
  }, [actionQueue, pushLog]);

  /* ---------- startTurn handler (use consistently) ---------- */
  const startTurn = useCallback(() => {
    // Starting a player turn: hide modal, increment turnNumber and set phase to player
    setShowTurnModal(false);
    setAwaitingPlayerStart(false);
    setTurnNumber(t => t + 1);
    setPhase("player");
    pushLog(`Turn ${turnNumber + 1} started (Player Phase)`);
  }, [turnNumber, pushLog]);

  /* ---------- End player phase: detect combos -> apply global bonuses -> execute queue -> boss ---------- */
  const onEndPlayerPhase = useCallback(async () => {
    if (phaseRef.current !== "player") { pushLog("Cannot end: not player phase"); return; }

    // Immediately hide any turn modal and cancel scheduled boss-phase modal
    setShowTurnModal(false);
    setAwaitingPlayerStart(false);
    if (bossPhaseTimeoutRef.current) {
      clearTimeout(bossPhaseTimeoutRef.current);
      bossPhaseTimeoutRef.current = null;
    }
    // clear any game over navigation pending
    if (gameOverRef.current?.timeoutId) {
      clearTimeout(gameOverRef.current.timeoutId);
      gameOverRef.current.timeoutId = null;
    }

    setPhase("resolving-player");
    setIsResolving(true);
    resolvingRef.current = true;

    // Prepare combo bonuses (global once-per-turn bonuses)
    let hydroBurstBonus = 0;   // +15 global for H+O
    let overreactBonus = 0;    // +20 global for H+O+Na

    const queuedActors = actionQueue.map(a => playersRef.current.find(p => p.id === a.actorId)).filter(Boolean);
    const queuedSymbols = Array.from(new Set(queuedActors.map(a => a.symbol)));

    // Detect triple combo first
    if (queuedSymbols.includes("H") && queuedSymbols.includes("O") && queuedSymbols.includes("Na")) {
      overreactBonus = 20;
      // immediate self-damage -10 to each queued card
      queuedActors.forEach(actor => {
        applyDamageSelf(actor.id, 10);
      });
      // log expected total
      const h = queuedActors.find(a => a.symbol === "H")?.damage ?? 0;
      const o = queuedActors.find(a => a.symbol === "O")?.damage ?? 0;
      const na = queuedActors.find(a => a.symbol === "Na")?.damage ?? 0;
      const expectedTotal = h + o + na + overreactBonus;
      pushLog(`Combo H+O+Na detected -> Overreact: global +20 this turn, immediate -10 self-dmg each. Expected total boss damage = ${expectedTotal}`);
      pushLog("Applied Overreact: each queued card takes -10 HP immediately");
    }
    // If triple did not occur, check H+O pair
    else if (queuedSymbols.includes("H") && queuedSymbols.includes("O")) {
      hydroBurstBonus = 15;
      const h = queuedActors.find(a => a.symbol === "H")?.damage ?? 0;
      const o = queuedActors.find(a => a.symbol === "O")?.damage ?? 0;
      const expectedTotal = h + o + hydroBurstBonus;
      pushLog(`Combo H+O detected -> Hydro Burst: global +15 this turn. Expected total boss damage = ${expectedTotal}`);
    }

    // Execute queued actions sequentially; apply global bonus only once (to first executed attack)
    const queue = [...actionQueue];
    for (let i = 0; i < queue.length; i++) {
      const act = queue[i];
      const actor = playersRef.current.find(p => p.id === act.actorId);
      if (!actor || actor.health <= 0) { pushLog(`${act.actorId} skipped (dead)`); continue; }
      const defender = bossRef.current;
      if (!defender) break;

      // determine bonus for this attack (only for first attack)
      let bonus = 0;
      if (i === 0) {
        bonus = hydroBurstBonus + overreactBonus; // only one of them will be >0, or 0
        if (bonus > 0) pushLog(`Applying global bonus +${bonus} to first attack (${actor.name})`);
      }

      pushLog(`${actor.name} attacks ${defender.name}`);
      // call handleAttack with a temp attacker object that includes the bonus added to damage
      await handleAttack({ attacker: { ...actor, damage: (actor.damage || actor.dmg || 0) + bonus }, defender });
      await new Promise(r => setTimeout(r, 450));
      if (bossRef.current && bossRef.current.hp <= 0) break;
    }

    // clear queue after execution
    setActionQueue([]);

    // start boss phase once by bumping token
    // schedule quickly; boss-phase effect will wait for animations before showing modal
    setPhase("boss");
    setBossPhaseToken(t => t + 1);
  }, [actionQueue, applyDamageSelf, handleAttack, pushLog]);

  /* ---------- Boss phase runs exactly once per token ---------- */
  useEffect(() => {
    if (!bossPhaseToken) return;
    let cancelled = false;
    (async () => {
      if (!bossRef.current) return;

      // mark resolving for UI-disable
      resolvingRef.current = true;
      setIsResolving(true);

      pushLog(`-- Boss Phase (Turn ${turnNumber}) --`);
      const alive = playersRef.current.filter(p => p.health > 0);
      for (let i = 0; i < alive.length; i++) {
        if (cancelled) break;
        const target = alive[i];
        if (!bossRef.current) break;
        pushLog(`${bossRef.current.name} attacks ${target.name}`);
        await handleAttack({ attacker: bossRef.current, defender: target });
        await new Promise(r => setTimeout(r, 500));
      }

      // apply ticks (DoT/heal) after boss attacks
      tickStatuses();

      // resolving done — clear resolving flags
      resolvingRef.current = false;
      setIsResolving(false);

      // cancel any previous modal timeout then schedule showing mid/after animations
      if (bossPhaseTimeoutRef.current) {
        clearTimeout(bossPhaseTimeoutRef.current);
        bossPhaseTimeoutRef.current = null;
      }
      // we ensure no modal appears while resolving; schedule modal after ANIM_DURATION_MS
      bossPhaseTimeoutRef.current = setTimeout(() => {
        bossPhaseTimeoutRef.current = null;
        // only show modal if not resolving (safety)
        if (!resolvingRef.current) {
          setPhase("awaiting");
          setAwaitingPlayerStart(true);
          setShowTurnModal(true);
        }
      }, ANIM_DURATION_MS);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bossPhaseToken]);

  /* ---------- Victory / Defeat ---------- */
  useEffect(() => {
    if (boss && boss.hp <= 0) {
      pushLog("Boss defeated! You win 🎉");
      navigateToResultOnce("win");
    }
  }, [boss, navigateToResultOnce, pushLog]);

  useEffect(() => {
    if (playerCards.length && playerCards.every(c => c.health <= 0)) {
      pushLog("All player cards have fallen. Game over.");
      navigateToResultOnce("lose");
    }
  }, [playerCards, navigateToResultOnce, pushLog]);

  /* ---------- cleanup timeouts on unmount ---------- */
  useEffect(() => {
    return () => {
      // clear boss-phase modal timeout
      if (bossPhaseTimeoutRef.current) {
        clearTimeout(bossPhaseTimeoutRef.current);
        bossPhaseTimeoutRef.current = null;
      }
      // clear game over timeout
      if (gameOverRef.current?.timeoutId) {
        clearTimeout(gameOverRef.current.timeoutId);
        gameOverRef.current.timeoutId = null;
      }
      gameOverRef.current.ended = false;
    };
  }, []);

  /* ---------- UI helpers ---------- */
  const listStatuses = (id) => (statuses[id] || []).map(s => `${s.name}(${s.turns})`).join(", ");
  const clearStatusesForUI = (id) => { clearStatusesFor(id); pushLog(`Statuses cleared for ${id}`); };

  /* ---------- Guard render to avoid blank screen ---------- */
  if (loadingBoss || loadingCards || !boss || playerCards.length === 0) {
    return (
      <main className="arena-root">
        <div className="arena-container">
          <div style={{ color: "white", padding: 28 }}>Memuat arena…</div>
        </div>
      </main>
    );
  }

  /* ---------- Derived values for modal title + when to show it ---------- */
  // If awaitingPlayerStart is true, the modal is about to start the next turn: show turnNumber + 1
  const modalTurnNumber = awaitingPlayerStart ? (turnNumber + 1) : Math.max(1, turnNumber);
  // show modal only when showTurnModal true and not resolving
  const shouldShowModal = showTurnModal && !isResolving;

  /* ---------- Render ---------- */
  return (
    <main className="arena-root">
      <button className="arena-pause-toggle" onClick={() => setPaused(true)} aria-label="Pause" title="Pause">
        <span className="pause-icon">II</span>
      </button>
      {paused && <PauseMenu onClose={() => setPaused(false)} onExit={() => navigate("/games")} />}

      {/* Turn modal */}
      {shouldShowModal && (
        <div className="turn-modal" role="dialog" aria-modal="true">
          <div className="turn-modal-card">
            <div className="turn-title">Turn {modalTurnNumber}</div>
            <div className="turn-sub">
              {phase === "player" ? "Player Phase" : phase === "boss" ? "Boss Phase" : awaitingPlayerStart ? "Press Start to begin turn" : "Resolving..."}
            </div>
            {awaitingPlayerStart && (
              <div style={{ marginTop: 12 }}>
                <button
                  className="btn primary"
                  onClick={() => {
                    // Use the single startTurn function to avoid double increments
                    startTurn();
                  }}
                >
                  Start Turn
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="arena-container">
        <div className="arena-title-block">
          <div>
            <h1 className="arena-title">{boss ? `Arena Boss — ${boss.name}` : "Arena"}</h1>
            <div className="arena-sub">Kalahkan Boss untuk memenangkan permainan!</div>
          </div>
        </div>

        <div className="arena-core">
          <div className="boss-row">
            <div className={`player-card boss-as-player ${animFlash[boss.id] ? `flash-${animFlash[boss.id]}` : ""}`}>
              <div className="player-image"><img src={boss.image || "/mnt/data/default.png"} alt={boss.name} /><div className="player-symbol">{boss.symbol}</div></div>
              <div className="player-meta">
                <div className="player-name">{boss.name}</div>
                <div className="meta-row">
                  <div className="hp-row"><div className="meta-label">HP</div><div className="bar"><div className="bar-fill" style={{ width: `${Math.min(100, (boss.hp / boss.maxHp) * 100)}%` }} /></div><div className="meta-value">{boss.hp}</div></div>
                  <div className="dm-row"><div className="meta-label">DMG</div><div className="bar dmg-bar"><div className="bar-fill" style={{ width: `${Math.min(100, (boss.dmg / 100) * 100)}%` }} /></div><div className="meta-value">{boss.dmg}</div></div>
                </div>
                <div style={{ marginTop: 8, fontSize: 12 }}>Shield: {boss.shield || 0} • Statuses: <span className="status-list">{listStatuses(boss.id)}</span></div>
              </div>
            </div>
          </div>

          <div className="vs-row"><div className="vs-circle">VS</div></div>

          <div className="players-row">
            <div className="players-stack">
              {playerCards.map((pc) => {
                const alreadyQueued = actionQueue.some(a => a.actorId === pc.id);
                return (
                  <div key={pc.id} className={`player-card ${animFlash[pc.id] ? `flash-${animFlash[pc.id]}` : ""}`}>
                    <div className="player-image"><img src={pc.image} alt={pc.name} /><div className="player-symbol">{pc.symbol}</div></div>
                    <div className="player-meta">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="player-name">{pc.name}</div>
                        {alreadyQueued && <div className="pill" style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: 8, fontWeight: 800 }}>Queued</div>}
                      </div>

                      <div className="meta-row">
                        <div className="hp-row"><div className="meta-label">HP</div><div className="bar"><div className="bar-fill" style={{ width: `${Math.min(100, (pc.health / pc.maxHp) * 100)}%` }} /></div><div className="meta-value">{pc.health}</div></div>
                        <div className="dm-row"><div className="meta-label">DMG</div><div className="bar dmg-bar"><div className="bar-fill" style={{ width: `${Math.min(100, (pc.damage / 100) * 100)}%`}} /></div><div className="meta-value">{pc.damage}</div></div>
                      </div>

                      <div style={{ marginTop: 8, fontSize: 12 }}>Shield: {pc.shield || 0} • Statuses: <span className="status-list">{listStatuses(pc.id)}</span></div>

                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <button className="btn primary" onClick={() => enqueuePlayerAction(pc)} disabled={phase !== "player" || pc.health <= 0 || awaitingPlayerStart || alreadyQueued}>Queue Attack</button>
                        <button className="btn ghost" onClick={() => clearStatusesForUI(pc.id)}>Clear</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div style={{ width: "100%", display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <div style={{ alignSelf: "center", color: "var(--muted-200)", fontWeight: 800 }}>Phase: <span style={{ color: "white" }}>{phase}</span></div>
            <button className="btn primary" onClick={onEndPlayerPhase} disabled={phase !== "player" || actionQueue.length === 0}>End Player Phase</button>
            <button className="btn ghost" onClick={() => { setActionQueue([]); pushLog("Action queue cleared"); }} disabled={phase !== "player"}>Clear Queue</button>
            <div style={{ alignSelf: "center", color: "var(--muted-200)", fontWeight: 700 }}>Queued: {actionQueue.length}</div>
          </div>

          {/* Combat log */}
          <div style={{ width: "100%", marginTop: 18 }}>
            <div style={{ color: "var(--muted-200)", fontWeight: 800, marginBottom: 8 }}>Combat Log</div>
            <div style={{ maxHeight: 260, overflowY: "auto", background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 8 }}>
              {logLines.length ? logLines.map((l, i) => (<div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>{l}</div>)) : <div className="muted">No events yet</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
