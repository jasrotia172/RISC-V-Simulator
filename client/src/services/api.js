import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

async function request(method, path, data) {
  try {
    const response = await api.request({ method, url: path, data });
    return response.data;
  } catch (cause) {
    const body = cause.response?.data;
    const error = new Error(body?.error || 'Cannot reach the simulator. Check that the backend is running.');
    error.state = body?.state;
    error.programLoaded = body?.programLoaded;
    throw error;
  }
}

export const executeCode = code => request('post', '/execute', { code });
export const resetSimulator = () => request('post', '/reset');
// An empty editor must be validated, rather than silently resuming an old program.
export const stepSimulator = code => request('post', '/step', code === undefined ? {} : { code });
export const getState = () => request('get', '/state');
