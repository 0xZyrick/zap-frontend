// ─── HomeScreens.jsx ─────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { StadiumEnvironment } from "../pitch/pitch.jsx";
import { myRank } from "../game/gameState.js";
import HomeStadiumBackdrop from "../ui/HomeStadiumBackdrop.jsx";
import { createPvpRoom, getPvpRoom, joinPvpRoom, subscribePvpRooms } from "../lib/pvpRooms.js";
import "./homeScreen.css";

const PLAYER_HOME = "/assets/players/anime-home.png";
const PLAYER_KICK = "/assets/players/anime-kickoff.png";
const ZAP_LOGO = "/assets/logo/zap-logo.png";
const COIN_ICON = "/assets/icons/coin.png";
const MEDAL_ICON = "/assets/icons/medal.png";
const RANK_ICON = "/assets/icons/rank.png";
const LEADERBOARD_CARD_IMAGE = "/assets/announcements/leaderboard-bg.png";
const TOURNAMENT_CARD_IMAGE = "/assets/announcements/tournament-bg.png";
const CREST_GENERATION_BG = "/assets/bg/crest-generation-bg.png";
const ANNOUNCEMENT_CANDIDATES = [
  ...Array.from({ length: 5 }, (_, i) => `/assets/announcements/announcement-${String(i + 1).padStart(2, "0")}.png`),
];

const CRESTS = {
  derick: "/assets/crests/derick.png",
  derickfc: "/assets/crests/derick.png",
  elmaestro: "/assets/crests/el-maestro.png",
  phantomxi: "/assets/crests/phantom-xi.png",
  codmai: "/assets/crests/codmai.png",
  skyfoot: "/assets/crests/sky-foot.png",
  ghoststrike: "/assets/crests/ghost-strike.png",
};

