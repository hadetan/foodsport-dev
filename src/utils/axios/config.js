/**
 * Axios Config
 *
 * BASE_URLS: Set base URLs for different app states (landing, admin, my)
 * DEFAULT_TIMEOUT: Default request timeout in ms
 */ 

const BASE_URLS = {
  url: process.env.NEXT_PUBLIC_BASEURL || '/api'
};

const DEFAULT_TIMEOUT = 15000;

export { BASE_URLS, DEFAULT_TIMEOUT };
