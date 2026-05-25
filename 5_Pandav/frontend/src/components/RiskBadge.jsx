import React from 'react';
import './RiskBadge.css';

function getLevel(score) {
  if (score <= 4) return "low";
  if (score <= 7) return "medium";
  return "high";
}

const labels = {
  low: "LOW",
  medium: "ELEVATED",
  high: "CRITICAL"
};

export function RiskBadge({ score, size = "md" }) {
  const level = getLevel(score);
  return (
    <div className={`risk-badge risk-badge-${level} risk-badge-${size}`}>
      <span className={`risk-dot risk-dot-${level}`} />
      <span className="risk-label">{labels[level]}</span>
      <span className="risk-score">
        {score}<span className="risk-score-muted">/10</span>
      </span>
    </div>
  );
}

export function getRiskLevel(score) {
  return getLevel(score);
}
