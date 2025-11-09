function parseInstructions(code) {
  const lines = code.split('\n');
  const labels = {};
  const instructions = [];
  let instructionIndex = 0;

  // First pass: Find all labels and their positions
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Remove comments
    line = line.split('#')[0].split('//')[0].trim();

    if (!line) continue;

    // Check if line is a label (ends with :)
    if (line.endsWith(':')) {
      const labelName = line.substring(0, line.length - 1).trim();
      labels[labelName] = instructionIndex;
      continue;
    }

    // Not a label, so it's an instruction
    instructionIndex++;
  }

  // Second pass: Parse instructions and resolve labels
  instructionIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      continue;
    }

    // Skip labels
    if (line.endsWith(':')) {
      continue;
    }

    try {
      const instruction = parseLine(line, labels, instructionIndex);
      if (instruction) {
        instructions.push(instruction);
        instructionIndex++;
      }
    } catch (error) {
      throw new Error(`Error on line ${i + 1}: ${error.message}`);
    }
  }

  return instructions;
}

function parseLine(line, labels = {}, currentIndex = 0) {
  // Remove comments from the line
  line = line.split('#')[0].split('//')[0].trim();

  if (!line) return null;

  // Split instruction and operands
  const parts = line.split(/[\s,]+/).filter(part => part);

  if (parts.length === 0) return null;

  const opcode = parts[0].toUpperCase();
  let operands = parts.slice(1);

  // For branch, JAL and JALR instructions, resolve label to offset
  if (['BEQ', 'BNE', 'BLT', 'BGE', 'BLTU', 'BGEU', 'JAL', 'JALR'].includes(opcode)) {
    const lastOperand = operands[operands.length - 1];

    // Check if last operand is a label (not a number)
    if (isNaN(parseInt(lastOperand)) && labels.hasOwnProperty(lastOperand)) {
      // Calculate offset from current instruction to label
      // Subtract 1 because PC will auto-increment after branch/jump
      const offset = labels[lastOperand] - currentIndex - 1;
      operands = [...operands.slice(0, -1), offset.toString()];
    }
  }

  return {
    opcode,
    operands
  };
}

function parseRegister(reg) {
  // Handle both x0-x31 and numeric formats
  if (reg.startsWith('x') || reg.startsWith('X')) {
    const num = parseInt(reg.substring(1));
    if (num >= 0 && num <= 31) return num;
  }

  const num = parseInt(reg);
  if (num >= 0 && num <= 31) return num;

  throw new Error(`Invalid register: ${reg}`);
}

function parseImmediate(imm) {
  // Handle hex (0x), binary (0b), and decimal
  if (typeof imm === 'string') {
    if (imm.startsWith('0x') || imm.startsWith('0X')) {
      return parseInt(imm, 16);
    } else if (imm.startsWith('0b') || imm.startsWith('0B')) {
      return parseInt(imm.substring(2), 2);
    }
  }
  return parseInt(imm);
}

function parseMemoryOperand(operand) {
  // Parse format: offset(base) or just offset
  // Example: 4(x2) or 100
  const match = operand.match(/^(-?\d+)\(([xX]\d+)\)$/);

  if (match) {
    return {
      offset: parseImmediate(match[1]),
      base: parseRegister(match[2])
    };
  }

  // If no parentheses, treat as offset with base x0
  return {
    offset: parseImmediate(operand),
    base: 0
  };
}

module.exports = {
  parseInstructions,
  parseRegister,
  parseImmediate,
  parseMemoryOperand
};
