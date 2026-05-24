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
  changePassword: async (passwordData: any) => {
    return fetchWithAuth("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  },
};

export const videoApi = {
  getPublicVideos: async (page: number = 1, q: string = "", category: string = "") => {
    const params = new URLSearchParams({
      page: page.toString(),
      q,
      category,
    });
    return fetchWithAuth(`/videos/public?${params.toString()}`, {
      method: "GET",
    });
  },
  getAll: async (search?: string) => {
    const endpoint = search ? `/videos?q=${encodeURIComponent(search)}` : "/videos";
    return fetchWithAuth(endpoint, {
      method: "GET",
    });
  },
  getById: async (id: string) => {
    return fetchWithAuth(`/videos/${id}`, {
      method: "GET",
    });
  },
  create: async (videoData: { title: string; description: string; youtubeLink: string; category: string; status: "publish" | "draft" }) => {
    return fetchWithAuth("/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    });
  },
  edit: async (id: string, videoData: { title?: string; description?: string; youtubeLink?: string; category?: string; status?: "publish" | "draft" }) => {
    return fetchWithAuth(`/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(videoData),
    });
  },
  delete: async (id: string) => {
    return fetchWithAuth(`/videos/${id}`, {
      method: "DELETE",
    });
  },
};

