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

interface CreateLearningRequest {
  title: string;
  content: string;
  category: string;
  difficulty: string;
  status: string;
  thumbnail: string;
  links: string[];
  viewCount: number;
  likeCount: number;
}

interface CreateLearningResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  status: string;
  thumbnail: string;
  links: string[];
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileRequest {
  name: string;
  email: string;
  profileImage: string;
}

interface UpdateProfileResponse {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  updatedAt: string;
}

export const apiClient = {
  async post<T>(endpoint: string, data: any, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
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

  async put<T>(endpoint: string, data: any, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
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

  async createLearning(learningData: CreateLearningRequest, token?: string): Promise<ApiResponse<CreateLearningResponse>> {
    return this.post<CreateLearningResponse>('/learning', learningData, token);
  },

  async updateProfile(profileData: UpdateProfileRequest, token?: string): Promise<ApiResponse<UpdateProfileResponse>> {
    return this.put<UpdateProfileResponse>('/users/profile', profileData, token);
  },
};