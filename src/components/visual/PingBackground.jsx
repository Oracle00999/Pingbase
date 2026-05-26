export function PingBackground({ className = "" }) {
  return (
    <div className={`hero-ping-field ${className}`} aria-hidden="true">
      <span className="hero-node hero-node-a" />
      <span className="hero-node hero-node-b" />
      <span className="hero-node hero-node-c" />
      <span className="hero-node hero-node-d" />
      <span className="hero-ping hero-ping-a" />
      <span className="hero-ping hero-ping-b" />
      <span className="hero-ping hero-ping-c" />
    </div>
  );
}
