import React from 'react';
import './PageHeader.css';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {eyebrow && (
          <p className="page-header-eyebrow">
            {eyebrow}
          </p>
        )}
        <h2 className="page-header-title">
          {title}
        </h2>
        {description && (
          <p className="page-header-desc">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
