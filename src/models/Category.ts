import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ICategory } from '../types/index';

/**
 * Category document interface extending the base interface
 */
export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {
  _id: Types.ObjectId;
}

/**
 * Category model interface with static methods
 */
interface ICategoryModel extends Model<ICategoryDocument> {
  findBySlug(slug: string): Promise<ICategoryDocument | null>;
  findHierarchy(): Promise<any[]>;
  getTopCategories(): Promise<ICategoryDocument[]>;
  updateStats(categoryId: string): Promise<void>;
}

/**
 * Settings schema for category-specific settings
 */
const settingsSchema = new Schema({
  autoTag: {
    type: Boolean,
    default: false,
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  defaultTags: [{
    type: String,
    trim: true,
  }],
}, { _id: false });

/**
 * Stats schema for category statistics
 */
const statsSchema = new Schema({
  articlesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

/**
 * Main Category schema
 */
const categorySchema = new Schema<ICategoryDocument>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color'],
    default: '#3B82F6',
  },
  icon: {
    type: String,
    trim: true,
    default: '📂',
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  settings: {
    type: settingsSchema,
    default: () => ({}),
  },
  stats: {
    type: statsSchema,
    default: () => ({}),
  },
  createdBy: {
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
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentId: 1 });
categorySchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(this: ICategoryDocument, next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  }
  next();
});

// Pre-remove middleware to handle category deletion
categorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Check if there are subcategories
    const subcategoriesCount = await mongoose.model('Category').countDocuments({ parentId: this._id });
    if (subcategoriesCount > 0) {
      throw new Error('Cannot delete category with subcategories. Please delete or move subcategories first.');
    }

    // Check if there are articles in this category
    const articlesCount = await mongoose.model('Article').countDocuments({ 'metadata.categories': this._id });
    if (articlesCount > 0) {
      throw new Error('Cannot delete category with articles. Please move or delete articles first.');
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static methods
categorySchema.statics.findBySlug = function(slug: string): Promise<ICategoryDocument | null> {
  return this.findOne({ slug }).exec();
};

categorySchema.statics.findHierarchy = async function(): Promise<any[]> {
  const categories = await this.find({}).sort({ name: 1 }).exec();
  
  // Build hierarchy tree
  const categoryMap = new Map();
  const rootCategories: any[] = [];

  // First pass: create map of all categories
  categories.forEach((category: any) => {
    categoryMap.set(category._id.toString(), {
      ...category.toJSON(),
      children: [],
    });
  });

  // Second pass: build hierarchy
  categories.forEach((category: any) => {
    const categoryData = categoryMap.get(category._id.toString());
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId.toString());
      if (parent) {
        parent.children.push(categoryData);
      } else {
        // Parent not found, treat as root
        rootCategories.push(categoryData);
      }
    } else {
      rootCategories.push(categoryData);
    }
  });

  return rootCategories;
};

categorySchema.statics.getTopCategories = function(): Promise<ICategoryDocument[]> {
  return this.find({ parentId: null })
    .sort({ 'stats.articlesCount': -1 })
    .limit(10)
    .exec();
};

categorySchema.statics.updateStats = async function(categoryId: string): Promise<void> {
  try {
    // Count articles in this category
    const articlesCount = await mongoose.model('Article').countDocuments({
      'metadata.categories': categoryId,
      'flags.isArchived': false,
    });

    // Update category stats
    await this.findByIdAndUpdate(categoryId, {
      'stats.articlesCount': articlesCount,
      'stats.lastUpdated': new Date(),
    });
  } catch (error) {
    console.error(`Failed to update stats for category ${categoryId}:`, error);
  }
};

// Instance methods
categorySchema.methods.getArticles = function(this: ICategoryDocument, limit = 10, skip = 0) {
  return mongoose.model('Article').find({
    'metadata.categories': this._id,
    'flags.isArchived': false,
    'flags.isPublic': true,
  })
    .sort({ addedDate: -1 })
    .limit(limit)
    .skip(skip)
    .exec();
};

categorySchema.methods.getSubcategories = function(this: ICategoryDocument) {
  return mongoose.model('Category').find({ parentId: this._id }).sort({ name: 1 }).exec();
};

categorySchema.methods.getParent = function(this: ICategoryDocument) {
  if (!this.parentId) return null;
  return mongoose.model('Category').findById(this.parentId).exec();
};

categorySchema.methods.updateArticleCount = async function(this: ICategoryDocument): Promise<ICategoryDocument> {
  const articlesCount = await mongoose.model('Article').countDocuments({
    'metadata.categories': this._id,
    'flags.isArchived': false,
  });

  this.stats.articlesCount = articlesCount;
  this.stats.lastUpdated = new Date();
  
  return this.save();
};

// Virtual for full path (breadcrumb)
categorySchema.virtual('fullPath').get(async function(this: ICategoryDocument) {
  const path = [this.name];
  let current: any = this;

  while (current.parentId) {
    const parent = await mongoose.model('Category').findById(current.parentId);
    if (parent) {
      path.unshift((parent as any).name);
      current = parent;
    } else {
      break;
    }
  }

  return path.join(' > ');
});

// Create and export the model
export const Category: ICategoryModel = mongoose.model<ICategoryDocument, ICategoryModel>('Category', categorySchema);

export default Category;