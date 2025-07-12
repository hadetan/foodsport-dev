// Axios config for base URLs, timeout, etc.

const BASE_URLS = {
  url: process.env.NEXT_PUBLIC_BASEURL || '/api'
};

const DEFAULT_TIMEOUT = 15000;

export { BASE_URLS, DEFAULT_TIMEOUT };
