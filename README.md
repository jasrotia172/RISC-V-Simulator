

```
# 🖥️ RISC-V 32-bit Simulator

An interactive web-based RISC-V assembly language simulator with a modern UI, supporting 37 base instructions from the RV32I instruction set. Built with React (frontend) and Node.js/Express (backend).

## ✨ Features

- **Full RV32I Instruction Support**: Implements 37 base RISC-V instructions
- **Interactive Code Editor**: Write and edit RISC-V assembly code with syntax support
- **Real-time Execution**: Execute programs with instant feedback
- **Step-by-Step Debugging**: Execute code one instruction at a time
- **Register Display**: View all 32 registers with hexadecimal values
- **Memory Visualization**: Monitor memory state during execution
- **Example Programs**: Pre-loaded programs demonstrating different instruction types
- **Label Support**: Use labels for branches and jumps
- **Modern Dark Theme**: VS Code-inspired interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository**
   git clone https://github.com/jasrotia172/Risc-V-Simulator.git
   cd riscv-simulator


2. **Install backend dependencies**

   cd server
   npm install


3. **Install frontend dependencies**
   
   cd ../client
   npm install
   

### Running the Simulator

1. **Start the backend server**
   cd server
   node server.js
   
   Server runs on `http://localhost:3000`

2. **Start the frontend** (in a new terminal)

   cd client
   npm start

   Application opens at `http://localhost:5173`

## 📚 Supported Instructions

### R-Type Instructions
- `ADD`, `SUB`, `SLL`, `SLT`, `SLTU`, `XOR`, `SRL`, `SRA`, `OR`, `AND`

### I-Type Instructions
- `ADDI`, `SLLI`, `SLTI`, `SLTIU`, `XORI`, `SRLI`, `SRAI`, `ORI`, `ANDI`

### Load Instructions
- `LB`, `LH`, `LW`, `LBU`, `LHU`

### Store Instructions
- `SB`, `SH`, `SW`

### U-Type Instructions
- `LUI`, `AUIPC`

### Branch Instructions
- `BEQ`, `BNE`, `BLT`, `BGE`, `BLTU`, `BGEU`

### Jump Instructions
- `JAL`, `JALR`

### Control
- `HLT` (Halt execution)

## 💡 Usage Examples

### Basic Arithmetic
ADDI x1, x0, 10    # x1 = 10
ADDI x2, x0, 20    # x2 = 20
ADD x3, x1, x2     # x3 = x1 + x2 = 30
HLT

### Conditional Branch
ADDI x1, x0, 5
ADDI x2, x0, 5
BEQ x1, x2, equal
ADDI x3, x0, 0
HLT
equal:
ADDI x3, x0, 1
HLT

### Function Call with JAL
JAL x1, func
ADDI x2, x0, 999
HLT

func:
ADDI x2, x0, 42
JALR x0, x1, 0

## 🎮 Controls

- **Execute**: Run the entire program at once
- **Step Mode**: Initialize step-by-step execution
- **Next Step**: Execute one instruction (in step mode)
- **Reset**: Clear all registers and memory
- **Load Example**: Select from pre-built example programs

## 🏗️ Project Structure

riscv-simulator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── Editor.jsx
│   │   │   ├── RegisterDisplay.jsx
│   │   │   ├── MemoryDisplay.jsx
│   │   │   └── ControlPanel.jsx
│   │   ├── examples/      # Example programs
│   │   │   └── programs.js
│   │   ├── services/      # API calls
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
│
└── server/                # Node.js/Express backend
    ├── utils/
    │   ├── Processor.js   # CPU simulation
    │   ├── Memory.js      # Memory management
    │   ├── parser.js      # Assembly parser
    │   └── executor.js    # Instruction execution
    ├── routes/
    │   └── simulator.js   # API routes
    ├── server.js          # Main server file
    └── package.json


## 🔧 Architecture

### Frontend (React)
- **Editor**: Monaco-like code editor for assembly input
- **Register Display**: Real-time register value visualization
- **Memory Display**: Memory contents viewer
- **Control Panel**: Execution controls and error display

### Backend (Express)
- **Parser**: Converts assembly code to instruction objects
- **Processor**: Simulates 32 registers and program counter
- **Memory**: 1024-byte memory simulation
- **Executor**: Executes individual instructions
- **Session Management**: Handles step-by-step execution state

## 👨‍💻 Author

Developed by Ansh Jasrotia and Anant Gautam 
NIT Srinagar - B.Tech Information Technology

```
