const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/family-education';

// Basit şemalar oluştur
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['parent', 'child', 'teacher'], required: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  preferences: {
    age: Number,
    interests: [String],
    learningLevel: String
  }
}, { timestamps: true });

const FamilySchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  settings: {
    privacy: { type: String, enum: ['public', 'private'], default: 'private' },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['game', 'quiz', 'lesson', 'exercise'], required: true },
  ageRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  content: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    materials: [String],
    instructions: String
  },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Family = mongoose.model('Family', FamilySchema);
const Activity = mongoose.model('Activity', ActivitySchema);

async function seedData() {
  try {
    console.log('🌱 Örnek veriler ekleniyor...');
    await mongoose.connect(MONGODB_URI);

    // Mevcut verileri temizle
    await User.deleteMany({});
    await Family.deleteMany({});
    await Activity.deleteMany({});

    console.log('📝 Veriler temizlendi.');

    // Örnek kullanıcılar oluştur
    const parent1 = new User({
      email: 'anne@example.com',
      name: 'Anne Yılmaz',
      role: 'parent',
      preferences: {
        age: 35,
        interests: ['eğitim', 'çocuk gelişimi'],
        learningLevel: 'intermediate'
      }
    });

    const child1 = new User({
      email: 'ahmet@example.com',
      name: 'Ahmet Yılmaz',
      role: 'child',
      preferences: {
        age: 8,
        interests: ['matematik', 'oyunlar'],
        learningLevel: 'beginner'
      }
    });

    const teacher1 = new User({
      email: 'ogretmen@example.com',
      name: 'Ayşe Öğretmen',
      role: 'teacher',
      preferences: {
        age: 28,
        interests: ['eğitim', 'teknoloji'],
        learningLevel: 'advanced'
      }
    });

    await parent1.save();
    await child1.save();
    await teacher1.save();

    console.log('👥 Kullanıcılar oluşturuldu.');

    // Örnek aile oluştur
    const family1 = new Family({
      name: 'Yılmaz Ailesi',
      members: [parent1._id, child1._id],
      settings: {
        privacy: 'private',
        notifications: true
      }
    });

    await family1.save();

    // Aile ID'lerini kullanıcılara ekle
    parent1.familyId = family1._id;
    child1.familyId = family1._id;
    await parent1.save();
    await child1.save();

    console.log('👨‍👩‍👧‍👦 Aile oluşturuldu.');

    // Örnek aktiviteler oluştur
    const activity1 = new Activity({
      title: 'Matematik Oyunu',
      description: 'Çocuklar için eğlenceli matematik oyunu',
      type: 'game',
      ageRange: { min: 6, max: 10 },
      difficulty: 'easy',
      content: {
        instructions: 'Sayıları toplayarak doğru cevabı bulun!',
        materials: ['kalem', 'kağıt']
      },
      tags: ['matematik', 'oyun', 'eğlenceli'],
      createdBy: teacher1._id,
      isActive: true
    });

    const activity2 = new Activity({
      title: 'Hayvanlar Quiz',
      description: 'Hayvanlar hakkında bilgi testi',
      type: 'quiz',
      ageRange: { min: 5, max: 12 },
      difficulty: 'medium',
      content: {
        questions: [
          {
            question: 'Hangi hayvan en hızlı koşar?',
            options: ['Aslan', 'Çita', 'Kaplan', 'Leopar'],
            correctAnswer: 1,
            explanation: 'Çita dünyanın en hızlı kara hayvanıdır.'
          },
          {
            question: 'Penguenler nerede yaşar?',
            options: ['Sıcak ülkeler', 'Soğuk ülkeler', 'Çöller', 'Ormanlar'],
            correctAnswer: 1,
            explanation: 'Penguenler soğuk iklimlerde yaşar.'
          }
        ]
      },
      tags: ['hayvanlar', 'quiz', 'bilgi'],
      createdBy: teacher1._id,
      isActive: true
    });

    const activity3 = new Activity({
      title: 'Renkler Dersi',
      description: 'Temel renkleri öğrenme aktivitesi',
      type: 'lesson',
      ageRange: { min: 3, max: 6 },
      difficulty: 'easy',
      content: {
        instructions: 'Renkleri gösterilen nesnelerle eşleştirin.',
        materials: ['renkli kalemler', 'resimler']
      },
      tags: ['renkler', 'ders', 'temel'],
      createdBy: teacher1._id,
      isActive: true
    });

    await activity1.save();
    await activity2.save();
    await activity3.save();

    console.log('🎯 Aktiviteler oluşturuldu.');

    // Sonuçları göster
    const userCount = await User.countDocuments();
    const familyCount = await Family.countDocuments();
    const activityCount = await Activity.countDocuments();

    console.log('\n📊 Veritabanı Durumu:');
    console.log(`  👥 Kullanıcılar: ${userCount}`);
    console.log(`  👨‍👩‍👧‍👦 Aileler: ${familyCount}`);
    console.log(`  🎯 Aktiviteler: ${activityCount}`);

    console.log('\n✅ Örnek veriler başarıyla eklendi!');
    console.log('\n🔗 Test için:');
    console.log('  - Kullanıcılar: http://localhost:3000/api/users');
    console.log('  - Aktiviteler: http://localhost:3000/api/activities');
    console.log('  - Aileler: http://localhost:3000/api/families');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Bağlantı kapatıldı.');
  }
}

// Script çalıştırılırsa
if (require.main === module) {
  seedData();
}

module.exports = seedData; 