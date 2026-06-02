// ─── pitch.jsx ────────────────────────────────────────────────────────────────
// All static pitch rendering components. No game logic, no state.
// Export individual named components.

// ─── Pitch line markings ──────────────────────────────────────────────────────

export function PitchMarkings() {
  return (
    <svg
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:2, pointerEvents:"none" }}
      viewBox="0 0 100 100" preserveAspectRatio="none"
    >
      {/* ─ Alternating grass bands (classic stadium stripe pattern) ─ */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x="0" y={i*12.5} width="100" height="12.5"
          fill={i%2===0 ? "rgba(255,255,255,.045)" : "rgba(0,0,0,.025)"}/>
      ))}
      <rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="rgba(255,255,255,.46)" strokeWidth=".58"/>
      <line x1="50" y1="1.5" x2="50" y2="98.5" stroke="rgba(255,255,255,.42)" strokeWidth=".68"/>
      <circle cx="50" cy="50" r="11.6" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth=".68"/>
      <circle cx="50" cy="50" r="1.1" fill="rgba(255,255,255,.72)"/>
      <circle cx="50" cy="50" r="3"   fill="rgba(255,255,255,.10)"/>

      {/* Left penalty area */}
      <rect x="1.5" y="20.5" width="18.2" height="59" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth=".58"/>
      <rect x="1.5" y="35"   width="7.2"  height="30" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".46"/>
      <circle cx="12.2" cy="50" r=".9"  fill="rgba(255,255,255,.72)"/>
      <circle cx="12.2" cy="50" r="2.2" fill="rgba(255,255,255,.10)"/>
      <path d="M19.7,42 Q29.5,50 19.7,58" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth=".52"/>
      <rect x="0" y="40" width="1.5" height="20" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.38)" strokeWidth=".32"/>

      {/* Right penalty area */}
      <rect x="80.3" y="20.5" width="18.2" height="59" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth=".58"/>
      <rect x="91.3" y="35"   width="7.2"  height="30" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth=".46"/>
      <circle cx="87.8" cy="50" r=".9"  fill="rgba(255,255,255,.72)"/>
      <circle cx="87.8" cy="50" r="2.2" fill="rgba(255,255,255,.10)"/>
      <path d="M80.3,42 Q70.5,50 80.3,58" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth=".52"/>
      <rect x="98.5" y="40" width="1.5" height="20" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.38)" strokeWidth=".32"/>

      {/* Corner arcs */}
      <path d="M1.5,5.5  Q5.8,5.5  5.8,9.5"  fill="none" stroke="rgba(255,255,255,.28)" strokeWidth=".5"/>
      <path d="M98.5,5.5 Q94.2,5.5 94.2,9.5" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth=".5"/>
      <path d="M1.5,94.5  Q5.8,94.5  5.8,90.5"  fill="none" stroke="rgba(255,255,255,.28)" strokeWidth=".5"/>
      <path d="M98.5,94.5 Q94.2,94.5 94.2,90.5" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth=".5"/>

      <ellipse cx="50" cy="50" rx="26" ry="20" fill="rgba(255,255,255,.032)"/>
    </svg>
  );
}

// ─── Stadium atmosphere / lighting overlays ───────────────────────────────────

