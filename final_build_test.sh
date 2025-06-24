#!/bin/bash

# 🎯 خطوات التأكد من إصلاح جميع الأخطاء وإكمال الأمر 2

echo "🚀 بدء اختبار إصلاحات TypeScript..."

# 1. التأكد من هيكل المجلدات
echo "📁 إنشاء هيكل المجلدات المطلوب..."
mkdir -p tests scripts

# 2. إنشاء ملفات البيئة إذا لم تكن موجودة
if [ ! -f .env ]; then
    echo "🔧 إنشاء ملف .env..."
    cat > .env << 'EOF'
# Database
MONGODB_URI=mongodb://localhost:27017/article-archiver
MONGODB_TEST_URI=mongodb://localhost:27017/article-archiver-test

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
fi

if [ ! -f .env.test ]; then
    echo "🧪 إنشاء ملف .env.test..."
    cat > .env.test << 'EOF'
NODE_ENV=test
MONGODB_TEST_URI=mongodb://localhost:27017/article-archiver-test
JWT_SECRET=test-jwt-secret-key-for-testing
BCRYPT_SALT_ROUNDS=4
EOF
fi

# 3. إنشاء ملف jest.config.js إذا لم يكن موجوداً
if [ ! -f jest.config.js ]; then
    echo "⚙️ إنشاء ملف jest.config.js..."
    cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.(ts|js)',
    '**/*.(test|spec).(ts|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/server.ts',
  ],
  testTimeout: 30000,
  clearMocks: true,
  verbose: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
};
EOF
fi

# 4. إنشاء ملف tests/setup.ts إذا لم يكن موجوداً
if [ ! -f tests/setup.ts ]; then
    echo "🧪 إنشاء ملف tests/setup.ts..."
    cat > tests/setup.ts << 'EOF'
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Set test database URI if not provided
if (!process.env.MONGODB_TEST_URI) {
  process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/article-archiver-test';
}

// Set JWT secret for testing
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key';
}

// Mock console methods to reduce noise during testing
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test timeout
jest.setTimeout(30000);
EOF
fi

# 5. بناء المشروع
echo "🔨 بناء المشروع..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل بناء المشروع! تحقق من أخطاء TypeScript أعلاه."
    exit 1
fi

echo "✅ تم بناء المشروع بنجاح!"

# 6. تشغيل الاختبارات (إذا كانت موجودة)
if [ -f tests/models.test.ts ]; then
    echo "🧪 تشغيل الاختبارات..."
    npm test
    
    if [ $? -ne 0 ]; then
        echo "⚠️ بعض الاختبارات فشلت، لكن هذا قد يكون بسبب عدم توفر MongoDB"
        echo "💡 تأكد من تشغيل MongoDB ثم جرب: npm test"
    else
        echo "✅ جميع الاختبارات نجحت!"
    fi
else
    echo "📝 لم يتم العثور على ملف الاختبارات. أنشئ tests/models.test.ts من المحتوى المقدم."
fi

# 7. اختبار تشغيل الخادم
echo "🚀 اختبار تشغيل الخادم..."
timeout 10s npm start &
SERVER_PID=$!

sleep 5

# اختبار الـ health endpoint
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ الخادم يعمل بنجاح!"
    kill $SERVER_PID 2>/dev/null
else
    echo "⚠️ لم يتم الوصول للخادم. تأكد من تشغيل MongoDB وجرب: npm run dev"
fi

echo ""
echo "🎉 ملخص الحالة:"
echo "✅ بناء TypeScript: نجح"
echo "📁 هيكل المجلدات: موجود"
echo "🔧 ملفات الإعداد: موجودة"

echo ""
echo "📋 الخطوات التالية:"
echo "1. تأكد من تشغيل MongoDB:"
echo "   mongod"
echo "   # أو باستخدام Docker:"
echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
echo ""
echo "2. أنشئ ملف tests/models.test.ts من المحتوى المقدم"
echo ""
echo "3. أنشئ ملف scripts/seed.ts من المحتوى المقدم"
echo ""
echo "4. جرب الأوامر التالية:"
echo "   npm test                    # تشغيل الاختبارات"
echo "   npm run db:seed            # إنشاء البيانات الأولية"
echo "   npm run dev                # تشغيل الخادم في وضع التطوير"
echo ""
echo "5. اختبر الـ endpoints:"
echo "   curl http://localhost:5000/health"
echo "   curl http://localhost:5000/api"
echo ""
echo "🏆 إذا تمت جميع الخطوات بنجاح، فقد أكملت الأمر 2 بنجاح!"
echo "🚀 ستكون جاهزاً للانتقال إلى الأمر 3: إنشاء خدمة استخلاص البيانات الوصفية"