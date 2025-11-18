import React, { useState, useEffect } from 'react';
import './App.css';
import Editor from './components/Editor';
import RegisterDisplay from './components/RegisterDisplay';
import MemoryDisplay from './components/MemoryDisplay';
import ControlPanel from './components/ControlPanel';
import { executeCode, resetSimulator, stepSimulator, getState } from './services/api';


function App() {
  const [code, setCode] = useState('');
  const [registers, setRegisters] = useState(Array(32).fill(0));
  const [pc, setPc] = useState(0);
  const [memory, setMemory] = useState([]);
  const [error, setError] = useState('');
  const [halted, setHalted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepInitialized, setStepInitialized] = useState(false);

  // Fetch initial state on component mount
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const result = await getState();
        setRegisters(result.registers);
        setPc(result.pc);
        setMemory(result.memory);
        setHalted(result.halted);
      } catch (err) {
        console.error('Failed to fetch initial state:', err);
      }
    };

    fetchInitialState();
  }, []); // Empty dependency array means this runs once on mount


  const handleExecute = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await executeCode(code);
      setRegisters(result.registers);
      setPc(result.pc);
      setMemory(result.memory);
      setHalted(result.halted);
      setStepInitialized(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleReset = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await resetSimulator();
      setRegisters(result.registers);
      setPc(result.pc);
      setMemory(result.memory);
      setHalted(result.halted);
      setCode('');
      setStepInitialized(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleStep = async () => {
    try {
      setLoading(true);
      setError('');
      let result;
      if (!stepInitialized) {
        result = await stepSimulator(code);
        setStepInitialized(true);
      } else {
        result = await stepSimulator();
      }
      setRegisters(result.registers);
      setPc(result.pc);
      setMemory(result.memory);
      setHalted(result.halted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="App">
      <header className="app-header">
        <h1>🖥️ RISC-V 32-bit Simulator</h1>
        <p className="app-subtitle">Interactive Assembly Language Simulator</p>
      </header>


      <div className="main-container">
        <div className="left-panel">
          <Editor code={code} setCode={setCode} />
          <ControlPanel 
            onExecute={handleExecute} 
            onReset={handleReset}
            onStep={handleStep}
            error={error}
            loading={loading}
          />
        </div>


        <div className="right-panel">
          <RegisterDisplay 
            registers={registers} 
            pc={pc} 
            halted={halted} 
          />
          <MemoryDisplay memory={memory} />
        </div>
      </div>
    </div>
  );
}


export default App;
