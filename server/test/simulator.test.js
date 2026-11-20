const { test } = require('node:test');
const assert = require('node:assert/strict');
const Simulator = require('../utils/Simulator');
const Memory = require('../utils/Memory');
const { parseInstructions, parseRegister, parseImmediate } = require('../utils/parser');

function run(code) {
  const simulator = new Simulator();
  simulator.load(code);
  simulator.run();
  return simulator;
}

test('labels support inline instructions, comments, aliases, and object property names', () => {
  const sim = run('JAL x0, constructor\nADDI x1,x0,99\nconstructor: alias: # comment\n__proto__: ADDI x1,x0,7 // comment\nHALT');
  assert.equal(sim.processor.getRegister(1), 7);
  assert.equal(sim.processor.pc, 3);
});

for (const code of [
  'ADDI x1junk,x0,1', 'ADDI x32,x0,1', 'ADDI x1,x0,nope', 'ADDI x1,x0,12abc',
  'ADDI x1,x0,0b102', 'ADDI x1,x0,0xzz', 'ADDI x1,x0', 'ADDI x1,x0,1,2',
  'ADDI x1,,x0,1', 'ADDI x1,x0,1,', 'HLT x1', 'BOGUS x1', 'LW x1,4(x2)junk',
  'JAL x1,missing', 'BEQ x0,x0,toString', 'again: HLT\nagain: HLT', '1bad: HLT',
  'ADDI x1,x0,4294967296', 'ADDI x1,x0,-2147483649',
]) {
  test(`rejects malformed source: ${code}`, () => assert.throws(() => parseInstructions(code), /line \d+/i));
}

test('numeric parsing accepts only whole valid tokens', () => {
  assert.equal(parseRegister('X31'), 31);
  assert.equal(parseRegister('0'), 0);
  for (const [input, expected] of [['-0x10', -16], ['+0B11', 3], ['42', 42], ['0xffffffff', 4294967295]]) {
    assert.equal(parseImmediate(input), expected);
  }
  for (const input of [undefined, null, NaN, '', '1.2', '1e2']) assert.throws(() => parseImmediate(input));
});

test('invalid replacement leaves the current program and machine intact', () => {
  const sim = run('ADDI x1,x0,7');
  const before = sim.getState();
  assert.throws(() => sim.load('ADDI x1,x0,2\nBOGUS'), /line 2/i);
  assert.deepEqual(sim.getState(), before);
  assert.throws(() => sim.load('# only comments'), /No instructions/);
  assert.deepEqual(sim.getState(), before);
});

const registerCases = [
  ['ADD', 2147483647, 1, -2147483648], ['SUB', -2147483648, 1, 2147483647],
  ['SLL', 1, 33, 2], ['SLT', -1, 1, 1], ['SLTU', -1, 1, 0],
  ['XOR', 0x55, 0x0f, 0x5a], ['SRL', -1, 1, 2147483647], ['SRA', -4, 1, -2],
  ['OR', 0x50, 0x0f, 0x5f], ['AND', 0x55, 0x0f, 5],
];
for (const [opcode, a, b, expected] of registerCases) {
  test(`${opcode} arithmetic and bit semantics`, () => {
    const sim = run(`ADDI x1,x0,${a}\nADDI x2,x0,${b}\n${opcode} x3,x1,x2`);
    assert.equal(sim.processor.getRegister(3), expected);
    assert.equal(sim.processor.pc, 3);
    assert.equal(sim.completed, true);
  });
}

for (const [opcode, a, imm, expected] of [
  ['ADDI', 2147483647, 1, -2147483648], ['SLLI', 1, 31, -2147483648],
  ['SLTI', -1, 0, 1], ['SLTI', 0, 0xffffffff, 0], ['SLTIU', 1, -1, 1], ['XORI', 0x55, 0x0f, 0x5a],
  ['SRLI', -1, 1, 2147483647], ['SRAI', -4, 1, -2], ['ORI', 0x50, 15, 0x5f], ['ANDI', 0x55, 15, 5],
]) {
  test(`${opcode} immediate semantics`, () => {
    assert.equal(run(`ADDI x1,x0,${a}\n${opcode} x2,x1,${imm}`).processor.getRegister(2), expected);
  });
}

test('x0 stays zero, and upper immediates use the instruction-index PC', () => {
  const sim = run('ADDI x0,x0,99\nLUI x1,0x12345\nAUIPC x2,1');
  assert.equal(sim.processor.getRegister(0), 0);
  assert.equal(sim.processor.getRegister(1), 0x12345000);
  assert.equal(sim.processor.getRegister(2), 4098);
});

for (const [opcode, a, b, taken] of [
  ['BEQ', 1, 1, true], ['BEQ', 1, 2, false], ['BNE', 1, 2, true], ['BNE', 1, 1, false],
  ['BLT', -1, 1, true], ['BLT', 1, -1, false], ['BGE', 1, 1, true], ['BGE', -1, 1, false],
  ['BLTU', 1, -1, true], ['BLTU', -1, 1, false], ['BGEU', -1, 1, true], ['BGEU', 1, -1, false],
]) {
  test(`${opcode} ${taken ? 'taken' : 'untaken'}`, () => {
    const sim = run(`ADDI x1,x0,${a}\nADDI x2,x0,${b}\n${opcode} x1,x2,done\nADDI x3,x0,99\ndone: HLT`);
    assert.equal(sim.processor.getRegister(3), taken ? 0 : 99);
  });
}

