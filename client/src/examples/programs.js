export const examplePrograms = {
  "ADD": `# R-Type: ADD
ADDI x1, x0, 10
ADDI x2, x0, 5
ADD x3, x1, x2
HLT`,

  "SUB": `# R-Type: SUB
ADDI x1, x0, 20
ADDI x2, x0, 7
SUB x3, x1, x2
HLT`,

  "ADDI": `# I-Type: ADDI
ADDI x1, x0, 42
ADDI x2, x1, 8
HLT`,

  "ANDI": `# I-Type: ANDI
ADDI x1, x0, 15
ANDI x2, x1, 7
HLT`,

  "LW": `# Load: LW
ADDI x1, x0, 100
ADDI x2, x0, 42
SW x2, 0(x1)
LW x3, 0(x1)
HLT`,

  "SW": `# Store: SW
ADDI x1, x0, 200
ADDI x2, x0, 99
SW x2, 0(x1)
HLT`,

  "BEQ": `# Branch: BEQ
ADDI x1, x0, 5
ADDI x2, x0, 5
BEQ x1, x2, skip
ADDI x3, x0, 999
skip:
ADDI x3, x0, 1
HLT`,

  "JAL": `# Jump: JAL
JAL x1, target
ADDI x2, x0, 999
target:
ADDI x2, x0, 1
HLT`,

  "LUI": `# U-Type: LUI
LUI x1, 0x12345
HLT`,

  "Loop": `# Simple Loop
ADDI x1, x0, 0
ADDI x2, x0, 5
loop:
ADDI x1, x1, 1
BLT x1, x2, loop
HLT`,

};
