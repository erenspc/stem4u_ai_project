const mongoose = require('mongoose');

// MongoDB bağlantı URL'i
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/family-education';

async function initDatabase() {
  try {
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı!');
    
    // Veritabanı durumunu kontrol et
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Mevcut koleksiyonlar:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    if (collections.length === 0) {
      console.log('\n📝 Veritabanı boş. İlk veriler oluşturulabilir.');
    }
    
    console.log('\n🎉 Veritabanı hazır!');
    
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Bağlantı kapatıldı.');
  }
}

// Script çalıştırılırsa
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase; 