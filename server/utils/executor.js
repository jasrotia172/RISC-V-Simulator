const { parseRegister, parseImmediate, parseMemoryOperand } = require('./parser');

function executeInstruction(instruction, processor, memory) {
  const { opcode, operands } = instruction;
  if (processor.halted) return;
  let jumped = false;

  try {
    switch (opcode) {
      // R-Format Instructions
      case 'ADD':
        executeADD(operands, processor);
        break;
      case 'SUB':
        executeSUB(operands, processor);
        break;
      case 'SLL':
        executeSLL(operands, processor);
        break;
      case 'SLT':
        executeSLT(operands, processor);
        break;
      case 'SLTU':
        executeSLTU(operands, processor);
        break;
      case 'XOR':
        executeXOR(operands, processor);
        break;
      case 'SRL':
        executeSRL(operands, processor);
        break;
      case 'SRA':
        executeSRA(operands, processor);
        break;
      case 'OR':
        executeOR(operands, processor);
        break;
      case 'AND':
        executeAND(operands, processor);
        break;

      // I-Format Instructions (Immediate)
      case 'ADDI':
        executeADDI(operands, processor);
        break;
      case 'SLLI':
        executeSLLI(operands, processor);
        break;
      case 'SLTI':
        executeSLTI(operands, processor);
        break;
      case 'SLTIU':
        executeSLTIU(operands, processor);
        break;
      case 'XORI':
        executeXORI(operands, processor);
        break;
      case 'SRLI':
        executeSRLI(operands, processor);
        break;
      case 'SRAI':
        executeSRAI(operands, processor);
        break;
      case 'ORI':
        executeORI(operands, processor);
        break;
      case 'ANDI':
        executeANDI(operands, processor);
        break;

      // Load Instructions
      case 'LB':
        executeLB(operands, processor, memory);
        break;
      case 'LH':
      case 'LHW':
        executeLH(operands, processor, memory);
        break;
      case 'LW':
        executeLW(operands, processor, memory);
        break;
      case 'LBU':
        executeLBU(operands, processor, memory);
        break;
      case 'LHU':
      case 'LHWU':
        executeLHU(operands, processor, memory);
        break;

      // Store Instructions
      case 'SB':
        executeSB(operands, processor, memory);
        break;
      case 'SH':
      case 'SHW':
        executeSH(operands, processor, memory);
        break;
      case 'SW':
        executeSW(operands, processor, memory);
        break;

      // U-Format Instructions
      case 'LUI':
        executeLUI(operands, processor);
        break;
      case 'AUIPC':
        executeAUIPC(operands, processor);
        break;

      // Branch Instructions
      case 'BEQ':
        jumped = executeBEQ(operands, processor);
        break;
      case 'BNE':
        jumped = executeBNE(operands, processor);
        break;
      case 'BLT':
        jumped = executeBLT(operands, processor);
        break;
      case 'BGE':
        jumped = executeBGE(operands, processor);
        break;
      case 'BLTU':
        jumped = executeBLTU(operands, processor);
        break;
      case 'BGEU':
        jumped = executeBGEU(operands, processor);
        break;

      // Jump Instructions
      case 'JAL':
        jumped = executeJAL(operands, processor);
        break;
      case 'JALR':
        jumped = executeJALR(operands, processor);
        break;

      // Halt
      case 'HLT':
      case 'HALT':
        processor.halt();
        break;

      default:
        throw new Error(`Unknown instruction: ${opcode}`);
    }
    if (!processor.halted && !jumped) processor.pc++;
  } catch (error) {
    throw new Error(`Error executing ${opcode}: ${error.message}`);
  }
}

// R-Format: ADD rd, rs1, rs2
function executeADD(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const result = processor.getRegister(rs1) + processor.getRegister(rs2);
  processor.setRegister(rd, result);
}

function executeSUB(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const result = processor.getRegister(rs1) - processor.getRegister(rs2);
  processor.setRegister(rd, result);
}

function executeSLL(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const shamt = processor.getRegister(rs2) & 0x1F; // Only use lower 5 bits
  const result = processor.getRegister(rs1) << shamt;
  processor.setRegister(rd, result);
}

