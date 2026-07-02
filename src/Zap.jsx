// ─── Zap.jsx ──────────────────────────────────────────────────────────────────
// Root component. Screen router, global state, wallet abstraction, persistence.
// Wallet connection is invisible — triggered by ENTER CLUBHOUSE, not a button.
// Club name is the player's identity throughout the game.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { GLOBAL_CSS }      from "./styles/globalCSS.js";
import { FORMATION_FELT, FORMATIONS } from "./game/constants.js";
import { defS, defLB, normalizeState, formatClubName } from "./game/gameState.js";
import { useWallet }       from "./hooks/useWallet.js";
import { useDojoGame }     from "./hooks/useDojoGame.js";
import { getPlayerRegistry, registerPlayer }  from "./lib/calls.js";
import { CreateClubScreen, HomeScreen, ModeSelectionScreen, MissionsScreen, ShopScreen } from "./screens/HomeScreens.jsx";
import { PreMatchScreen, MatchFoundScreen }           from "./screens/MatchScreens.jsx";
import { Leaderboard }                                from "./screens/Leaderboard.jsx";
import GameScreen                                     from "./game/GameScreen.jsx";
import TrainingMode                                   from "./screens/TrainingMode.jsx";
import {
  trackAppOpened, trackClubCreated, trackMatchStarted,
} from "./lib/analytics.js";
import { playLoop, playSound, stopLoop, unlockAudio } from "./lib/sound.js";
import MarketSheet                                    from "./modals/MarketSheet.jsx";
import { Toast, TxPendingBadge }                      from "./ui/ui.jsx";

const walletKey = (wallet) => String(wallet || "local").toLowerCase();
const stateKey = (wallet) => `zapfc:s5:${walletKey(wallet)}`;
const leaderboardKey = (wallet) => `zapfc:lb5:${walletKey(wallet)}`;
const TRAINING_MODE_ENABLED = false;
const BOOT_LOADING_MS = 13000;
const PLAYER_LOADING = "/assets/players/loading-anime.png";
const LOADING_BG = "/assets/bg/loading-bg.png";
const ZAP_LOGO = "/assets/logo/zap-logo.png";
const CRITICAL_ASSETS = [
  "/assets/bg/spilt-bg.png",
  "/assets/bg/home-bg.png",
  "/assets/bg/card-texture.png",
  "/assets/bg/loading-bg.png",
  "/assets/bg/mode-texture.png",
  "/assets/players/loading-anime.png",
  "/assets/players/anime-home.png",
  "/assets/players/anime-kickoff.png",
  "/assets/logo/zap-logo.png",
  "/assets/icons/coin.png",
  "/assets/icons/medal.png",
  "/assets/icons/rank.png",
];

const loadProfile = (wallet) => {
  let s = normalizeState({ ...defS(), wallet: wallet || "local" });
  let lb = defLB();
  try {
    const r = localStorage.getItem(stateKey(wallet));
    if (r) s = normalizeState({ ...defS(), ...JSON.parse(r), wallet: wallet || "local" });
  } catch (_) {}
  try {
    const r = localStorage.getItem(leaderboardKey(wallet));
    if (r) lb = JSON.parse(r);
  } catch (_) {}
  return { s, lb };
};

