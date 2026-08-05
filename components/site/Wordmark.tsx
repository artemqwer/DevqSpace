// Логотип-вордмарк: «Devq» неоново-блакитним зі світінням + «Space» фіолетовим.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span
        className="text-neon-blue"
        style={{ textShadow: "0 0 10px rgba(0,240,255,0.5)" }}
      >
        Devq
      </span>
      <span className="text-neon-purple">Space</span>
    </span>
  );
}
