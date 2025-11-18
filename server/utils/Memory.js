class Memory {
  constructor(size = 256) {
    this.data = new Array(size).fill(0);
    this.size = size;
  }

  // Read single byte (8 bits)
  readByte(address) {
    if (address < 0 || address >= this.size) {
      throw new Error(`Memory access out of bounds: ${address}`);
    }
    return this.data[address] & 0xFF;
  }

  // Write single byte
  writeByte(address, value) {
    if (address < 0 || address >= this.size) {
      throw new Error(`Memory access out of bounds: ${address}`);
    }
    this.data[address] = value & 0xFF;
  }

  // Read word (32 bits = 4 bytes) - little endian
readWord(address) {
  const byte0 = this.readByte(address);
  const byte1 = this.readByte(address + 1);
  const byte2 = this.readByte(address + 2);
  const byte3 = this.readByte(address + 3);
  
  // Combine bytes in little endian format and convert to signed 32-bit
  const unsigned = (byte3 << 24) | (byte2 << 16) | (byte1 << 8) | byte0;
  return unsigned | 0;
}


  // Write word (32 bits)
  writeWord(address, value) {
    this.writeByte(address, value & 0xFF);
    this.writeByte(address + 1, (value >> 8) & 0xFF);
    this.writeByte(address + 2, (value >> 16) & 0xFF);
    this.writeByte(address + 3, (value >> 24) & 0xFF);
  }

  // Read half word (16 bits = 2 bytes)
  readHalfWord(address) {
    const byte0 = this.readByte(address);
    const byte1 = this.readByte(address + 1);
    
    // Combine bytes and sign extend to 32 bits
    const value = (byte1 << 8) | byte0;
    // Sign extend from 16 to 32 bits
    return value & 0x8000 ? value | 0xFFFF0000 : value;
  }

  // Read half word unsigned
  readHalfWordUnsigned(address) {
    const byte0 = this.readByte(address);
    const byte1 = this.readByte(address + 1);
    return (byte1 << 8) | byte0;
  }

  // Write half word (16 bits)
  writeHalfWord(address, value) {
    this.writeByte(address, value & 0xFF);
    this.writeByte(address + 1, (value >> 8) & 0xFF);
  }

  // Read byte with sign extension
  readByteSigned(address) {
    const value = this.readByte(address);
    // Sign extend from 8 to 32 bits
    return value & 0x80 ? value | 0xFFFFFF00 : value;
  }

  // Get all non-zero memory locations for display
  // Get memory snapshot - show all memory addresses
getMemorySnapshot() {
  const snapshot = [];
  
  // Show all 1024 bytes
  for (let i = 0; i < this.size; i++) {
    const value = this.readByte(i);
    snapshot.push({ 
      address: i,
      value: value,
      hex: '0x' + value.toString(16).padStart(2, '0').toUpperCase()
    });
  }
  
  return snapshot;
}




  reset() {
    this.data = new Array(this.size).fill(0);
  }
}

module.exports = Memory;
