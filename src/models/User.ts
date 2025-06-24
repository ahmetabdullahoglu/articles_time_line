import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, UserRole } from '../types/index';

/**
 * User document interface extending the base interface
 */
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  toAuthJSON(): any;
  incrementArticleCount(): Promise<IUserDocument>;
  updateLastLogin(): Promise<IUserDocument>;
  addToken(token: string, type: 'refresh' | 'reset' | 'verification', expiresIn?: string): Promise<IUserDocument>;
  removeToken(token: string): Promise<IUserDocument>;
}

/**
 * User model interface with static methods
 */
interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByUsername(username: string): Promise<IUserDocument | null>;
  findByCredentials(identifier: string, password: string): Promise<IUserDocument | null>;
  getActiveUsers(): Promise<IUserDocument[]>;
}

/**
 * Profile schema for user profile information
 */
const profileSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  avatar: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Allow empty values
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid website URL',
    },
  },
  timezone: {
    type: String,
    default: 'UTC',
    trim: true,
  },
  language: {
    type: String,
    default: 'en',
    trim: true,
    lowercase: true,
  },
}, { _id: false });

/**
 * Preferences schema for user preferences
 */
const preferencesSchema = new Schema({
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto',
  },
  defaultView: {
    type: String,
    enum: ['list', 'timeline', 'grid'],
    default: 'list',
  },
  articlesPerPage: {
    type: Number,
    min: 5,
    max: 100,
    default: 20,
  },
  notifications: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: false,
    },
    digest: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
  },
  privacy: {
    profilePublic: {
      type: Boolean,
      default: false,
    },
    articlesPublic: {
      type: Boolean,
      default: true,
    },
  },
}, { _id: false });

/**
 * Stats schema for user statistics
 */
const statsSchema = new Schema({
  articlesAdded: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastLogin: {
    type: Date,
  },
  totalViews: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

/**
 * Token schema for user tokens (refresh, reset, verification)
 */
const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['refresh', 'reset', 'verification'],
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
}, { _id: false });

/**
 * Main User schema
 */
const userSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
  },
  profile: {
    type: profileSchema,
    default: () => ({}),
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({}),
  },
  role: {
    type: String,
    enum: Object.values(['user', 'moderator', 'admin'] as UserRole[]),
    default: 'user' as UserRole,
  },
  permissions: [{
    type: String,
    trim: true,
  }],
  stats: {
    type: statsSchema,
    default: () => ({}),
  },
  tokens: [tokenSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      delete ret.tokens;
      return ret;
    },
  },
});

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(this: IUserDocument, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to update stats
userSchema.pre('save', function(this: IUserDocument, next) {
  if (this.isModified('stats.lastLogin')) {
    // Update login timestamp
    this.stats.lastLogin = new Date();
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

userSchema.methods.generateAuthToken = function(this: IUserDocument): string {
  const payload = {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    role: this.role,
  };

  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as jwt.SignOptions['expiresIn'],
    issuer: 'article-archiver',
    audience: 'article-archiver-users',
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret-key',
    options
  );
};

userSchema.methods.generateRefreshToken = function(this: IUserDocument): string {
  const payload = {
    id: this._id.toString(),
    type: 'refresh',
  };

  const options: jwt.SignOptions = {
    expiresIn: '30d',
    issuer: 'article-archiver',
    audience: 'article-archiver-refresh',
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback-refresh-secret',
    options
  );
};

userSchema.methods.toAuthJSON = function(this: IUserDocument) {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    role: this.role,
    profile: this.profile,
    preferences: this.preferences,
    isVerified: this.isVerified,
    token: this.generateAuthToken(),
  };
};

userSchema.methods.addToken = function(this: IUserDocument, token: string, type: 'refresh' | 'reset' | 'verification', expiresIn = '30d') {
  // Remove existing tokens of the same type
  this.tokens = this.tokens.filter((t: any) => t.type !== type);

  // Calculate expiration date
  const expires = new Date();
  if (expiresIn.endsWith('d')) {
    expires.setDate(expires.getDate() + parseInt(expiresIn.slice(0, -1)));
  } else if (expiresIn.endsWith('h')) {
    expires.setHours(expires.getHours() + parseInt(expiresIn.slice(0, -1)));
  } else if (expiresIn.endsWith('m')) {
    expires.setMinutes(expires.getMinutes() + parseInt(expiresIn.slice(0, -1)));
  }

  // Add new token
  this.tokens.push({ token, type, expires });
  
  return this.save();
};

userSchema.methods.removeToken = function(this: IUserDocument, token: string) {
  this.tokens = this.tokens.filter((t: any) => t.token !== token);
  return this.save();
};

userSchema.methods.incrementArticleCount = function(this: IUserDocument) {
  this.stats.articlesAdded += 1;
  return this.save();
};

userSchema.methods.updateLastLogin = function(this: IUserDocument) {
  this.stats.lastLogin = new Date();
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email: string): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase() }).exec();
};

userSchema.statics.findByUsername = function(username: string): Promise<IUserDocument | null> {
  return this.findOne({ username: username.toLowerCase() }).exec();
};

userSchema.statics.findByCredentials = async function(identifier: string, password: string): Promise<IUserDocument | null> {
  // Find user by email or username
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() },
    ],
    isActive: true,
  }).select('+password').exec();

  if (!user) {
    return null;
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return null;
  }

  return user;
};

userSchema.statics.getActiveUsers = function(): Promise<IUserDocument[]> {
  return this.find({ 
    isActive: true,
    isVerified: true,
  })
    .sort({ 'stats.lastLogin': -1 })
    .exec();
};

// Virtual for full name
userSchema.virtual('fullName').get(function(this: IUserDocument) {
  const firstName = this.profile?.firstName || '';
  const lastName = this.profile?.lastName || '';
  return `${firstName} ${lastName}`.trim() || this.username;
});

// Virtual for initials
userSchema.virtual('initials').get(function(this: IUserDocument) {
  const firstName = this.profile?.firstName || '';
  const lastName = this.profile?.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  
  return this.username.charAt(0).toUpperCase();
});

// Create and export the model
export const User: IUserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;