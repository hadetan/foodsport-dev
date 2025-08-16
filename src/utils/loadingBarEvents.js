
let activeRequests = 0;
let loadingBar = null;
let pendingStarts = 0;


export function setLoadingBarInstance(instance) {
  loadingBar = instance;
  if (loadingBar && pendingStarts > 0) {
    for (let i = 0; i < pendingStarts; i++) {
      if (activeRequests === 0) loadingBar.continuousStart();
      activeRequests++;
    }
    pendingStarts = 0;
  }
}

export function setupGlobalLoadingBarForAxios(axiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      if (loadingBar) {
        if (activeRequests === 0) loadingBar.continuousStart();
        activeRequests++;
      } else {
        pendingStarts++;
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
