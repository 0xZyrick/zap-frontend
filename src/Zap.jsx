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
import { SplashScreen, CreateClubScreen, HomeScreen } from "./screens/HomeScreens.jsx";
import { PreMatchScreen, MatchFoundScreen }           from "./screens/MatchScreens.jsx";
import { Leaderboard }                                from "./screens/Leaderboard.jsx";
import GameScreen                                     from "./game/GameScreen.jsx";
import TrainingMode                                   from "./screens/TrainingMode.jsx";
import {
  trackAppOpened, trackClubCreated, trackMatchStarted,
} from "./lib/analytics.js";
import MarketSheet                                    from "./modals/MarketSheet.jsx";
import { Toast, TxPendingBadge }                      from "./ui/ui.jsx";

const walletKey = (wallet) => String(wallet || "local").toLowerCase();
const stateKey = (wallet) => `zapfc:s5:${walletKey(wallet)}`;
const leaderboardKey = (wallet) => `zapfc:lb5:${walletKey(wallet)}`;
const TRAINING_MODE_ENABLED = false;
const BOOT_LOADING_MS = 3000;

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
function LoadingScreen({ label = "LOADING CLUBHOUSE" }) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const eased = 1 - Math.pow(1 - Math.min(elapsed / 3200, 1), 3);
      setProgress(Math.min(96, Math.round(8 + eased * 88)));
    }, 120);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:80, background:"#020504", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 54% 38% at 50% 42%,rgba(24,193,88,.16),transparent 68%),linear-gradient(180deg,rgba(2,5,4,.7),#020504 82%)" }} />
      <div style={{ position:"absolute", inset:0, opacity:.18, backgroundImage:"linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize:"100% 18px", animation:"loadPulse 1.8s ease-in-out infinite" }} />

      <div style={{ position:"relative", zIndex:1, width:"min(680px,calc(100vw - 40px))", textAlign:"center" }}>
        <div style={{ fontFamily:"var(--f-cond)", fontSize:"clamp(18px,2.4vw,28px)", fontWeight:900, letterSpacing:".16em", color:"rgba(250,204,21,.88)", marginBottom:"12px", textTransform:"uppercase" }}>From the founder of Cipher</div>
        <div style={{ fontFamily:"var(--f-cond)", fontSize:"clamp(15px,1.8vw,22px)", fontWeight:800, letterSpacing:".14em", color:"rgba(255,255,255,.58)", marginBottom:"22px", textTransform:"uppercase" }}>Winner of Dojo Hackathon</div>
        <div style={{ fontFamily:"var(--f-disp)", fontSize:"clamp(118px,18vw,190px)", lineHeight:.78, letterSpacing:".05em", color:"#f8fff9", textShadow:"0 0 70px rgba(24,193,88,.32)" }}>ZAP</div>
        <div style={{ fontFamily:"var(--f-cond)", fontSize:"clamp(18px,2.2vw,28px)", fontWeight:900, letterSpacing:".18em", color:"rgba(24,193,88,.72)", marginTop:"16px", textTransform:"uppercase" }}>A Decision Football Story</div>

        <div style={{ margin:"44px auto 0", width:"min(480px,100%)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px", fontFamily:"var(--f-mono)", fontSize:"10px", letterSpacing:".16em", color:"rgba(255,255,255,.58)" }}>
            <span>{label}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height:"11px", borderRadius:"999px", overflow:"hidden", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.1)" }}>
            <i style={{ display:"block", width:`${progress}%`, height:"100%", borderRadius:"inherit", background:"linear-gradient(90deg,#facc15,#22c55e,#38bdf8)", boxShadow:"0 0 22px rgba(34,197,94,.42)", transition:"width .18s ease" }} />
          </div>
        </div>
      </div>
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

  const toastRef = useRef(null);
  const registerPromiseRef = useRef(null);

  const { account, address, provider, connect } = useWallet();
  const dojo = useDojoGame(account, provider);

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

  const markOnchainRegistered = useCallback((stateLike = S, registry = null) => {
    const wallet = stateLike?.wallet || account?.address || address || "local";
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

  const ensureRegistered = useCallback(async (clubName, stateLike = S) => {
    if (!account) return null;
    if (stateLike?.onchainRegistered) return { alreadyRegistered: true };
    if (registerPromiseRef.current) return registerPromiseRef.current;

    const wallet = account.address || address || stateLike?.wallet;
    registerPromiseRef.current = (async () => {
      const registry = await getPlayerRegistry(wallet);
      if (registry?.registered) {
        markOnchainRegistered(stateLike, registry);
        return { alreadyRegistered: true, registry };
      }

      const tx = await registerPlayer(account, clubName);
      if (tx?.transaction_hash && provider) {
        await provider.waitForTransaction(tx.transaction_hash);
      }
      if (tx?.transaction_hash || tx?.alreadyRegistered) {
        markOnchainRegistered(stateLike);
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
      setScreen("splash");
      trackAppOpened();
    })();
    return () => { cancelled = true; };
  }, []);

  const routeForWallet = useCallback((wallet) => {
    const { s, lb } = loadProfile(wallet);
    setSelectedFId(s.formationId || "control-433");
    setS(s);
    setLB(lb);
    if (!s.clubCreated) {
      setScreen("createClub");
    } else if (TRAINING_MODE_ENABLED && !s.trainingDone) {
      setScreen("training");
    } else {
      setScreen("home");
    }
  }, []);

  useEffect(() => {
    if (!entering || !account || !provider) return;
    const id = window.setTimeout(() => {
      routeForWallet(account.address || address);
      setEntering(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [account, address, entering, provider, routeForWallet]);

  // ── Splash → connect wallet invisibly → route ─────────────────────────────
  const handleEnter = useCallback(async () => {
    setEntering(true);
    try {
      // Attempt connection if not already connected
      if (!account || !provider) {
        try {
          await connect();
        } catch {
          showToast("Wallet connection failed. Please try again.");
          setEntering(false);
          return;
        }
      }
      
      if (account && provider) {
        routeForWallet(account.address || address);
        setEntering(false);
      }
    } catch {
      showToast("Error entering clubhouse");
      setEntering(false);
    }
  }, [account, address, connect, routeForWallet, showToast, provider]);

  // ── Create club → register on-chain (non-blocking) ───────────────────────
  const handleCreateClub = useCallback(async (clubName) => {
    const formattedName = formatClubName(clubName);
    const ns = normalizeState({
      ...S,
      clubName:    formattedName,
      clubCreated: true,
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

  // ── Launch match ─────────────────────────────────────────────────────────
  const launchGame = useCallback(async (opponent) => {
    const ns = normalizeState({ ...S, formationId: selectedFId });
    setS(ns); saveS(ns);
    setMatchOpponent(opponent || { name:"RIVALS FC", rep: Math.max(10, S?.rep || 50) });

    if (account) {
      try {
        await ensureRegistered(ns.clubName || "ZAP", ns);
        const feltId = FORMATION_FELT[selectedFId];
        if (feltId) await dojo.doSetFormation(feltId);
      } catch {
        // Non-blocking: match can still run with client fallback if chain setup is unavailable.
      }
    }
    const fShape = FORMATIONS.find(x => x.id === selectedFId)?.shape || selectedFId;
    const { getOpponentProfile } = await import("./game/constants.js");
    const profile = getOpponentProfile(opponent?.name || "");
    trackMatchStarted({
      formationId:    selectedFId,
      formationShape: fShape,
      opponentStyle:  profile?.style || "unknown",
      isFirstMatch:   (S?.total || 0) === 0,
    });
    setScreen("game");
  }, [S, selectedFId, account, dojo, ensureRegistered, saveS]);

  const handleMarketUpdate = useCallback((ns) => {
    const next = normalizeState(ns);
    setS(next);
    saveS(next);
  }, [saveS]);

  const updateS = useCallback((ns) => {
    setS(ns);
    saveS(ns);
  }, [saveS]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (screen === "loading" || !S) return <LoadingScreen/>;

  return (
    <div style={{ position:"fixed", inset:0, background:"#010302" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Subtle dot-grid texture */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 1px 1px,rgba(24,193,88,.04) 1px,transparent 0)", backgroundSize:"24px 24px", pointerEvents:"none", zIndex:0 }}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", height:"100%", overflow:"hidden" }}>

        {screen === "splash" && (
          <SplashScreen onEnter={handleEnter} loading={entering}/>
        )}

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
            onKickOff={() => setScreen("prematch")}
            onLB={() => setScreen("lb")}
            onMarket={() => setMarket(true)}
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
            onKickOff={launchGame}
            onChangeFormation={() => setScreen("prematch")}
          />
        )}

        {screen === "game" && (
          <GameScreen
            S={S}
            setS={updateS}
            LB={LB}
            setLB={setLB}
            saveLB={saveLB}
            onHome={() => {
              // Only fire abandon if match was in progress
              setScreen("home");
            }}
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
          <Leaderboard S={S} LB={LB} onHome={() => setScreen("home")}/>
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
      </div>

      {dojo?.txPending && <TxPendingBadge/>}
    </div>
  );
}
