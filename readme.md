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

### 5. تشغيل التطبيق

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
├── controllers/     # معالجات الطلبات
├── models/         # نماذج قاعدة البيانات
├── routes/         # مسارات API
├── middleware/     # Middleware functions
├── services/       # منطق الأعمال
├── utils/          # الأدوات المساعدة
├── types/          # أنواع TypeScript
├── config/         # إعدادات التطبيق
├── app.ts          # إعداد Express
└── server.ts       # نقطة البداية
```

## 🔌 API Endpoints

### Health Check
```
GET /health - فحص حالة الخادم
```

### Articles (سيتم إضافتها لاحقاً)
```
GET    /api/v1/articles     - جلب المقالات
POST   /api/v1/articles     - إضافة مقال جديد
GET    /api/v1/articles/:id - جلب مقال محدد
PUT    /api/v1/articles/:id - تحديث مقال
DELETE /api/v1/articles/:id - حذف مقال
```

### Categories (سيتم إضافتها لاحقاً)
```
GET    /api/v1/categories   - جلب الأقسام
POST   /api/v1/categories   - إضافة قسم جديد
PUT    /api/v1/categories/:id - تحديث قسم
DELETE /api/v1/categories/:id - حذف قسم
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
npm clean
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

### Error Handling
- استخدام try-catch للعمليات غير المتزامنة
- إرجاع أخطاء واضحة ومفيدة
- تسجيل الأخطاء المهمة

## 🔒 الأمان

- **Rate Limiting**: حماية من الطلبات المفرطة
- **CORS**: تكوين CORS آمن
- **Helmet**: حماية HTTP headers
- **Input Validation**: التحقق من جميع المدخلات
- **JWT**: مصادقة آمنة بـ tokens

## 🚀 النشر

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
- **Logging**: تسجيل مفصل للعمليات والأخطاء
- **Error Tracking**: تتبع الأخطاء والاستثناءات
- **Performance**: مراقبة الأداء والاستجابة

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📜 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🆘 الدعم

للحصول على المساعدة أو الإبلاغ عن مشاكل:

1. فتح issue في GitHub
2. مراجعة التوثيق
3. التأكد من إعداد المتغيرات البيئية صحيحاً

## 🔄 الإصدارات القادمة

- [ ] نظام المصادقة الكامل
- [ ] سحب المقالات الجماعي
- [ ] التصنيف الذكي بالذكاء الاصطناعي
- [ ] نظام الإشعارات
- [ ] لوحة الإدارة
- [ ] API GraphQL
- [ ] تطبيق الهاتف المحمول

---

**تم التطوير بـ ❤️ لأرشفة أفضل للمقالات**