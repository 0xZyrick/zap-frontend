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
import TrainingMode                                  from "./screens/TrainingMode.jsx";
import {
  trackAppOpened, trackClubCreated, trackMatchStarted,
} from "./lib/analytics.js";
import MarketSheet                                    from "./modals/MarketSheet.jsx";
import { Toast, TxPendingBadge }                      from "./ui/ui.jsx";

const walletKey = (wallet) => String(wallet || "local").toLowerCase();
const stateKey = (wallet) => `zapfc:s5:${walletKey(wallet)}`;
const leaderboardKey = (wallet) => `zapfc:lb5:${walletKey(wallet)}`;

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
function LoadingScreen() {
  return (
    <div style={{ position:"fixed", inset:0, background:"#020504", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontFamily:'"Bebas Neue",cursive', fontSize:"32px", letterSpacing:"6px", color:"#18c158", animation:"loadPulse 1.4s ease-in-out infinite" }}>ZAP</div>
      <div style={{ display:"flex", gap:"6px" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#18c158", opacity:.6, animation:`loadPulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
        ))}
      </div>
      <div style={{ fontFamily:'"IBM Plex Mono",monospace', fontSize:"8px", letterSpacing:".22em", color:"rgba(24,193,88,.38)" }}>DECISION FOOTBALL</div>
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
    (async () => {
      const { s, lb } = loadProfile("local");
      setSelectedFId(s.formationId || "control-433");
      setS(s);
      setLB(lb);
      setScreen("splash");
      trackAppOpened();
    })();
  }, []);

  const routeForWallet = useCallback((wallet) => {
    const { s, lb } = loadProfile(wallet);
    setSelectedFId(s.formationId || "control-433");
    setS(s);
    setLB(lb);
    // Route to training if first-time player hasn't done it yet
    if (!s.clubCreated) {
      setScreen("createClub");
    } else if (!s.trainingDone) {
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
      console.log("[handleEnter] Initiating enter flow...", { account: !!account, provider: !!provider });
      
      // Attempt connection if not already connected
      if (!account || !provider) {
        console.log("[handleEnter] Calling connect()...");
        try {
          await connect();
          console.log("[handleEnter] Connect succeeded");
        } catch (e) {
          console.error("[handleEnter] Connect failed:", e?.message || e);
          showToast("Wallet connection failed. Please try again.");
          setEntering(false);
          return;
        }
      }
      
      if (account && provider) {
        console.log("[handleEnter] Routing with active wallet...");
        routeForWallet(account.address || address);
        setEntering(false);
      } else {
        console.log("[handleEnter] Waiting for wallet state before routing...");
      }
    } catch (e) {
      console.error("[handleEnter] Unexpected error:", e?.message || e);
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
      wallet:      account?.address || address || "local",
    });
    setS(ns); saveS(ns);
    setScreen(ns.trainingDone ? "home" : "training");
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
        } catch (e) {
          if (!e?.message?.includes("Already registered"))
            console.warn("registerPlayer:", e?.message);
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
      } catch (e) {
        console.warn("pre-match chain setup:", e?.message);
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
