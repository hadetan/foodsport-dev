import axios from 'axios';
import { BASE_URLS, DEFAULT_TIMEOUT } from './config';

const serverApi = axios.create({
  baseURL: BASE_URLS.url,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default serverApi;
