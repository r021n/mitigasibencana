const API_BASE_URL = "http://localhost:3000";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "An error occurred");
  }

  return data;
}

export const authApi = {
  login: async (credentials: any) => {
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
  register: async (userData: any) => {
    return fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },
};
