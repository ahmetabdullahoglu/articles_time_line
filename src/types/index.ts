/**
 * Enhanced TypeScript interfaces and types for the Article Archiver application
 * Updated to match the database models
 */

// =================================
// API Response Types
// =================================

export interface ApiResponse<T = any> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =================================
// Article Types
// =================================

export interface IArticleSource {
  domain: string;
  siteName: string;
  favicon?: string;
  trustScore?: number;
}

export interface IArticleContent {
  rawHtml?: string;
  extractedText?: string;
  cleanText?: string;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  videos: string[];
  wordCount: number;
  readingTime: number;
  language?: string;
}

export interface IArticleMetadata {
  author?: string;
  authorUrl?: string;
  tags: string[];
  categories: string[];
  customTags: string[];
  externalId?: string;
}

export interface IArticleClassification {
  topics: string[];
  keywords: string[];
  entities: Array<{
    name: string;
    type: 'person' | 'organization' | 'location' | 'other';
    confidence: number;
  }>;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  quality: number;
}

export interface IArticleScraping {
  method: 'manual' | 'bulk' | 'scheduled';
  ruleId?: string;
  attempts: number;
  lastAttempt?: Date;
  errors: string[];
}

export interface IArticleAnalytics {
  views: number;
  bookmarks: number;
  shares: number;
  rating: number;
  comments: string[];
}

export interface IArticleFlags {
  isDuplicate: boolean;
  isArchived: boolean;
  isPublic: boolean;
  needsReview: boolean;
}

export type ArticleStatus = 'pending' | 'processing' | 'processed' | 'failed' | 'archived';

export interface IArticle {
  _id?: string;
  url: string;
  title: string;
  description?: string;
  publishDate?: Date;
  addedDate: Date;
  updatedDate: Date;
  source: IArticleSource;
  content: IArticleContent;
  metadata: IArticleMetadata;
  classification: IArticleClassification;
  scraping: IArticleScraping;
  analytics: IArticleAnalytics;
  status: ArticleStatus;
  flags: IArticleFlags;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// =================================
// Category Types
// =================================

export interface ICategorySettings {
  autoTag: boolean;
  keywords: string[];
  defaultTags: string[];
}

export interface ICategoryStats {
  articlesCount: number;
  lastUpdated: Date;
}

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  parentId?: string;
  settings: ICategorySettings;
  stats: ICategoryStats;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// =================================
// User Types
// =================================

export interface IUserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  timezone: string;
  language: string;
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'list' | 'timeline' | 'grid';
  articlesPerPage: number;
  notifications: {
    email: boolean;
    push: boolean;
    digest: 'daily' | 'weekly' | 'monthly';
  };
  privacy: {
    profilePublic: boolean;
    articlesPublic: boolean;
  };
}

export interface IUserStats {
  articlesAdded: number;
  lastLogin?: Date;
  totalViews: number;
}

export interface IUserToken {
  token: string;
  type: 'refresh' | 'reset' | 'verification';
  expires: Date;
}

export type UserRole = 'user' | 'moderator' | 'admin';

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  profile: IUserProfile;
  preferences: IUserPreferences;
  role: UserRole;
  permissions: string[];
  stats: IUserStats;
  tokens: IUserToken[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =================================
// Request/Response Types
// =================================

export interface CreateArticleRequest {
  url: string;
  title?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
}

export interface UpdateArticleRequest {
  title?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  status?: ArticleStatus;
}

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  status?: ArticleStatus;
  dateFrom?: string;
  dateTo?: string;
  source?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface UpdateUserRequest {
  profile?: Partial<IUserProfile>;
  preferences?: Partial<IUserPreferences>;
}

// =================================
// Validation Types
// =================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =================================
// Database Types
// =================================

export interface DatabaseConfig {
  uri: string;
  options: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
    bufferMaxEntries?: number;
  };
}

export interface DatabaseStats {
  host: string;
  port: number;
  database: string;
  readyState: number;
  collections: any[];
  version: string;
  uptime: number;
}

// =================================
// Service Types
// =================================

export interface MetadataExtractionResult {
  title?: string;
  description?: string;
  author?: string;
  publishDate?: Date;
  image?: string;
  keywords?: string[];
  language?: string;
  source: IArticleSource;
}

export interface TextExtractionResult {
  extractedText: string;
  cleanText: string;
  wordCount: number;
  readingTime: number;
  images: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
  videos: string[];
}

// =================================
// Error Types
// =================================

export interface AppErrorDetails {
  statusCode: number;
  status: string;
  message: string;
  isOperational: boolean;
  stack?: string;
}

// =================================
// Utility Types
// =================================

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// =================================
// Environment Types
// =================================

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  MONGODB_TEST_URI?: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_REFRESH_SECRET?: string;
  CORS_ORIGIN: string;
  BCRYPT_SALT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

// =================================
// Model Static Methods Types
// =================================

export interface ArticleStatics {
  findByUrl(url: string): Promise<IArticle | null>;
  findByCategory(categoryId: string): Promise<IArticle[]>;
  findPublished(): Promise<IArticle[]>;
  getStats(): Promise<{
    total: number;
    processed: number;
    pending: number;
    failed: number;
    avgWordCount: number;
    avgReadingTime: number;
  }>;
}

export interface CategoryStatics {
  findBySlug(slug: string): Promise<ICategory | null>;
  findHierarchy(): Promise<any[]>;
  getTopCategories(): Promise<ICategory[]>;
  updateStats(categoryId: string): Promise<void>;
}

export interface UserStatics {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findByCredentials(identifier: string, password: string): Promise<IUser | null>;
  getActiveUsers(): Promise<IUser[]>;
}

// =================================
// Authentication Types
// =================================

export interface AuthTokenPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface RefreshTokenPayload {
  id: string;
  type: 'refresh';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

// =================================
// Express Request Extensions
// =================================

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}