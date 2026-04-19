'use client';

export default function SafetyRecommendations({ recommendations, aiExplanation }) {
  return (
    <div className="glass-card p-6 space-y-6">
      {/* AI Explanation */}
      <div>
        <h3
          className="text-base font-bold mb-4 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          🤖 AI Analysis
        </h3>
        <div
          className="p-5 rounded-xl text-sm leading-[1.8]"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)',
          }}
        >
          {aiExplanation.split('\n').map((line, i) => {
            if (line.trim() === '') return <div key={i} className="h-3" />;
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={i} className="mb-1.5">
                {parts.map((part, j) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={j} style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={j}>{part}</span>;
                })}
              </p>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3
          className="text-base font-bold mb-4 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          🛡️ Safety Recommendations
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-card)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span className="text-2xl flex-shrink-0">{rec.icon}</span>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {rec.action}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {rec.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