function executeSLT(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const val1 = processor.getRegister(rs1);
  const val2 = processor.getRegister(rs2);
  const result = val1 < val2 ? 1 : 0;
  processor.setRegister(rd, result);
}

function executeSLTU(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const val1 = processor.getRegister(rs1) >>> 0; // Unsigned
  const val2 = processor.getRegister(rs2) >>> 0;
  const result = val1 < val2 ? 1 : 0;
  processor.setRegister(rd, result);
}

function executeXOR(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const result = processor.getRegister(rs1) ^ processor.getRegister(rs2);
  processor.setRegister(rd, result);
}

function executeSRL(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const shamt = processor.getRegister(rs2) & 0x1F;
  const result = processor.getRegister(rs1) >>> shamt; // Logical shift
  processor.setRegister(rd, result);
}

function executeSRA(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const shamt = processor.getRegister(rs2) & 0x1F;
  const result = processor.getRegister(rs1) >> shamt; // Arithmetic shift
  processor.setRegister(rd, result);
}

function executeOR(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const result = processor.getRegister(rs1) | processor.getRegister(rs2);
  processor.setRegister(rd, result);
}

function executeAND(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const rs2 = parseRegister(operands[2]);
  
  const result = processor.getRegister(rs1) & processor.getRegister(rs2);
  processor.setRegister(rd, result);
}

// I-Format: ADDI rd, rs1, imm
function executeADDI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const imm = parseImmediate(operands[2]);
  
  const result = processor.getRegister(rs1) + imm;
  processor.setRegister(rd, result);
}

function executeSLLI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const shamt = parseImmediate(operands[2]) & 0x1F;
  
  const result = processor.getRegister(rs1) << shamt;
  processor.setRegister(rd, result);
}

function executeSLTI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const imm = parseImmediate(operands[2]);
  
  const val = processor.getRegister(rs1);
  const result = val < (imm | 0) ? 1 : 0;
  processor.setRegister(rd, result);
}

function executeSLTIU(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const imm = parseImmediate(operands[2]);
  
  const val = processor.getRegister(rs1) >>> 0;
  const result = val < (imm >>> 0) ? 1 : 0;
  processor.setRegister(rd, result);
}

function executeXORI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const imm = parseImmediate(operands[2]);
  
  const result = processor.getRegister(rs1) ^ imm;
  processor.setRegister(rd, result);
}

function executeSRLI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const shamt = parseImmediate(operands[2]) & 0x1F;
  
  const result = processor.getRegister(rs1) >>> shamt;
  processor.setRegister(rd, result);
}

function executeSRAI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const shamt = parseImmediate(operands[2]) & 0x1F;
  
  const result = processor.getRegister(rs1) >> shamt;
  processor.setRegister(rd, result);
}

function executeORI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const imm = parseImmediate(operands[2]);
  
  const result = processor.getRegister(rs1) | imm;
  processor.setRegister(rd, result);
}

function executeANDI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const imm = parseImmediate(operands[2]);
  
  const result = processor.getRegister(rs1) & imm;
  processor.setRegister(rd, result);
}

// Load Instructions: LB rd, offset(rs1)
function executeLB(operands, processor, memory) {
  const rd = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = memory.readByteSigned(address);
  processor.setRegister(rd, value);
}

function executeLH(operands, processor, memory) {
  const rd = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = memory.readHalfWord(address);
  processor.setRegister(rd, value);
}

function executeLW(operands, processor, memory) {
  const rd = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = memory.readWord(address);
  processor.setRegister(rd, value);
}

function executeLBU(operands, processor, memory) {
  const rd = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = memory.readByte(address);
  processor.setRegister(rd, value);
}

function executeLHU(operands, processor, memory) {
  const rd = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = memory.readHalfWordUnsigned(address);
  processor.setRegister(rd, value);
}

// Store Instructions: SB rs2, offset(rs1)
function executeSB(operands, processor, memory) {
  const rs2 = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = processor.getRegister(rs2);
  memory.writeByte(address, value);
}

function executeSH(operands, processor, memory) {
  const rs2 = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = processor.getRegister(rs2);
  memory.writeHalfWord(address, value);
}

function executeSW(operands, processor, memory) {
  const rs2 = parseRegister(operands[0]);
  const memOp = parseMemoryOperand(operands[1]);
  
  const address = processor.getRegister(memOp.base) + memOp.offset;
  const value = processor.getRegister(rs2);
  memory.writeWord(address, value);
}

