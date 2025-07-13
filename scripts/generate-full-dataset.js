const fs = require('fs');
const path = require('path');

// Temel etkinlik şablonları
const activityTemplates = [
  {
    baseTitle: "Sayı Öğrenme",
    baseDescription: "Sayıları öğrenme ve sayma becerilerini geliştirme",
    type: "game",
    difficulty: "easy",
    tags: ["matematik", "sayılar", "temel beceriler"],
    materials: ["kalem", "kağıt", "sayı kartları", "nesneler"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Renk Tanıma",
    baseDescription: "Renkleri öğrenme ve tanıma aktivitesi",
    type: "game",
    difficulty: "easy",
    tags: ["renkler", "görsel algı", "temel"],
    materials: ["renkli kağıtlar", "boya", "renkli kalemler"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Harf Öğrenme",
    baseDescription: "Harfleri öğrenme ve ses-harf ilişkisi",
    type: "lesson",
    difficulty: "medium",
    tags: ["okuma yazma", "alfabe", "dil gelişimi"],
    materials: ["alfabe kartları", "kağıt", "kalem", "mıknatıslı harfler"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Şekil Çizme",
    baseDescription: "Geometrik şekilleri öğrenme ve çizme",
    type: "exercise",
    difficulty: "easy",
    tags: ["geometri", "şekiller", "çizim"],
    materials: ["kağıt", "kalem", "şekil şablonları"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Hafıza Oyunu",
    baseDescription: "Görsel hafıza ve konsantrasyon geliştirme",
    type: "game",
    difficulty: "medium",
    tags: ["hafıza", "konsantrasyon", "bilişsel gelişim"],
    materials: ["hafıza kartları", "masa", "zamanlayıcı"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Müzik ve Ritim",
    baseDescription: "Müzik duygusu ve ritim becerileri",
    type: "game",
    difficulty: "easy",
    tags: ["müzik", "ritim", "sanat"],
    materials: ["davul", "kaşık", "müzik çalar"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Hikaye Anlatma",
    baseDescription: "Hayal gücü ve dil becerileri geliştirme",
    type: "lesson",
    difficulty: "medium",
    tags: ["dil gelişimi", "hayal gücü", "yaratıcılık"],
    materials: ["resimler", "kağıt", "kalem", "kayıt cihazı"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Bilim Deneyi",
    baseDescription: "Bilimsel düşünme ve deney yapma",
    type: "exercise",
    difficulty: "medium",
    tags: ["bilim", "deney", "gözlem"],
    materials: ["su", "kap", "termometre", "güneş ışığı"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Matematik Quiz",
    baseDescription: "Matematik problemlerini çözme",
    type: "quiz",
    difficulty: "hard",
    tags: ["matematik", "problem çözme", "test"],
    materials: ["kağıt", "kalem", "hesap makinesi"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Duygu Tanıma",
    baseDescription: "Duyguları tanıma ve ifade etme",
    type: "game",
    difficulty: "easy",
    tags: ["duygusal gelişim", "sosyal beceriler", "empati"],
    materials: ["duygu kartları", "ayna", "resimler"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Kodlama Temelleri",
    baseDescription: "Algoritma düşünme ve kodlama mantığı",
    type: "lesson",
    difficulty: "hard",
    tags: ["kodlama", "algoritma", "teknoloji"],
    materials: ["komut kartları", "oyuncak robot", "bilgisayar"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Çevre Eğitimi",
    baseDescription: "Çevre koruma ve sürdürülebilirlik",
    type: "lesson",
    difficulty: "medium",
    tags: ["çevre", "geri dönüşüm", "doğa"],
    materials: ["geri dönüşüm kutuları", "atık malzemeler", "resimler"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Yoga Egzersizleri",
    baseDescription: "Fiziksel ve zihinsel sağlık",
    type: "exercise",
    difficulty: "easy",
    tags: ["yoga", "sağlık", "fiziksel gelişim"],
    materials: ["yoga matı", "rahat kıyafetler", "müzik"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Coğrafya Keşfi",
    baseDescription: "Dünya ve ülkeleri öğrenme",
    type: "lesson",
    difficulty: "medium",
    tags: ["coğrafya", "dünya", "kültür"],
    materials: ["dünya haritası", "atlas", "bayraklar"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Sanat Aktivitesi",
    baseDescription: "Yaratıcılık ve sanat becerileri",
    type: "exercise",
    difficulty: "easy",
    tags: ["sanat", "yaratıcılık", "el sanatları"],
    materials: ["boya", "fırça", "kağıt", "makas"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Fen Bilgisi Testi",
    baseDescription: "Fen bilgisi konularını test etme",
    type: "quiz",
    difficulty: "medium",
    tags: ["fen bilgisi", "bilim", "test"],
    materials: ["quiz kağıdı", "kalem", "fen kitabı"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Sosyal Beceriler",
    baseDescription: "İletişim ve sosyal etkileşim",
    type: "game",
    difficulty: "medium",
    tags: ["sosyal beceriler", "iletişim", "grup"],
    materials: ["rol yapma kartları", "oyuncaklar", "maske"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Mantık Bulmacası",
    baseDescription: "Mantık ve problem çözme",
    type: "exercise",
    difficulty: "hard",
    tags: ["mantık", "bulmaca", "problem çözme"],
    materials: ["bulmaca kitapları", "kağıt", "kalem"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Spor Aktivitesi",
    baseDescription: "Fiziksel gelişim ve koordinasyon",
    type: "exercise",
    difficulty: "easy",
    tags: ["spor", "fiziksel gelişim", "koordinasyon"],
    materials: ["top", "ip", "koni", "spor ekipmanları"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  },
  {
    baseTitle: "Dil Öğrenme",
    baseDescription: "Yabancı dil öğrenme ve pratik",
    type: "lesson",
    difficulty: "medium",
    tags: ["dil öğrenme", "yabancı dil", "kültür"],
    materials: ["dil kartları", "sözlük", "video", "müzik"],
    ageRanges: [{min: 6, max: 7}, {min: 7, max: 8}, {min: 8, max: 9}, {min: 9, max: 10}]
  }
];

// Varyasyonlar için kelime listeleri
const variations = {
  adjectives: ["Eğlenceli", "Yaratıcı", "Müthiş", "Harika", "Süper", "Muhteşem", "Büyüleyici", "İlginç", "Heyecanlı", "Renkli", "Dinamik", "İnteraktif", "Eğitici", "Öğretici", "Geliştirici", "Stimüle edici", "Motivasyonel", "İnovatif", "Modern", "Klasik"],
  nouns: ["Oyunu", "Aktivitesi", "Deneyimi", "Macerası", "Keşfi", "Yolculuğu", "Dünyası", "Sihri", "Gücü", "Hikayesi", "Mücadelesi", "Yarışması", "Festivali", "Partisi", "Şenliği", "Buluşması", "Karşılaşması", "Düellosu", "Turnuvası", "Maratonu"],
  topics: ["Sayılar", "Renkler", "Harfler", "Şekiller", "Hayvanlar", "Bitkiler", "Mevsimler", "Hava Durumu", "Meslekler", "Araçlar", "Yiyecekler", "İçecekler", "Kıyafetler", "Ev Eşyaları", "Oyuncaklar", "Sporlar", "Müzik", "Sanat", "Bilim", "Teknoloji"],
  actions: ["Öğrenme", "Keşfetme", "Tanıma", "Anlama", "Çözme", "Bulma", "Yaratma", "Geliştirme", "Güçlendirme", "İyileştirme", "Mükemmelleştirme", "Hızlandırma", "Kolaylaştırma", "Eğlendirme", "Motivasyon", "İlham", "Heyecan", "Merak", "Beceri", "Yetenek"]
};

// Talimat şablonları
const instructionTemplates = [
  "1. Malzemeleri hazırlayın\n2. Adım adım talimatları takip edin\n3. Sonucu gözlemleyin\n4. Öğrendiklerinizi paylaşın",
  "1. Başlangıç seviyesinden başlayın\n2. Zorluk seviyesini kademeli artırın\n3. Başarılarınızı kutlayın\n4. Yeni şeyler deneyin",
  "1. Güvenli bir ortam hazırlayın\n2. Malzemeleri kontrol edin\n3. Dikkatli bir şekilde ilerleyin\n4. Sonuçları değerlendirin",
  "1. Konuyu anlayın\n2. Pratik yapın\n3. Hatalarınızdan öğrenin\n4. Sürekli gelişin",
  "1. Sabırlı olun\n2. Adım adım ilerleyin\n3. Yardım isteyin\n4. Başarılarınızı paylaşın"
];

// Soru şablonları (quiz tipi aktiviteler için)
const questionTemplates = [
  {
    question: "Bu aktivitede en önemli kural nedir?",
    options: ["Hızlı olmak", "Dikkatli olmak", "Sessiz olmak", "Güçlü olmak"],
    correctAnswer: 1,
    explanation: "Dikkatli olmak başarı için en önemli kuraldır"
  },
  {
    question: "Hangi malzeme en çok kullanılır?",
    options: ["Kalem", "Kağıt", "Makas", "Yapıştırıcı"],
    correctAnswer: 1,
    explanation: "Kağıt en temel ve çok kullanılan malzemedir"
  }
];

// Rastgele seçim fonksiyonu
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Rastgele sayı üretme
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Aktivite oluşturma fonksiyonu
function generateActivity(template, index) {
  const adjective = getRandomElement(variations.adjectives);
  const noun = getRandomElement(variations.nouns);
  const topic = getRandomElement(variations.topics);
  const action = getRandomElement(variations.actions);
  
  const title = `${adjective} ${template.baseTitle} ${noun}`;
  const description = `${topic} ${action} ${template.baseDescription.toLowerCase()}`;
  
  const ageRange = getRandomElement(template.ageRanges);
  const instruction = getRandomElement(instructionTemplates);
  
  // Malzemeleri rastgele seç ve karıştır
  const baseMaterials = [...template.materials];
  const extraMaterials = ["kağıt", "kalem", "makas", "yapıştırıcı", "boya", "fırça", "resimler", "kartlar"];
  const allMaterials = [...baseMaterials, ...extraMaterials.slice(0, getRandomInt(1, 3))];
  
  // Tags'leri genişlet
  const extraTags = ["eğlenceli", "öğretici", "geliştirici", "yaratıcı", "interaktif"];
  const tags = [...template.tags, ...extraTags.slice(0, getRandomInt(1, 2))];
  
  // Quiz tipi için sorular ekle
  const questions = template.type === 'quiz' ? questionTemplates : [];
  
  return {
    title,
    description,
    type: template.type,
    ageRange,
    difficulty: template.difficulty,
    content: {
      instructions: instruction,
      materials: allMaterials,
      questions
    },
    tags
  };
}

// Ana dataset oluşturma fonksiyonu
function generateFullDataset() {
  const activities = [];
  
  // Her template için 100 aktivite oluştur (20 template x 100 = 2000)
  activityTemplates.forEach((template, templateIndex) => {
    for (let i = 0; i < 100; i++) {
      const activity = generateActivity(template, templateIndex * 100 + i);
      activities.push(activity);
    }
  });
  
  return activities;
}

// Dataset'i oluştur ve kaydet
const fullDataset = generateFullDataset();

// data klasörünü oluştur (eğer yoksa)
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Dataset'i kaydet
const outputPath = path.join(dataDir, 'activities-full-dataset.json');
fs.writeFileSync(outputPath, JSON.stringify(fullDataset, null, 2));

console.log(`✅ ${fullDataset.length} aktivite başarıyla oluşturuldu!`);
console.log(`📁 Dataset kaydedildi: ${outputPath}`);
console.log(`📊 İstatistikler:`);
console.log(`   - Toplam aktivite: ${fullDataset.length}`);
console.log(`   - Oyun tipi: ${fullDataset.filter(a => a.type === 'game').length}`);
console.log(`   - Quiz tipi: ${fullDataset.filter(a => a.type === 'quiz').length}`);
console.log(`   - Ders tipi: ${fullDataset.filter(a => a.type === 'lesson').length}`);
console.log(`   - Egzersiz tipi: ${fullDataset.filter(a => a.type === 'exercise').length}`); 