function assetKey(name = "") {
  return name
    .toLowerCase()
    .replace(/\bfc\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function crestSrc(name) {
  return CRESTS[assetKey(name)] || null;
}

function ordinal(value) {
  const n = Number(value) || 0;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}TH`;
  const suffix = n % 10 === 1 ? "ST" : n % 10 === 2 ? "ND" : n % 10 === 3 ? "RD" : "TH";
  return `${n}${suffix}`;
}

function getClubDisplay(S) {
  const clubName = S?.clubName || "ZYRICK FC";
  const initials = clubName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return { clubName, initials, clubCrest: crestSrc(clubName) };
}

function buildMissions(S = {}) {
  const total = Number(S.total || 0);
  const wins = Number(S.wins || 0);
  const claims = S.missionClaims || {};
  const accuracy = total ? Math.round((wins / Math.max(total, 1)) * 100) : 0;
  const mission = (group, id, title, desc, current, target, reward, reset = "") => {
    const progress = Math.min(current, target);
    const complete = progress >= target;
    return {
      group,
      id,
      title,
      desc,
      current: progress,
      target,
      reward,
      reset,
      complete,
      claimed: !!claims[id],
      pct: Math.min(100, Math.round(progress / Math.max(target, 1) * 100)),
    };
  };

  return {
    daily: [
      mission("daily", "daily-play-match", "Play one match today", "Finish any match before the daily reset.", total, 1, 10, "24H"),
      mission("daily", "daily-go-wide", "Win with Go Wide", "Win a midfield turn using the wide read.", Number(S.goWideWins || 0), 1, 5, "24H"),
      mission("daily", "daily-no-abandon", "No abandon finish", "Complete a full match without quitting.", total, 1, 8, "24H"),
      mission("daily", "daily-three-correct", "Three correct reads", "Read correctly three times in one match.", Number(S.bestCorrectReads || 0), 3, 12, "24H"),
    ],
    weekly: [
      mission("weekly", "weekly-three-wins", "Win three matches", "Stack three wins before Monday reset.", wins, 3, 50, "MON"),
      mission("weekly", "weekly-accuracy", "70% read accuracy", "Reach 70%+ accuracy in a single match.", Number(S.bestAccuracy || accuracy), 70, 40, "MON"),
      mission("weekly", "weekly-five-opponents", "Five different opponents", "Play against five different rivals.", Number(S.uniqueOpponents || 0), 5, 35, "MON"),
      mission("weekly", "weekly-in-form", "Trigger In Form", "Hit the momentum state in live play.", Number(S.inFormTriggers || 0), 1, 30, "MON"),
    ],
    achievements: [
      mission("achievements", "ach-read-master", "Read Master", "Claim after 25 correct reads.", Number(S.correctReads || 0), 25, 120, "TITLE"),
      mission("achievements", "ach-counter-caller", "Counter Caller", "Beat the opponent's read 10 times.", Number(S.counterReads || 0), 10, 90, "TITLE"),
      mission("achievements", "ach-comeback-king", "Comeback King", "Win after trailing at half time.", Number(S.comebackWins || 0), 1, 100, "TITLE"),
      mission("achievements", "ach-clean-sheet", "Clean Sheet Mind", "Win without conceding.", Number(S.cleanSheetWins || 0), 1, 80, "TITLE"),
    ],
  };
}

function hasClaimableMission(S) {
  return Object.values(buildMissions(S)).flat().some((mission) => mission.complete && !mission.claimed);
}

export function ScreenBackButton({ onClick, label = "Back" }) {
  return (
    <button className="zap-screen-back" onClick={onClick} aria-label={label}>
      <span aria-hidden="true">‹</span>
      {label}
    </button>
  );
}

export function ClubhouseHeader({ S, LB = [], active = "play", onPlay, onMissions, onShop, onTeam, extraStats = null }) {
  const { clubName, initials, clubCrest } = getClubDisplay(S);
  const coins = S?.coins || 0;
  const medals = S?.medals ?? S?.wins ?? 6;
  const rank = myRank(S, LB);
  const navItems = [
    { id:"play", label:"PLAY", onClick:onPlay },
    { id:"missions", label:"MISSIONS", onClick:onMissions, badge:hasClaimableMission(S) },
    { id:"shop", label:"SHOP", onClick:onShop, disabled:!onShop },
    { id:"team", label:"TEAM", onClick:onTeam },
  ];

  return (
    <>
      <header className="zap-home__header">
        <div className="zap-home__club">
          <div className="zap-home__crest">
            {clubCrest ? <img src={clubCrest} alt="" draggable={false} /> : <span>{initials}</span>}
          </div>
          <strong>{clubName}</strong>
        </div>

        <div className="zap-home__stats" aria-label="Club stats">
          {active === "leaderboard" && (
            <span className="zap-home__stat"><img src={RANK_ICON} alt="" draggable={false} />{ordinal(rank)}</span>
          )}
          <span className="zap-home__stat zap-home__stat--coin"><img src={COIN_ICON} alt="" draggable={false} />{coins}</span>
          <span className="zap-home__stat zap-home__stat--medal"><img src={MEDAL_ICON} alt="" draggable={false} />{medals}</span>
          {extraStats}
        </div>

        <img className="zap-home__logo" src={ZAP_LOGO} alt="ZAP" draggable={false} />
      </header>

      {active !== "leaderboard" && (
        <nav className="zap-home__nav" aria-label="Clubhouse">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${item.id === active ? "is-active" : ""} ${item.badge ? "has-badge" : ""}`}
              disabled={item.disabled}
              onClick={item.onClick}
            >
              {item.label}
              {item.badge && <span className="zap-home__nav-badge" aria-hidden="true" />}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}

