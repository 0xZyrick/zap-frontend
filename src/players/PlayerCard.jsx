const DEFAULT_CARD_FRAME = "/assets/bg/card-texture.png";
const DEFAULT_PLAYER_ART = "/assets/players/player_idle.png";

function Stat({ label, value }) {
  return (
    <div style={{ textAlign:"center", minWidth:0 }}>
      <div style={{
        fontFamily:"var(--f-cond)",
        fontWeight:800,
        fontSize:"clamp(12px, 6cqw, 17px)",
        lineHeight:1,
        color:"#F2F1EC",
      }}>{Math.max(0, Math.min(100, Number(value || 0)))}%</div>
      <div style={{
        marginTop:"4px",
        fontFamily:"var(--f-mono)",
        fontSize:"clamp(6px, 2.9cqw, 8px)",
        color:"rgba(242,241,236,.55)",
        letterSpacing:".06em",
      }}>{label}</div>
    </div>
  );
}

export default function PlayerCard({
  cardImageUrl = DEFAULT_CARD_FRAME,
  playerArtUrl = DEFAULT_PLAYER_ART,
  crestUrl,
  matchCode = "ZAP-ONCHAIN-PROFILE",
  playerName = "ZAP PLAYER",
  rating = 50,
  driveAcc = 50,
  wideAcc = 50,
  longAcc = 50,
}) {
  return (
    <div style={{
      position:"relative",
      width:"min(320px, 78vw)",
      aspectRatio:"3 / 4.2",
      containerType:"inline-size",
      borderRadius:"10px",
      overflow:"hidden",
      boxShadow:"0 28px 74px rgba(0,0,0,.5), 0 0 42px rgba(84,232,113,.16)",
      background:"#06120b",
    }}>
      <img src={cardImageUrl} alt="" draggable={false} style={{
        position:"absolute",
        inset:0,
        width:"100%",
        height:"100%",
        display:"block",
        objectFit:"cover",
        filter:"saturate(1.08) contrast(1.08) brightness(.78)",
      }} />
      <div style={{
        position:"absolute",
        inset:0,
        background:"linear-gradient(180deg, rgba(84,232,113,.16), rgba(3,10,6,.18) 34%, rgba(1,4,3,.82) 100%)",
      }} />

      <div style={{
        position:"absolute",
        top:"6%",
        left:"50%",
        transform:"translateX(-50%)",
        width:"70%",
        textAlign:"center",
      }}>
        <span style={{
          fontFamily:"var(--f-cond)",
          fontWeight:800,
          fontSize:"clamp(13px, 6cqw, 19px)",
          color:"#F2F1EC",
          letterSpacing:".04em",
          whiteSpace:"nowrap",
          overflow:"hidden",
          textOverflow:"ellipsis",
          display:"block",
          textShadow:"0 2px 14px rgba(0,0,0,.5)",
        }}>
          {String(playerName || "ZAP PLAYER").toUpperCase()}
        </span>
      </div>

      <div style={{
        position:"absolute",
        top:"4%",
        left:"8%",
        width:"18%",
        aspectRatio:"1",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        clipPath:"polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)",
        background:"linear-gradient(160deg, rgba(84,232,113,.95), rgba(2,10,5,.95))",
        border:"1px solid rgba(255,255,255,.22)",
        boxShadow:"0 10px 22px rgba(0,0,0,.28)",
      }}>
        <span style={{
          fontFamily:"var(--f-cond)",
          fontWeight:900,
          fontSize:"clamp(15px, 8cqw, 25px)",
          color:"#F2F1EC",
          lineHeight:1,
        }}>{rating}</span>
      </div>

      <div style={{ position:"absolute", top:"18%", left:"15%", width:"70%", height:"42%" }}>
        <img src={playerArtUrl} alt="" draggable={false} style={{
          width:"100%",
          height:"100%",
          objectFit:"contain",
          filter:"drop-shadow(0 16px 20px rgba(0,0,0,.55))",
        }} />
      </div>

      <div style={{
        position:"absolute",
        bottom:"16%",
        left:"10%",
        width:"80%",
        display:"flex",
        justifyContent:"space-between",
        gap:"8px",
      }}>
        <Stat label="DRIVE" value={driveAcc} />
        <Stat label="WIDE" value={wideAcc} />
        <Stat label="LONG" value={longAcc} />
      </div>

      <div style={{
        position:"absolute",
        bottom:"6%",
        left:"8%",
        width:"12%",
        aspectRatio:"1",
        display:"grid",
        placeItems:"center",
      }}>
        {crestUrl ? (
          <img src={crestUrl} alt="" draggable={false} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
        ) : (
          <span style={{
            width:"100%",
            height:"100%",
            borderRadius:"6px",
            display:"grid",
            placeItems:"center",
            background:"rgba(84,232,113,.16)",
            border:"1px solid rgba(84,232,113,.28)",
            color:"#bafc8a",
            fontFamily:"var(--f-cond)",
            fontSize:"clamp(8px, 4cqw, 12px)",
            fontWeight:900,
          }}>ZF</span>
        )}
      </div>

      <div style={{
        position:"absolute",
        bottom:"1.5%",
        left:"50%",
        transform:"translateX(-50%)",
        width:"84%",
        textAlign:"center",
      }}>
        <span style={{
          fontFamily:"var(--f-mono)",
          fontSize:"clamp(7px, 3.2cqw, 9px)",
          color:"rgba(242,241,236,.5)",
          letterSpacing:".05em",
          whiteSpace:"nowrap",
          overflow:"hidden",
          textOverflow:"ellipsis",
          display:"block",
        }}>
          {matchCode}
        </span>
      </div>
    </div>
  );
}
