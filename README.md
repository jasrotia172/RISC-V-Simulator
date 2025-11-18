
# 🖥️ RISC-V 32-bit Simulator

An interactive web-based RISC-V assembly language simulator that supports real-time execution, step-by-step debugging, and visual feedback for register and memory states.

## 📋 Features

- **Interactive Code Editor**: Write and edit RISC-V assembly code with syntax highlighting
- **Real-time Execution**: Execute all instructions at once or step through them one-by-one
- **Visual Feedback**: Registers and memory locations highlight in green when modified
- **Comprehensive Instruction Support**: Implements R, I, S, U, B, and J format instructions
- **Memory Display**: View all 256 bytes of memory with address-value pairs in a multi-column layout
- **Program Counter Tracking**: Monitor PC changes during execution
- **Error Handling**: Clear error messages for invalid instructions or syntax errors

## 🚀 Supported Instructions

### R-Format (Register-Register)
`ADD`, `SUB`, `SLL`, `SLT`, `SLTU`, `XOR`, `SRL`, `SRA`, `OR`, `AND`

### I-Format (Immediate)
`ADDI`, `SLLI`, `SLTI`, `SLTIU`, `XORI`, `SRLI`, `SRAI`, `ORI`, `ANDI`

### Load Instructions
`LB`, `LH`, `LW`, `LBU`, `LHU`

### Store Instructions
`SB`, `SH`, `SW`

### U-Format (Upper Immediate)
`LUI`, `AUIPC`

### Branch Instructions
`BEQ`, `BNE`, `BLT`, `BGE`, `BLTU`, `BGEU`

### Jump Instructions
`JAL`, `JALR`

### Control
`HLT` (Halt execution)

## 🛠️ Tech Stack

### Frontend
- React.js
- CSS3 with custom styling
- Axios for API calls

### Backend
- Node.js
- Express.js
- CORS enabled

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup

1. **Clone the repository**
```
git clone https://github.com/jasrotia172/RISC-V-Simulator.git
cd RISC-V-Simulator
```

2. **Install Backend Dependencies**
```
cd server
npm install
```

3. **Install Frontend Dependencies**
```
cd ../client
npm install
```

## ▶️ Running the Application

### Start Backend Server
```
cd server
npm start
```
Server will run on `http://localhost:3000`

### Start Frontend
```
cd client
npm start
```
Frontend will run on `http://localhost:3001` (or next available port)

## 🎯 Usage

### Writing Code
Enter RISC-V assembly instructions in the editor. Example:
```
# Simple addition program
ADDI x1, x0, 5
ADDI x2, x0, 10
ADD x3, x1, x2
HLT
```

### Labels and Jumps
```
# Jump example
JAL x1, target
ADDI x2, x0, 999
target:
ADDI x2, x0, 1
HLT


### Branch Instructions

# Conditional branch
ADDI x1, x0, 5
ADDI x2, x0, 5
BEQ x1, x2, skip
ADDI x3, x0, 999
skip:
ADDI x10, x0, 1
HLT


### Control Panel
- **Execute**: Run all instructions until HLT or end of program
- **Step**: Execute one instruction at a time
- **Reset**: Clear all registers, memory, and reset PC to 0

## 📊 Visual Feedback

- **Green highlighting**: Indicates registers or memory locations that have been modified
- **Program Counter (PC)**: Displays current instruction being executed
- **Memory Display**: Shows all 256 bytes in a 4-column layout with address-value pairs

## 🏗️ Project Structure

RISC-V SIMULATOR/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Editor.jsx
│   │   │   ├── RegisterDisplay.jsx
│   │   │   ├── MemoryDisplay.jsx
│   │   │   └── ControlPanel.jsx
│   │   ├── services/      # API service
│   │   └── App.jsx
│   └── package.json
│
├── server/                # Node.js backend
│   ├── utils/
│   │   ├── Processor.js   # CPU simulation
│   │   ├── Memory.js      # Memory management
│   │   ├── parser.js      # Instruction parser
│   │   └── executor.js    # Instruction execution
│   ├── server.js          # Express server
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

- `GET /api/health` - Server health check
- `POST /api/execute` - Execute all instructions
- `POST /api/step` - Execute one instruction
- `POST /api/reset` - Reset simulator state
- `GET /api/state` - Get current simulator state

## 🎓 Educational Use

This simulator is designed for students learning computer architecture and RISC-V assembly language. It provides:
- Visual understanding of instruction execution
- Step-by-step debugging capabilities
- Real-time register and memory updates
- Support for labels and control flow

## 🐛 Known Limitations

- Memory size: 256 bytes (addresses 0-255)
- 32 general-purpose registers (x0-x31)
- Single-threaded execution
- No pipeline simulation
- No cache simulation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Ansh Jasrotia**
**Anant Gautam**

## 🙏 Acknowledgments

- RISC-V Foundation for the ISA specification
- React and Node.js communities

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for Computer Architecture Education**
