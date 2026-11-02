export default function StarField() {
  return (
    <div className="starfield" aria-hidden="true">
      <div className="starfield__nebula" />
      <div className="starfield__stars--far" />
      <div className="starfield__stars" />
      <div className="starfield__comet" />
    </div>
  );
}