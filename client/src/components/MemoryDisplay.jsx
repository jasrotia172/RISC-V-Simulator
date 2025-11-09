import React from 'react';
import './MemoryDisplay.css';

function MemoryDisplay({ memory }) {
  return (
    <div className="memory-display">
      <div className="memory-header">
        <span className="memory-title">💾 Memory</span>
        <span className="memory-count">{memory.length} bytes</span>
      </div>
      
      {memory.length === 0 ? (
        <div className="memory-empty">
          <span>No data in memory</span>
          <span className="memory-hint">Memory values will appear here after store operations</span>
        </div>
      ) : (
        <div className="memory-table">
          <div className="memory-table-header">
            <span>Address</span>
            <span>Value</span>
          </div>
          {memory.map((mem, index) => (
            <div key={index} className="memory-row">
              <span className="memory-address">{mem.address}</span>
              <span className="memory-value">
                {mem.value} ({mem.hex || '0x' + (mem.value >>> 0).toString(16).padStart(2, '0').toUpperCase()})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MemoryDisplay;
