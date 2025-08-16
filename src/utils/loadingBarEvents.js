let activeRequests = 0;
let loadingBar = null;

export function setLoadingBarInstance(instance) {
  loadingBar = instance;
}

export function setupGlobalLoadingBarForAxios(axiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined' && !window.loadingBarReady) {
        let waited = 0;
        const wait = (resolve) => {
          if (window.loadingBarReady || waited > 200) return resolve();
          setTimeout(() => { waited += 20; wait(resolve); }, 20);
        };
        return new Promise((resolve) => wait(() => {
            if (loadingBar) {
              if (activeRequests === 0) loadingBar.continuousStart();
              activeRequests++;
            }
          resolve(config);
        }));
      }
      if (loadingBar) {
        if (activeRequests === 0) loadingBar.continuousStart();
        activeRequests++;
      }
      return config;
    },
    (error) => {
      if (loadingBar) {
        activeRequests = Math.max(activeRequests - 1, 0);
        if (activeRequests === 0) loadingBar.complete();
      }
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      if (loadingBar) {
        activeRequests = Math.max(activeRequests - 1, 0);
        if (activeRequests === 0) loadingBar.complete();
      }
      return response;
    },
    (error) => {
      if (loadingBar) {
        activeRequests = Math.max(activeRequests - 1, 0);
        if (activeRequests === 0) loadingBar.complete();
      }
      return Promise.reject(error);
    }
  );
}
