import React from 'react';
import './MemoryDisplay.css';

function MemoryDisplay({ memory }) {
  // Group memory into rows of 4 address-value pairs each
  const groupMemoryIntoRows = (memoryArray, itemsPerRow = 4) => {
    const rows = [];
    for (let i = 0; i < memoryArray.length; i += itemsPerRow) {
      rows.push(memoryArray.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  const memoryRows = groupMemoryIntoRows(memory, 4);

  return (
    <div className="memory-display">
      <div className="memory-header">
        <span className="memory-title">💾 Memory</span>
        <span className="memory-count">{memory.length} bytes</span>
      </div>
      
      {memory.length === 0 ? (
        <div className="memory-empty">
          <span>No data in memory</span>
          <span className="memory-hint">Memory values will appear here after initialization</span>
        </div>
      ) : (
        <div className="memory-table">
          <div className="memory-table-header">
            <span>Address</span>
            <span>Value</span>
            <span>Address</span>
            <span>Value</span>
            <span>Address</span>
            <span>Value</span>
            <span>Address</span>
            <span>Value</span>
          </div>
          {memoryRows.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              className="memory-row"
            >
              {row.map((mem, colIndex) => {
                const isActive = mem.value !== 0;
                return (
                  <React.Fragment key={colIndex}>
                    <span className={`memory-address ${isActive ? 'memory-active' : ''}`}>
                      {mem.address}
                    </span>
                    <span className={`memory-value ${isActive ? 'memory-active' : ''}`}>
                      {mem.value} ({mem.hex})
                    </span>
                  </React.Fragment>
                );
              })}
              {/* Fill empty cells if row is incomplete */}
              {row.length < 4 && Array(4 - row.length).fill(0).map((_, i) => (
                <React.Fragment key={`empty-${i}`}>
                  <span className="memory-address"></span>
                  <span className="memory-value"></span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MemoryDisplay;
