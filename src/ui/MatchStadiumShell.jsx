import "./matchStadiumShell.css";

export default function MatchStadiumShell({ children }) {
  return (
    <div className="match-stadium-shell">
      <div className="match-stadium-shell__crowd match-stadium-shell__crowd--top" />
      <div className="match-stadium-shell__crowd match-stadium-shell__crowd--bottom" />
      <div className="match-stadium-shell__light match-stadium-shell__light--left" />
      <div className="match-stadium-shell__light match-stadium-shell__light--right" />
      <div className="match-stadium-shell__ambient" />
      <div className="match-stadium-shell__content">{children}</div>
    </div>
  );
}
