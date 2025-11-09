class Processor {
  constructor() {
    this.registers = new Array(32).fill(0);
    this.pc = 0;
    this.halted = false;
  }

  reset() {
    this.registers = new Array(32).fill(0);
    this.pc = 0;
    this.halted = false;
  }

  getRegister(index) {
    if (index === 0) return 0; // x0 is always 0 in RISC-V
    return this.registers[index];
  }

  setRegister(index, value) {
    if (index !== 0) { // x0 is hardwired to 0
      // Keep as 32-bit signed integer
      this.registers[index] = value | 0;
    }
  }

  halt() {
    this.halted = true;
  }
}

module.exports = Processor;
