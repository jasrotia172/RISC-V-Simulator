const express = require('express');
const cors = require('cors');
const Processor = require('./utils/Processor');
const Memory = require('./utils/Memory');
const { parseInstructions } = require('./utils/parser');
const { executeInstruction } = require('./utils/executor');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let processor = new Processor();
let memory = new Memory(1024); // 1024 bytes
let instructions = []; // Store parsed instructions from the loaded code

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    message: 'RISC-V Simulator API is active'
  });
});

// Execute all instructions at once
app.post('/api/execute', (req, res) => {
  try {
    const { code } = req.body;
    if (!code || code.trim() === '') {
      return res.status(400).json({ success: false, error: 'No code provided' });
    }
    processor.pc = 0;
    processor.halted = false;
    const instructions = parseInstructions(code);

    if (instructions.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid instructions found' });
    }

    let executionCount = 0;
    const maxExecutions = 10000;

    while (!processor.halted && processor.pc < instructions.length) {
      if (executionCount >= maxExecutions) {
        return res.status(400).json({
          success: false,
          error: 'Execution limit reached (possible infinite loop)'
        });
      }

      const prevPC = processor.pc;
      const instruction = instructions[prevPC];
      executeInstruction(instruction, processor, memory);

      // Only increment PC if the instruction didn't change it
      if (!processor.halted && processor.pc === prevPC) {
        processor.pc++;
      }

      executionCount++;
    }
    res.json({
      success: true,
      registers: processor.registers,
      pc: processor.pc,
      memory: memory.getMemorySnapshot(),
      halted: processor.halted,
      executionCount: executionCount
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// Step-by-step execution
app.post('/api/step', (req, res) => {
  try {
    const code = req.body?.code;  // safer than destructuring

    // If code is provided, re-load instructions and reset the processor/memory state
    if (code && code.trim() !== '') {
      processor = new Processor();
      memory = new Memory(1024);
      instructions = parseInstructions(code);
      processor.pc = 0;
      processor.halted = false;
    }

    if (!instructions || instructions.length === 0) {
      return res.status(400).json({ success: false, error: 'No program loaded, please load code first' });
    }

    if (processor.pc >= instructions.length || processor.halted) {
      return res.json({
        success: true,
        registers: processor.registers,
        pc: processor.pc,
        memory: memory.getMemorySnapshot(),
        halted: processor.halted,
        message: 'Execution completed or already halted'
      });
    }

    // Execute one instruction
    const instruction = instructions[processor.pc];
    executeInstruction(instruction, processor, memory);
    if (!processor.halted) {
      processor.pc++;
    }
    res.json({
      success: true,
      registers: processor.registers,
      pc: processor.pc,
      memory: memory.getMemorySnapshot(),
      halted: processor.halted
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// Reset the simulator
app.post('/api/reset', (req, res) => {
  try {
    processor = new Processor();
    memory = new Memory(1024);
    instructions = [];
    res.json({
      success: true,
      registers: processor.registers,
      pc: processor.pc,
      memory: memory.getMemorySnapshot(),
      halted: processor.halted,
      message: 'Simulator reset successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current state without executing
app.get('/api/state', (req, res) => {
  res.json({
    success: true,
    registers: processor.registers,
    pc: processor.pc,
    memory: memory.getMemorySnapshot(),
    halted: processor.halted
  });
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
    documentation: 'Visit frontend at http://localhost:3000',
    author: 'RISC-V Simulator Project'
  });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`╔══════════════════════════════════╗`);
  console.log(`║  RISC-V Simulator Server Running ║`);
  console.log(`║  Port: ${PORT}                   ║`);
  console.log(`║  URL: http://localhost:${PORT}   ║`);
  console.log(`╚══════════════════════════════════╝`);
});

module.exports = app;
