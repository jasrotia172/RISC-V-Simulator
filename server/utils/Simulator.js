const Processor = require('./Processor');
const Memory = require('./Memory');
const { parseInstructions } = require('./parser');
const { executeInstruction } = require('./executor');

class Simulator {
  constructor() {
    this.reset();
  }

  reset() {
    this.processor = new Processor();
    this.memory = new Memory(256);
    this.instructions = [];
    this.executionCount = 0;
  }

  load(code) {
    // Validate the entire program before replacing the current state.
    const instructions = parseInstructions(code);
    if (!instructions.length) throw new Error('No instructions found');
    this.reset();
    this.instructions = instructions;
  }

  get completed() {
    return this.processor.halted || (this.instructions.length > 0 && this.processor.pc >= this.instructions.length);
  }

  step() {
    if (!this.instructions.length) throw new Error('No program loaded, please load code first');
    if (this.completed) return;
    const instruction = this.instructions[this.processor.pc];
    try {
      executeInstruction(instruction, this.processor, this.memory);
      this.executionCount++;
    } catch (error) {
      throw new Error(`Line ${instruction.lineNumber}: ${error.message}`);
    }
  }

  run(maxExecutions = 10000) {
    let count = 0;
    while (!this.completed) {
      if (count >= maxExecutions) throw new Error('Execution limit reached (possible infinite loop)');
      this.step();
      count++;
    }
  }

  getState() {
    return {
      registers: [...this.processor.registers],
      pc: this.processor.pc,
      memory: this.memory.getMemorySnapshot(),
      halted: this.processor.halted,
      completed: this.completed,
      executionCount: this.executionCount,
    };
  }
}

module.exports = Simulator;