test('backward branch loops terminate with correct state', () => {
  const sim = run('ADDI x2,x0,5\nloop: ADDI x1,x1,1\nBLT x1,x2,loop\nHLT');
  assert.equal(sim.processor.getRegister(1), 5);
  assert.equal(sim.executionCount, 12);
});

test('JAL resolves a label relative to a nonzero PC and JALR returns', () => {
  const sim = run('ADDI x3,x0,1\nJAL x1,subroutine\nADDI x3,x3,1\nHLT\nsubroutine: ADDI x3,x3,10\nJALR x0,x1,0');
  assert.equal(sim.processor.getRegister(1), 2);
  assert.equal(sim.processor.getRegister(3), 12);
});

test('numeric JAL supports forward and backward relative offsets', () => {
  const sim = run('JAL x0,2\nHLT\nJAL x1,-1');
  assert.equal(sim.processor.pc, 1);
  assert.equal(sim.processor.getRegister(1), 3);
});

test('JALR reads its old source before writing the same destination', () => {
  const sim = run('ADDI x1,x0,3\nJALR x1,x1,0\nADDI x2,x0,99\nHLT');
  assert.equal(sim.processor.getRegister(1), 2);
  assert.equal(sim.processor.getRegister(2), 0);
});

for (const source of ['loop: BEQ x0,x0,loop', 'loop: JAL x0,loop', 'JALR x0,x0,0']) {
  test(`self-loop stays at its target and hits the execution limit: ${source}`, () => {
    const sim = new Simulator();
    sim.load(source);
    sim.step();
    assert.equal(sim.processor.pc, 0);
    assert.throws(() => sim.run(10), /Execution limit/);
    assert.equal(sim.processor.pc, 0);
  });
}

for (const source of ['JAL x1,-1', 'JALR x1,x0,-1', 'BEQ x0,x0,-1']) {
  test(`invalid jump does not corrupt the PC or link register: ${source}`, () => {
    const sim = new Simulator(); sim.load(source);
    assert.throws(() => sim.step(), /Invalid jump target/);
    assert.equal(sim.processor.pc, 0);
    assert.equal(sim.processor.getRegister(1), 0);
  });
}

test('loads and stores are little endian, with correct sign extension', () => {
  const sim = run(`ADDI x1,x0,-128
SB x1,0x10(x0)
LB x2,0x10(x0)
LBU x3,0x10(x0)
ADDI x1,x0,-32768
SH x1,18(x0)
LH x4,18(x0)
LHU x5,18(x0)
LUI x1,0x87654
ORI x1,x1,0x321
SW x1, 20 ( x0 )
LW x6,20(x0)`);
  assert.deepEqual(sim.processor.registers.slice(2,7), [-128,128,-32768,32768,-2023406815]);
  assert.deepEqual(sim.memory.data.slice(20,24), [0x21,0x43,0x65,0x87]);
});

test('out-of-bounds multibyte stores are atomic and invalid addresses fail', () => {
  const memory = new Memory(256);
  memory.writeWord(252, 0x12345678);
  const before = [...memory.data];
  assert.throws(() => memory.writeWord(254, -1), /out of bounds/);
  assert.throws(() => memory.writeHalfWord(255, -1), /out of bounds/);
  assert.deepEqual(memory.data, before);
  for (const address of [-1, 256, 0.5, NaN, Infinity, '1']) {
    assert.throws(() => memory.readByte(address), /out of bounds/);
    assert.throws(() => memory.writeByte(address, 1), /out of bounds/);
  }
});

test('runtime errors include source line and preserve the failing instruction', () => {
  const sim = new Simulator(); sim.load('# comment\nADDI x1,x0,42\nSW x1,254');
  sim.step();
  assert.throws(() => sim.step(), /Line 3:.*out of bounds/);
  assert.equal(sim.processor.pc, 1);
  assert.equal(sim.memory.data[254], 0);
});

test('all bundled examples agree between Execute and Step', async () => {
  const { examplePrograms } = await import('../../client/src/examples/programs.js');
  const expected = { ADD: [3,15], SUB: [3,13], ADDI: [2,50], ANDI: [2,7], LW: [3,42], SW: [2,99], BEQ: [3,1], JAL: [2,1], LUI: [1,0x12345000], Loop: [1,5] };
  for (const [name, code] of Object.entries(examplePrograms)) {
    const full = run(code);
    const stepped = new Simulator(); stepped.load(code);
    let count = 0;
    while (!stepped.completed && count++ < 100) stepped.step();
    assert.deepEqual(stepped.getState(), full.getState(), name);
    const [register, value] = expected[name];
    assert.equal(full.processor.getRegister(register), value, name);
    assert.equal(full.memory.size, 256);
  }
});

test('loading a new program resets all state; HLT and end of source stop stepping', () => {
  const sim = run('ADDI x1,x0,1\nSB x1,0\nHLT');
  sim.load('ADDI x2,x0,2'); sim.run();
  assert.equal(sim.processor.getRegister(1), 0);
  assert.equal(sim.memory.readByte(0), 0);
  const before = sim.getState(); sim.step(); assert.deepEqual(sim.getState(), before);
  sim.load('HLT\nADDI x1,x0,99'); sim.run(); sim.step();
  assert.equal(sim.processor.getRegister(1), 0);
  assert.equal(sim.processor.pc, 0);
});
