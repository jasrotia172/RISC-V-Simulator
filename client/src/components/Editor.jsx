import React, { useState } from 'react';
import './Editor.css';
import { examplePrograms } from '../examples/programs';

function Editor({ code, setCode }) {
  const [selectedExample, setSelectedExample] = useState('');

  const handleExampleChange = (e) => {
    const exampleName = e.target.value;
    setSelectedExample(exampleName);
    if (exampleName && examplePrograms[exampleName]) {
      setCode(examplePrograms[exampleName]);
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-left">
          <span className="editor-title">📝 Assembly Code Editor</span>
          <span className="editor-hint">Write your RISC-V instructions here</span>
        </div>
        <div className="editor-right">
          <select 
            value={selectedExample} 
            onChange={handleExampleChange}
            className="example-selector"
          >
            <option value="">Load Example...</option>
            {Object.keys(examplePrograms).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="# Write RISC-V assembly code here
# Example:
ADDI x1, x0, 10
ADDI x2, x0, 20
ADD x3, x1, x2
HLT"
        spellCheck="false"
      />
    </div>
  );
}

export default Editor;
