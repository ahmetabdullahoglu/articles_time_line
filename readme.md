# Article Archiver Backend

مشروع خلفية متكامل لأرشفة المقالات مع ميزات متقدمة للسحب التلقائي، التصنيف الذكي، والتحليل.

## 🚀 الميزات الرئيسية

- **أرشفة المقالات**: حفظ المقالات من أي موقع مع استخلاص البيانات الوصفية
- **استخلاص البيانات**: استخراج العنوان، الوصف، الصور، والنص الكامل تلقائياً
- **التصنيف الذكي**: تصنيف المقالات تلقائياً حسب المحتوى
- **البحث المتقدم**: بحث ذكي مع فلترة متعددة المعايير
- **الخط الزمني التفاعلي**: عرض المقالات في خط زمني تفاعلي
- **السحب الجماعي**: سحب مقالات متعددة من موقع واحد
- **API شامل**: REST API مع توثيق كامل
- **نظام المستخدمين**: مصادقة وإدارة المستخدمين مع أذونات متدرجة

## 🛠️ التقنيات المستخدمة

- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Joi + Express Validator
- **Security**: Helmet + CORS + Rate Limiting
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier

## 📋 المتطلبات

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

## ⚡ التثبيت والتشغيل

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd article-archiver-backend
```

### 2. تثبيت Dependencies

```bash
npm install
```

### 3. إعداد المتغيرات البيئية

```bash
cp .env.example .env
```

قم بتعديل ملف `.env` بالقيم المناسبة:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/article-archiver

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

### 4. تشغيل MongoDB

```bash
# باستخدام Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# أو باستخدام MongoDB المثبت محلياً
mongod
```

### 5. إعداد قاعدة البيانات

```bash
# إنشاء البيانات الأولية (categories, users, sample articles)
npm run db:seed
```

### 6. تشغيل التطبيق

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## 📊 هيكل المشروع

```
src/
├── config/         # إعدادات قاعدة البيانات والتطبيق
│   └── database.ts # إعدادات MongoDB
├── controllers/    # معالجات الطلبات (سيتم إضافتها في الأمر 4)
├── models/         # نماذج قاعدة البيانات
│   ├── Article.ts  # نموذج المقالات
│   ├── Category.ts # نموذج الأقسام
│   ├── User.ts     # نموذج المستخدمين
│   └── index.ts    # تجميع النماذج
├── routes/         # مسارات API (سيتم إضافتها في الأمر 4)
├── middleware/     # Middleware functions
│   ├── error-handler.ts  # معالج الأخطاء
│   └── not-found.ts      # معالج 404
├── services/       # منطق الأعمال (سيتم إضافتها في الأمر 3)
├── utils/          # الأدوات المساعدة
├── types/          # أنواع TypeScript
│   └── index.ts    # الأنواع المشتركة
├── app.ts          # إعداد Express
└── server.ts       # نقطة البداية
scripts/
└── seed.ts         # سكريبت البيانات الأولية
tests/              # الاختبارات
└── models.test.ts  # اختبارات النماذج
```

## 🗄️ نماذج قاعدة البيانات

### Article Model
- **Basic Info**: url, title, description, publishDate
- **Source**: domain, siteName, favicon, trustScore
- **Content**: rawHtml, extractedText, images, videos, wordCount, readingTime
- **Metadata**: author, tags, categories, language
- **Classification**: topics, keywords, entities, sentiment, difficulty, quality
- **Analytics**: views, bookmarks, shares, rating
- **Status & Flags**: processing status, public/private, archived, etc.

### Category Model
- **Basic Info**: name, slug, description, color, icon
- **Hierarchy**: parentId for subcategories
- **Settings**: autoTag, keywords, defaultTags
- **Stats**: articlesCount, lastUpdated

### User Model
- **Authentication**: username, email, password (hashed)
- **Profile**: firstName, lastName, avatar, bio, website
- **Preferences**: theme, defaultView, notifications, privacy
- **Role & Permissions**: user/moderator/admin with granular permissions
- **Stats**: articlesAdded, lastLogin, totalViews
- **Tokens**: refresh, reset, verification tokens

## 🔌 API Endpoints

### Health Check
```
GET /health - فحص حالة الخادم والاتصال بقاعدة البيانات
GET /api     - معلومات API الأساسية
```

### المتوقع في الأوامر القادمة:
```
GET    /api/v1/articles     - جلب المقالات
POST   /api/v1/articles     - إضافة مقال جديد
GET    /api/v1/articles/:id - جلب مقال محدد
PUT    /api/v1/articles/:id - تحديث مقال
DELETE /api/v1/articles/:id - حذف مقال

GET    /api/v1/categories   - جلب الأقسام
POST   /api/v1/categories   - إضافة قسم جديد
PUT    /api/v1/categories/:id - تحديث قسم
DELETE /api/v1/categories/:id - حذف قسم

POST   /api/v1/auth/login   - تسجيل الدخول
POST   /api/v1/auth/register - تسجيل حساب جديد
POST   /api/v1/auth/logout  - تسجيل الخروج
```

## 🧪 الاختبار

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات مع المراقبة
npm run test:watch

# تقرير التغطية
npm run test:coverage
```

