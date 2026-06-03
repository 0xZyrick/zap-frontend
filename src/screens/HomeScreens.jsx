// ─── HomeScreens.jsx ─────────────────────────────────────────────────────────
import { useState } from "react";
import { StadiumEnvironment } from "../pitch/pitch.jsx";
import { ranked, myRank } from "../game/gameState.js";
import HomeStadiumBackdrop from "../ui/HomeStadiumBackdrop.jsx";
import "./homeScreen.css";

// ── SplashScreen ──────────────────────────────────────────────────────────────
export function SplashScreen({ onEnter, loading }) {
  const ghostPlayers = [
    { x:18, y:31, d:0 }, { x:26, y:37, d:1 }, { x:38, y:33, d:2 },
    { x:58, y:42, d:3 }, { x:70, y:36, d:4 }, { x:82, y:45, d:5 },
    { x:22, y:68, d:2 }, { x:36, y:62, d:4 }, { x:64, y:70, d:1 },
    { x:77, y:64, d:3 },
  ];
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", background:"#030a05" }}>
      <StadiumEnvironment gs="MIDFIELD"/>

      {/* layered overlays */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(1,6,3,.82) 0%,rgba(1,6,3,.45) 40%,rgba(1,6,3,.92) 100%)" }}/>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 55% at 50% 48%,rgba(24,193,88,.13),transparent 68%)" }}/>
      <div style={{ position:"absolute", left:"8%", right:"8%", top:"18%", height:"50%", opacity:.24, border:"1px solid rgba(255,255,255,.22)", borderRadius:"18px", zIndex:1 }}>
        <div style={{ position:"absolute", inset:"10% 18%", border:"1px solid rgba(255,255,255,.16)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", left:"50%", top:0, bottom:0, width:"1px", background:"rgba(255,255,255,.20)" }}/>
        {ghostPlayers.map((p, i) => (
          <i key={i} style={{
            position:"absolute",
            left:`${p.x}%`,
            top:`${p.y}%`,
            width:"5px",
            height:"5px",
            borderRadius:"50%",
            background:i % 3 === 0 ? "#facc15" : i % 2 === 0 ? "#18c158" : "rgba(255,255,255,.76)",
            boxShadow:"0 0 14px rgba(24,193,88,.45)",
            animation:`ghostMatchDrift ${5 + (i % 4)}s ease-in-out ${p.d * .18}s infinite alternate`,
          }}/>
        ))}
      </div>

      {/* top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#18c158", boxShadow:"0 0 10px #18c158" }}/>
          <span style={{ fontFamily:"var(--f-disp)", fontSize:"18px", letterSpacing:".18em", color:"#facc15", textShadow:"0 0 20px rgba(250,204,21,.28)" }}>MATCHDAY 05 · LIVE</span>
        </div>
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".2em", color:"rgba(255,255,255,.22)" }}>SEASON 1</div>
      </div>

      {/* main content */}
      <div style={{ position:"absolute", inset:0, zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", textAlign:"center" }}>

        {/* wordmark */}
        <div style={{ fontFamily:"var(--f-mono)", fontSize:"8px", letterSpacing:".42em", color:"rgba(24,193,88,.6)", marginBottom:"12px", textTransform:"uppercase" }}>ZAP</div>

        <div style={{ fontFamily:"var(--f-disp)", fontSize:"clamp(88px,20vw,168px)", letterSpacing:"4px", lineHeight:.8, color:"#fff", textShadow:"0 0 80px rgba(24,193,88,.22)", marginBottom:"6px" }}>
          ZAP
        </div>
        <div style={{ height:"10px", marginBottom:"28px" }} />

        <div style={{ maxWidth:"320px", fontFamily:"var(--f-body)", fontSize:"13px", lineHeight:1.6, color:"rgba(238,245,240,.5)", marginBottom:"36px" }}>
          You're not playing the pitch.<br/>You're playing the person reading it.
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          disabled={loading}
          style={{
            padding:"18px 54px",
            borderRadius:"10px",
            background: loading ? "rgba(24,193,88,.3)" : "#18c158",
            color: loading ? "rgba(0,0,0,.5)" : "#020a04",
            fontFamily:"var(--f-disp)",
            fontSize:"20px",
            letterSpacing:"3px",
            boxShadow: loading ? "none" : "0 0 48px rgba(24,193,88,.45), 0 12px 0 rgba(4,76,34,.9), 0 24px 42px rgba(0,0,0,.55)",
            border:"1px solid rgba(220,255,220,.28)",
            cursor: loading ? "not-allowed" : "pointer",
            transition:"all .18s",
          }}
        >
          {loading ? "LOADING…" : "ENTER CLUBHOUSE"}
        </button>

        {/* feature pills */}
        <div style={{ display:"flex", gap:"8px", marginTop:"24px", flexWrap:"wrap", justifyContent:"center" }}>
          {["FORMATION","MARKET","LEADERBOARD","ON-CHAIN"].map(f => (
            <span key={f} style={{ fontFamily:"var(--f-mono)", fontSize:"7px", letterSpacing:".16em", color:"rgba(255,255,255,.28)", padding:"4px 10px", border:"1px solid rgba(255,255,255,.08)", borderRadius:"999px" }}>{f}</span>
          ))}
        </div>
      </div>

      {/* bottom grass fade */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"30%", background:"linear-gradient(0deg,rgba(1,6,3,.95),transparent)", zIndex:1 }}/>
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
    <div style={{ position:"absolute", inset:0, overflow:"hidden", background:"#030a05" }}>
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

// ── StatPill ─── tiny helper ──────────────────────────────────────────────────
function StatPill({ label, value, color }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
      <div style={{ fontFamily:"var(--f-disp)", fontSize:"28px", lineHeight:1, color: color || "#fff" }}>{value}</div>
      <div style={{ fontFamily:"var(--f-mono)", fontSize:"6px", letterSpacing:".16em", color:"rgba(255,255,255,.3)" }}>{label}</div>
    </div>
  );
}

