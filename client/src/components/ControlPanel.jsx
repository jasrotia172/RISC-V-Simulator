import React from 'react';
import './ControlPanel.css';


function ControlPanel({ onExecute, onReset, error }) {
  return (
    <div className="control-panel">
      <div className="button-group">
        <button className="btn btn-execute" onClick={onExecute}>
          ▶️ Execute
        </button>
        <button className="btn btn-reset" onClick={onReset}>
          🔄 Reset
        </button>
      </div>
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
    </div>
  );
}


export default ControlPanel;
