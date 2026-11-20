const express = require('express');
const cors = require('cors');
const Simulator = require('./utils/Simulator');

function createApp() {
  const app = express();
  const simulator = new Simulator();

  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', message: 'RISC-V Simulator API is active' });
  });

  app.post('/api/execute', (req, res) => {
    let programLoaded = false;
    try {
      simulator.load(req.body?.code);
      programLoaded = true;
      simulator.run();
      res.json({ success: true, ...simulator.getState() });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message, programLoaded, state: simulator.getState() });
    }
  });

  app.post('/api/step', (req, res) => {
    let programLoaded = false;
    try {
      if (req.body && Object.hasOwn(req.body, 'code')) simulator.load(req.body.code);
      programLoaded = simulator.instructions.length > 0;
      simulator.step();
      res.json({ success: true, ...simulator.getState() });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message, programLoaded, state: simulator.getState() });
    }
  });

  app.post('/api/reset', (req, res) => {
    simulator.reset();
    res.json({ success: true, ...simulator.getState() });
  });

  app.get('/api/state', (req, res) => {
    res.json({ success: true, ...simulator.getState() });
  });

  // Root route - API info
  app.get('/', (req, res) => {
    res.json({
      name: 'RISC-V 32-bit Simulator API',
      version: '1.0.0',
      description: 'Backend API for executing RISC-V assembly instructions',
      endpoints: {
        health: 'GET /api/health',
        execute: 'POST /api/execute',
        reset: 'POST /api/reset',
        step: 'POST /api/step',
        state: 'GET /api/state'
      },
      instructions_supported: {
        'R-Format': ['ADD', 'SUB', 'SLL', 'SLT', 'SLTU', 'XOR', 'SRL', 'SRA', 'OR', 'AND'],
        'I-Format': ['ADDI', 'SLLI', 'SLTI', 'SLTIU', 'XORI', 'SRLI', 'SRAI', 'ORI', 'ANDI'],
        'Load': ['LB', 'LH', 'LW', 'LBU', 'LHU'],
        'Store': ['SB', 'SH', 'SW'],
        'U-Format': ['LUI', 'AUIPC'],
        'Branch': ['BEQ', 'BNE', 'BLT', 'BGE', 'BLTU', 'BGEU'],
        'Jump': ['JAL', 'JALR'],
        'Control': ['HLT']
      },
      documentation: 'Visit frontend at http://localhost:5173',
      author: 'RISC-V Simulator Project'
    });
  });

  // 404 for unknown routes
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Express requires four parameters to identify an error handler.
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      error: status === 400 ? 'Invalid JSON request body'
        : status === 413 ? 'Request body too large' : 'Internal server error',
    });
  });

  return app;
}

const app = createApp();
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`RISC-V Simulator API: http://localhost:${port}`));
}

module.exports = app;
module.exports.createApp = createApp;