// ── SplashScreen ──────────────────────────────────────────────────────────────
export function SplashScreen({ onEnter, loading }) {
  return (
    <div className="zap-splash">
      <StadiumEnvironment gs="MIDFIELD"/>
      <div className="zap-splash__wash" />
      <img className="zap-splash__player" src={PLAYER_HOME} alt="" draggable={false} />
      <div className="zap-splash__mark">
        <img className="zap-splash__logo" src={ZAP_LOGO} alt="ZAP" draggable={false} />
        <div className="zap-splash__line" />
        <h1>WORLD FIRST<br/>ONCHAIN FOOTBALL</h1>
        <p>Read the pressure. Pick the intent. Own the match.</p>
        <button
          onClick={onEnter}
          disabled={loading}
          className="zap-splash__cta"
        >
          {loading ? "LOADING..." : "ENTER CLUBHOUSE"}
        </button>
      </div>
      <div className="zap-splash__fineprint">SEASON 1 ACCESS</div>
    </div>
  );
}

// ── CreateClubScreen ──────────────────────────────────────────────────────────
export function CreateClubScreen({ initialName = "", onCreate }) {
  const [clubName, setClubName] = useState(initialName);
  const [saving,   setSaving]   = useState(false);
  const clean    = clubName.trim().replace(/\s+/g," ");
  const previewBase = (clean || "YOUR CLUB").replace(/\s+F\.?C\.?$/i, "").replace(/\bF\.?C\.?$/i, "").trim() || "YOUR CLUB";
  const shortName = previewBase
    .replace(/\s+F\.?C\.?$/i, "")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase() || "FC";
  const canSave  = clean.length >= 2 && !saving;

  const submit = async (e) => {
    e?.preventDefault();
    if (!canSave) return;
    setSaving(true);
    await onCreate(clean.slice(0, 28));
    setSaving(false);
  };

  return (
    <div className="club-reveal-screen" style={{ position:"absolute", inset:0, overflow:"hidden", background:"#030a05" }}>
      <StadiumEnvironment gs="MIDFIELD"/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,rgba(1,6,3,.92) 0%,rgba(1,6,3,.6) 50%,rgba(1,6,3,.96) 100%)" }}/>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 50% 60% at 30% 50%,rgba(24,193,88,.12),transparent 65%)" }}/>

      {/* top label */}
      <div style={{ position:"absolute", top:"20px", left:"20px", right:"20px", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:2 }}>
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".28em", color:"var(--green)" }}>NEW SAVE</div>
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".2em", color:"rgba(255,255,255,.3)" }}>THIS NAME IS YOUR IDENTITY</div>
      </div>

      <form onSubmit={submit} style={{ position:"relative", zIndex:2, height:"100%", display:"flex", flexDirection:"column", alignItems:"flex-start", justifyContent:"center", padding:"60px 24px 40px" }}>

        <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".32em", color:"rgba(24,193,88,.6)", marginBottom:"10px" }}>STEP 1 OF 1</div>

        <div style={{ fontFamily:"var(--f-disp)", fontSize:"clamp(48px,10vw,90px)", lineHeight:.85, letterSpacing:"2px", marginBottom:"28px" }}>
          <span style={{ color:"rgba(255,255,255,.9)" }}>NAME<br/>YOUR </span>
          <span style={{ color:"#18c158" }}>CLUB</span>
        </div>

        <div style={{ width:"100%", maxWidth:"540px" }}>
          <input
            value={clubName}
            maxLength={28}
            autoFocus
            onChange={e => setClubName(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
            placeholder="CLUB NAME…"
            style={{
              width:"100%",
              height:"60px",
              borderRadius:"12px",
              border:"1px solid rgba(24,193,88,.25)",
              background:"rgba(3,10,5,.8)",
              color:"#fff",
              padding:"0 18px",
              fontFamily:"var(--f-disp)",
              fontSize:"28px",
              letterSpacing:"1.5px",
              outline:"none",
              boxSizing:"border-box",
              caretColor:"#18c158",
              marginBottom:"12px",
            }}
          />

          <div style={{
            display:"grid",
            gridTemplateColumns:"72px minmax(0,1fr)",
            gap:"12px",
            alignItems:"center",
            padding:"12px",
            marginBottom:"12px",
            borderRadius:"14px",
            background:"linear-gradient(135deg,rgba(24,193,88,.12),rgba(255,255,255,.035))",
            border:"1px solid rgba(24,193,88,.22)",
            boxShadow:"0 14px 36px rgba(0,0,0,.22)",
          }}>
            <div style={{
              width:"64px", height:"64px", borderRadius:"16px",
              display:"flex", alignItems:"center", justifyContent:"center",
              background:"radial-gradient(circle at 35% 25%,rgba(255,255,255,.22),rgba(24,193,88,.2) 42%,rgba(2,10,4,.95))",
              border:"1px solid rgba(24,193,88,.45)",
              color:"#18c158",
              fontFamily:"var(--f-disp)",
              fontSize:"24px",
              letterSpacing:"1px",
              animation:"clubCrestReveal .8s cubic-bezier(.2,.86,.2,1)",
            }}>{shortName}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".18em", color:"rgba(24,193,88,.62)", marginBottom:"5px" }}>CLUB PREVIEW</div>
              <div style={{ fontFamily:"var(--f-disp)", fontSize:"26px", color:"#fff", lineHeight:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{previewBase.toUpperCase()} FC</div>
              <div style={{ marginTop:"6px", display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:"8px", color:"rgba(255,255,255,.42)", letterSpacing:".14em" }}>SHORT {shortName}</span>
                <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:"rgba(24,193,88,.55)" }}/>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:"8px", color:"rgba(255,255,255,.42)", letterSpacing:".14em" }}>PFP READY</span>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:"10px" }}>
            <button
              type="submit"
              disabled={!canSave}
              style={{
                flex:1,
                height:"52px",
                borderRadius:"12px",
                background: canSave ? "#18c158" : "rgba(255,255,255,.08)",
                color: canSave ? "#020a04" : "rgba(255,255,255,.28)",
                fontFamily:"var(--f-disp)",
                fontSize:"18px",
                letterSpacing:"2.5px",
                border:"none",
                cursor: canSave ? "pointer" : "not-allowed",
                boxShadow: canSave ? "0 0 32px rgba(24,193,88,.35)" : "none",
                transition:"all .15s",
              }}
            >
              {saving ? "CREATING…" : "CREATE CLUB"}
            </button>
          </div>

          <div style={{ marginTop:"12px", fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".18em", color:"rgba(255,255,255,.22)" }}>
            {clean.length}/28 CHARACTERS · SQUAD & FORMATION NEXT
          </div>
        </div>
      </form>
    </div>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────────
