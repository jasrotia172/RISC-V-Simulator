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


// Execute single step
export const executeStep = async (code) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/step`, { code });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Step execution failed');
  }
};


// Get current state
export const getState = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/state`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get state');
  }
};