export function StadiumEnvironment({ gs }) {
  const accent =
    gs === "ATTACK" ? "rgba(74,222,128,.72)"
    : gs === "DEFEND" ? "rgba(248,113,113,.66)"
    : "rgba(250,204,21,.58)";

  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      <div style={{
        position:"absolute", inset:0,
        background:`
          radial-gradient(ellipse 88% 42% at 50% -2%, rgba(132,170,160,.16) 0%, rgba(11,22,24,.34) 46%, transparent 74%),
          linear-gradient(180deg,#061014 0%,#071915 24%,#082915 58%,#0f3f1f 100%)
        `,
      }}/>

      {/* Upper bowl */}
      <div style={{
        position:"absolute", left:"-16%", right:"-16%", top:"3%", height:"30%",
        borderRadius:"0 0 50% 50% / 0 0 100% 100%",
        background:`
          linear-gradient(180deg,rgba(5,11,12,.99),rgba(10,25,20,.9) 58%,transparent),
          repeating-linear-gradient(90deg,rgba(118,153,135,.14) 0 2px,rgba(24,193,88,.11) 2px 7px,rgba(212,160,23,.08) 7px 10px,transparent 10px 14px)
        `,
        boxShadow:"0 18px 60px rgba(0,0,0,.38)",
        opacity:.98,
      }}/>

      {/* Lower bowl */}
      <div style={{
        position:"absolute", left:"-20%", right:"-20%", bottom:"-3%", height:"28%",
        borderRadius:"50% 50% 0 0 / 100% 100% 0 0",
        background:`
          linear-gradient(0deg,rgba(4,10,7,.99),rgba(9,35,20,.88) 62%,transparent),
          repeating-linear-gradient(90deg,rgba(118,153,135,.12) 0 2px,rgba(24,193,88,.1) 2px 7px,rgba(212,160,23,.08) 7px 10px,transparent 10px 14px)
        `,
        opacity:.92,
      }}/>

      {/* Advertising boards */}
      <div style={{
        position:"absolute", left:"5%", right:"5%", top:"29%", height:"24px",
        borderRadius:"5px",
        background:`linear-gradient(90deg,#0d7a37 0 18%,#263a31 18% 22%,#9a6b0f 22% 38%,#263a31 38% 42%,${accent} 42% 62%,#263a31 62% 66%,#0d7a37 66% 100%)`,
        boxShadow:"0 0 22px rgba(0,0,0,.36)",
        opacity:.78,
      }}/>

      {/* Floodlights */}
      {[12, 32, 68, 88].map((x, i) => (
        <div key={x} style={{
          position:"absolute", left:`${x}%`, top:i < 2 ? "1%" : "2%",
          width:"110px", height:"110px", transform:"translateX(-50%)",
          background:"radial-gradient(circle,rgba(242,255,218,.82) 0 4px,rgba(242,255,218,.24) 5px 14px,transparent 15px)",
          filter:"blur(.2px)",
          opacity:.74,
        }}/>
      ))}
      {[18, 82].map(x => (
        <div key={`beam-${x}`} style={{
          position:"absolute", left:`${x}%`, top:"4%", width:"46%", height:"78%",
          transform:`translateX(-50%) rotate(${x < 50 ? "16deg" : "-16deg"})`,
          transformOrigin:"50% 0",
          background:"linear-gradient(180deg,rgba(210,255,214,.1),rgba(210,255,214,.035) 42%,transparent 78%)",
          clipPath:"polygon(45% 0,55% 0,100% 100%,0 100%)",
          mixBlendMode:"soft-light",
        }}/>
      ))}
    </div>
  );
}

export function StadiumAtmosphere({ gs }) {
  const zG =
    gs === "ATTACK" ? "rgba(34,197,94,.16)"
    : gs === "DEFEND" ? "rgba(239,68,68,.14)"
    : "rgba(250,204,21,.1)";
  return (
    <>
      <div style={{
        position:"absolute", left:"-8%", right:"-8%", top:"-9%", height:"18%", zIndex:1, pointerEvents:"none",
        background:"linear-gradient(180deg,rgba(13,20,18,.94),rgba(13,20,18,.74) 42%,transparent),repeating-linear-gradient(90deg,rgba(255,255,255,.1) 0 2px,transparent 2px 11px)",
        opacity:.34,
      }}/>
      <div style={{
        position:"absolute", left:"-8%", right:"-8%", bottom:"-10%", height:"19%", zIndex:1, pointerEvents:"none",
        background:"linear-gradient(0deg,rgba(13,20,18,.94),rgba(13,20,18,.7) 44%,transparent),repeating-linear-gradient(90deg,rgba(255,255,255,.09) 0 2px,transparent 2px 10px)",
        opacity:.30,
      }}/>
      <div style={{
        position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
        background:`
          radial-gradient(ellipse 54% 24% at 18% 0%, rgba(210,255,214,.06) 0%, transparent 54%),
          radial-gradient(ellipse 54% 24% at 82% 0%, rgba(210,255,214,.055) 0%, transparent 54%),
          radial-gradient(ellipse 76% 52% at 50% 50%, ${zG} 0%, transparent 58%),
          radial-gradient(ellipse 112% 82% at 50% 52%, transparent 42%, rgba(0,0,0,.18) 100%)
        `,
        animation:"stadiumLightPulse 3.8s ease-in-out infinite",
        transition:"background .85s ease",
      }}/>
      <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
        background:"linear-gradient(154deg,rgba(210,255,214,.035) 0%,transparent 36%)" }}/>
      <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
        background:"linear-gradient(206deg,rgba(210,255,214,.03) 0%,transparent 36%)" }}/>
      <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none",
        background:"radial-gradient(ellipse 92% 64% at 50% 52%,rgba(255,255,255,.025),transparent 64%)", mixBlendMode:"soft-light" }}/>
    </>
  );
}

// ─── Premium match ball ───────────────────────────────────────────────────────

