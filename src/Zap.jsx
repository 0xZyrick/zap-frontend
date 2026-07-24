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
import { getPlayerRegistry, isAlreadyRegisteredError, registerPlayer }  from "./lib/calls.js";
import { HomeScreen, ModeSelectionScreen, MissionsScreen, ShopScreen } from "./screens/HomeScreens.jsx";
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
const BOOT_LOADING_MS = 2500;
const PLAYER_LOADING = "/assets/players/loading-anime.png";
const LOADING_BG = "/assets/bg/loading-bg.png";
const ZAP_LOGO = "/assets/logo/zap-logo.png";
const ZAP_X_URL = import.meta.env.VITE_ZAP_X_URL || "https://x.com/humblechigozie_";
const ZAP_TELEGRAM_URL = import.meta.env.VITE_ZAP_TELEGRAM_URL || "https://t.me/+fIcD-lidDI81ZWE0";
const ZAP_DOCS_URL = import.meta.env.VITE_ZAP_DOCS_URL || "https://0xzyrick.github.io/zap-docs";
const CRITICAL_ASSETS = [
  "/assets/bg/spilt-bg.png",
  "/assets/bg/home-bg.png",
  "/assets/bg/card-texture.png",
  "/assets/bg/loading-bg.png",
  "/assets/bg/mode-texture.png",
  "/assets/bg/crest-generation-bg.png",
  "/assets/players/loading-anime.png",
  "/assets/players/anime-home.png",
  "/assets/players/anime-kickoff.png",
  "/assets/logo/zap-logo.png",
  "/assets/icons/coin.png",
  "/assets/icons/medal.png",
  "/assets/icons/rank.png",
];

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

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

function SplashSocialIcon({ type }) {
  const common = {
    fill:"none",
    stroke:"currentColor",
    strokeWidth:"2",
    strokeLinecap:"round",
    strokeLinejoin:"round",
  };
  if (type === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M4 4l16 16" />
        <path {...common} d="M20 4L4 20" />
      </svg>
    );
  }
  if (type === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M20.6 4.4c.5-.2.9.2.8.8l-3.1 14.6c-.1.6-.7.8-1.2.5l-4.6-3.4-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L7.2 13.4 2.6 12c-.6-.2-.6-.8.1-1.1l17.9-6.5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path {...common} d="M6 2h8l4 4v16H6z" />
      <path {...common} d="M14 2v5h5" />
      <path {...common} d="M9 12h6" />
      <path {...common} d="M9 16h6" />
    </svg>
  );
}

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
      <div className="zap-splash__corner">
        <div className="zap-splash__socials" aria-label="ZAP links">
          {[
            { label:"ZAP on X", href:ZAP_X_URL, type:"x" },
            { label:"ZAP on Telegram", href:ZAP_TELEGRAM_URL, type:"telegram" },
            { label:"ZAP documentation", href:ZAP_DOCS_URL, type:"docs" },
          ].map((link) => (
            <a
              key={link.type}
              className="zap-splash__social"
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
            >
              <SplashSocialIcon type={link.type} />
            </a>
          ))}
        </div>
        <div className="zap-splash__fineprint">SEASON 1 ACCESS</div>
      </div>
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

function ClubIdentityModal({
  initialName = "",
  saving = false,
  onSave,
  onLater,
  walletAddress = "",
  onCopyAddress,
  showLater = true,
  eyebrow = "FIRST MATCH COMPLETE",
  title = "What should the clubhouse call your squad?",
  body = "Your first run is saved. Add a matchday name now, or keep playing and decide later.",
}) {
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
        <div className="club-identity-modal__eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{body}</p>
        {walletAddress && (
          <div className="club-identity-modal__wallet">
            <span>Fund this account before registering</span>
            <code>{walletAddress}</code>
            <button type="button" onClick={() => onCopyAddress?.(walletAddress)}>
              Copy address
            </button>
          </div>
        )}
        <input
          value={clubName}
          maxLength={28}
          autoFocus
          onChange={(e) => setClubName(e.target.value.toUpperCase())}
          placeholder="SQUAD NAME"
        />
        <div className={`club-identity-modal__actions ${showLater ? "" : "club-identity-modal__actions--single"}`}>
          {showLater && <button type="button" onClick={onLater}>Later</button>}
          <button type="submit" disabled={!canSave}>{saving ? "Saving..." : "Save squad"}</button>
        </div>
      </form>
    </div>
  );
}

