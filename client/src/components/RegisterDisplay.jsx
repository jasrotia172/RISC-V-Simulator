import React from 'react';
import './RegisterDisplay.css';

function RegisterDisplay({ registers, pc, halted }) {
  return (
    <div className="register-display">
      <div className="register-header">
        <span className="register-title">📊 Registers</span>
        {halted && <span className="halted-badge">HALTED</span>}
      </div>
      
      <div className="pc-display">
        <span className="pc-label">PC (Program Counter):</span>
        <span className="pc-value">{pc}</span>
      </div>

      <div className="register-grid">
        {registers.map((value, index) => (
          <div 
            key={index} 
            className={`register-item ${value !== 0 ? 'register-active' : ''}`}
          >
            <span className="register-name">x{index}</span>
            <span className="register-value">
              {value} (0x{(value >>> 0).toString(16).padStart(8, '0')})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RegisterDisplay;