export function PremiumBall({ ball, gs }) {
  const isAtk = gs === "ATTACK";
  const isDef = gs === "DEFEND";
  const rgb   = isAtk ? "74,222,128" : isDef ? "248,113,113" : "255,255,255";
  const gAlpha= isAtk ? .74 : isDef ? .74 : .95;
  const hAlpha= isAtk ? .36 : isDef ? .36 : .28;

  const transStyle = {
    transition:"left .6s cubic-bezier(.25,.46,.45,.94),top .5s cubic-bezier(.25,.46,.45,.94)",
  };

  return (
    <>
      {/* Ground shadow */}
      <div style={{
        position:"absolute", width:"22px", height:"9px", borderRadius:"50%",
        background:"rgba(0,0,0,.56)",
        left:ball.x+"%", top:`calc(${ball.y}% + 12px)`,
        transform:"translate(-50%,-50%)",
        filter:"blur(3.5px)",
        ...transStyle,
        zIndex:1,
      }}/>

      {/* Glow halo */}
      <div style={{
        position:"absolute", width:"50px", height:"50px", borderRadius:"50%",
        left:ball.x+"%", top:ball.y+"%", transform:"translate(-50%,-50%)",
        background:`radial-gradient(circle,rgba(${rgb},${hAlpha*.52}) 0%,rgba(${rgb},${hAlpha*.14}) 42%,transparent 68%)`,
        ...transStyle,
        zIndex:2, animation:"spotPulse 1.9s ease-in-out infinite",
      }}/>

      {/* Ball */}
      <div style={{
        position:"absolute", width:"19px", height:"19px",
        left:ball.x+"%", top:ball.y+"%", transform:"translate(-50%,-50%)",
        borderRadius:"50%",
        boxShadow:`0 0 11px rgba(${rgb},${gAlpha}),0 0 26px rgba(${rgb},.4),0 4px 13px rgba(0,0,0,.78)`,
        ...transStyle,
        animation:"premiumBallGlow 1.45s ease-in-out infinite",
        zIndex:3,
      }}>
        <svg viewBox="0 0 19 19" width="19" height="19" style={{ display:"block", borderRadius:"50%", overflow:"hidden" }}>
          <circle cx="9.5" cy="9.5" r="9.5" fill="white" stroke="rgba(0,0,0,.18)" strokeWidth=".4"/>
          <path d="M9.5,1 C5.4,1 2,4.4 2,8.3 L6.4,8.3 L8.5,3.7 Z" fill="rgba(15,15,15,.17)"/>
          <path d="M9.5,1 C13.6,1 17,4.4 17,8.3 L12.6,8.3 L10.5,3.7 Z" fill="rgba(15,15,15,.1)"/>
          <path d="M2,8.3 L2,11.4 L5.5,15.3 L8.5,12.6 L6.4,8.3 Z" fill="rgba(15,15,15,.14)"/>
          <path d="M17,8.3 L17,11.4 L13.5,15.3 L10.5,12.6 L12.6,8.3 Z" fill="rgba(15,15,15,.08)"/>
          <path d="M5.5,15.3 L9.5,18 L13.5,15.3 L10.5,12.6 L8.5,12.6 Z" fill="rgba(15,15,15,.16)"/>
          <path d="M9.5,1 L8.5,3.7 L6.4,8.3"  fill="none" stroke="rgba(0,0,0,.21)" strokeWidth=".55"/>
          <path d="M9.5,1 L10.5,3.7 L12.6,8.3" fill="none" stroke="rgba(0,0,0,.21)" strokeWidth=".55"/>
          <path d="M6.4,8.3  L8.5,12.6"  fill="none" stroke="rgba(0,0,0,.19)" strokeWidth=".55"/>
          <path d="M12.6,8.3 L10.5,12.6" fill="none" stroke="rgba(0,0,0,.19)" strokeWidth=".55"/>
          <path d="M8.5,12.6 L9.5,18 L10.5,12.6" fill="none" stroke="rgba(0,0,0,.21)" strokeWidth=".55"/>
          <path d="M2,9.5 L6.4,8.3 L12.6,8.3 L17,9.5" fill="none" stroke="rgba(0,0,0,.17)" strokeWidth=".55"/>
          <ellipse cx="6.8" cy="5.8" rx="2.9" ry="2.1" fill="rgba(255,255,255,.5)"  transform="rotate(-22 6.8 5.8)"/>
          <ellipse cx="7.4" cy="6.3" rx="1.3" ry=".9"  fill="rgba(255,255,255,.34)" transform="rotate(-22 7.4 6.3)"/>
        </svg>
      </div>
    </>
  );
}