export function HomeScreen({ S, LB = [], onKickOff, onLB, onMissions, onShop, onTeam }) {
  const [announcementImages, setAnnouncementImages] = useState(ANNOUNCEMENT_CANDIDATES);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const visibleAnnouncements = announcementImages.length ? announcementImages : ["/assets/announcements/announcement-01.png"];
  const activeAnnouncement = visibleAnnouncements[announcementIndex % visibleAnnouncements.length];
  const nextAnnouncement = visibleAnnouncements[(announcementIndex + 1) % visibleAnnouncements.length];
  const removeMissingAnnouncement = (src) => {
    setAnnouncementImages((items) => items.length > 1 ? items.filter((item) => item !== src) : items);
  };

  useEffect(() => {
    setAnnouncementIndex((index) => index % Math.max(visibleAnnouncements.length, 1));
  }, [visibleAnnouncements.length]);

  useEffect(() => {
    if (visibleAnnouncements.length <= 1) return undefined;
    const nextTimer = window.setTimeout(() => {
      setAnnouncementIndex((index) => (index + 1) % visibleAnnouncements.length);
    }, 18000);
    return () => {
      window.clearTimeout(nextTimer);
    };
  }, [announcementIndex, visibleAnnouncements.length]);

  return (
    <HomeStadiumBackdrop>
      <div className="home-rotate-gate">
        <div>
          <span>Portrait screen detected</span>
          <strong>Rotate your phone</strong>
          <p>ZAP needs a wider matchday view so the pitch, table, and controls stay clean.</p>
        </div>
      </div>

      <main className="zap-home">
        <ClubhouseHeader S={S} LB={LB} active="play" onPlay={onKickOff} onMissions={onMissions} onShop={onShop} onTeam={onTeam} />

        <section className="zap-home__cards">
          <div className="zap-home__slider" aria-hidden="true">
            <article className="zap-home-card zap-home-card--tournament" key={activeAnnouncement}>
              <img
                className="zap-home-card__banner-img zap-home-card__banner-img--current"
                src={activeAnnouncement}
                alt=""
                draggable={false}
                decoding="async"
                onError={() => removeMissingAnnouncement(activeAnnouncement)}
              />
              {visibleAnnouncements.length > 1 && (
                <img
                  className="zap-home-card__banner-img zap-home-card__banner-img--next"
                  src={nextAnnouncement}
                  alt=""
                  draggable={false}
                  decoding="async"
                  onError={() => removeMissingAnnouncement(nextAnnouncement)}
                />
              )}
            </article>
          </div>

          <button className="zap-home-card zap-home-card--kickoff" onClick={onKickOff}>
            <div className="zap-home-card__tab-media">
              <img className="zap-home-card__kick-img" src={PLAYER_KICK} alt="" draggable={false} decoding="async" />
            </div>
            <div className="zap-home-card__tab-copy">
              <h2>KICK OFF</h2>
              <p>Quick match with single or multiplayer mode.</p>
              <span>START MATCH</span>
            </div>
          </button>

          <button className="zap-home-card zap-home-card--leaderboard" onClick={onLB}>
            <div className="zap-home-card__tab-media">
              <img
                className="zap-home-card__side-img"
                src={LEADERBOARD_CARD_IMAGE}
                alt=""
                draggable={false}
                decoding="async"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className="zap-home-card__tab-copy">
              <h2>LEADERBOARD</h2>
              <p>The table doesn't lie. Every read recorded.</p>
              <span>CHECK THE RACE</span>
            </div>
          </button>

          <button className="zap-home-card zap-home-card--leaderboard zap-home-card--tournament-tab is-locked" disabled>
            <div className="zap-home-card__tab-media">
              <img
                className="zap-home-card__side-img"
                src={TOURNAMENT_CARD_IMAGE}
                alt=""
                draggable={false}
                decoding="async"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div className="zap-home-card__tab-copy">
              <h2>TOURNAMENT</h2>
              <p>Bracket play and champion runs are being prepared.</p>
              <span>COMING SOON</span>
            </div>
          </button>

        </section>
      </main>
    </HomeStadiumBackdrop>
  );
}

