import React from 'react';
import { ShieldCheck, Check } from "lucide-react";
import './AllCaughtUp.css';

export function AllCaughtUp() {
  return (
    <div className="all-caught-up glass">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="all-caught-up-glow"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(34,197,94,0.18), transparent 70%)",
        }}
      />

      {/* Shield graphic */}
      <div className="all-caught-up-graphic">
        <div className="all-caught-up-shield">
          <ShieldCheck className="text-success" size={48} strokeWidth={1.75} />
          {/* Concentric rings */}
          <span aria-hidden="true" className="all-caught-up-ring ring-1" />
          <span aria-hidden="true" className="all-caught-up-ring ring-2" />
          <span aria-hidden="true" className="all-caught-up-ring ring-3" />
        </div>
        {/* Check ping */}
        <div className="all-caught-up-check">
          <Check size={14} color="#000" strokeWidth={3} />
        </div>
      </div>

      <h3 className="all-caught-up-title">
        All Caught Up
      </h3>
      <p className="all-caught-up-desc">
        No pending intents require guardian review. The network is secure and all
        autonomous agents are operating within approved risk parameters.
      </p>

      <div className="all-caught-up-status">
        <span className="pulse-dot-wrapper">
          <span className="pulse-dot-ping bg-success" />
          <span className="pulse-dot bg-success" />
        </span>
        <span className="status-text text-success">Guardian monitor active</span>
      </div>
    </div>
  );
}