// ─── Goal moment SVG ──────────────────────────────────────────────────────────
// Front-facing goal frame with ball placed at outcome-specific position.
//
// type: "goal_left" | "goal_centre" | "goal_right"
//     | "save_keeper" | "post" | "miss_wide"

export function GoalMomentSVG({ type }) {
  const isGoal = type?.startsWith("goal");
  const isPost = type === "post";
  const isMiss = type === "miss_wide";
  const isSave = type === "save_keeper";
 
  const ballTarget = {
    goal_left:   { x:82,  y:72 },
    goal_centre: { x:110, y:85 },
    goal_right:  { x:138, y:72 },
    save_keeper: { x:110, y:80 },
    post:        { x:80,  y:58 },
    miss_wide:   { x:154, y:68 },
  }[type || "goal_centre"] || { x:110, y:85 };

  const netColor  = "rgba(255,255,255,.18)";
  const postColor = "#c8c8c8";

  const netVLines = []; for (let x = 70; x <= 152; x += 13) netVLines.push(x);
  const netHLines = []; for (let y = 58; y <= 98; y  += 10) netHLines.push(y);

  const bx = ballTarget.x, by = ballTarget.y;

  return (
    <svg viewBox="0 0 220 130" width="100%" height="100%"
         xmlns="http://www.w3.org/2000/svg"
         style={{ display:"block", maxWidth:"300px", margin:"0 auto" }}>


      {/* Net */}
      {netHLines.map(y => <line key={y} x1="70" y1={y} x2="152" y2={y} stroke={netColor} strokeWidth=".8"/>)}
      {netVLines.map(x => <line key={x} x1={x} y1="58" x2={x}  y2="98" stroke={netColor} strokeWidth=".8"/>)}

      {/* Posts */}
      <line x1="70"  y1="58" x2="70"  y2="98" stroke={postColor} strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="152" y1="58" x2="152" y2="98" stroke={postColor} strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="68"  y1="58" x2="154" y2="58" stroke={postColor} strokeWidth="3.5" strokeLinecap="round"/>

      {/* Post glow */}
      {isPost && <>
        <line x1="70" y1="58" x2="70" y2="98" stroke="#fbbf24" strokeWidth="5" opacity=".4"
              strokeLinecap="round" style={{ animation:"flashIn .1s ease alternate infinite" }}/>
        <circle cx="70" cy={by} r="6" fill="#fbbf24" opacity=".5"/>
      </>}

      {/* Keeper silhouette */}
      {isSave && (
        <g opacity=".85">
          <ellipse cx="108" cy="75" rx="10" ry="18" fill="#b91c1c" opacity=".9"/>
          <circle  cx="108" cy="58" r="6" fill="#c68642"/>
          <line x1="108" y1="65" x2="128" y2="55" stroke="#b91c1c" strokeWidth="5" strokeLinecap="round"/>
        </g>
      )}

      {/* Trajectory */}
      <line x1="110" y1="115" x2={bx} y2={by}
            stroke="rgba(255,255,255,.15)" strokeWidth="1" strokeDasharray="4,3"/>

      {/* Ball */}
      <circle cx={bx} cy={by} r={isGoal ? 8.5 : 7.5}
        fill="white" stroke="rgba(0,0,0,.3)" strokeWidth="1"
        style={{
          animation:"bounceIn .4s ease forwards",
          filter: isGoal ? "drop-shadow(0 0 6px rgba(74,222,128,.8))"
                : isSave  ? "drop-shadow(0 0 5px rgba(248,113,113,.7))"
                : isPost  ? "drop-shadow(0 0 5px rgba(251,191,36,.8))"
                :            "drop-shadow(0 0 4px rgba(255,255,255,.5))",
        }}
      />
      <line x1={bx-5} y1={by} x2={bx+5} y2={by} stroke="rgba(0,0,0,.25)" strokeWidth=".8"/>
      <line x1={bx} y1={by-5} x2={bx} y2={by+5} stroke="rgba(0,0,0,.25)" strokeWidth=".8"/>

      {/* Net bulge on goal */}
      {isGoal && (
        <ellipse cx={bx} cy={by} rx="16" ry="12"
          fill="rgba(74,222,128,.12)"
          style={{ animation:"bounceIn .3s ease forwards" }}/>
      )}

      {/* Wide indicator */}
      {isMiss && <>
        <line x1="155" y1="65" x2="175" y2="55"
              stroke="rgba(248,113,113,.5)" strokeWidth="1.2" strokeDasharray="3,2"/>
      </>}
    </svg>
  );
}
