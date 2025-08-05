const API_BASE_URL = 'https://eqapi.juany.kr';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
  user: {
    id: string;
    uuid: string;
    email: string;
    name: string;
    role: string;
    level: number | null;
    experience: number;
    marathonPoints: number;
    petFood: number;
    petToys: number;
  };
}

interface SignUpRequest {
  id: string;
  password: string;
  name: string;
  email: string;
}

interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
  message: string;
  user: {
    id: string;
    uuid: string;
    email: string;
    name: string;
    role: string;
    level: number | null;
    experience: number;
    marathonPoints: number;
    petFood: number;
    petToys: number;
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

interface LearningItem {
  uuid: string;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  status: string;
  thumbnail: string;
  links: string[];
  viewCount: number;
  likeCount: number;
  authorId: string;
  authorName: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface GetLearningListResponse {
  items: LearningItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface ProfileResponse {
  message: string;
  user: {
    uuid: string;
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    profileImage: string | null;

    level: number;
    experience: number;
    marathonPoints: number;
    freshSeaweed: number;
    ecoBerries: number;
    organicSeeds: number;
    bambooSnack: number;
    ecoBall: number;
    puzzleTree: number;
    waterWheel: number;
    flyingRing: number;
    petToys: number;
    petFood: number;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ShopItem {
  name: string;
  displayName: string;
  cost: number;
  description: string;
  type: 'food' | 'toy';
}

interface GetShopItemsResponse {
  message: string;
  items: ShopItem[];
}

export interface MyItem {
  name: string;
  displayName: string;
  type: 'food' | 'toy';
  cost: number;
  description: string;
  quantity: number;
}

interface GetMyItemsResponse {
  message: string;
  items: MyItem[];
}

export interface ShopAnimal {
  type: string;
  defaultName: string;
  adoptionCost: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: boolean;
}

interface GetShopAnimalsResponse {
  message: string;
  animals: ShopAnimal[];
}

interface PurchaseItemRequest {
  itemName: string;
  quantity: number;
}

interface PurchaseItemResponse {
  message: string;
  itemName: string;
  quantity: number;
  usedMarathonPoints: number;
  currentItemCount: number;
}

interface AdoptPetRequest {
  name: string;
  type: string;
}

interface AdoptedPet {
  uuid: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  experienceProgress: number;
  happiness: number;
  hunger: number;
  status: string;
  petImage: string | null;
  lastFedAt: string | null;
  lastPlayedAt: string | null;
  createdAt: string;
}

interface AdoptPetResponse {
  message: string;
  pet: AdoptedPet;
  usedMarathonPoints: number;
}

interface MainPet {
  uuid: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  experienceProgress: number;
  happiness: number;
  hunger: number;
  status: string;
  petImage: string | null;
  lastFedAt: string | null;
  lastPlayedAt: string | null;
  createdAt: string;
}

interface GetMainPetResponse {
  message: string;
  mainPet: MainPet;
}

interface PetDetail {
  uuid: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  experienceProgress: number;
  happiness: number;
  hunger: number;
  status: string;
  petImage: string | null;
  lastFedAt: string | null;
  lastPlayedAt: string | null;
  createdAt: string;
}

interface GetPetDetailResponse {
  message: string;
  pet: PetDetail;
}

interface SetMainPetRequest {
  petId: string;
}

interface SetMainPetResponse {
  message: string;
  mainPet: MainPet;
}

interface UserPet {
  uuid: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  experienceProgress: number;
  happiness: number;
  hunger: number;
  status: string;
  petImage: string | null;
  lastFedAt: string | null;
  lastPlayedAt: string | null;
  createdAt: string;
}

interface GetUserPetsResponse {
  message: string;
  data: UserPet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error - Status: ${response.status}, Response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
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

  async getLearningList(type: string, page: number = 1, limit: number = 10, token?: string): Promise<ApiResponse<GetLearningListResponse>> {
    return this.get<GetLearningListResponse>(`/learning/type/${type}?page=${page}&limit=${limit}`, token);
  },

  async getProfile(token?: string): Promise<ApiResponse<ProfileResponse>> {
    return this.get<ProfileResponse>('/auth/profile', token);
  },

  async getShopItems(token?: string): Promise<ApiResponse<GetShopItemsResponse>> {
    return this.get<GetShopItemsResponse>('/pets/shop/items', token);
  },

  async getMyItems(token?: string): Promise<ApiResponse<GetMyItemsResponse>> {
    return this.get<GetMyItemsResponse>('/pets/items/my', token);
  },

  async purchaseItem(itemName: string, quantity: number, token?: string): Promise<ApiResponse<PurchaseItemResponse>> {
    return this.post<PurchaseItemResponse>('/pets/shop/buy', { itemName, quantity }, token);
  },

  async getShopAnimals(token?: string): Promise<ApiResponse<GetShopAnimalsResponse>> {
    return this.get<GetShopAnimalsResponse>('/pets/shop/animals', token);
  },

  async adoptPet(petData: AdoptPetRequest, token?: string): Promise<ApiResponse<AdoptPetResponse>> {
    return this.post<AdoptPetResponse>('/pets/adopt', petData, token);
  },

  async getMainPet(token?: string): Promise<ApiResponse<GetMainPetResponse>> {
    return this.get<GetMainPetResponse>('/pets/main', token);
  },

  async getPetDetail(petUuid: string, token?: string): Promise<ApiResponse<GetPetDetailResponse>> {
    return this.get<GetPetDetailResponse>(`/pets/${petUuid}`, token);
  },

  async setMainPet(petId: string, token?: string): Promise<ApiResponse<SetMainPetResponse>> {
    return this.post<SetMainPetResponse>('/pets/main', { petId }, token);
  },

  async getUserPets(token?: string): Promise<ApiResponse<GetUserPetsResponse>> {
    return this.get<GetUserPetsResponse>('/pets/', token);
  },
};