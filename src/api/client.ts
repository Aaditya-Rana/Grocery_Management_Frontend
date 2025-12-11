import axios, { AxiosError } from 'axios';
import type { User, GroceryList, ListItem, ShareData, ShareResponse } from '../types';

// Use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    register: async (userData: { email: string; password: string; name: string }) => {
      const { data } = await apiClient.post<User>('/auth/register', userData);
      return data;
    },
    login: async (credentials: { email: string; password: string }) => {
      const { data } = await apiClient.post<{ access_token: string }>('/auth/login', credentials);
      localStorage.setItem('accessToken', data.access_token);
      return data.access_token;
    },
    getProfile: async () => {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    },
    logout: () => {
      localStorage.removeItem('accessToken');
    },
  },

  lists: {
    // Get all lists for authenticated user
    getAll: async () => {
      const { data } = await apiClient.get<GroceryList[]>('/lists');
      return data;
    },

    // Create a new list
    create: async (name: string) => {
      const { data } = await apiClient.post<GroceryList>('/lists', { name });
      return data;
    },

    // Get a specific list by ID
    getById: async (listId: string) => {
      const { data } = await apiClient.get<GroceryList>(`/lists/${listId}`);
      return data;
    },

    // Update list (name and/or status)
    update: async (
      listId: string,
      updates: { name?: string; status?: 'draft' | 'shared' | 'completed' }
    ) => {
      const { data } = await apiClient.patch<GroceryList>(`/lists/${listId}`, updates);
      return data;
    },

    // Delete a list
    delete: async (listId: string) => {
      const { data } = await apiClient.delete<{ message: string }>(`/lists/${listId}`);
      return data;
    },

    // Duplicate a list
    duplicate: async (listId: string) => {
      const { data } = await apiClient.post<GroceryList>(`/lists/${listId}/duplicate`);
      return data;
    },
  },

  items: {
    // Get all items in a list
    getAll: async (listId: string) => {
      const { data } = await apiClient.get<ListItem[]>(`/lists/${listId}/items`);
      return data;
    },

    // Add item to list
    add: async (
      listId: string,
      itemData: { name: string; quantity?: number; unit?: string; notes?: string }
    ) => {
      const { data } = await apiClient.post<ListItem>(`/lists/${listId}/items`, itemData);
      return data;
    },

    // Get a specific item
    getById: async (listId: string, itemId: string) => {
      const { data } = await apiClient.get<ListItem>(`/lists/${listId}/items/${itemId}`);
      return data;
    },

    // Update item
    update: async (listId: string, itemId: string, updates: Partial<ListItem>) => {
      const { data } = await apiClient.patch<ListItem>(`/lists/${listId}/items/${itemId}`, updates);
      return data;
    },

    // Delete item
    delete: async (listId: string, itemId: string) => {
      const { data } = await apiClient.delete<{ message: string }>(
        `/lists/${listId}/items/${itemId}`
      );
      return data;
    },
  },

  share: {
    // Owner: Generate share link
    generateLink: async (listId: string, shopkeeperName?: string) => {
      const { data } = await apiClient.post<{ shareToken: string; shareUrl: string }>(
        `/lists/${listId}/share`,
        { shopkeeperName }
      );
      return data;
    },

    // Owner: Revoke share link
    revokeLink: async (listId: string) => {
      const { data } = await apiClient.post<{ message: string }>(`/lists/${listId}/share/revoke`);
      return data;
    },

    // Shopkeeper: View shared list (public)
    viewSharedList: async (shareToken: string) => {
      const { data } = await axios.get<ShareResponse>(`${API_BASE_URL}/share/${shareToken}`);
      return data;
    },

    // Shopkeeper: Accept share (public)
    acceptShare: async (shareToken: string, shopkeeperName?: string) => {
      const { data } = await axios.post<ShareData>(`${API_BASE_URL}/share/${shareToken}/accept`, {
        shopkeeperName,
      });
      return data;
    },

    // Shopkeeper: Update list status (public)
    updateListStatus: async (shareToken: string, status: 'draft' | 'shared' | 'completed') => {
      const { data } = await axios.post<GroceryList>(`${API_BASE_URL}/share/${shareToken}/status`, {
        status,
      });
      return data;
    },

    // Shopkeeper: Update item status (public)
    updateItemStatus: async (
      shareToken: string,
      itemId: string,
      updates: {
        status: 'to_buy' | 'in_progress' | 'done' | 'unavailable' | 'substituted';
        notes?: string;
      }
    ) => {
      const { data } = await axios.post<ListItem>(
        `${API_BASE_URL}/share/${shareToken}/items/${itemId}/status`,
        updates
      );
      return data;
    },
  },
};

export default apiClient;