function WalletChoiceModal({ hasCartridgeWallet, hasReadyWallet, onCartridge, onReady, onClose }) {
  return (
    <div className="zap-modal-backdrop">
      <div className="wallet-choice-modal">
        <div className="wallet-choice-modal__eyebrow">WALLET ROUTE</div>
        <h2>Connect wallet</h2>
        <p>Cartridge is the smooth game route with sessions. Ready wallet stays available as a funded fallback.</p>
        <button
          type="button"
          disabled={!hasCartridgeWallet}
          onClick={onCartridge}
          className="wallet-choice-modal__option"
        >
          <span>Cartridge Controller</span>
          <small>{hasCartridgeWallet ? "Session keys + sponsorship route" : "Controller unavailable"}</small>
        </button>
        <button
          type="button"
          disabled={!hasReadyWallet}
          onClick={onReady}
          className="wallet-choice-modal__option"
        >
          <span>Ready wallet</span>
          <small>{hasReadyWallet ? "Argent X or Braavos" : "Install Argent X or Braavos"}</small>
        </button>
        <button type="button" onClick={onClose} className="wallet-choice-modal__cancel">
          Cancel
        </button>
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
  const [profileSyncing, setProfileSyncing] = useState(false);
  const [welcomeBanner, setWelcomeBanner] = useState(null);
  const [clubPrompt,    setClubPrompt]    = useState(false);
  const [savingClub,    setSavingClub]    = useState(false);
  const [walletChoice,  setWalletChoice]  = useState(false);

  const toastRef = useRef(null);
  const welcomeRef = useRef(null);
  const registerPromiseRef = useRef(null);
  const walletSessionRef = useRef(null);

  const { account, address, provider, connect, hasCartridgeWallet, hasReadyWallet } = useWallet();
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

  const showWelcome = useCallback((clubName, mode = "back") => {
    const name = formatClubName(clubName || "ZAP FC");
    clearTimeout(welcomeRef.current);
    setWelcomeBanner(mode === "new"
      ? `Welcome ${name}. Clubhouse ready.`
      : `Welcome back, ${name}. Nice to have you back.`);
    welcomeRef.current = setTimeout(() => setWelcomeBanner(null), 3200);
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

  const fetchRegistryWithRetry = useCallback(async (wallet, attempts = 4) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const registry = await getPlayerRegistry(wallet);
      if (registry?.registered) return registry;
      if (attempt < attempts - 1) await delay(700);
    }
    return null;
  }, []);

  const ensureRegistered = useCallback(async (clubName, stateLike = S, walletSession = null) => {
    const activeAccount = walletSession?.account || account;
    const activeProvider = walletSession?.provider || provider;
    const activeWallet = walletSession?.address || activeAccount?.address || address || stateLike?.wallet;
    if (!activeAccount) return null;
    if (stateLike?.onchainRegistered) return { alreadyRegistered: true };
    if (registerPromiseRef.current) return registerPromiseRef.current;

    const wallet = activeWallet;
    registerPromiseRef.current = (async () => {
      const registry = await fetchRegistryWithRetry(wallet);
      if (registry?.registered) {
        markOnchainRegistered(stateLike, registry, wallet);
        return { alreadyRegistered: true, registry };
      }

      let tx = null;
      try {
        tx = await registerPlayer(activeAccount, clubName);
      } catch (error) {
        console.error("ensureRegistered -> registerPlayer error:", error);
        if (!isAlreadyRegisteredError(error)) throw error;
        const confirmedRegistry = await fetchRegistryWithRetry(wallet, 6);
        markOnchainRegistered(stateLike, confirmedRegistry, wallet);
        return { alreadyRegistered: true, registry: confirmedRegistry };
      }
      if (tx?.transaction_hash && activeProvider) {
        await activeProvider.waitForTransaction(tx.transaction_hash);
      }
      if (tx?.transaction_hash || tx?.alreadyRegistered) {
        const confirmedRegistry = tx?.alreadyRegistered
          ? await fetchRegistryWithRetry(wallet, 6)
          : null;
        markOnchainRegistered(stateLike, confirmedRegistry, wallet);
      }
      return tx;
    })().finally(() => {
      registerPromiseRef.current = null;
    });

    return registerPromiseRef.current;
  }, [S, account, address, fetchRegistryWithRetry, markOnchainRegistered, provider]);

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

  const routeForWallet = useCallback(async (wallet, options = {}) => {
    let { s, lb } = loadProfile(wallet);
    const isWallet = wallet && wallet !== "local";

    if (isWallet) {
      const registry = await fetchRegistryWithRetry(wallet);
      if (registry?.registered) {
        s = normalizeState({
          ...s,
          wallet: wallet || "local",
          clubName: registry.clubName || s.clubName,
          clubCreated: true,
          clubIdentitySet: true,
          onchainRegistered: true,
        });
        try { localStorage.setItem(stateKey(wallet), JSON.stringify(s)); } catch (_) {}
      } else if (s?.onchainRegistered || s?.clubIdentitySet) {
        s = normalizeState({
          ...s,
          wallet,
          clubCreated: true,
          clubIdentitySet: true,
          onchainRegistered: !!s?.onchainRegistered,
        });
      } else {
        s = normalizeState({
          ...s,
          wallet,
          clubName: "ZAP",
          clubCreated: false,
          clubIdentitySet: false,
          clubIdentityPrompted: false,
          onchainRegistered: false,
        });
        setSelectedFId(s.formationId || "control-433");
        setS(s);
        setLB(lb);
        setScreen("createClub");
        return { registered:false, state:s, lb };
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
    if (options.welcome && isWallet) {
      showWelcome(s.clubName || "ZAP FC");
    }
    return { registered:!!s.onchainRegistered || !!s.clubIdentitySet, state:s, lb };
  }, [fetchRegistryWithRetry, showWelcome]);

  useEffect(() => {
    if (walletSessionRef.current) return;
    if (!entering || !account || !provider) return;
    const id = window.setTimeout(() => {
      setProfileSyncing(true);
      routeForWallet(account.address || address, { welcome:true }).finally(() => {
        setEntering(false);
        setProfileSyncing(false);
      });
    }, 0);
    return () => window.clearTimeout(id);
  }, [account, address, entering, provider, routeForWallet]);

  // ── Splash → connect wallet invisibly → route ─────────────────────────────
  const connectAndRoute = useCallback(async (mode) => {
    unlockAudio();
    setEntering(true);
    setWalletChoice(false);
    try {
      const walletSession = account && provider
        ? { account, provider, address:account.address || address }
        : await connect(mode);
      const wallet = walletSession?.account?.address || walletSession?.address || account?.address || address;
      walletSessionRef.current = walletSession;
      if (!wallet) throw new Error("Wallet connection did not return an address");
      setProfileSyncing(!!wallet && wallet !== "local");
      await routeForWallet(wallet, { welcome:true });
      setEntering(false);
      setProfileSyncing(false);
    } catch (error) {
      showToast(error?.message || "Wallet login failed. Please try again or use Guest Mode.", 4200);
      setEntering(false);
      setProfileSyncing(false);
      setScreen("entry");
    }
  }, [account, address, connect, provider, routeForWallet, showToast]);

  const handleEnter = useCallback(() => {
    unlockAudio();
    setWalletChoice(true);
  }, []);

  const handleGuestEnter = useCallback(async () => {
    unlockAudio();
    setEntering(true);
    try {
      await routeForWallet("local");
    } finally {
      setEntering(false);
    }
  }, [routeForWallet]);

  // ── Create club → register on-chain before clubhouse opens ───────────────
  const handleCreateClub = useCallback(async (clubName) => {
    const formattedName = formatClubName(clubName);
    const walletSession = walletSessionRef.current;
    const activeAccount = walletSession?.account || account;
    const activeProvider = walletSession?.provider || provider;
    const walletAddress = walletSession?.address || activeAccount?.address || account?.address || address || "local";
    const ns = normalizeState({
      ...S,
      clubName:    formattedName,
      clubCreated: true,
      clubIdentitySet: true,
      clubIdentityPrompted: true,
      trainingDone: TRAINING_MODE_ENABLED ? S?.trainingDone : true,
      wallet:      walletAddress,
    });

    setSavingClub(true);

    if (walletAddress !== "local") {
      if (!activeAccount) {
        showToast("Wallet connection needed to create your club.");
        setSavingClub(false);
        return;
      }
      setProfileSyncing(true);
      try {
        const result = await ensureRegistered(formattedName, ns, {
          account: activeAccount,
          provider: activeProvider,
          address: walletAddress,
        });
        const registry = result?.registry || await fetchRegistryWithRetry(walletAddress);
        const finalState = normalizeState({
          ...ns,
          clubName: registry?.clubName || formattedName,
          clubCreated: true,
          clubIdentitySet: true,
          clubIdentityPrompted: true,
          onchainRegistered: true,
        });
        setS(finalState);
        saveS(finalState);
        setScreen(TRAINING_MODE_ENABLED && !finalState.trainingDone ? "training" : "home");
        showWelcome(finalState.clubName, "new");
        trackClubCreated();
      } catch (error) {
        console.error("handleCreateClub error:", error);
        if (isAlreadyRegisteredError(error)) {
          const registry = await fetchRegistryWithRetry(walletAddress, 6);
          const finalState = markOnchainRegistered(ns, registry, walletAddress);
          setScreen(TRAINING_MODE_ENABLED && !finalState.trainingDone ? "training" : "home");
          showWelcome(finalState.clubName, "back");
        } else {
          showToast(`Could not create club on-chain: ${error?.message || "Check console"}`);
        }
      } finally {
        setProfileSyncing(false);
        setSavingClub(false);
      }
      return;
    }

    setS(ns);
    saveS(ns);
    setScreen(TRAINING_MODE_ENABLED && !ns.trainingDone ? "training" : "home");
    showWelcome(formattedName, "new");
    trackClubCreated();
    setSavingClub(false);
  }, [S, account, address, ensureRegistered, fetchRegistryWithRetry, markOnchainRegistered, provider, saveS, showToast, showWelcome]);

  const handleSaveClubIdentity = useCallback(async (clubName) => {
    const formattedName = formatClubName(clubName);
    setSavingClub(true);
    if ((S?.wallet || "local") === "local") {
      const ns = normalizeState({
        ...S,
        clubName: formattedName,
        clubCreated: true,
        clubIdentitySet: true,
        clubIdentityPrompted: true,
        trainingDone: TRAINING_MODE_ENABLED ? S?.trainingDone : true,
        wallet: "local",
      });
      setS(ns);
      saveS(ns);
      setClubPrompt(false);
      showToast("Guest squad name saved locally.");
      trackClubCreated();
      setSavingClub(false);
      return;
    }
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
    } catch (error) {
      console.error("handleSaveClubIdentity error:", error);
      if (isAlreadyRegisteredError(error)) {
        const registry = await fetchRegistryWithRetry(walletAddress, 6);
        markOnchainRegistered(ns, registry, walletAddress);
        showToast("Wallet club already exists. Synced profile.");
      } else {
        showToast(`Saved locally. On-chain error: ${error?.message || "Check console"}`);
      }
    }
    setSavingClub(false);
  }, [S, account, address, connect, ensureRegistered, fetchRegistryWithRetry, markOnchainRegistered, provider, saveS, showToast, showWelcome]);

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
      } catch (error) {
        console.error("launchGame on-chain sync error:", error);
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
        {walletChoice && (
          <WalletChoiceModal
            hasCartridgeWallet={hasCartridgeWallet}
            hasReadyWallet={hasReadyWallet}
            onCartridge={() => connectAndRoute("cartridge")}
            onReady={() => connectAndRoute("ready")}
            onClose={() => setWalletChoice(false)}
          />
        )}
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
          <ClubIdentityModal
            initialName={S.clubIdentitySet ? S.clubName : ""}
            saving={savingClub}
            onSave={handleCreateClub}
            walletAddress={S?.wallet && S.wallet !== "local" ? S.wallet : address || account?.address || ""}
            onCopyAddress={async (walletAddress) => {
              try {
                await navigator.clipboard.writeText(walletAddress);
                showToast("Wallet address copied.");
              } catch {
                showToast("Copy failed. Select the address manually.");
              }
            }}
            showLater={false}
            eyebrow="CREATE CLUB"
            title="Name your club"
            body="Your wallet is connected. Choose the club name that will be registered to this profile."
          />
        )}

        {walletChoice && (
          <WalletChoiceModal
            hasCartridgeWallet={hasCartridgeWallet}
            hasReadyWallet={hasReadyWallet}
            onCartridge={() => connectAndRoute("cartridge")}
            onReady={() => connectAndRoute("ready")}
            onClose={() => setWalletChoice(false)}
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
            onBack={() => setScreen("home")}
            pvp={dojo}
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
        {welcomeBanner && (
          <div style={{
            position:"absolute",
            top:"72px",
            left:"50%",
            transform:"translateX(-50%)",
            zIndex:1000,
            padding:"9px 14px",
            borderRadius:"999px",
            border:"1px solid rgba(84,232,113,.22)",
            background:"rgba(2,10,6,.82)",
            color:"rgba(238,245,240,.86)",
            fontFamily:"var(--f-mono)",
            fontSize:"9px",
            letterSpacing:".12em",
            textTransform:"uppercase",
            boxShadow:"0 16px 38px rgba(0,0,0,.3),0 0 22px rgba(34,197,94,.12)",
            backdropFilter:"blur(12px)",
            pointerEvents:"none",
            animation:"flashIn .22s ease",
            whiteSpace:"nowrap",
          }}>{welcomeBanner}</div>
        )}
        {profileSyncing && (
          <div style={{
            position:"absolute",
            inset:0,
            zIndex:999,
            display:"grid",
            placeItems:"center",
            background:"rgba(1,5,3,.72)",
            backdropFilter:"blur(5px)",
            pointerEvents:"auto",
          }}>
            <div style={{ display:"grid", justifyItems:"center", gap:"14px" }}>
              <div style={{
                width:"42px",
                height:"42px",
                borderRadius:"50%",
                border:"2px solid rgba(84,232,113,.18)",
                borderTopColor:"#54e871",
                animation:"spin .8s linear infinite",
                boxShadow:"0 0 22px rgba(84,232,113,.18)",
              }}/>
              <div style={{
                fontFamily:"var(--f-mono)",
                fontSize:"9px",
                letterSpacing:".18em",
                color:"rgba(238,245,240,.72)",
                textTransform:"uppercase",
              }}>Syncing clubhouse profile</div>
            </div>
          </div>
        )}
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
