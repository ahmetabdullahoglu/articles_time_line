import mongoose from 'mongoose';
import { Article, Category, User } from '../src/models';

describe('Database Models', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/article-archiver-test';
    await mongoose.connect(mongoUri);
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  
  beforeEach(async () => {
    await Article.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
  });
  
  describe('Article Model', () => {
    test('should create an article', async () => {
      const article = new Article({
        url: 'https://example.com/test',
        title: 'Test Article',
        source: { domain: 'example.com', siteName: 'Test' },
      });
      
      const saved = await article.save();
      expect(saved._id).toBeDefined();
    });
  });
  
  describe('User Model', () => {
    test('should create a user', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
      });
      
      const saved = await user.save();
      expect(saved._id).toBeDefined();
      expect(saved.password).not.toBe('TestPassword123!'); // Should be hashed
    });
  });
});