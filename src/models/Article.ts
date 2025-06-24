import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IArticle, ArticleStatus } from '../types/index';

/**
 * Article document interface extending the base interface
 */
export interface IArticleDocument extends Omit<IArticle, '_id'>, Document {
  _id: Types.ObjectId;
}

/**
 * Article model interface with static methods
 */
interface IArticleModel extends Model<IArticleDocument> {
  findByUrl(url: string): Promise<IArticleDocument | null>;
  findByCategory(categoryId: string): Promise<IArticleDocument[]>;
  findPublished(): Promise<IArticleDocument[]>;
  getStats(): Promise<any>;
}

/**
 * Source schema for article source information
 */
const sourceSchema = new Schema({
  domain: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  siteName: {
    type: String,
    required: true,
    trim: true,
  },
  favicon: {
    type: String,
    trim: true,
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
}, { _id: false });

/**
 * Content schema for article content data
 */
const contentSchema = new Schema({
  rawHtml: {
    type: String,
  },
  extractedText: {
    type: String,
  },
  cleanText: {
    type: String,
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    alt: String,
    caption: String,
  }],
  videos: [String],
  wordCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  readingTime: {
    type: Number,
    default: 0,
    min: 0,
  },
  language: {
    type: String,
    default: 'en',
    trim: true,
    lowercase: true,
  },
}, { _id: false });

/**
 * Metadata schema for article metadata
 */
const metadataSchema = new Schema({
  author: {
    type: String,
    trim: true,
  },
  authorUrl: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
  }],
  customTags: [{
    type: String,
    trim: true,
  }],
  externalId: {
    type: String,
    trim: true,
  },
}, { _id: false });

/**
 * Classification schema for AI-powered article classification
 */
const classificationSchema = new Schema({
  topics: [{
    type: String,
    trim: true,
  }],
  keywords: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  entities: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['person', 'organization', 'location', 'other'],
      default: 'other',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
  }],
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral',
    },
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  quality: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
}, { _id: false });

/**
 * Scraping schema for scraping-related information
 */
const scrapingSchema = new Schema({
  method: {
    type: String,
    enum: ['manual', 'bulk', 'scheduled'],
    default: 'manual',
  },
  ruleId: {
    type: Schema.Types.ObjectId,
    ref: 'SiteRule',
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastAttempt: Date,
  errors: [String],
}, { _id: false });

/**
 * Analytics schema for article analytics
 */
const analyticsSchema = new Schema({
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  bookmarks: {
    type: Number,
    default: 0,
    min: 0,
  },
  shares: {
    type: Number,
    default: 0,
    min: 0,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
}, { _id: false });

/**
 * Flags schema for article flags
 */
const flagsSchema = new Schema({
  isDuplicate: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  needsReview: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// في ملف src/models/Article.ts
// استبدل هذا الجزء من الكود:

/**
 * Main Article schema
 */
const articleSchema = new Schema<IArticleDocument>({
  url: {
    type: String,
    required: [true, 'Article URL is required'],
    unique: true, // Remove this line - we'll use schema.index() instead
    trim: true,
    validate: {
      validator: function(url: string) {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid URL',
    },
  },
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  publishDate: {
    type: Date,
    // Remove index: true - we'll use schema.index() instead
  },
  addedDate: {
    type: Date,
    default: Date.now,
    // Remove index: true - we'll use schema.index() instead
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: sourceSchema,
    required: true,
  },
  content: {
    type: contentSchema,
    default: () => ({}),
  },
  metadata: {
    type: metadataSchema,
    default: () => ({}),
  },
  classification: {
    type: classificationSchema,
    default: () => ({}),
  },
  scraping: {
    type: scrapingSchema,
    default: () => ({}),
  },
  analytics: {
    type: analyticsSchema,
    default: () => ({}),
  },
  status: {
    type: String,
    enum: Object.values(['pending', 'processing', 'processed', 'failed', 'archived'] as ArticleStatus[]),
    default: 'pending' as ArticleStatus,
    // Remove index: true - we'll use schema.index() instead
  },
  flags: {
    type: flagsSchema,
    default: () => ({}),
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for better query performance
articleSchema.index({ url: 1 }, { unique: true });
articleSchema.index({ publishDate: -1 });
articleSchema.index({ addedDate: -1 });
articleSchema.index({ 'source.domain': 1 });
articleSchema.index({ 'metadata.categories': 1 });
articleSchema.index({ 'metadata.tags': 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ 'flags.isPublic': 1 });
articleSchema.index({ title: 'text', description: 'text', 'content.extractedText': 'text' });

// Pre-save middleware to update the updatedDate
articleSchema.pre('save', function(this: IArticleDocument, next) {
  if (this.isModified() && !this.isNew) {
    this.updatedDate = new Date();
  }
  next();
});

// Static methods
articleSchema.statics.findByUrl = function(url: string): Promise<IArticleDocument | null> {
  return this.findOne({ url }).exec();
};

articleSchema.statics.findByCategory = function(categoryId: string): Promise<IArticleDocument[]> {
  return this.find({ 'metadata.categories': categoryId }).exec();
};

articleSchema.statics.findPublished = function(): Promise<IArticleDocument[]> {
  return this.find({ 
    status: 'processed',
    'flags.isPublic': true,
    'flags.isArchived': false,
  }).exec();
};

articleSchema.statics.getStats = async function(): Promise<any> {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        processed: { $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        avgWordCount: { $avg: '$content.wordCount' },
        avgReadingTime: { $avg: '$content.readingTime' },
      },
    },
  ]);

  return stats[0] || {
    total: 0,
    processed: 0,
    pending: 0,
    failed: 0,
    avgWordCount: 0,
    avgReadingTime: 0,
  };
};

// Instance methods
articleSchema.methods.incrementViews = function(this: IArticleDocument): Promise<IArticleDocument> {
  this.analytics.views += 1;
  return this.save();
};

articleSchema.methods.addBookmark = function(this: IArticleDocument): Promise<IArticleDocument> {
  this.analytics.bookmarks += 1;
  return this.save();
};

articleSchema.methods.removeBookmark = function(this: IArticleDocument): Promise<IArticleDocument> {
  if (this.analytics.bookmarks > 0) {
    this.analytics.bookmarks -= 1;
  }
  return this.save();
};

// Create and export the model
export const Article: IArticleModel = mongoose.model<IArticleDocument, IArticleModel>('Article', articleSchema);

export default Article;