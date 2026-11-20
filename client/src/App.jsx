import { useState, useEffect } from 'react';
import './App.css';
import Editor from './components/Editor';
import RegisterDisplay from './components/RegisterDisplay';
import MemoryDisplay from './components/MemoryDisplay';
import ControlPanel from './components/ControlPanel';
import { executeCode, resetSimulator, stepSimulator, getState } from './services/api';

const initialState = { registers: Array(32).fill(0), pc: 0, memory: [], halted: false, completed: false };

function App() {
  const [code, setCode] = useState('');
  const [state, setState] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [stepInitialized, setStepInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    getState()
      .then(result => { if (active) setState(result); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleCodeChange = (value) => {
    setCode(value);
    setStepInitialized(false);
    setError('');
  };

  const performAction = async (action) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await (action === 'reset' ? resetSimulator()
        : action === 'execute' ? executeCode(code)
        : stepSimulator(stepInitialized ? undefined : code));
      setState(result);
      setStepInitialized(action !== 'reset');
    } catch (err) {
      setError(err.message);
      if (err.state) setState(err.state);
      if (typeof err.programLoaded === 'boolean') setStepInitialized(err.programLoaded);
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
          <Editor code={code} setCode={handleCodeChange} disabled={loading} />
          <ControlPanel
            onExecute={() => performAction('execute')}
            onReset={() => performAction('reset')}
            onStep={() => performAction('step')}
            error={error}
            loading={loading}
            hasCode={Boolean(code.trim())}
            completed={stepInitialized && state.completed}
          />
        </div>
        <div className="right-panel">
          <RegisterDisplay registers={state.registers} pc={state.pc} halted={state.halted} completed={state.completed} />
          <MemoryDisplay memory={state.memory} />
        </div>
      </div>
    </div>
  );
}

export default App;