// ── Loading screen ─────────────────────────────────────────────────────────────
function LoadingScreen({ label = "LOADING CLUBHOUSE", ready = false, entering = false, onEnter, onGuest }) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      if (ready) {
        setProgress(100);
        return;
      }
      const elapsed = performance.now() - start;
      const eased = 1 - Math.pow(1 - Math.min(elapsed / BOOT_LOADING_MS, 1), 3);
      setProgress(Math.min(98, Math.round(8 + eased * 90)));
    }, 120);
    return () => window.clearInterval(id);
  }, [ready]);

  const complete = ready && progress >= 100;

  return (
    <div className="zap-splash zap-splash--loading" style={{ position:"fixed", zIndex:80 }}>
      <style>{GLOBAL_CSS}</style>
      <img className="zap-splash__bg" src={LOADING_BG} alt="" draggable={false} decoding="async" fetchpriority="high" />
      <div className="zap-splash__bg-tint" />
      <div className="zap-splash__wash" />
      <img className="zap-splash__player" src={PLAYER_LOADING} alt="" draggable={false} decoding="async" fetchpriority="high" />
      <div className="zap-splash__mark">
        <img className="zap-splash__logo" src={ZAP_LOGO} alt="ZAP" draggable={false} decoding="async" fetchpriority="high" />
        <div className="zap-splash__line" />
        <h1>WORLD FIRST<br/>ONCHAIN FOOTBALL</h1>
        <p>{complete ? "Clubhouse is ready. Enter when you are set." : "Preparing clubhouse and match assets."}</p>
        <div style={{ margin:"0 auto", width:"min(250px,100%)", display: complete ? "none" : "block" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px", fontFamily:"var(--f-mono)", fontSize:"10px", letterSpacing:".16em", color:"rgba(255,255,255,.58)" }}>
            <span>{label}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height:"11px", borderRadius:"999px", overflow:"hidden", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.1)" }}>
            <i style={{ display:"block", width:`${progress}%`, height:"100%", borderRadius:"inherit", background:"linear-gradient(90deg,#facc15,#22c55e,#38bdf8)", boxShadow:"0 0 22px rgba(34,197,94,.42)", transition:"width .18s ease" }} />
          </div>
        </div>
        {complete && (
          <div style={{ display:"grid", gap:"18px", justifyItems:"center" }}>
            <button
              onClick={onEnter}
              disabled={entering}
              className="zap-splash__cta"
              style={{ boxShadow:entering ? "none" : "0 10px 26px rgba(34,197,94,.24)" }}
            >
              {entering ? "ENTERING..." : "ENTER CLUBHOUSE"}
            </button>
            <button
              onClick={onGuest}
              disabled={entering}
              style={{
                width:"min(226px, 100%)",
                height:"40px",
                padding:"0 20px",
                borderRadius:"8px",
                border:"1px solid rgba(84,232,113,.18)",
                background:"rgba(2,10,6,.62)",
                color:"rgba(238,245,240,.78)",
                fontFamily:"var(--f-mono)",
                fontSize:"9px",
                letterSpacing:".18em",
                boxShadow:"0 8px 18px rgba(0,0,0,.18)",
              }}
            >
              GUEST MODE
            </button>
          </div>
        )}
      </div>
      <div className="zap-splash__fineprint">SEASON 1 ACCESS</div>
    </div>
  );
}

function shouldAskClubIdentity(state) {
  return (
    (state?.total || 0) > 0 &&
    !state?.clubIdentitySet &&
    !state?.clubIdentityPrompted
  );
}

