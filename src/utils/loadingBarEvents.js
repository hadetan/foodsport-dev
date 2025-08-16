let activeRequests = 0;
let loadingBar = null;

export function setLoadingBarInstance(instance) {
  loadingBar = instance;
}

export function setupGlobalLoadingBarForAxios(axiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
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
