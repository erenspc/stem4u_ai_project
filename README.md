# Family Education Platform

Aile eğitim platformu - MongoDB ile geliştirilmiş modern web uygulaması.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Ebeveyn, çocuk ve öğretmen rolleri
- **Aktivite Sistemi**: Oyunlar, quizler ve dersler
- **Aile Grupları**: Aile üyelerini yönetme
- **Modern UI**: Tailwind CSS ve Radix UI bileşenleri
- **TypeScript**: Tip güvenliği
- **MongoDB**: Esnek veri yapısı

## 📋 Gereksinimler

- Node.js 18+
- MongoDB (yerel veya Atlas)
- npm veya pnpm

## 🛠️ Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd family-education-platform
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment dosyası oluşturun**
   ```bash
   # .env.local dosyası oluşturun
   MONGODB_URI=mongodb://localhost:27017/family-education
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **MongoDB'yi başlatın**
   ```bash
   # MongoDB servisini başlatın
   # Windows: MongoDB servisini başlatın
   # macOS/Linux: brew services start mongodb-community
   ```

5. **Veritabanını test edin**
   ```bash
   npm run db:init
   ```

6. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

7. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## 🗄️ Veritabanı Modelleri

### User (Kullanıcı)
```typescript
{
  email: string;
  name: string;
  role: 'parent' | 'child' | 'teacher';
  familyId?: ObjectId;
  preferences: {
    age?: number;
    interests?: string[];
    learningLevel?: string;
  };
}
```

### Family (Aile)
```typescript
{
  name: string;
  members: ObjectId[];
  settings: {
    privacy: 'public' | 'private';
    notifications: boolean;
  };
}
```

### Activity (Aktivite)
```typescript
{
  title: string;
  description: string;
  type: 'game' | 'quiz' | 'lesson' | 'exercise';
  ageRange: { min: number; max: number };
  difficulty: 'easy' | 'medium' | 'hard';
  content: {
    questions?: Array<{
      question: string;
      options?: string[];
      correctAnswer?: number;
      explanation?: string;
    }>;
    materials?: string[];
    instructions?: string;
  };
  tags: string[];
  createdBy: ObjectId;
  isActive: boolean;
}
```

## 🔌 API Endpoints

### Kullanıcılar
- `GET /api/users` - Tüm kullanıcıları getir
- `POST /api/users` - Yeni kullanıcı oluştur
- `GET /api/users/[id]` - Kullanıcı detayı
- `PUT /api/users/[id]` - Kullanıcı güncelle
- `DELETE /api/users/[id]` - Kullanıcı sil

### Aktiviteler
- `GET /api/activities` - Aktiviteleri getir (filtreleme ile)
- `POST /api/activities` - Yeni aktivite oluştur
- `GET /api/activities/[id]` - Aktivite detayı
- `PUT /api/activities/[id]` - Aktivite güncelle
- `DELETE /api/activities/[id]` - Aktivite sil

### Test
- `GET /api/test` - MongoDB bağlantı testi

## 🧪 Test

```bash
# MongoDB bağlantısını test et
npm run db:test

# API testi
curl http://localhost:3000/api/test
```

## 📁 Proje Yapısı

```
family-education-platform/
├── app/
│   ├── api/           # API endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/        # UI bileşenleri
├── lib/
│   ├── models/        # MongoDB modelleri
│   ├── mongodb.ts     # MongoDB bağlantısı
│   └── utils.ts
├── scripts/           # Yardımcı scriptler
└── public/           # Statik dosyalar
```

## 🚀 Deployment

1. **Production build**
   ```bash
   npm run build
   ```

2. **Environment değişkenlerini ayarlayın**
   - `MONGODB_URI`: Production MongoDB URL'i
   - `NEXTAUTH_SECRET`: Güvenli secret key
   - `NEXTAUTH_URL`: Production URL

3. **Sunucuyu başlatın**
   ```bash
   npm start
   ```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorunlarınız için GitHub Issues kullanın veya iletişime geçin. 