function ClubIdentityModal({ initialName = "", saving = false, onSave, onLater }) {
  const [clubName, setClubName] = useState(initialName);
  const clean = clubName.trim().replace(/\s+/g, " ");
  const canSave = clean.length >= 2 && !saving;

  const submit = (e) => {
    e?.preventDefault();
    if (canSave) onSave(clean.slice(0, 28));
  };

  return (
    <div className="zap-modal-backdrop">
      <form className="club-identity-modal" onSubmit={submit}>
        <div className="club-identity-modal__eyebrow">FIRST MATCH COMPLETE</div>
        <h2>What should the clubhouse call your squad?</h2>
        <p>Your first run is saved. Add a matchday name now, or keep playing and decide later.</p>
        <input
          value={clubName}
          maxLength={28}
          autoFocus
          onChange={(e) => setClubName(e.target.value.toUpperCase())}
          placeholder="SQUAD NAME"
        />
        <div className="club-identity-modal__actions">
          <button type="button" onClick={onLater}>Later</button>
          <button type="submit" disabled={!canSave}>{saving ? "Saving..." : "Save squad"}</button>
        </div>
      </form>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function Zap() {
  const [screen,        setScreen]        = useState("loading");
  const [S,             setS]             = useState(null);
  const [LB,            setLB]            = useState([]);
  const [toast,         setToast]         = useState(null);
  const [market,        setMarket]        = useState(false);
  const [selectedFId,   setSelectedFId]   = useState("control-433");
  const [matchOpponent, setMatchOpponent] = useState(null);
  const [entering,      setEntering]      = useState(false);
  const [clubPrompt,    setClubPrompt]    = useState(false);
  const [savingClub,    setSavingClub]    = useState(false);

  const toastRef = useRef(null);
  const registerPromiseRef = useRef(null);

  const { account, address, provider, connect } = useWallet();
  const dojo = useDojoGame(account, provider);

  useEffect(() => {
    CRITICAL_ASSETS.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);

      const img = new Image();
      img.decoding = "async";
      img.src = src;
      img.decode?.().catch(() => {});
    });
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      unlockAudio();
      if (screen !== "game" && event.target?.closest?.("button, a, input, [role='button']")) {
        playSound("uiClick", { volume:0.18 });
      }
    };
    const preventSaveMenu = (event) => event.preventDefault();
    const preventDrag = (event) => event.preventDefault();
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("contextmenu", preventSaveMenu, true);
    window.addEventListener("dragstart", preventDrag, true);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("contextmenu", preventSaveMenu, true);
      window.removeEventListener("dragstart", preventDrag, true);
    };
  }, [screen]);

  useEffect(() => {
    if (screen && screen !== "loading" && screen !== "entry" && screen !== "game") {
      playLoop("menuMusic", { volume:0.075 });
      return;
    }
    stopLoop("menuMusic");
  }, [screen]);

  // ── Persistence ──────────────────────────────────────────────────────────
  const saveS = useCallback((ns) => {
    const wallet = ns?.wallet || account?.address || address || "local";
    try { localStorage.setItem(stateKey(wallet), JSON.stringify(normalizeState({ ...ns, wallet }))); } catch (_) {}
  }, [account, address]);

  const saveLB = useCallback((nextLB, wallet = S?.wallet || account?.address || address || "local") => {
    try { localStorage.setItem(leaderboardKey(wallet), JSON.stringify(nextLB)); } catch (_) {}
  }, [S?.wallet, account, address]);

  const showToast = useCallback((msg, dur = 2500) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), dur);
  }, []);

  const markOnchainRegistered = useCallback((stateLike = S, registry = null, walletOverride = null) => {
    const wallet = walletOverride || stateLike?.wallet || account?.address || address || "local";
    const next = normalizeState({
      ...stateLike,
      wallet,
      clubCreated: true,
      clubName: registry?.clubName || stateLike?.clubName || S?.clubName || "ZAP",
      onchainRegistered: true,
    });

    setS((current) => {
      const base = current?.wallet === wallet ? current : next;
      const merged = normalizeState({
        ...base,
        wallet,
        clubCreated: true,
        clubName: registry?.clubName || base?.clubName || next.clubName,
        onchainRegistered: true,
      });
      saveS(merged);
      return merged;
    });

    return next;
  }, [S, account?.address, address, saveS]);

  const ensureRegistered = useCallback(async (clubName, stateLike = S, walletSession = null) => {
    const activeAccount = walletSession?.account || account;
    const activeProvider = walletSession?.provider || provider;
    const activeWallet = walletSession?.address || activeAccount?.address || address || stateLike?.wallet;
    if (!activeAccount) return null;
    if (stateLike?.onchainRegistered) return { alreadyRegistered: true };
    if (registerPromiseRef.current) return registerPromiseRef.current;

    const wallet = activeWallet;
    registerPromiseRef.current = (async () => {
      const registry = await getPlayerRegistry(wallet);
      if (registry?.registered) {
        markOnchainRegistered(stateLike, registry, wallet);
        return { alreadyRegistered: true, registry };
      }

      const tx = await registerPlayer(activeAccount, clubName);
      if (tx?.transaction_hash && activeProvider) {
        await activeProvider.waitForTransaction(tx.transaction_hash);
      }
      if (tx?.transaction_hash || tx?.alreadyRegistered) {
        markOnchainRegistered(stateLike, null, wallet);
      }
      return tx;
    })().finally(() => {
      registerPromiseRef.current = null;
    });

    return registerPromiseRef.current;
  }, [S, account, address, markOnchainRegistered, provider]);

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loadingHold = new Promise((resolve) => window.setTimeout(resolve, BOOT_LOADING_MS));
      const { s, lb } = loadProfile("local");
      await loadingHold;
      if (cancelled) return;
      setSelectedFId(s.formationId || "control-433");
      setS(s);
      setLB(lb);
      setScreen("entry");
      trackAppOpened();
    })();
    return () => { cancelled = true; };
  }, []);

  const routeForWallet = useCallback(async (wallet) => {
    let { s, lb } = loadProfile(wallet);

    if (!s.clubCreated && wallet && wallet !== "local") {
      const registry = await getPlayerRegistry(wallet);
      if (registry?.registered) {
        s = normalizeState({
          ...s,
          wallet: wallet || "local",
          clubName: registry.clubName || s.clubName,
          clubCreated: true,
          onchainRegistered: true,
        });
        try { localStorage.setItem(stateKey(wallet), JSON.stringify(s)); } catch (_) {}
      }
    }

    setSelectedFId(s.formationId || "control-433");
    setS(s);
    setLB(lb);
    if (TRAINING_MODE_ENABLED && !s.trainingDone) {
      setScreen("training");
    } else {
      setScreen("home");
    }
  }, []);

  useEffect(() => {
    if (!entering || !account || !provider) return;
    const id = window.setTimeout(() => {
      routeForWallet(account.address || address).finally(() => setEntering(false));
    }, 0);
    return () => window.clearTimeout(id);
  }, [account, address, entering, provider, routeForWallet]);

  // ── Splash → connect wallet invisibly → route ─────────────────────────────
  const handleEnter = useCallback(async () => {
    unlockAudio();
    setEntering(true);
    try {
      const walletSession = account && provider
        ? { account, provider, address:account.address || address }
        : await connect();
      await routeForWallet(walletSession?.account?.address || walletSession?.address || account?.address || address || "local");
      setEntering(false);
    } catch {
      showToast("Wallet login failed. Guest mode is still available.");
      setEntering(false);
    }
  }, [account, address, connect, provider, routeForWallet, showToast]);

  const handleGuestEnter = useCallback(async () => {
    unlockAudio();
    setEntering(true);
    try {
      await routeForWallet("local");
    } finally {
      setEntering(false);
    }
  }, [routeForWallet]);

  // ── Create club → register on-chain (non-blocking) ───────────────────────
  const handleCreateClub = useCallback(async (clubName) => {
    const formattedName = formatClubName(clubName);
    const ns = normalizeState({
      ...S,
      clubName:    formattedName,
      clubCreated: true,
      clubIdentitySet: true,
      clubIdentityPrompted: true,
      trainingDone: TRAINING_MODE_ENABLED ? S?.trainingDone : true,
      wallet:      account?.address || address || "local",
    });
    setS(ns); saveS(ns);
    setScreen(TRAINING_MODE_ENABLED && !ns.trainingDone ? "training" : "home");
    showToast("⚽ Welcome, " + formattedName + "!");
    trackClubCreated();

    // Register on-chain in background — never block the game.
    // If Torii already has this wallet, no Cartridge modal is opened.
    if (account) {
      (async () => {
        try {
          const result = await ensureRegistered(formattedName, ns);
          if (result?.registry) {
            showToast("Using existing on-chain club: " + formatClubName(result.registry.clubName));
          }
        } catch {
          // Non-blocking: club creation should continue even if registration is unavailable.
        }
      })();
    }
  }, [S, account, address, ensureRegistered, saveS, showToast]);

  const handleSaveClubIdentity = useCallback(async (clubName) => {
    const formattedName = formatClubName(clubName);
    setSavingClub(true);
    let walletSession = null;
    try {
      walletSession = account && provider
        ? { account, provider, address: account.address || address }
        : await connect();
    } catch {
      setSavingClub(false);
      showToast("Wallet connection needed to save your club on-chain.");
      return;
    }

    const walletAddress = walletSession?.account?.address || walletSession?.address || account?.address || address || "local";
    const ns = normalizeState({
      ...S,
      clubName: formattedName,
      clubCreated: true,
      clubIdentitySet: true,
      clubIdentityPrompted: true,
      trainingDone: TRAINING_MODE_ENABLED ? S?.trainingDone : true,
      wallet: walletAddress,
    });
    setS(ns);
    saveS(ns);
    setClubPrompt(false);
    showToast("Saving club on-chain: " + formattedName);
    trackClubCreated();

    try {
      await ensureRegistered(formattedName, ns, walletSession);
      showToast("Club saved to wallet.");
    } catch {
      showToast("Saved locally. On-chain claim can wait.");
    }
    setSavingClub(false);
  }, [S, account, address, connect, ensureRegistered, provider, saveS, showToast]);

  const handleClubIdentityLater = useCallback(() => {
    const ns = normalizeState({
      ...S,
      clubIdentityPrompted: true,
      trainingDone: TRAINING_MODE_ENABLED ? S?.trainingDone : true,
    });
    setS(ns);
    saveS(ns);
    setClubPrompt(false);
  }, [S, saveS]);

  // ── Launch match ─────────────────────────────────────────────────────────
  const launchGame = useCallback(async (opponent) => {
    const selectedFormation = FORMATIONS.find((f) => f.id === selectedFId);
    const playableFormationId = selectedFormation && (S?.rep || 0) >= (selectedFormation.minRep || 0)
      ? selectedFId
      : "control-433";
    if (playableFormationId !== selectedFId) {
      setSelectedFId(playableFormationId);
      showToast("Formation locked. Control 4-3-3 selected.");
    }
    const ns = normalizeState({ ...S, formationId: playableFormationId });
    setS(ns); saveS(ns);
    setMatchOpponent(opponent || { name:"RIVALS FC", rep: Math.max(10, S?.rep || 50), difficulty:"medium" });

    if (account) {
      try {
        await ensureRegistered(ns.clubName || "ZAP", ns);
        const feltId = FORMATION_FELT[playableFormationId];
        if (feltId) await dojo.doSetFormation(feltId);
      } catch {
        // Non-blocking: match can still run with client fallback if chain setup is unavailable.
      }
    }
    const fShape = FORMATIONS.find(x => x.id === playableFormationId)?.shape || playableFormationId;
    const { getOpponentProfile } = await import("./game/constants.js");
    const profile = getOpponentProfile(opponent?.name || "");
    trackMatchStarted({
      formationId:    playableFormationId,
      formationShape: fShape,
      opponentStyle:  profile?.style || "unknown",
      isFirstMatch:   (S?.total || 0) === 0,
    });
    setScreen("game");
  }, [S, selectedFId, account, dojo, ensureRegistered, saveS, showToast]);

  const handleMarketUpdate = useCallback((ns) => {
    const next = normalizeState(ns);
    setS(next);
    saveS(next);
  }, [saveS]);

  const updateS = useCallback((ns) => {
    const next = normalizeState(ns);
    setS(next);
    saveS(next);
  }, [saveS]);

  const returnHomeAfterMatch = useCallback(() => {
    setScreen("home");
    if (shouldAskClubIdentity(S)) {
      window.setTimeout(() => setClubPrompt(true), 280);
    }
  }, [S]);

  const requestCrest = useCallback(async (payload) => {
    const requestedState = normalizeState({
      ...S,
      crestRequested: true,
      crestRequestPending: true,
      crestRequest: {
        clubName: payload?.clubName || S?.clubName || "ZAP FC",
        wallet: payload?.wallet || S?.wallet || "local",
        cost: "$3 in STRK",
        requestedAt: new Date().toISOString(),
      },
    });
    setS(requestedState);
    saveS(requestedState);
    try {
      const response = await fetch("/api/crest-request", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ ...payload, notify:"justzyrick@gmail.com" }),
      });
      if (!response.ok) throw new Error("Endpoint unavailable");
      showToast("Crest request sent.");
    } catch {
      showToast("Crest request queued. Add /api/crest-request to email justzyrick@gmail.com.");
    }
  }, [S, saveS, showToast]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (screen === "loading" || screen === "entry" || !S) {
    return (
      <>
        <LoadingScreen
          ready={screen === "entry" && !!S}
          entering={entering}
          onEnter={handleEnter}
          onGuest={handleGuestEnter}
          label={entering ? "ENTERING CLUBHOUSE" : "LOADING CLUBHOUSE"}
        />
        {toast && <Toast msg={toast}/>}
      </>
    );
  }

  return (
    <div
      style={{ position:"fixed", inset:0, background:"#010302" }}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Subtle dot-grid texture */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 1px 1px,rgba(24,193,88,.04) 1px,transparent 0)", backgroundSize:"24px 24px", pointerEvents:"none", zIndex:0 }}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", height:"100%", overflow:"hidden" }}>

        {screen === "createClub" && (
          <CreateClubScreen
            initialName={S.clubName !== "ZAP" ? S.clubName : ""}
            onCreate={handleCreateClub}
          />
        )}

        {screen === "home" && (
          <HomeScreen
            S={S}
            LB={LB}
            onKickOff={() => setScreen("modeSelect")}
            onLB={() => setScreen("lb")}
            onMissions={() => setScreen("missions")}
            onShop={() => setScreen("shop")}
            onTeam={() => setScreen("formation")}
          />
        )}

        {screen === "modeSelect" && (
          <ModeSelectionScreen
            S={S}
            LB={LB}
            onSinglePlayer={() => setScreen("matchfound")}
            onPvp={(room) => {
              launchGame({ name:room?.opponent?.clubName || "PVP RIVAL", rep:room?.opponent?.rep || S?.rep || 50, difficulty:"hard", pvpRoom:room?.code });
            }}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "missions" && (
          <MissionsScreen
            S={S}
            onPlay={() => setScreen("home")}
            onShop={() => setScreen("shop")}
            onTeam={() => setScreen("formation")}
            onClaimMission={(mission) => {
              const ns = normalizeState({
                ...S,
                rep: Math.max(0, Number(S.rep || 0) + Number(mission.reward || 0)),
                missionClaims: { ...(S.missionClaims || {}), [mission.id]: true },
              });
              setS(ns);
              saveS(ns);
              showToast(`+${mission.reward} REP claimed`);
            }}
          />
        )}

        {screen === "shop" && (
          <ShopScreen
            S={S}
            onPlay={() => setScreen("home")}
            onMissions={() => setScreen("missions")}
            onTeam={() => setScreen("formation")}
            onRequestCrest={requestCrest}
          />
        )}

        {screen === "formation" && (
          <PreMatchScreen
            S={S}
            teamOnly
            onKickOff={(fId) => {
              setSelectedFId(fId);
              const ns = normalizeState({ ...S, formationId: fId });
              setS(ns);
              saveS(ns);
              showToast("Formation saved.");
              setScreen("home");
            }}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "prematch" && (
          <PreMatchScreen
            S={S}
            onKickOff={(fId) => { setSelectedFId(fId); setScreen("matchfound"); }}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "matchfound" && (
          <MatchFoundScreen
            S={S}
            LB={LB}
            selectedFormationId={selectedFId}
            onSelectFormation={(fId) => {
              setSelectedFId(fId);
              const ns = normalizeState({ ...S, formationId: fId });
              setS(ns);
              saveS(ns);
              showToast("Formation ready.");
            }}
            onKickOff={launchGame}
            onBack={() => setScreen("modeSelect")}
          />
        )}

        {screen === "game" && (
          <GameScreen
            S={S}
            setS={updateS}
            LB={LB}
            setLB={setLB}
            saveLB={saveLB}
            onHome={returnHomeAfterMatch}
            showToast={showToast}
            dojo={dojo}
            account={account}
            provider={provider}
            opponent={matchOpponent}
          />
        )}

        {screen === "training" && (
          <TrainingMode
            onDone={() => {
              const ns = normalizeState({ ...S, trainingDone: true });
              setS(ns); saveS(ns);
              setScreen("home");
            }}
          />
        )}

        {screen === "lb" && (
          <Leaderboard
            S={S}
            LB={LB}
            onHome={() => setScreen("home")}
            onMissions={() => setScreen("missions")}
            onTeam={() => setScreen("formation")}
          />
        )}

        {market && (
          <MarketSheet
            S={S}
            onUpdate={handleMarketUpdate}
            onClose={() => setMarket(false)}
            showToast={showToast}
            dojo={dojo}
            account={account}
          />
        )}

        {toast && <Toast msg={toast}/>}
        {clubPrompt && (
          <ClubIdentityModal
            initialName=""
            saving={savingClub}
            onSave={handleSaveClubIdentity}
            onLater={handleClubIdentityLater}
          />
        )}
      </div>

      {dojo?.txPending && screen !== "game" && <TxPendingBadge/>}
    </div>
  );
}
