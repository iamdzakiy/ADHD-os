export default function GlassCard({ children, className = '', hover = true }) {
  return (
    <div className={`glass-card p-6 ${hover ? 'hover:border-purple-500/30 transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
}