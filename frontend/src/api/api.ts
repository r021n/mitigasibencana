const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


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
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_info");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-unauthorized"));
      }
    }
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
  getProfile: async () => {
    return fetchWithAuth("/auth/me", {
      method: "GET",
    });
  },
};

export const videoApi = {
  getPublicVideos: async (page: number = 1, q: string = "", category: string = "", limit: number = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      q,
      category,
      limit: limit.toString(),
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
  getPublicById: async (id: string) => {
    return fetchWithAuth(`/videos/public/${id}`, {
      method: "GET",
    });
  },
  create: async (videoData: { title: string; description: string; youtubeLink: string; category: string; status: "publish" | "draft"; seriesOrder?: number }) => {
    return fetchWithAuth("/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    });
  },
  edit: async (id: string, videoData: { title?: string; description?: string; youtubeLink?: string; category?: string; status?: "publish" | "draft"; seriesOrder?: number }) => {
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

export const commentApi = {
  getByVideoId: async (videoId: string) => {
    return fetchWithAuth(`/comments/${videoId}`, {
      method: "GET",
    });
  },
  createComment: async (data: { videoId: string; content: string; guestName?: string }) => {
    return fetchWithAuth("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  createReply: async (data: { commentId: string; content: string; guestName?: string }) => {
    return fetchWithAuth("/comments/reply", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const youtubeAnalysisApi = {
  getAll: async () => {
    return fetchWithAuth("/analysis", {
      method: "GET",
    });
  },
  create: async (youtubeLink: string) => {
    return fetchWithAuth("/analysis", {
      method: "POST",
      body: JSON.stringify({ youtubeLink }),
    });
  },
  startAnalysis: async (id: string) => {
    return fetchWithAuth(`/analysis/${id}/analyze`, {
      method: "POST",
    });
  },
  delete: async (id: string) => {
    return fetchWithAuth(`/analysis/${id}`, {
      method: "DELETE",
    });
  },
  getChats: async (id: string) => {
    return fetchWithAuth(`/analysis/${id}/chats`, {
      method: "GET",
    });
  },
  sendChatMessage: async (id: string, content: string) => {
    return fetchWithAuth(`/analysis/${id}/chat`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};

export const materialApi = {
  getAll: async () => {
    return fetchWithAuth("/materials", {
      method: "GET",
    });
  },
  getById: async (id: string) => {
    return fetchWithAuth(`/materials/${id}`, {
      method: "GET",
    });
  },
  create: async (data: { title: string; content: string; audioUrl?: string | null; status: "publish" | "draft" }) => {
    return fetchWithAuth("/materials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  edit: async (id: string, data: { title?: string; content?: string; audioUrl?: string | null; status?: "publish" | "draft" }) => {
    return fetchWithAuth(`/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return fetchWithAuth(`/materials/${id}`, {
      method: "DELETE",
    });
  },
};

export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to upload file");
    }

    // Convert relative URL to absolute API URL if needed, or just return as is
    return `${API_BASE_URL}${data.url}`;
  }
};

export const interactiveQuestionApi = {
  getPublicQuestions: async (videoId: string) => {
    return fetchWithAuth(`/videos/public/${videoId}/questions`, {
      method: "GET",
    });
  },
  getQuestions: async (videoId: string) => {
    return fetchWithAuth(`/videos/${videoId}/questions`, {
      method: "GET",
    });
  },
  createQuestion: async (videoId: string, questionData: { timestamp: number; question: string; options: string[]; correctAnswer: string; explanation?: string }) => {
    return fetchWithAuth(`/videos/${videoId}/questions`, {
      method: "POST",
      body: JSON.stringify(questionData),
    });
  },
  editQuestion: async (videoId: string, questionId: string, questionData: { timestamp?: number; question?: string; options?: string[]; correctAnswer?: string; explanation?: string }) => {
    return fetchWithAuth(`/videos/${videoId}/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(questionData),
    });
  },
  deleteQuestion: async (videoId: string, questionId: string) => {
    return fetchWithAuth(`/videos/${videoId}/questions/${questionId}`, {
      method: "DELETE",
    });
  },
};