// U-Format: LUI rd, imm
function executeLUI(operands, processor) {
  const rd = parseRegister(operands[0]);
  const imm = parseImmediate(operands[1]);
  
  // Load upper 20 bits, lower 12 bits are 0
  const result = imm << 12;
  processor.setRegister(rd, result);
}

function executeAUIPC(operands, processor) {
  const rd = parseRegister(operands[0]);
  const imm = parseImmediate(operands[1]);
  
  // Add upper immediate to PC
  const result = processor.pc + (imm << 12);
  processor.setRegister(rd, result);
}

// Branch Instructions: BEQ rs1, rs2, label
function executeBEQ(operands, processor) {
  const rs1 = parseRegister(operands[0]);
  const rs2 = parseRegister(operands[1]);
  const targetAddress = parseImmediate(operands[2]); // Absolute instruction line number
  
  if (processor.getRegister(rs1) === processor.getRegister(rs2)) {
    return jumpTo(processor, targetAddress);
  }
  // Untaken branches advance in executeInstruction.
}

function executeBNE(operands, processor) {
  const rs1 = parseRegister(operands[0]);
  const rs2 = parseRegister(operands[1]);
  const targetAddress = parseImmediate(operands[2]);
  
  if (processor.getRegister(rs1) !== processor.getRegister(rs2)) {
    return jumpTo(processor, targetAddress);
  }
}

function executeBLT(operands, processor) {
  const rs1 = parseRegister(operands[0]);
  const rs2 = parseRegister(operands[1]);
  const targetAddress = parseImmediate(operands[2]);
  
  // Signed comparison
  const val1 = processor.getRegister(rs1) | 0;
  const val2 = processor.getRegister(rs2) | 0;
  
  if (val1 < val2) {
    return jumpTo(processor, targetAddress);
  }
}

function executeBGE(operands, processor) {
  const rs1 = parseRegister(operands[0]);
  const rs2 = parseRegister(operands[1]);
  const targetAddress = parseImmediate(operands[2]);
  
  // Signed comparison
  const val1 = processor.getRegister(rs1) | 0;
  const val2 = processor.getRegister(rs2) | 0;
  
  if (val1 >= val2) {
    return jumpTo(processor, targetAddress);
  }
}

function executeBLTU(operands, processor) {
  const rs1 = parseRegister(operands[0]);
  const rs2 = parseRegister(operands[1]);
  const targetAddress = parseImmediate(operands[2]);
  
  // Unsigned comparison
  const val1 = processor.getRegister(rs1) >>> 0;
  const val2 = processor.getRegister(rs2) >>> 0;
  
  if (val1 < val2) {
    return jumpTo(processor, targetAddress);
  }
}

function executeBGEU(operands, processor) {
  const rs1 = parseRegister(operands[0]);
  const rs2 = parseRegister(operands[1]);
  const targetAddress = parseImmediate(operands[2]);
  
  // Unsigned comparison
  const val1 = processor.getRegister(rs1) >>> 0;
  const val2 = processor.getRegister(rs2) >>> 0;
  
  if (val1 >= val2) {
    return jumpTo(processor, targetAddress);
  }
}



// Jump Instructions
function executeJAL(operands, processor) {
  const rd = parseRegister(operands[0]);
  const offset = parseImmediate(operands[1]); // Relative instruction offset
  
  const returnAddr = processor.pc + 1;
  jumpTo(processor, processor.pc + offset);
  processor.setRegister(rd, returnAddr);
  return true;
}



function executeJALR(operands, processor) {
  const rd = parseRegister(operands[0]);
  const rs1 = parseRegister(operands[1]);
  const offset = parseImmediate(operands[2]);
  
  // Save return address
  const returnAddr = processor.pc + 1;
  // Jump to (rs1 + offset)
  jumpTo(processor, processor.getRegister(rs1) + offset);
  processor.setRegister(rd, returnAddr);
  return true;
}


function jumpTo(processor, target) {
  if (!Number.isSafeInteger(target) || target < 0) {
    throw new Error(`Invalid jump target: ${target}`);
  }
  processor.pc = target;
  return true;
}

module.exports = {
  executeInstruction
};
