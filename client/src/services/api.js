import axios from 'axios';

const API_BASE_URL = '/api';

// Execute all instructions
export const executeCode = async (code) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/execute`, { code });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Execution failed');
  }
};

// Reset the simulator
export const resetSimulator = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reset`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Reset failed');
  }
};

// Execute a single step (send code only on the first step after code change or reset)
export const stepSimulator = async (code) => {
  try {
    let response;
    if (code && code.trim() !== '') {
      response = await axios.post('/api/step', { code }); // Send code as object
    } else {
      response = await axios.post('/api/step', {}); // Send empty object, not undefined
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Step execution failed');
  }
};


// Get the current state (registers, memory, PC, halted)
export const getState = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/state`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get state');
  }
};
