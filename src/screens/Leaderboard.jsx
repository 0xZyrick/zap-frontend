import { useEffect, useMemo, useState } from "react";
import { ranked } from "../game/gameState.js";
import { TIERS } from "../game/constants.js";
import { getGlobalLeaderboard } from "../lib/calls.js";
import { ClubhouseHeader, ScreenBackButton } from "./HomeScreens.jsx";
import "./leaderboard.css";

const tabs = ["GLOBAL", "MASTER", "PRO", "ELITE", "AMATEUR", "ROOKIE"];

const CRESTS = {
  derick: "/assets/crests/derick.png",
  derickfc: "/assets/crests/derick.png",
  elmaestro: "/assets/crests/el-maestro.png",
  phantomxi: "/assets/crests/phantom-xi.png",
  codmai: "/assets/crests/codmai.png",
  skyfoot: "/assets/crests/sky-foot.png",
  ghoststrike: "/assets/crests/ghost-strike.png",
};

function initials(name = "FC") {
  return name
    .replace(/\s+F\.?C\.?$/i, "")
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function assetKey(name = "") {
  return name
    .toLowerCase()
    .replace(/\bfc\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function crestSrc(name) {
  return CRESTS[assetKey(name)] || null;
}

export function Leaderboard({ S, LB, onHome, onMissions, onTeam }) {
  const [activeTab, setActiveTab] = useState("GLOBAL");
  const [globalRows, setGlobalRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("local");
  const clubName = clubNameFromState(S);
  const playerWallet = String(S?.wallet || "").toLowerCase();

  useEffect(() => {
    let cancelled = false;
    getGlobalLeaderboard(100).then((rows) => {
      if (cancelled) return;
      setGlobalRows(rows);
      setSource(rows.length ? "global" : "local");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const table = useMemo(() => {
    const localRows = ranked(S, LB).map((entry) => ({
      id: entry.id ?? entry.name,
      name: entry.cpu ? entry.name : clubName,
      rep: Number(entry.pts ?? entry.rep ?? 0),
      pts: Number(entry.pts ?? entry.rep ?? 0),
      wins: entry.cpu ? Number(entry.wins || 0) : Number(S?.wins || 0),
      draws: entry.cpu ? Number(entry.draws || 0) : Number(S?.draws || 0),
      losses: entry.cpu ? Number(entry.losses || 0) : Number(S?.losses || 0),
      total: entry.cpu ? Number(entry.total || 0) : Number(S?.total || 0),
      cpu: !!entry.cpu,
      source: "local",
    }));

    const rows = globalRows.length ? [...globalRows] : localRows;
    const currentRegistered = playerWallet && rows.some((row) => String(row.wallet || "").toLowerCase() === playerWallet);
    if (!currentRegistered && !globalRows.length) {
      return rows.map((row, index) => ({ ...row, rank: index + 1 }));
    }

    if (!currentRegistered && S?.clubIdentitySet) {
      rows.push({
        id: "local-player",
        name: clubName,
        rep: Number(S?.rep || 0),
        pts: Number(S?.rep || 0),
        wins: Number(S?.wins || 0),
        draws: Number(S?.draws || 0),
        losses: Number(S?.losses || 0),
        total: Number(S?.total || 0),
        cpu: false,
        source: "local",
      });
    }

    return rows
      .sort((a, b) => b.rep - a.rep || b.wins - a.wins || a.losses - b.losses)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [S, LB, clubName, globalRows, playerWallet]);

  const filteredTable = useMemo(() => {
    if (activeTab === "GLOBAL") return table.slice(0, 100);
    const tier = TIERS.find((t) => t.short === activeTab || t.name.toUpperCase().startsWith(activeTab));
    if (!tier) return table.slice(0, 100);
    return table.filter((row) => Number(row.rep ?? row.pts ?? 0) >= (tier.repMin ?? 0) && Number(row.rep ?? row.pts ?? 0) <= (tier.repMax ?? Infinity));
  }, [activeTab, table]);

  const countLabel = loading ? "SYNCING" : `${table.length} CLUBS`;

  return (
    <main className="zap-leaderboard">
      <ScreenBackButton onClick={onHome} />
      <ClubhouseHeader
        S={S}
        LB={LB}
        active="leaderboard"
        onPlay={onHome}
        onMissions={onMissions}
        onTeam={onTeam}
        extraStats={<span className="zap-home__stat zap-leaderboard__count">{countLabel}</span>}
      />

      <nav className="zap-leaderboard__tabs" aria-label="Leaderboard tier">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "is-active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="zap-leaderboard__meta">
        <span>{source === "global" ? "TORII GLOBAL" : "LOCAL FALLBACK"}</span>
        <span>{loading ? "Refreshing standings..." : "Sorted by REP, wins, then losses"}</span>
      </div>

      <section className="zap-leaderboard__table" aria-label={`${activeTab} leaderboard`}>
        <div className="zap-leaderboard__row zap-leaderboard__row--head">
          <span>RANK</span>
          <span>TEAM</span>
          <span>W</span>
          <span>D</span>
          <span>L</span>
          <span>REP</span>
        </div>

        <div className="zap-leaderboard__body">
          {filteredTable.map((entry) => {
            const name = entry.name || "UNKNOWN FC";
            const rowCrest = crestSrc(name);
            return (
              <div className="zap-leaderboard__row" key={entry.id ?? "player"}>
                <span className="zap-leaderboard__place">{entry.rank}.</span>
                <span className="zap-leaderboard__team">
                  <span className="zap-leaderboard__team-crest">
                    {rowCrest ? <img src={rowCrest} alt="" draggable={false} /> : initials(name)}
                  </span>
                  <strong>{name.toUpperCase()}</strong>
                </span>
                <span>{statNumber(entry.wins)}</span>
                <span>{statNumber(entry.draws)}</span>
                <span>{statNumber(entry.losses)}</span>
                <span>{statNumber(entry.rep ?? entry.pts)}</span>
              </div>
            );
          })}

          {!filteredTable.length && (
            <div className="zap-leaderboard__empty">
              {loading ? "Loading clubs..." : "No clubs in this tier yet."}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function clubNameFromState(S) {
  return S?.clubName || "DERICK FC";
}
