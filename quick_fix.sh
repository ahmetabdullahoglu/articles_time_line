#!/bin/bash

echo "🔧 إصلاح سريع لمشاكل TypeScript..."

# إنشاء الملفات المطلوبة إذا لم تكن موجودة

# إنشاء tests/models.test.ts
if [ ! -f tests/models.test.ts ]; then
    echo "📝 إنشاء tests/models.test.ts..."
    cat > tests/models.test.ts << 'EOF'
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
    
    test('should create an article with valid data', async () => {
      const articleData = {
        url: 'https://example.com/test-article',
        title: 'Test Article',
        description: 'This is a test article',
        source: {
          domain: 'example.com',
          siteName: 'Test Site',
          trustScore: 85,
        },
      };
      
      const article = new Article(articleData);
      const savedArticle = await article.save();
      
      expect(savedArticle._id).toBeDefined();
      expect(savedArticle.url).toBe(articleData.url);
      expect(savedArticle.title).toBe(articleData.title);
      expect(savedArticle.status).toBe('pending');
    });
    
  });
  
  describe('Category Model', () => {
    
    test('should create a category with valid data', async () => {
      const categoryData = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'This is a test category',
        color: '#3B82F6',
        icon: '📁',
      };
      
      const category = new Category(categoryData);
      const savedCategory = await category.save();
      
      expect(savedCategory._id).toBeDefined();
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.slug).toBe(categoryData.slug);
    });
    
  });
  
  describe('User Model', () => {
    
    test('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123!',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          timezone: 'UTC',
          language: 'en',
        },
        role: 'user' as const,
        permissions: ['read', 'create'],
        isActive: true,
        isVerified: false,
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password);
    });
    
  });
  
});
EOF
fi

# إنشاء scripts/seed.ts
if [ ! -f scripts/seed.ts ]; then
    echo "📝 إنشاء scripts/seed.ts..."
    cat > scripts/seed.ts << 'EOF'
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
      
      await this.clearData();
      
      const categories = await this.seedCategories();
      const users = await this.seedUsers();
      await this.seedArticles(categories, users);
      
      console.log('✅ Database seeding completed successfully!');
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    } finally {
      await mongoose.disconnect();
    }
  }
  
  private async clearData(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    await Article.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    
    console.log('✅ Existing data cleared');
  }
  
  private async seedCategories(): Promise<any[]> {
    console.log('📂 Seeding categories...');
    
    const categoriesData = [
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Articles about technology, programming, and digital innovation',
        color: '#3B82F6',
        icon: '💻',
      },
      {
        name: 'Science',
        slug: 'science',
        description: 'Scientific discoveries, research, and educational content',
        color: '#10B981',
        icon: '🔬',
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business news, entrepreneurship, and market insights',
        color: '#F59E0B',
        icon: '💼',
      },
    ];
    
    const categories = await Category.insertMany(categoriesData);
    console.log(`✅ Created ${categories.length} categories`);
    
    return categories;
  }
  
  private async seedUsers(): Promise<any[]> {
    console.log('👥 Seeding users...');
    
    const usersData = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123!@#',
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          bio: 'System administrator for Article Archiver',
          timezone: 'UTC',
          language: 'en',
        },
        isVerified: true,
        permissions: ['all'],
      },
      {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!@#',
        role: 'user',
        profile: {
          firstName: 'Test',
          lastName: 'User',
          bio: 'Test user account for development',
          timezone: 'UTC',
          language: 'en',
        },
        isVerified: true,
        permissions: ['read', 'create'],
      },
    ];
    
    const users = await User.insertMany(usersData);
    console.log(`✅ Created ${users.length} users`);
    
    return users;
  }
  
  private async seedArticles(categories: any[], users: any[]): Promise<void> {
    console.log('📰 Seeding articles...');
    
    const articlesData = [
      {
        url: 'https://example.com/test-article',
        title: 'Test Article',
        description: 'This is a test article for development',
        publishDate: new Date('2024-01-15'),
        source: {
          domain: 'example.com',
          siteName: 'Example Blog',
          trustScore: 85,
        },
        metadata: {
          author: 'Test Author',
          tags: ['test', 'development'],
          categories: categories.length > 0 ? [categories[0]._id] : [],
          customTags: [],
        },
        status: 'processed',
        flags: {
          isPublic: true,
          isDuplicate: false,
          isArchived: false,
          needsReview: false,
        },
        createdBy: users.length > 0 ? users[0]._id : null,
      },
    ];
    
    const articles = await Article.insertMany(articlesData);
    console.log(`✅ Created ${articles.length} articles`);
    
    for (const category of categories) {
      await Category.updateStats(category._id.toString());
    }
    
    console.log('✅ Updated category statistics');
  }
}

const seeder = new DatabaseSeeder();

if (require.main === module) {
  seeder.run()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seeder;
EOF
fi

echo "🔨 تشغيل البناء مرة أخرى..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ تم بناء المشروع بنجاح!"
    
    echo "🧪 تجربة الاختبارات..."
    npm test
    
    if [ $? -eq 0 ]; then
        echo "✅ جميع الاختبارات نجحت!"
        
        echo "🌱 تجربة إنشاء البيانات الأولية..."
        npm run db:seed
        
        if [ $? -eq 0 ]; then
            echo "✅ تم إنشاء البيانات الأولية بنجاح!"
            
            echo "🚀 تجربة تشغيل الخادم..."
            timeout 5s npm run dev &
            SERVER_PID=$!
            
            sleep 3
            
            if curl -f http://localhost:5000/health > /dev/null 2>&1; then
                echo "✅ الخادم يعمل بنجاح!"
                kill $SERVER_PID 2>/dev/null
                
                echo ""
                echo "🎉 الأمر 2 مكتمل بنجاح!"
                echo "✅ جميع الاختبارات نجحت"
                echo "✅ قاعدة البيانات تعمل"
                echo "✅ الخادم يعمل"
                echo ""
                echo "🚀 جاهز للانتقال إلى الأمر 3!"
                
            else
                echo "⚠️ لم يتم الوصول للخادم. تأكد من تشغيل MongoDB وجرب: npm run dev"
            fi
        else
            echo "⚠️ فشل في إنشاء البيانات الأولية. تأكد من تشغيل MongoDB."
        fi
    else
        echo "⚠️ بعض الاختبارات فشلت. تأكد من تشغيل MongoDB."
    fi
else
    echo "❌ فشل بناء المشروع. راجع الأخطاء أعلاه."
fi