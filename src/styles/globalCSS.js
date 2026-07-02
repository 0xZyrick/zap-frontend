// ─── globalCSS.js ─────────────────────────────────────────────────────────────
// Inject this once at the root via <style>{GLOBAL_CSS}</style>.
// Covers CSS variables, keyframe animations, and sprite/figure utility classes.

export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:ital,wght@0,400;0,600;0,800;1,400&display=swap');

/* ── Design tokens ── */
:root {
  --green:#22d35f; --green-d:#18a84f; --gold:#fbbf24;
  --red:#f87171; --tx:#f0fdf4; --tx2:#86efac; --tx3:#4b7c59;
  --bg:#020504; --bg1:#0a0f0d; --pitch-d:#0b3d1f; --pitch:#1a6b35;
  --coin:#fbbf24;
  --f-disp:'Bebas Neue',cursive;
  --f-cond:'Barlow Condensed',sans-serif;
  --f-body:'Barlow',sans-serif;
  --f-mono:'IBM Plex Mono',monospace;
}

*  { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent }
html,body { width:100%; height:100%; background:#020504; color:var(--tx); font-family:var(--f-body); overflow:hidden }
button { cursor:pointer; font-family:inherit; border:none; outline:none; background:none }
img { user-select:none; -webkit-user-select:none; -webkit-user-drag:none }

/* ── Keyframes ── */
@keyframes bounceIn        { 0%{transform:scale(.1) rotate(-20deg);opacity:0} 55%{transform:scale(1.25) rotate(6deg);opacity:1} 75%{transform:scale(.9) rotate(-3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
@keyframes flashIn         { from{opacity:0} to{opacity:1} }
@keyframes slideUp         { from{opacity:0;transform:translate(-50%,18px)} to{opacity:1;transform:translate(-50%,0)} }
@keyframes slideUpSimple   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes goalBurst       { from{transform:scale(.8);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes commentIn       { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes scoreFlash      { 0%{transform:scale(1)} 30%{transform:scale(1.5)} 100%{transform:scale(1)} }
@keyframes dangerPulse     { 0%,100%{opacity:.12} 50%{opacity:.28} }
@keyframes streakPop       { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
@keyframes slideLeft       { from{transform:translateX(-100%)} to{transform:translateX(0)} }
@keyframes slideDown       { from{transform:translateY(-110%);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes htReveal        { 0%{transform:scale(.88) translateY(24px);opacity:0} 60%{transform:scale(1.02) translateY(-4px)} 100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes vxBounce        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes vxBounceFast    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
@keyframes vxCelebrate     { 0%{transform:translateY(0) rotate(0)} 25%{transform:translateY(-10px) rotate(-10deg)} 50%{transform:translateY(-12px) rotate(0)} 75%{transform:translateY(-10px) rotate(10deg)} 100%{transform:translateY(0) rotate(0)} }
@keyframes ballPulse       { 0%,100%{box-shadow:0 0 8px rgba(255,255,255,.95),0 0 18px rgba(255,255,255,.4)} 50%{box-shadow:0 0 15px rgba(255,255,255,1),0 0 30px rgba(255,255,255,.65)} }
@keyframes coinFlip        { 0%{transform:rotateY(0) translateY(0) scale(.9)} 42%{transform:rotateY(520deg) translateY(-10px) scale(1.08)} 100%{transform:rotateY(720deg) translateY(0) scale(1)} }
@keyframes rewardPop       { 0%{transform:scale(.55) translateY(40px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes confettiFall    { 0%{opacity:1;transform:translateY(-20px) rotate(0)} 80%{opacity:.8} 100%{opacity:0;transform:translateY(110%) rotate(720deg)} }
@keyframes flameRise       { 0%{opacity:.95;transform:translateY(0) scale(1)} 60%{opacity:.65;transform:translateY(-50px) scale(.8)} 100%{opacity:0;transform:translateY(-90px) scale(.2)} }
@keyframes borderGlow      { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0)} 50%{box-shadow:0 0 0 4px rgba(251,191,36,.2),0 0 48px rgba(251,191,36,.28)} }
@keyframes rankPop         { 0%{transform:scale(1)} 30%{transform:scale(1.08)} 60%{transform:scale(.97)} 100%{transform:scale(1)} }
@keyframes rankShimmer     { 0%,100%{background-position:200% center} 50%{background-position:-200% center} }
@keyframes rankSlide       { 0%{transform:translateY(var(--rank-from));opacity:.4} 100%{transform:translateY(0);opacity:1} }
@keyframes cpuPulse        { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0)} 50%{box-shadow:0 0 0 6px rgba(248,113,113,.22)} }
@keyframes timePop         { 0%{transform:scale(1)} 40%{transform:scale(1.2)} 100%{transform:scale(1)} }
@keyframes tabSlide        { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
@keyframes spotPulse       { 0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.85;transform:translate(-50%,-50%) scale(1.08)} }
@keyframes phaseIn         { 0%{opacity:0;transform:translateY(-8px) scale(.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes btnStagger      { 0%{opacity:0;transform:translateY(12px) scale(.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes glowPulse       { 0%,100%{opacity:.42} 50%{opacity:.68} }
@keyframes depthFar        { 0%,100%{filter:brightness(.52) saturate(.35)} 50%{filter:brightness(.58) saturate(.42)} }
@keyframes loadPulse       { 0%,100%{opacity:.55;transform:scale(.97)} 50%{opacity:1;transform:scale(1)} }
@keyframes splashFade      { 0%{opacity:0;transform:translateY(18px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes scanSweep       { 0%{transform:translateX(-120%)} 100%{transform:translateX(260%)} }
@keyframes vsFlash         { 0%,100%{opacity:.55;transform:scale(.95)} 50%{opacity:1;transform:scale(1)} }
@keyframes formCardIn      { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes stadiumLightPulse{ 0%,100%{opacity:.78} 50%{opacity:.95} }
@keyframes premiumBallGlow { 0%,100%{filter:drop-shadow(0 0 8px rgba(255,255,255,.98)) drop-shadow(0 0 20px rgba(255,255,255,.5))} 50%{filter:drop-shadow(0 0 14px rgba(255,255,255,1)) drop-shadow(0 0 35px rgba(255,255,255,.78))} }
@keyframes phaseWash       { 0%{opacity:0} 12%{opacity:1} 78%{opacity:1} 100%{opacity:0} }
@keyframes phaseRushRight  { 0%{transform:translateX(-58%) skewX(-12deg)} 100%{transform:translateX(58%) skewX(-12deg)} }
@keyframes phaseRushLeft   { 0%{transform:translateX(58%) skewX(12deg)} 100%{transform:translateX(-58%) skewX(12deg)} }
@keyframes phaseTitlePop   { 0%{opacity:0;transform:translate(-50%,-44%) scale(.92)} 18%{opacity:1;transform:translate(-50%,-50%) scale(1.04)} 72%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-56%) scale(.98)} }
@keyframes momentHeadline  { 0%{opacity:0;transform:translateY(16px) scale(.94)} 60%{opacity:1;transform:translateY(-2px) scale(1.04)} 100%{opacity:1;transform:translateY(0) scale(1)} }

/* ── Premium button glow ── */
@keyframes buttonGlow      { 0%,100%{box-shadow:0 0 24px rgba(34,197,95,.28),inset 0 1px 0 rgba(255,255,255,.12)} 50%{box-shadow:0 0 40px rgba(34,197,95,.45),inset 0 1px 0 rgba(255,255,255,.2)} }
@keyframes cardHover       { 0%{transform:translateY(0)} 50%{transform:translateY(-2px)} 100%{transform:translateY(0)} }

/* ── Decision card glow ── */
@keyframes decisionCardGlow { 0%,100%{border-color:#22d35f77;box-shadow:0 0 16px rgba(34,211,95,.15)} 50%{border-color:#22d35faa;box-shadow:0 0 32px rgba(34,211,95,.25)} }
@keyframes readGlyphRoute   { 0%{opacity:.74;filter:brightness(1)} 50%{opacity:1;filter:brightness(1.25)} 100%{opacity:.74;filter:brightness(1)} }
@keyframes readCardSheen    { 0%{transform:translateY(140%);opacity:0} 36%{opacity:.26} 100%{transform:translateY(-230%);opacity:0} }
@keyframes readMomentPulse  { 0%,100%{box-shadow:0 24px 80px rgba(0,0,0,.62),0 0 34px rgba(250,204,21,.18),inset 0 1px 0 rgba(255,255,255,.08)} 50%{box-shadow:0 24px 90px rgba(0,0,0,.68),0 0 54px rgba(34,211,95,.28),inset 0 1px 0 rgba(255,255,255,.12)} }
@keyframes readProgress     { 0%{width:18%;transform:translateX(-35%)} 55%{width:64%;transform:translateX(62%)} 100%{width:28%;transform:translateX(330%)} }
@keyframes readFeedbackIn   { 0%{opacity:0;transform:translate(-50%,-14px)} 100%{opacity:1;transform:translate(-50%,0)} }
@keyframes thinkingDot      { 0%,100%{opacity:.28;transform:translateY(0) scale(.86)} 45%{opacity:1;transform:translateY(-3px) scale(1.12)} }

/* ── Player glow states ── */
@keyframes youGlowPulse    { 0%,100%{filter:drop-shadow(0 0 10px rgba(251,191,36,1))  drop-shadow(0 0 26px rgba(251,191,36,.65)) drop-shadow(0 5px 16px rgba(0,0,0,.95))} 50%{filter:drop-shadow(0 0 18px rgba(251,191,36,1)) drop-shadow(0 0 42px rgba(251,191,36,.88))  drop-shadow(0 5px 16px rgba(0,0,0,.95))} }
@keyframes activeGlowPulse { 0%,100%{filter:drop-shadow(0 0 16px rgba(253,224,71,1)) drop-shadow(0 0 36px rgba(255,213,79,.92)) drop-shadow(0 7px 20px rgba(0,0,0,.95))} 50%{filter:drop-shadow(0 0 30px rgba(253,224,71,1)) drop-shadow(0 0 60px rgba(255,213,79,1))  drop-shadow(0 7px 20px rgba(0,0,0,.95))} }
@keyframes celebrateGlowFig{ 0%,100%{filter:drop-shadow(0 0 12px rgba(34,211,95,.95)) drop-shadow(0 0 30px rgba(34,211,95,.62))} 50%{filter:drop-shadow(0 0 26px rgba(34,211,95,1)) drop-shadow(0 0 52px rgba(34,211,95,.9))} }
@keyframes teamGlow        { 0%,100%{filter:drop-shadow(0 3px 12px rgba(0,0,0,.85)) drop-shadow(0 0 6px rgba(96,165,250,.25))} 50%{filter:drop-shadow(0 3px 16px rgba(0,0,0,.92)) drop-shadow(0 0 10px rgba(96,165,250,.38))} }
@keyframes oppGlow         { 0%,100%{filter:drop-shadow(0 3px 12px rgba(0,0,0,.85)) drop-shadow(0 0 6px rgba(248,113,113,.2))} 50%{filter:drop-shadow(0 3px 16px rgba(0,0,0,.92)) drop-shadow(0 0 10px rgba(248,113,113,.32))} }
@keyframes figBounce       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes figBounceActive { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-7px) scale(1.05)} }
@keyframes figCelebrate    { 0%{transform:translateY(0) rotate(0)} 20%{transform:translateY(-15px) rotate(-15deg)} 50%{transform:translateY(-17px) rotate(0)} 80%{transform:translateY(-15px) rotate(15deg)} 100%{transform:translateY(0) rotate(0)} }
@keyframes figureCarrierPulse  { 0%,100%{filter:drop-shadow(0 0 10px rgba(96,165,250,0.95)) drop-shadow(0 0 22px rgba(96,165,250,0.50)) drop-shadow(0 2px 5px rgba(0,0,0,0.55))} 50%{filter:drop-shadow(0 0 18px rgba(96,165,250,1)) drop-shadow(0 0 38px rgba(96,165,250,0.72)) drop-shadow(0 2px 5px rgba(0,0,0,0.55))} }
@keyframes figurePressurePulse { 0%,100%{filter:drop-shadow(0 0 9px rgba(239,68,68,0.92)) drop-shadow(0 0 18px rgba(239,68,68,0.46)) drop-shadow(0 2px 4px rgba(0,0,0,0.55))} 50%{filter:drop-shadow(0 0 15px rgba(239,68,68,1)) drop-shadow(0 0 28px rgba(239,68,68,0.68)) drop-shadow(0 2px 4px rgba(0,0,0,0.55))} }

/* ── Encounter UI animations ── */
@keyframes fadeInUp        { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes slideInRight    { 0%{opacity:0;transform:translateX(20px)} 100%{opacity:1;transform:translateX(0)} }
@keyframes spotlightPulse  { 0%,100%{r:180px;opacity:0.25} 50%{r:220px;opacity:0.35} }
@keyframes pathGlow        { 0%,100%{opacity:0.5;stroke-width:2} 50%{opacity:0.8;stroke-width:3} }
@keyframes threatRing      { 0%{r:100px;opacity:0.4} 50%{r:120px;opacity:0.2} 100%{r:100px;opacity:0.4} }
@keyframes passlaneFlow    { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-20px} }
@keyframes playerHighlight { 0%,100%{opacity:0.6} 50%{opacity:1} }

/* ── Utility classes ── */
.fig-you      { animation:youGlowPulse 1.8s ease-in-out infinite,figBounce .95s ease-in-out infinite }
.fig-active   { animation:activeGlowPulse .9s ease-in-out infinite,figBounceActive .85s ease-in-out infinite!important }
.fig-team     { animation:teamGlow 2.2s ease-in-out infinite,figBounce 1.25s ease-in-out infinite }
.fig-opp      { filter:brightness(0) saturate(0) contrast(2.2) drop-shadow(0 5px 12px rgba(0,0,0,.95))!important;opacity:.95;animation:figBounce 1.4s ease-in-out infinite }
.fig-far      { filter:brightness(.55) saturate(.4) blur(.4px)!important;animation:figBounce 1.6s ease-in-out infinite!important }
.fig-celebrate{ animation:figCelebrate .65s ease-in-out 3,celebrateGlowFig .4s ease-in-out 5!important }
.pop          { animation:scoreFlash .4s ease }
.time-pop     { animation:timePop .35s ease }

.read-action-button {
  outline: none;
  position:relative;
}

.read-action-button::before {
  content:"";
  position:absolute;
  left:8%;
  right:8%;
  top:-24px;
  height:56px;
  z-index:0;
  pointer-events:none;
  opacity:0;
  transform:translateY(10px) scaleX(.78);
  background:
    radial-gradient(ellipse 58% 72% at 50% 100%, color-mix(in srgb, var(--read-col) 46%, transparent), transparent 72%),
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--read-col) 22%, transparent));
  filter:blur(6px);
  transition:opacity .2s ease, transform .2s ease;
}

.read-action-card {
  isolation:isolate;
  z-index:1;
}

.read-action-card::before {
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  background:
    linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px 18px),
    linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 14px),
    radial-gradient(ellipse 88% 48% at 50% 100%, color-mix(in srgb, var(--read-col) 62%, transparent) 0%, transparent 62%);
  opacity:.18;
}

.read-action-card__ray {
  position:absolute;
  left:8%;
  right:8%;
  bottom:0;
  height:38%;
  z-index:0;
  pointer-events:none;
  background:
    linear-gradient(0deg, color-mix(in srgb, var(--read-col) 30%, transparent), transparent),
    radial-gradient(ellipse 70% 95% at 50% 100%, color-mix(in srgb, var(--read-col) 42%, transparent), transparent 66%);
  opacity:.34;
  transform:translateY(8px);
  transition:opacity .18s ease, transform .18s ease;
}

.read-action-card__sheen {
  position:absolute;
  left:-10%;
  right:-10%;
  bottom:-34%;
  height:28%;
  z-index:1;
  pointer-events:none;
  background:linear-gradient(0deg, transparent, rgba(255,255,255,.18), transparent);
  transform:translateY(140%);
  opacity:0;
}

.read-action-card__sub {
  display:grid;
}

.read-action-card__sub-default,
.read-action-card__sub-hover {
  grid-area:1 / 1;
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  transition:opacity .14s ease, transform .14s ease, color .14s ease;
}

.read-action-card__sub-hover {
  color:rgba(255,255,255,.92);
  opacity:0;
  transform:translateY(4px);
}

.read-action-button:not(:disabled):hover .read-action-card__sub-default,
.read-action-button:not(:disabled):focus-visible .read-action-card__sub-default {
  opacity:0;
  transform:translateY(-4px);
}

.read-action-button:not(:disabled):hover .read-action-card__sub-hover,
.read-action-button:not(:disabled):focus-visible .read-action-card__sub-hover {
  opacity:1;
  transform:translateY(0);
}

.read-action-button:not(:disabled):hover .read-action-card,
.read-action-button:not(:disabled):focus-visible .read-action-card {
  transform:translateY(-2px);
  border-color:var(--read-col)!important;
  box-shadow:
    0 12px 26px rgba(0,0,0,.5),
    0 0 0 1px color-mix(in srgb, var(--read-col) 32%, transparent),
    0 0 20px color-mix(in srgb, var(--read-col) 30%, transparent),
    inset 0 1px 0 rgba(255,255,255,.12)!important;
}

.read-action-button:not(:disabled):hover::before,
.read-action-button:not(:disabled):focus-visible::before {
  opacity:1;
  transform:translateY(0) scaleX(1);
}

.read-action-button:not(:disabled):hover .read-action-card::before,
.read-action-button:not(:disabled):focus-visible .read-action-card::before {
  opacity:.28;
}

.read-action-button:not(:disabled):hover .read-action-card__ray,
.read-action-button:not(:disabled):focus-visible .read-action-card__ray {
  opacity:.62;
  transform:translateY(0);
}

.read-action-button:not(:disabled):hover .read-action-card__sheen,
.read-action-button:not(:disabled):focus-visible .read-action-card__sheen {
  animation:readCardSheen .82s ease forwards;
}

.read-action-button:not(:disabled):active .read-action-card {
  transform:translateY(0) scale(.99);
}

.read-glyph {
  position:relative;
  width:42px;
  height:42px;
  border-radius:7px;
  flex-shrink:0;
  overflow:hidden;
  background:
    radial-gradient(circle at 28% 28%, color-mix(in srgb, var(--glyph-col) 40%, transparent), transparent 43%),
    radial-gradient(ellipse 90% 70% at 62% 70%, rgba(255,255,255,.055), transparent 70%),
    linear-gradient(160deg, rgba(255,255,255,.085), rgba(0,0,0,.18)),
    rgba(2,7,5,.92);
  border:1px solid color-mix(in srgb, var(--glyph-col) 76%, rgba(255,255,255,.1));
  box-shadow:
    0 0 16px color-mix(in srgb, var(--glyph-col) 28%, transparent),
    inset 0 1px 0 rgba(255,255,255,.10),
    inset 0 0 0 1px rgba(255,255,255,.035);
}

.read-glyph::before {
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(90deg, rgba(255,255,255,.08) 0 1px, transparent 1px 12px),
    linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 12px);
  opacity:.25;
}

.read-glyph__midline {
  position:absolute;
  left:50%;
  top:4px;
  bottom:4px;
  width:1px;
  background:rgba(255,255,255,.18);
}

.read-glyph__box {
  position:absolute;
  right:4px;
  top:11px;
  width:8px;
  height:18px;
  border:1px solid rgba(255,255,255,.14);
  border-right:0;
  border-radius:4px 0 0 4px;
}

.read-action-button:not(:disabled):hover .read-glyph-route,
.read-action-button:not(:disabled):focus-visible .read-glyph-route {
  animation:readGlyphRoute .9s ease-in-out infinite;
}

.read-action-button:not(:disabled):hover .read-glyph,
.read-action-button:not(:disabled):focus-visible .read-glyph {
  box-shadow:
    0 0 16px color-mix(in srgb, var(--glyph-col) 38%, transparent),
    inset 0 1px 0 rgba(255,255,255,.14),
    inset 0 0 0 1px rgba(255,255,255,.05);
}

.prematch-main {
  flex:1;
  min-height:0;
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns:minmax(0,1.18fr) minmax(320px,.82fr);
  gap:14px;
  padding:14px;
}

.prematch-field-panel,
.prematch-options-panel {
  min-height:0;
  border:1px solid rgba(255,255,255,.08);
  border-radius:14px;
  background:linear-gradient(180deg,rgba(12,25,17,.78),rgba(4,10,7,.88));
  box-shadow:0 18px 54px rgba(0,0,0,.28);
  backdrop-filter:blur(14px);
}

.prematch-field-panel {
  display:flex;
  flex-direction:column;
  padding:16px;
}

.prematch-options-panel {
  display:flex;
  flex-direction:column;
  padding:14px;
}

.formation-field {
  flex:1;
  min-height:260px;
  position:relative;
  overflow:hidden;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.1);
  background:
    repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 10%,transparent 10% 20%),
    linear-gradient(180deg,#0b3b1d 0%,#1d8844 46%,#13692f 100%);
  box-shadow:inset 0 0 60px rgba(0,0,0,.38);
}

@media (max-width:760px) {
  .prematch-main {
    grid-template-columns:1fr;
    overflow-y:auto;
    scrollbar-width:none;
  }

  .prematch-field-panel,
  .prematch-options-panel {
    min-height:auto;
  }

  .formation-field {
    min-height:220px;
  }
}

/* ── Resolution breakpoints ── */
@media (min-width:1440px) {
  .prematch-main {
    grid-template-columns:minmax(0,1.25fr) minmax(360px,.75fr);
  }
}

@media (max-width:640px) {
  .prematch-main {
    grid-template-columns:1fr;
    padding:10px;
    gap:10px;
  }

  .prematch-field-panel,
  .prematch-options-panel {
    padding:12px;
  }

  .formation-field {
    min-height:200px;
  }
}

/* ── Enhanced button styles ── */
button {
  transition:all .2s cubic-bezier(.34,.69,.64,1);
}

button:hover:not(:disabled) {
  transform:translateY(-1px);
}

button:active:not(:disabled) {
  transform:translateY(0);
}

/* ── Premium card styles ── */
.premium-card {
  border:1px solid rgba(74,222,128,.2);
  background:rgba(74,222,128,.06);
  border-radius:12px;
  transition:all .3s ease;
}

.premium-card:hover {
  border-color:rgba(74,222,128,.4);
  background:rgba(74,222,128,.1);
  box-shadow:0 8px 24px rgba(74,222,128,.15);
}

/* ── Responsive font scaling ── */
@media (max-width:768px) {
  :root {
    font-size:14px;
  }
}

@media (max-width:480px) {
  :root {
    font-size:12px;
  }
}

/* ── High DPI screens ── */
@media (-webkit-min-device-pixel-ratio:2), (min-resolution:192dpi) {
  * {
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
  }
}

/* ── Dark mode optimization ── */
@media (prefers-color-scheme:dark) {
  html, body {
    background:#020504;
    color:var(--tx);
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion:reduce) {
  * {
    animation-duration:0.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:0.01ms!important;
  }
}

/* ── Scrollbar styling ── */
::-webkit-scrollbar {
  width:6px;
  height:6px;
}

::-webkit-scrollbar-track {
  background:rgba(255,255,255,.05);
}

::-webkit-scrollbar-thumb {
  background:rgba(74,222,128,.25);
  border-radius:3px;
}

::-webkit-scrollbar-thumb:hover {
  background:rgba(74,222,128,.4);
}

/* ── Focus states for accessibility ── */
button:focus-visible {
  outline:2px solid rgba(74,222,128,.5);
  outline-offset:2px;
}

/* ── Input field styles ── */
input, textarea, select {
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  color:var(--tx);
  font-family:var(--f-body);
  border-radius:8px;
  padding:8px 12px;
  transition:all .2s ease;
}

input:focus, textarea:focus, select:focus {
  background:rgba(255,255,255,.06);
  border-color:rgba(74,222,128,.3);
  outline:none;
  box-shadow:0 0 12px rgba(74,222,128,.1);
}

/* ── Text selection ── */
::selection {
  background:rgba(74,222,128,.3);
  color:var(--tx);
}

::-moz-selection {
  background:rgba(74,222,128,.3);
  color:var(--tx);
}
`;
