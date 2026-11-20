# RISC-V 32-bit Simulator

A React and Express teaching simulator for writing assembly, executing programs, and inspecting 32 registers and 256 bytes of memory.

## Setup

Use Node.js 22.12 or newer and npm. Install dependencies in both directories:

```sh
npm ci --prefix server
npm ci --prefix client
```

Start the backend and frontend in separate terminals:

```sh
npm start --prefix server
```

```sh
npm run dev --prefix client
```

Open **http://localhost:5173**. The frontend proxies `/api` to the backend at **http://localhost:3000**. If that frontend port is occupied, use the URL printed by Vite. The backend accepts a `PORT` environment variable; if you change it, update the proxy targets in `client/vite.config.js` too.

To check a production build locally, keep the backend running and run:

```sh
npm run build --prefix client
npm run preview --prefix client
```

For deployment, serve `client/dist` and forward `/api` to the Express server. This application currently has **one shared simulator per backend process**: browser tabs and users share registers, memory, and the loaded program. It is intended for local, single-user learning.

## Using the simulator

- **Execute** validates the entire source, starts with cleared registers and memory, and runs until `HLT`, the end of the program, or the 10,000-instruction limit.
- **Step** starts a fresh program after source edits or Reset. Later clicks execute one instruction each. After Execute, it uses the same loaded program and state.
- **Reset** clears machine state and unloads the program while preserving the editor text.
- Editing the source or selecting an example makes the next Step load that source. The last machine state remains visible until an action runs.
- Controls and the editor are disabled while a request is pending. Step is disabled when the current program finishes; Execute restarts it.
- Green cells indicate **nonzero values**, not changes since the previous step.
- Syntax errors include source line numbers and leave the previous machine state intact. Runtime errors show the state reached before the failing instruction. A failing out-of-bounds store does not partially write memory.

The editor is a plain-text assembly editor with an example selector; it does not provide syntax highlighting.

## Supported instructions

| Group | Instructions |
| --- | --- |
| Register arithmetic / logic | `ADD SUB SLL SLT SLTU XOR SRL SRA OR AND` |
| Immediate arithmetic / logic | `ADDI SLLI SLTI SLTIU XORI SRLI SRAI ORI ANDI` |
| Loads | `LB LH LW LBU LHU` |
| Stores | `SB SH SW` |
| Upper immediate | `LUI AUIPC` |
| Branches | `BEQ BNE BLT BGE BLTU BGEU` |
| Jumps | `JAL JALR` |
| Simulator control | `HLT` |

Compatibility aliases: `HALT`, `LHW`, `LHWU`, and `SHW`.

Opcodes and `x` register prefixes are case-insensitive. Registers are `x0`–`x31` (bare numbers `0`–`31` also work); `x0` always reads zero. ABI aliases such as `ra` and `sp` are not supported. Instructions must provide the exact number of operands. Decimal, hexadecimal (`0x`), and binary (`0b`) immediates accept optional `+` or `-` signs. Memory operands use `offset(base)`, such as `4(x2)` or `0x10(x0)`; a bare address uses `x0` as its base.

Use `#` or `//` for comments. Labels are case-sensitive, may share a line with an instruction, and must be unique. They begin with a letter, `_`, `.`, or `$`, followed by letters, digits, `_`, `.`, or `$`.

```asm
ADDI x1, x0, 0
ADDI x2, x0, 5
loop: ADDI x1, x1, 1
BLT x1, x2, loop
SW x1, 0(x0)
HLT
```

## Execution conventions and limits

This project models a subset of RISC-V operations with an **instruction-index PC**. It is not a binary-compatible RV32I emulator. Its conventions preserve the project's existing assembly model:

- PC begins at `0` and advances by `1` per instruction. Blank lines, labels, and comments do not consume a PC position.
- Branch labels resolve to absolute instruction indices. A numeric branch operand is also an absolute index: `BEQ x0, x0, 3` jumps to the fourth instruction.
- `JAL rd, label` jumps to that label. A numeric operand is a relative instruction offset: `JAL x1, 2` skips one instruction. The link register receives `PC + 1`.
- `JALR rd, rs1, offset` jumps to `rs1 + offset` in instruction indices and saves `PC + 1`. It does not clear the target's low bit. The source is read before the link register is written, including when `rd` equals `rs1`.
- `AUIPC` adds the current instruction index to the immediate shifted left by 12. `LUI` only shifts the immediate.
- Negative jump targets fail. Reaching or jumping beyond the final instruction completes execution. A jump to itself stays on that instruction; Execute eventually reports its loop limit.
- Registers contain signed 32-bit values; arithmetic wraps to 32 bits. Unsigned comparisons reinterpret the same bits as unsigned. Shift amounts use their low five bits.
- Immediates accept signed or unsigned 32-bit values (`-2147483648` through `4294967295`). Instruction encoding limits such as 12-bit immediates are not enforced.
- Data memory contains 256 bytes at addresses `0`–`255`, uses little-endian ordering, and permits unaligned accesses when the entire access fits. Instruction storage is separate from data memory.
- `HLT` is a simulator command. No machine-code decoding, assembler directives, system calls, pipeline, cache, or additional ISA extensions are implemented.

For comparison, hardware RISC-V uses byte addresses, `PC + 4` for these instruction links, and instruction-specific immediate encodings. See the [official RV32I specification](https://docs.riscv.org/reference/isa/unpriv/rv32.html).

## API

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/state` | Current machine state |
| POST | `/api/execute` | Validate and run a fresh program: `{ "code": "..." }` |
| POST | `/api/step` | Load and step with `{ "code": "..." }`, or continue with `{}` |
| POST | `/api/reset` | Reset and unload the program |

Successful machine responses include `success`, `registers`, `memory`, `pc`, `halted`, `completed`, and `executionCount`. `halted` means an explicit halt; `completed` also includes reaching the end of source. Memory is an array of `{ address, value, hex }` byte entries. Invalid programs and runtime errors return HTTP 400 with `error`, `state`, and `programLoaded`. Malformed JSON and oversized request bodies return JSON errors with HTTP 400 and 413 respectively.

## Verification

```sh
npm test --prefix server
npm run lint --prefix client
npm run build --prefix client
```

The Node test suite covers parsing, instruction behavior, control flow, memory bounds, execution limits, API requests, and agreement between Execute and Step for every bundled example. API tests start a temporary localhost listener.

## Structure

```text
client/
  src/components/      Editor, controls, registers, and memory
  src/examples/        Bundled assembly programs
  src/services/api.js  API client
  src/App.jsx          UI state and actions
server/
  server.js            Express app and API routes
  utils/Simulator.js   Shared loading, stepping, and execution lifecycle
  utils/Processor.js   Registers and PC
  utils/Memory.js      Byte-addressed memory
  utils/parser.js      Source validation and label resolution
  utils/executor.js    Instruction operations and PC advancement
  test/                Regression and API tests
```

Generated dependencies and build outputs are ignored by the root `.gitignore`. The original repository already tracks files under `server/node_modules`; ignoring the directory does not untrack those existing files.

## Authors

Ansh Jasrotia and Anant Gautam.
