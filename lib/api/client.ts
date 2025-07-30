const API_BASE_URL = 'https://eqapi.juany.kr';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

interface SignUpRequest {
  id: string;
  password: string;
  name: string;
  email: string;
}

interface SignUpResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export const apiClient = {
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  },

  async signIn(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/auth/signin', { email, password });
  },

  async signUp(signUpData: SignUpRequest): Promise<ApiResponse<SignUpResponse>> {
    return this.post<SignUpResponse>('/auth/signup', signUpData);
  },
};