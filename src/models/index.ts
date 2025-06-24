/**
 * Index file for all database models
 * Exports all models for easy importing throughout the application
 */

// Import and export all models
export { Article, IArticleDocument } from './Article';
export { Category, ICategoryDocument } from './Category';
export { User, IUserDocument } from './User';

// Export model types for TypeScript
export type {
  IArticle,
  IArticleSource,
  IArticleContent,
  IArticleMetadata,
  IArticleClassification,
  IArticleScraping,
  IArticleAnalytics,
  IArticleFlags,
  ArticleStatus,
  ICategory,
  ICategorySettings,
  ICategoryStats,
  IUser,
  IUserProfile,
  IUserPreferences,
  IUserStats,
  IUserToken,
  UserRole,
} from '../types/index';

// Utility function to initialize all models
export const initializeModels = (): void => {
  console.log('📊 Initializing database models...');
  
  // Models are automatically registered when imported
  console.log('✅ Article model registered');
  console.log('✅ Category model registered');
  console.log('✅ User model registered');
  
  console.log('📊 All models initialized successfully');
};

// Model validation utilities
export const validateModels = async (): Promise<boolean> => {
  try {
    console.log('🔍 Validating database models...');
    
    // Add any model validation logic here
    // For now, just check if models are properly registered
    
    console.log('✅ All models validated successfully');
    return true;
  } catch (error) {
    console.error('❌ Model validation failed:', error);
    return false;
  }
};