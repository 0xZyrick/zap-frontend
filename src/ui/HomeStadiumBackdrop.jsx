import "./homeStadiumBackdrop.css";

export default function HomeStadiumBackdrop({ children }) {
  return (
    <div className="home-stadium">
      <div className="home-stadium__content">{children}</div>
    </div>
  );
}
