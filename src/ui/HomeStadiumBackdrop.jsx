import "./homeStadiumBackdrop.css";

export default function HomeStadiumBackdrop({ children }) {
  return (
    <div className="home-stadium">
      <div className="home-stadium__sky" />
      <div className="home-stadium__stands home-stadium__stands--top" />
      <div className="home-stadium__stands home-stadium__stands--bottom" />
      <div className="home-stadium__pitch" />
      <div className="home-stadium__spotlight home-stadium__spotlight--left" />
      <div className="home-stadium__spotlight home-stadium__spotlight--right" />
      <div className="home-stadium__glow" />
      <div className="home-stadium__texture" />
      <div className="home-stadium__content">{children}</div>
    </div>
  );
}
