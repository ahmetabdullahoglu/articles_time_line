import { config } from 'dotenv';
import mongoose from 'mongoose';
import { Article, Category, User } from '../src/models';
import { connectDB } from '../src/config/database';

config();

class DatabaseSeeder {
  public async run(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      await connectDB();
      
      // Clear existing data
      await Article.deleteMany({});
      await Category.deleteMany({});
      await User.deleteMany({});
      
      // Seed categories
      const categories = await Category.insertMany([
        { name: 'Technology', slug: 'technology', color: '#3B82F6', icon: '💻' },
        { name: 'Science', slug: 'science', color: '#10B981', icon: '🔬' },
      ]);
      
      // Seed users
      const users = await User.insertMany([
        {
          username: 'admin',
          email: 'admin@example.com',
          password: 'Admin123!',
          role: 'admin',
          isVerified: true,
        },
      ]);
      
      // Seed articles
      await Article.insertMany([
        {
          url: 'https://example.com/test-article',
          title: 'Test Article',
          source: { domain: 'example.com', siteName: 'Test Site' },
          metadata: { categories: [categories[0]._id], tags: ['test'], customTags: [] },
          createdBy: users[0]._id,
        },
      ]);
      
      console.log('✅ Database seeding completed!');
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await mongoose.disconnect();
    }
  }
}

const seeder = new DatabaseSeeder();
if (require.main === module) {
  seeder.run().then(() => process.exit(0)).catch(() => process.exit(1));
}
export default seeder;