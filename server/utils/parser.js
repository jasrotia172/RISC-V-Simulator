const registerOps = new Set(['ADD', 'SUB', 'SLL', 'SLT', 'SLTU', 'XOR', 'SRL', 'SRA', 'OR', 'AND']);
const immediateOps = new Set(['ADDI', 'SLLI', 'SLTI', 'SLTIU', 'XORI', 'SRLI', 'SRAI', 'ORI', 'ANDI', 'JALR']);
const memoryOps = new Set(['LB', 'LH', 'LHW', 'LW', 'LBU', 'LHU', 'LHWU', 'SB', 'SH', 'SHW', 'SW']);
const branchOps = new Set(['BEQ', 'BNE', 'BLT', 'BGE', 'BLTU', 'BGEU']);
const upperOps = new Set(['LUI', 'AUIPC']);
const haltOps = new Set(['HLT', 'HALT']);

function parseInstructions(code) {
  if (typeof code !== 'string' || !code.trim()) {
    throw new Error('No code provided; code must be a non-empty string');
  }
  const labels = new Map();
  const source = [];

  for (const [index, raw] of code.split('\n').entries()) {
    let line = raw.split(/#|\/\//)[0].trim();
    // Labels may share a line with an instruction or another label.
    while (line.includes(':')) {
      const match = line.match(/^([A-Za-z_.$][\w.$]*):\s*/);
      if (!match) throw new Error(`Error on line ${index + 1}: Invalid label`);
      if (labels.has(match[1])) throw new Error(`Error on line ${index + 1}: Duplicate label: ${match[1]}`);
      labels.set(match[1], source.length);
      line = line.slice(match[0].length);
    }
    if (line) source.push({ line, lineNumber: index + 1 });
  }

  return source.map(({ line, lineNumber }, currentIndex) => {
    try {
      // Allow spaces inside offset(base), but reject empty comma-separated operands.
      if (/(^|,)\s*,|,\s*$/.test(line)) throw new Error('Empty operand');
      const [name, ...operands] = line.replace(/\s*\(\s*([^()]+?)\s*\)/g, '($1)').split(/[\s,]+/);
      const opcode = name.toUpperCase();
      const expected = registerOps.has(opcode) || immediateOps.has(opcode) || branchOps.has(opcode) ? 3
        : memoryOps.has(opcode) || upperOps.has(opcode) || opcode === 'JAL' ? 2
        : haltOps.has(opcode) ? 0 : undefined;
      if (expected === undefined) throw new Error(`Unknown instruction: ${opcode}`);
      if (operands.length !== expected) throw new Error(`${opcode} expects ${expected} operands, got ${operands.length}`);

      if (branchOps.has(opcode) || opcode === 'JAL') {
        const position = operands.length - 1;
        const target = operands[position];
        if (labels.has(target)) {
          // Branches use absolute instruction indices; JAL uses a relative offset.
          operands[position] = String(labels.get(target) - (opcode === 'JAL' ? currentIndex : 0));
        } else if (/^[A-Za-z_.$]/.test(target)) {
          throw new Error(`Unknown label: ${target}`);
        }
      }

      if (expected) parseRegister(operands[0]);
      if (registerOps.has(opcode)) {
        parseRegister(operands[1]);
        parseRegister(operands[2]);
      } else if (immediateOps.has(opcode) || branchOps.has(opcode)) {
        parseRegister(operands[1]);
        parseImmediate(operands[2]);
      } else if (memoryOps.has(opcode)) {
        parseMemoryOperand(operands[1]);
      } else if (upperOps.has(opcode) || opcode === 'JAL') {
        parseImmediate(operands[1]);
      }
      return { opcode, operands, lineNumber };
    } catch (error) {
      throw new Error(`Error on line ${lineNumber}: ${error.message}`);
    }
  });
}

function parseRegister(reg) {
  if (typeof reg === 'string' && /^(?:x)?(?:[0-9]|[12][0-9]|3[01])$/i.test(reg)) {
    return Number(reg.replace(/^x/i, ''));
  }
  throw new Error(`Invalid register: ${reg}`);
}

function parseImmediate(imm) {
  if (typeof imm !== 'string' || !/^[+-]?(?:0x[\da-f]+|0b[01]+|\d+)$/i.test(imm)) {
    throw new Error(`Invalid immediate: ${imm}`);
  }
  const sign = imm.startsWith('-') ? -1 : 1;
  const value = sign * Number(imm.replace(/^[+-]/, ''));
  if (!Number.isSafeInteger(value) || value < -0x80000000 || value > 0xffffffff) {
    throw new Error(`Immediate outside 32-bit range: ${imm}`);
  }
  return value;
}

function parseMemoryOperand(operand) {
  const match = typeof operand === 'string' && operand.match(/^([^()]+)\(([^()]+)\)$/);
  if (match) return { offset: parseImmediate(match[1]), base: parseRegister(match[2]) };
  return { offset: parseImmediate(operand), base: 0 };
}

module.exports = { parseInstructions, parseRegister, parseImmediate, parseMemoryOperand };
