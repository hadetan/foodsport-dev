import axios from 'axios';
import { DEFAULT_TIMEOUT } from './config';

const serverApi = axios.create({
  baseURL: process.env.SERVER_BASEURL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default serverApi;