### اختبارات النماذج المتوفرة:
- **Article Model**: إنشاء، البحث بالرابط، منع التكرار، زيادة المشاهدات
- **Category Model**: إنشاء، البحث بالـ slug، التسلسل الهرمي، إنشاء slug تلقائي
- **User Model**: إنشاء، تشفير كلمة المرور، المقارنة، البحث بالبيانات، إنشاء tokens

## 🔧 أوامر التطوير

```bash
# تشغيل في وضع التطوير
npm run dev

# بناء المشروع
npm run build

# فحص الكود
npm run lint

# إصلاح مشاكل الكود
npm run lint:fix

# تنسيق الكود
npm run format

# تنظيف مجلد البناء
npm run clean

# إنشاء البيانات الأولية
npm run db:seed

# تشغيل migrations (للمستقبل)
npm run db:migrate
```

## 📝 معايير الكود

### التسمية
- **الملفات**: kebab-case (article-controller.ts)
- **المتغيرات والوظائف**: camelCase
- **الكلاسات والواجهات**: PascalCase
- **الثوابت**: UPPER_SNAKE_CASE

### TypeScript
- استخدام strict mode
- تعريف أنواع صريحة للوظائف
- استخدام interfaces بدلاً من types للكائنات
- تجنب استخدام `any` إلا عند الضرورة

### قاعدة البيانات
- استخدام Mongoose schemas مع validation
- إنشاء indexes للحقول المستخدمة في البحث
- تطبيق middleware للعمليات التلقائية
- استخدام static methods و instance methods حسب الحاجة

## 🔒 الأمان

- **Password Hashing**: bcrypt مع salt rounds قابل للتخصيص
- **JWT Authentication**: tokens آمنة مع refresh tokens
- **Rate Limiting**: حماية من الطلبات المفرطة
- **CORS**: تكوين CORS آمن
- **Helmet**: حماية HTTP headers
- **Input Validation**: التحقق من جميع المدخلات
- **Database Validation**: Mongoose schema validation

## 🚀 النشر

### متغيرات البيئة المطلوبة
- `MONGODB_URI`: رابط قاعدة البيانات
- `JWT_SECRET`: مفتاح JWT سري وقوي
- `CORS_ORIGIN`: النطاقات المسموحة
- `BCRYPT_SALT_ROUNDS`: قوة تشفير كلمات المرور

### باستخدام Docker

```bash
# بناء الصورة
docker build -t article-archiver-backend .

# تشغيل الحاوية
docker run -p 5000:5000 --env-file .env article-archiver-backend
```

### باستخدام PM2

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل التطبيق
pm2 start dist/server.js --name "article-archiver"

# مراقبة التطبيق
pm2 monit
```

## 📈 المراقبة والتشخيص

- **Health Check**: `/health` endpoint للمراقبة
- **Database Stats**: معلومات حالة قاعدة البيانات
- **Error Handling**: معالجة شاملة للأخطاء
- **Logging**: تسجيل مفصل للعمليات
- **Testing**: اختبارات شاملة للنماذج

## 🔄 الإصدارات الحالية

### تم إنجازه (الأمر 1-2):
- ✅ إعداد البنية الأساسية للمشروع
- ✅ إعداد TypeScript وESLint وPrettier
- ✅ اتصال قاعدة البيانات مع MongoDB
- ✅ نماذج Article, Category, User
- ✅ نظام المصادقة الأساسي
- ✅ اختبارات النماذج
- ✅ سكريبت البيانات الأولية

### قادم (الأمر 3):
- [ ] خدمة استخلاص البيانات الوصفية
- [ ] التحقق من صحة الروابط
- [ ] استخلاص المحتوى من المواقع

## 📚 البيانات الأولية

السكريبت `npm run db:seed` ينشئ:
- **5 أقسام رئيسية**: Technology, Science, Business, Health, Education
- **2 أقسام فرعية**: Web Development, AI & Machine Learning
- **3 مستخدمين**: admin, moderator, testuser
- **3 مقالات تجريبية** مع بيانات كاملة

## 🆘 استكشاف الأخطاء

### مشاكل الاتصال بقاعدة البيانات:
1. تأكد من تشغيل MongoDB
2. تحقق من `MONGODB_URI` في ملف `.env`
3. تأكد من أذونات الوصول لقاعدة البيانات

### مشاكل الاختبارات:
1. تأكد من وجود `MONGODB_TEST_URI` في متغيرات البيئة
2. تحقق من أن قاعدة البيانات التجريبية منفصلة عن الإنتاج

### مشاكل JWT:
1. تأكد من وجود `JWT_SECRET` في متغيرات البيئة
2. تحقق من قوة المفتاح السري (32 حرف على الأقل)

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📜 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

**تم التطوير بـ ❤️ لأرشفة أفضل للمقالات**

**المرحلة الحالية**: الأساسيات والبنية التحتية (الأمر 2/30 مكتمل)