function MiniFormation({ formationId = "control-433" }) {
  const shapes = {
    "press-433": [[18,50],[36,25],[35,42],[35,58],[36,75],[52,38],[52,62],[68,28],[70,50],[68,72],[84,50]],
    "control-433": [[18,50],[35,25],[34,42],[34,58],[35,75],[50,50],[58,34],[58,66],[73,28],[76,50],[73,72]],
    "pivot-4231": [[18,50],[34,24],[34,42],[34,58],[34,76],[49,42],[49,58],[64,28],[66,50],[64,72],[82,50]],
    "classic-442": [[18,50],[34,25],[34,42],[34,58],[34,75],[52,28],[51,44],[51,56],[52,72],[78,42],[78,58]],
    "diamond-41212": [[18,50],[34,25],[34,42],[34,58],[34,75],[49,50],[60,38],[60,62],[70,50],[82,42],[82,58]],
    "wide-352": [[18,50],[34,36],[34,50],[34,64],[51,20],[52,40],[52,60],[51,80],[70,50],[84,42],[84,58]],
    "storm-343": [[18,50],[34,36],[34,50],[34,64],[54,28],[54,50],[54,72],[73,24],[76,50],[73,76],[88,50]],
    "lock-532": [[18,50],[32,18],[32,34],[32,50],[32,66],[32,82],[54,35],[54,50],[54,65],[78,43],[78,57]],
    "low-541": [[18,50],[30,18],[30,34],[30,50],[30,66],[30,82],[52,24],[52,42],[52,58],[52,76],[78,50]],
  };
  const points = shapes[formationId] || shapes["control-433"];

  return (
    <div className="home-formation-oval" aria-hidden="true">
      <div className="home-formation-oval__line" />
      {points.map(([x, y], i) => (
        <span
          key={`${formationId}-${i}`}
          className={i === 0 ? "is-keeper" : i > 7 ? "is-forward" : ""}
          style={{ left:`${x}%`, top:`${y}%`, transitionDelay:`${i * 18}ms` }}
        />
      ))}
    </div>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────────
export function HomeScreen({ S, LB = [], onKickOff, onLB, onMarket }) {
  const rep    = S?.rep    || 0;
  const coins  = S?.coins  || 0;
  const wins   = S?.wins   || 0;
  const draws  = S?.draws  || 0;
  const losses = S?.losses || 0;
  const played = wins + draws + losses;
  const pct    = Math.max(2, Math.min(100, rep / 200 * 100));
  const repCol = rep >= 100 ? "#facc15" : rep >= 50 ? "#22c55e" : "#f97316";
  const clubName = S?.clubName || "ZYRICK FC";
  const initials = clubName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const form = (S?.recentResults || []).slice(-5);
  const FORM_COL = { W:"#22c55e", D:"#facc15", L:"#ef4444" };
  const table = ranked(S, LB);
  const rank = myRank(S, LB);
  const leaders = table.slice(0, 4);
  const nextTarget = table.find((team) => team.rank === Math.max(1, rank - 1));
  const lastDelta = S?.lastDelta || 0;
  const clubBase = clubName.replace(/\s+FC$/i, "");
  const boosts = [
    { label:"ATK", value:S?.atkBoost || 0 },
    { label:"MID", value:S?.midBoost || 0 },
    { label:"DEF", value:S?.defBoost || 0 },
  ];

  const repLabel = rep >= 200
    ? "Elite status"
    : rep >= 100
      ? "Climbing fast"
      : rep >= 50
        ? "Building momentum"
        : rep >= 20
          ? "Pressure rising"
          : "Fresh save";

  const highlights = [
    { tag:"LIVE", text:`${clubBase} enter matchday ranked #${rank}` },
    { tag:"TARGET", text:nextTarget ? `Catch ${nextTarget.name}` : "Protect first place" },
    { tag:"MARKET", text:coins >= 40 ? "Squad move available" : "Coins needed" },
  ];

  return (
    <HomeStadiumBackdrop>
      <div className="home-rotate-gate">
        <div>
          <span>Portrait screen detected</span>
          <strong>Rotate your phone</strong>
          <p>ZAP needs a wider matchday view so the pitch, table, and controls stay clean.</p>
        </div>
      </div>

      <main className="home-ui">
        <header className="home-topbar">
          <div className="home-club-chip">
            <div className="home-club-crest">{initials}</div>
            <div>
              <div className="home-club-name">{clubName}</div>
              <div className="home-club-mode">MANAGER MODE</div>
            </div>
          </div>

          <div className="home-topbar__right">
            <div className="home-rank-pill">
              <strong>#{rank}</strong>
              <span>TABLE</span>
            </div>
            <div className="home-coin-pill">
              <strong>{coins}</strong>
              <span>COINS</span>
            </div>
          </div>
        </header>

        <section className="home-layout">
          <aside className="home-command-panel home-glass-card">
            <div className="home-command-panel__headline">
              <span className="home-eyebrow">MATCHDAY CONTROL</span>
              <h1>{clubBase}</h1>
              <p>{repLabel}</p>
            </div>

            <div className="home-command-stats">
              <div>
                <span>Rank</span>
                <strong>#{rank}</strong>
              </div>
              <div>
                <span>Rep</span>
                <strong>{rep}</strong>
              </div>
              <div>
                <span>Coins</span>
                <strong>{coins}</strong>
              </div>
            </div>

            <div className="home-boost-row">
              {boosts.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value >= 0 ? `+${item.value}` : item.value}</strong>
                </div>
              ))}
            </div>

            <div className="home-rep-card" style={{ "--rep-color": repCol, "--rep-width": `${pct}%` }}>
              <div className="home-panel-head">
                <span className="home-eyebrow">CLUB PULSE</span>
                <strong>{rep}</strong>
              </div>
              <div className="home-rep-track"><i /></div>
            </div>
          </aside>

          <article className="home-broadcast home-glass-card">
            <div className="home-broadcast__top">
              <div>
                <span className="home-eyebrow">LIVE TACTICAL FEED</span>
                <strong>{nextTarget ? `Next chase: ${nextTarget.name}` : "Top of the table"}</strong>
              </div>
              <b>ON AIR</b>
            </div>

            <div className="home-feed-screen">
              <div className="home-feed-screen__pitch" />
                <MiniFormation formationId={S?.formationId} />
              <div className="home-feed-screen__scan" />
            </div>

            <div className="home-broadcast__bottom">
              <div className="home-highlight-strip">
                {highlights.map((item) => (
                  <div key={item.tag}>
                    <span>{item.tag}</span>
                    <strong>{item.text}</strong>
                  </div>
                ))}
              </div>
              <button onClick={onKickOff} className="home-kickoff-btn">
                <span>Kick Off</span>
                <b>Start Match</b>
              </button>
            </div>
          </article>

          <aside className="home-side-stack">
            <section className="home-table-panel home-glass-card">
              <div className="home-panel-head">
                <span className="home-eyebrow">LEADERBOARD</span>
                <button onClick={onLB}>Table</button>
              </div>
              <div className="home-leaders">
                {leaders.map((team) => (
                  <div key={`${team.id}-${team.name}`} className={team.cpu ? "" : "is-you"}>
                    <span>#{team.rank}</span>
                    <strong>{team.name}</strong>
                    <b>{team.pts}</b>
                  </div>
                ))}
              </div>
              <div className="home-table-note">
                {lastDelta > 0 ? `+${lastDelta} last result` : lastDelta < 0 ? `${lastDelta} last result` : "No recent movement"}
              </div>
            </section>

            <section className="home-stats-strip home-glass-card">
              <div className="home-stat-tile">
                <span>P</span>
                <strong>{played}</strong>
              </div>
              <div className="home-stat-tile">
                <span>W</span>
                <strong className="is-green">{wins}</strong>
              </div>
              <div className="home-stat-tile">
                <span>D</span>
                <strong className="is-yellow">{draws}</strong>
              </div>
              <div className="home-stat-tile">
                <span>L</span>
                <strong className="is-red">{losses}</strong>
              </div>
              <div className="home-form-guide">
                <span>Form</span>
                <div>
                  {(form.length ? form : ["W", "D", "L", "W", "W"]).map((r, i) => (
                    <b key={`${r}-${i}`} style={{ background: FORM_COL[r] || "rgba(255,255,255,.14)" }}>{r}</b>
                  ))}
                </div>
              </div>
            </section>

            <div className="home-action-row">
              <button onClick={onMarket} className="home-action-card home-action-card--market home-glass-card">
                <span>Market</span>
                <strong>Upgrade XI</strong>
                <b>+</b>
              </button>

              <button onClick={onLB} className="home-action-card home-action-card--table home-glass-card">
                <span>Table</span>
                <strong>Race</strong>
                <b>#</b>
              </button>
            </div>
          </aside>
        </section>
      </main>
    </HomeStadiumBackdrop>
  );
}
