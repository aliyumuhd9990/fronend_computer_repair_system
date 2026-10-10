import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://backend-computer-repair-system.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("fixdesk_access");
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshPromise = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/login/") &&
      !original.url?.includes("/auth/refresh/")
    ) {
      const refresh = localStorage.getItem("fixdesk_refresh");
      if (refresh) {
        original._retry = true;
        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(
                `${import.meta.env.VITE_API_BASE_URL || "https://backend-computer-repair-system.onrender.com/api"}/auth/refresh/`,
                { refresh },
              )
              .finally(() => {
                refreshPromise = null;
              });
          }
          const response = await refreshPromise;
          localStorage.setItem("fixdesk_access", response.data.access);
          if (response.data.refresh)
            localStorage.setItem("fixdesk_refresh", response.data.refresh);
          original.headers.Authorization = `Bearer ${response.data.access}`;
          return api(original);
        } catch (refreshError) {
          localStorage.removeItem("fixdesk_access");
          localStorage.removeItem("fixdesk_refresh");
          window.dispatchEvent(new Event("fixdesk:session-expired"));
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
