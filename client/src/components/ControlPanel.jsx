import React from 'react';
import './ControlPanel.css';


function ControlPanel({ onExecute, onReset, onStep, error, loading, hasCode, completed }) {
  return (
    <div className="control-panel">
      <div className="button-group">
        <button className="btn btn-execute" onClick={onExecute} disabled={loading || !hasCode}>
          ▶️ Execute
        </button>
        <button className="btn btn-step" onClick={onStep} disabled={loading || !hasCode || completed}>
          ⏸️ Step
        </button>
        <button className="btn btn-reset" onClick={onReset} disabled={loading}>
          🔄 Reset
        </button>
      </div>
      {loading && <div role="status">Working…</div>}
      {error && (
        <div className="error-message" role="alert">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
    </div>
  );
}



export default ControlPanel;