function PvpRoomModal({ S, onClose, onPaired }) {
  const [step, setStep] = useState("menu");
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const clubName = S?.clubName || "ZAP FC";
  const player = {
    id: S?.wallet || `local-${clubName}`,
    clubName,
    rep: S?.rep || 50,
  };

  useEffect(() => {
    if (!room?.code) return undefined;
    return subscribePvpRooms(() => {
      const latest = getPvpRoom(room.code);
      if (latest) setRoom(latest);
    });
  }, [room?.code]);

  const create = () => {
    setError("");
    setRoom(createPvpRoom(player));
    setStep("created");
  };

  const join = () => {
    setError("");
    const result = joinPvpRoom(code, player);
    if (result.error) {
      setError(result.error);
      return;
    }
    setRoom(result.room);
    setStep("joined");
  };

  const paired = room?.status === "paired";
  const opponent = room?.host?.id === player.id ? room?.guest : room?.host;

  return (
    <div className="zap-modal-backdrop">
      <div className="pvp-room-modal">
        <button className="pvp-room-modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="pvp-room-modal__eyebrow">PVP ROOM</div>
        <h2>{step === "menu" ? "Set up a private match" : paired ? "Rival paired" : "Waiting for rival"}</h2>
        {step === "menu" && (
          <p className="pvp-room-modal__warning">PVP is still in build. Rooms work for pairing, while live settlement and anti-cheat are still being connected.</p>
        )}

        {step === "menu" && (
          <div className="pvp-room-modal__choices">
            <button onClick={create}>
              <strong>Create room</strong>
              <span>Open a private room and wait for one rival.</span>
            </button>
            <button onClick={() => setStep("join")}>
              <strong>Join room</strong>
              <span>Use the room code from your rival.</span>
            </button>
          </div>
        )}

        {step === "join" && (
          <div className="pvp-room-modal__join">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ROOM CODE" />
            {error && <p>{error}</p>}
            <div className="pvp-room-modal__actions">
              <button onClick={() => setStep("menu")}>Back</button>
              <button onClick={join}>Join</button>
            </div>
          </div>
        )}

        {room && step !== "join" && (
          <div className="pvp-room-modal__status">
            <div>
              <span>ROOM CODE</span>
              <strong>{room.code}</strong>
            </div>
            <div>
              <span>STATUS</span>
              <strong>{paired ? "PAIRED" : "OPEN"}</strong>
            </div>
            <p>{paired ? `${opponent?.clubName || "Rival"} is in the room.` : "Share this code only with the player you want to face."}</p>
            <button disabled>
              {paired ? "MATCH LAUNCH LOCKED" : "Waiting..."}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ModeSelectionScreen({ S, onSinglePlayer, onPvp, onBack }) {
  const [pvpOpen, setPvpOpen] = useState(false);
  const modeCards = [
    {
      id:"pvp",
      title:"PvP Category",
      body:"Create or join a private room against another user.",
      enabled:true,
      icon:"pvp",
      action:() => setPvpOpen(true),
    },
    {
      id:"single",
      title:"VS AI Category",
      body:"Play against the AI and climb your read rating.",
      enabled:true,
      icon:"ai",
      action:onSinglePlayer,
    },
    {
      id:"spectator",
      title:"Spectator Category",
      body:"Watch other users play when live rooms open.",
      enabled:false,
      icon:"spectator",
    },
  ];

  return (
    <HomeStadiumBackdrop>
      <div className="mode-select">
        <ScreenBackButton onClick={onBack} />

        <section className="mode-select__stage" aria-label="Kick off modes">
          {modeCards.map((mode, index) => {
            const positionClass = index === 0 ? "is-left" : index === 1 ? "is-active" : "is-right";
            return (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                if (!mode.enabled) return;
                mode.action?.();
              }}
              className={`mode-choice ${positionClass} ${mode.enabled ? "" : "is-disabled"}`}
            >
              <span className={`mode-choice__icon mode-choice__icon--${mode.icon}`} aria-hidden="true" />
              <div className="mode-choice__copy">
                <strong>{mode.title}</strong>
                <p>{mode.body}</p>
              </div>
              <b>{mode.enabled ? "SELECT" : "LOCKED"}</b>
            </button>
            );
          })}
        </section>

        {pvpOpen && (
          <PvpRoomModal
            S={S}
            onClose={() => setPvpOpen(false)}
            onPaired={(room) => {
              setPvpOpen(false);
              onPvp?.(room);
            }}
          />
        )}
      </div>
    </HomeStadiumBackdrop>
  );
}

export function MissionsScreen({ S, onPlay, onShop, onTeam, onClaimMission }) {
  const [activeTab, setActiveTab] = useState("daily");
  const missionGroups = buildMissions(S);
  const tabs = [
    { id:"daily", label:"DAILY" },
    { id:"weekly", label:"WEEKLY" },
    { id:"achievements", label:"ACHIEVEMENTS" },
  ];
  const activeMissions = missionGroups[activeTab] || missionGroups.daily;

  return (
    <HomeStadiumBackdrop>
      <main className="missions-screen">
        <ClubhouseHeader S={S} active="missions" onPlay={onPlay} onMissions={() => {}} onShop={onShop} onTeam={onTeam} />

        <section className="missions-panel">
          <nav className="missions-tabs" aria-label="Mission types">
            {tabs.map((tab) => {
              const claimable = (missionGroups[tab.id] || []).some((mission) => mission.complete && !mission.claimed);
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`${activeTab === tab.id ? "is-active" : ""} ${claimable ? "has-claim" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="missions-list">
            {activeMissions.map((mission) => {
              const claimable = mission.complete && !mission.claimed;
              return (
                <article
                  key={mission.id}
                  className={`mission-row ${mission.complete ? "is-complete" : "is-active"} ${mission.claimed ? "is-claimed" : ""} ${claimable ? "is-claimable" : ""}`}
                >
                  {activeTab === "achievements" && (
                    <span className="mission-row__badge" aria-hidden="true">
                      <img src={MEDAL_ICON} alt="" draggable={false} />
                    </span>
                  )}
                  <div className="mission-row__copy">
                    <span>{mission.reset}</span>
                    <h2>{mission.title}</h2>
                    <p>{mission.desc}</p>
                  </div>
                  <div className="mission-row__progress">
                    <div className="mission-row__progress-head">
                      <span>{mission.current}/{mission.target}</span>
                      <strong>+{mission.reward} REP</strong>
                    </div>
                    <div className="mission-row__bar" aria-hidden="true">
                      <i style={{ width:`${mission.pct}%` }} />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!claimable}
                    onClick={() => onClaimMission?.(mission)}
                  >
                    {mission.claimed ? "CLAIMED" : claimable ? "CLAIM" : "ACTIVE"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </HomeStadiumBackdrop>
  );
}

export function ShopScreen({ S, onPlay, onMissions, onTeam, onRequestCrest }) {
  const [requesting, setRequesting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const clubName = S?.clubName || "ZAP FC";
  const requested = !!S?.crestRequested || !!S?.crestRequestPending;
  const crestComingSoon = true;

  const requestCrest = async () => {
    if (requesting || requested) return;
    setRequesting(true);
    try {
      await onRequestCrest?.({ clubName, wallet:S?.wallet || "local", cost:"TBD STRK" });
    } finally {
      setRequesting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <HomeStadiumBackdrop>
      <main className="missions-screen">
        <ClubhouseHeader S={S} active="shop" onPlay={onPlay} onMissions={onMissions} onShop={() => {}} onTeam={onTeam} />
        <section className="shop-screen__panel" style={{ "--crest-generation-bg": `url("${CREST_GENERATION_BG}")` }}>
          <div>
            <span>CREST REQUEST</span>
            <h2>Your club. Your crest. Onchain forever.</h2>
            <p>Request custom crest generation for {clubName}. Price is $3 paid in STRK once payment wiring is live.</p>
          </div>
          <button onClick={() => setConfirmOpen(true)} disabled={crestComingSoon || requesting || requested}>
            {crestComingSoon ? "COMING SOON" : requested ? "CREST REQUESTED" : requesting ? "REQUESTING..." : "REQUEST CREST · $3 IN STRK"}
          </button>
        </section>

        {confirmOpen && (
          <div className="zap-modal-backdrop">
            <div className="crest-confirm-modal">
              <div className="crest-confirm-modal__eyebrow">CREST REQUEST</div>
              <h2>Confirm custom crest</h2>
              <p>{clubName} will be queued for a custom crest request. The target price is $3 in STRK.</p>
              <div className="crest-confirm-modal__actions">
                <button type="button" onClick={() => setConfirmOpen(false)}>Cancel</button>
                <button type="button" onClick={requestCrest} disabled={requesting}>
                  {requesting ? "Sending..." : "Confirm request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </HomeStadiumBackdrop>
  );
}
