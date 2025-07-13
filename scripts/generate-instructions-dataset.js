const fs = require('fs');
const path = require('path');

// Talimat şablonları ve varyasyonları
const instructionTemplates = {
  // Oyun aktiviteleri için talimatlar
  game: {
    basic: [
      "1. Malzemeleri hazırlayın ve güvenli bir alan oluşturun\n2. Oyun kurallarını açıklayın\n3. Oyuna başlayın ve eğlenin\n4. Sonuçları değerlendirin ve öğrendiklerinizi paylaşın",
      "1. Oyun alanını hazırlayın\n2. Oyuncuları gruplandırın\n3. Kuralları tekrar edin\n4. Oyunu başlatın ve rehberlik edin",
      "1. Gerekli malzemeleri toplayın\n2. Oyun ortamını düzenleyin\n3. Adım adım talimatları takip edin\n4. Başarıları kutlayın ve öğrenmeyi pekiştirin"
    ],
    educational: [
      "1. Öğrenme hedefini belirleyin\n2. Oyunu adım adım açıklayın\n3. Aktif katılımı teşvik edin\n4. Öğrenilen kavramları tekrar edin",
      "1. Konuyu tanıtın ve ilgi uyandırın\n2. Oyun kurallarını net bir şekilde anlatın\n3. Her adımda rehberlik edin\n4. Öğrenmeyi değerlendirin ve pekiştirin",
      "1. Ön bilgileri hatırlatın\n2. Oyunu eğlenceli bir şekilde başlatın\n3. Öğrenme anlarını yakalayın\n4. Sonuçları birlikte değerlendirin"
    ],
    creative: [
      "1. Yaratıcılığı teşvik eden malzemeleri hazırlayın\n2. Serbest keşif için zaman tanıyın\n3. Fikirleri destekleyin ve geliştirin\n4. Yaratıcı süreçleri takdir edin",
      "1. Hayal gücünü harekete geçirin\n2. Farklı yaklaşımları deneyin\n3. Yaratıcı çözümleri ödüllendirin\n4. Deneyimleri paylaşın ve öğrenin",
      "1. Yaratıcı düşünmeyi destekleyin\n2. Risk almayı teşvik edin\n3. Benzersiz fikirleri takdir edin\n4. Yaratıcı süreçleri belgeleyin"
    ]
  },

  // Quiz aktiviteleri için talimatlar
  quiz: {
    preparation: [
      "1. Quiz konusunu gözden geçirin\n2. Soruları dikkatlice okuyun\n3. Seçenekleri analiz edin\n4. En doğru cevabı seçin",
      "1. Konu hakkında ön bilgilerinizi hatırlayın\n2. Her soruyu anlayarak okuyun\n3. Mantıklı düşünerek cevaplayın\n4. Sonuçlarınızı kontrol edin",
      "1. Quiz öncesi konuyu tekrar edin\n2. Soruları sırayla çözün\n3. Zor soruları sona bırakın\n4. Cevap anahtarını inceleyin"
    ],
    interactive: [
      "1. Quiz'i grup halinde çözün\n2. Her soru için tartışın\n3. Farklı görüşleri dinleyin\n4. Doğru cevapları birlikte öğrenin",
      "1. Soruları sırayla okuyun\n2. Herkesin cevabını alın\n3. Yanlış cevapları açıklayın\n4. Öğrenmeyi pekiştirin",
      "1. Quiz'i eğlenceli bir yarışma haline getirin\n2. Puan sistemi kullanın\n3. Başarıları kutlayın\n4. Öğrenilen konuları tekrar edin"
    ],
    assessment: [
      "1. Quiz sonuçlarını analiz edin\n2. Zayıf alanları belirleyin\n3. Gelişim planı oluşturun\n4. Tekrar çalışma yapın",
      "1. Doğru ve yanlış cevapları inceleyin\n2. Hata nedenlerini anlayın\n3. Eksik bilgileri tamamlayın\n4. Başarıyı artırın",
      "1. Quiz performansını değerlendirin\n2. Öğrenme hedeflerini gözden geçirin\n3. Gelişim alanlarını belirleyin\n4. Sürekli iyileştirme yapın"
    ]
  },

  // Ders aktiviteleri için talimatlar
  lesson: {
    introduction: [
      "1. Konuyu ilgi çekici bir şekilde tanıtın\n2. Ön bilgileri hatırlatın\n3. Öğrenme hedeflerini belirtin\n4. Aktif katılımı teşvik edin",
      "1. Konuyla ilgili merak uyandırın\n2. Günlük hayattan örnekler verin\n3. Öğrenme sürecini planlayın\n4. Sorular sormayı teşvik edin",
      "1. Konunun önemini vurgulayın\n2. İlgi çekici materyaller kullanın\n3. Öğrenme yolculuğunu başlatın\n4. Katılımı destekleyin"
    ],
    development: [
      "1. Konuyu adım adım açıklayın\n2. Görsel materyaller kullanın\n3. Etkileşimli örnekler verin\n4. Anlayışı kontrol edin",
      "1. Karmaşık konuları basitleştirin\n2. Pratik örneklerle destekleyin\n3. Aktif öğrenmeyi teşvik edin\n4. Geri bildirim alın",
      "1. Konuyu farklı açılardan ele alın\n2. Çeşitli öğrenme stillerini destekleyin\n3. Anlayışı derinleştirin\n4. Öğrenmeyi pekiştirin"
    ],
    conclusion: [
      "1. Öğrenilen konuları özetleyin\n2. Anahtar kavramları tekrar edin\n3. Pratik uygulamaları gösterin\n4. Sonraki adımları planlayın",
      "1. Öğrenme hedeflerini değerlendirin\n2. Önemli noktaları vurgulayın\n3. Günlük hayata bağlantı kurun\n4. Gelecek öğrenmelere hazırlayın",
      "1. Öğrenme sürecini değerlendirin\n2. Başarıları kutlayın\n3. Gelişim alanlarını belirleyin\n4. Sürekli öğrenmeyi teşvik edin"
    ]
  },

  // Egzersiz aktiviteleri için talimatlar
  exercise: {
    physical: [
      "1. Isınma hareketleri yapın\n2. Egzersizi adım adım uygulayın\n3. Güvenliği ön planda tutun\n4. Sonuçları değerlendirin",
      "1. Vücudunuzu hazırlayın\n2. Hareketleri doğru şekilde yapın\n3. Kendi sınırlarınızı bilin\n4. Düzenli tekrar yapın",
      "1. Egzersiz öncesi hazırlık yapın\n2. Teknikleri öğrenin\n3. Güvenli bir şekilde uygulayın\n4. İlerlemeyi takip edin"
    ],
    mental: [
      "1. Odaklanmayı artırın\n2. Zihinsel egzersizleri uygulayın\n3. Konsantrasyonu geliştirin\n4. Sonuçları gözlemleyin",
      "1. Zihinsel hazırlık yapın\n2. Egzersizleri dikkatle uygulayın\n3. Beyin gücünüzü geliştirin\n4. Sürekli pratik yapın",
      "1. Zihinsel durumunuzu hazırlayın\n2. Egzersizleri sistematik uygulayın\n3. Kognitif becerileri geliştirin\n4. İlerlemeyi değerlendirin"
    ],
    creative: [
      "1. Yaratıcı düşünmeyi teşvik edin\n2. Farklı yaklaşımları deneyin\n3. Orijinal fikirler geliştirin\n4. Yaratıcılığı destekleyin",
      "1. Hayal gücünüzü kullanın\n2. Yenilikçi çözümler bulun\n3. Yaratıcı süreçleri keşfedin\n4. Benzersiz sonuçlar elde edin",
      "1. Yaratıcı potansiyelinizi açığa çıkarın\n2. Farklı perspektiflerden bakın\n3. İnovatif yaklaşımlar geliştirin\n4. Yaratıcılığı sürdürün"
    ]
  }
};

// Yaş grubuna göre talimat karmaşıklığı
const ageComplexity = {
  '1-sinif': {
    maxSteps: 4,
    language: 'anlaşılır',
    detail: 'temel'
  },
  '2-sinif': {
    maxSteps: 5,
    language: 'açık',
    detail: 'orta'
  },
  '3-sinif': {
    maxSteps: 6,
    language: 'detaylı',
    detail: 'gelişmiş'
  },
  '4-sinif': {
    maxSteps: 7,
    language: 'kapsamlı',
    detail: 'ileri'
  }
};

// Zorluk seviyesine göre talimat detayı
const difficultyDetail = {
  easy: {
    explanation: 'basit',
    examples: 'çok',
    support: 'yüksek'
  },
  medium: {
    explanation: 'orta',
    examples: 'orta',
    support: 'orta'
  },
  hard: {
    explanation: 'detaylı',
    examples: 'az',
    support: 'düşük'
  }
};

// Talimat varyasyonları
const instructionVariations = {
  starters: [
    "Başlamak için:",
    "İlk olarak:",
    "Öncelikle:",
    "Başlangıçta:",
    "Hazırlık aşamasında:",
    "Giriş olarak:"
  ],
  connectors: [
    "Sonrasında:",
    "Ardından:",
    "Daha sonra:",
    "Devam ederek:",
    "Sıradaki adım:",
    "İlerleyerek:"
  ],
  finishers: [
    "Son olarak:",
    "Sonuç olarak:",
    "Tamamlamak için:",
    "Bitirmek üzere:",
    "Final adımı:",
    "Özetle:"
  ],
  encouragements: [
    "Harika!",
    "Mükemmel!",
    "Çok iyi!",
    "Devam edin!",
    "Başarılı!",
    "Süper!"
  ],
  safety: [
    "Güvenliğinizi unutmayın",
    "Dikkatli olun",
    "Yavaş ve kontrollü hareket edin",
    "Gerekirse yardım isteyin",
    "Kendi sınırlarınızı bilin",
    "Güvenlik önceliğiniz olsun"
  ]
};

// Rastgele seçim fonksiyonu
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Rastgele sayı üretme
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Yaş grubunu belirleme
function getAgeGroup(age) {
  if (age >= 6 && age <= 7) return '1-sinif';
  if (age >= 7 && age <= 8) return '2-sinif';
  if (age >= 8 && age <= 9) return '3-sinif';
  if (age >= 9 && age <= 10) return '4-sinif';
  return '1-sinif'; // varsayılan
}

// Talimat oluşturma fonksiyonu
function generateInstruction(activityType, age, difficulty, topic) {
  const ageGroup = getAgeGroup(age);
  const complexity = ageComplexity[ageGroup];
  const detail = difficultyDetail[difficulty];
  
  // Temel talimat şablonunu seç
  let baseTemplate;
  if (activityType === 'game') {
    baseTemplate = getRandomElement(instructionTemplates.game[getRandomElement(['basic', 'educational', 'creative'])]);
  } else if (activityType === 'quiz') {
    baseTemplate = getRandomElement(instructionTemplates.quiz[getRandomElement(['preparation', 'interactive', 'assessment'])]);
  } else if (activityType === 'lesson') {
    baseTemplate = getRandomElement(instructionTemplates.lesson[getRandomElement(['introduction', 'development', 'conclusion'])]);
  } else if (activityType === 'exercise') {
    baseTemplate = getRandomElement(instructionTemplates.exercise[getRandomElement(['physical', 'mental', 'creative'])]);
  }
  
  // Talimatı yaş ve zorluk seviyesine göre uyarla
  let adaptedInstruction = baseTemplate;
  
  // Yaş grubuna göre uyarlama
  if (ageGroup === '1-sinif') {
    adaptedInstruction = adaptedInstruction.replace(/\d+\./g, '');
    adaptedInstruction = adaptedInstruction.replace(/\n/g, ' ');
    adaptedInstruction = adaptedInstruction.replace(/\./g, ' ve ');
  } else if (ageGroup === '2-sinif') {
    adaptedInstruction = adaptedInstruction.replace(/\d+\./g, (match, index) => {
      return `${getRandomElement(instructionVariations.starters)} `;
    });
  } else if (ageGroup === '3-sinif') {
    adaptedInstruction = adaptedInstruction.replace(/\d+\./g, (match, index) => {
      if (index === 0) return `${getRandomElement(instructionVariations.starters)} `;
      if (index === adaptedInstruction.split('\n').length - 1) return `${getRandomElement(instructionVariations.finishers)} `;
      return `${getRandomElement(instructionVariations.connectors)} `;
    });
  } else {
    // 4. sınıf için daha detaylı talimatlar
    adaptedInstruction = adaptedInstruction.replace(/\d+\./g, (match, index) => {
      if (index === 0) return `${getRandomElement(instructionVariations.starters)} `;
      if (index === adaptedInstruction.split('\n').length - 1) return `${getRandomElement(instructionVariations.finishers)} `;
      return `${getRandomElement(instructionVariations.connectors)} `;
    });
    
    // Zorluk seviyesine göre ek detaylar
    if (difficulty === 'hard') {
      adaptedInstruction += `\n\nNot: ${getRandomElement(instructionVariations.safety)}`;
    }
  }
  
  // Konuya özel eklemeler
  if (topic) {
    const topicSpecific = [
      `${topic} konusunda dikkatli olun`,
      `${topic} ile ilgili özel kuralları unutmayın`,
      `${topic} konusunda deneyimli birinden yardım alın`,
      `${topic} için gerekli önlemleri alın`
    ];
    
    if (ageGroup === '3-sinif' || ageGroup === '4-sinif') {
      adaptedInstruction += `\n\n${getRandomElement(topicSpecific)}`;
    }
  }
  
  // Teşvik mesajları ekle
  if (ageGroup !== '1-sinif') {
    const encouragement = getRandomElement(instructionVariations.encouragements);
    adaptedInstruction = adaptedInstruction.replace(/\.$/, `\n\n${encouragement} Başarılar!`);
  }
  
  return adaptedInstruction;
}

// Dataset oluşturma fonksiyonu
function generateInstructionsDataset() {
  const instructions = [];
  
  // Her aktivite tipi için talimatlar oluştur
  const activityTypes = ['game', 'quiz', 'lesson', 'exercise'];
  const ageGroups = [6, 7, 8, 9, 10]; // 1. sınıftan 4. sınıfa
  const difficulties = ['easy', 'medium', 'hard'];
  const topics = ['matematik', 'fen', 'türkçe', 'sosyal', 'sanat', 'müzik', 'spor', 'bilim', 'teknoloji', 'doğa'];
  
  // Her kombinasyon için talimat oluştur
  activityTypes.forEach(type => {
    ageGroups.forEach(age => {
      difficulties.forEach(difficulty => {
        topics.forEach(topic => {
          // Her kombinasyon için 2-3 farklı talimat oluştur
          for (let i = 0; i < getRandomInt(2, 3); i++) {
            const instruction = generateInstruction(type, age, difficulty, topic);
            
            instructions.push({
              id: `inst_${instructions.length + 1}`,
              type: type,
              ageGroup: getAgeGroup(age),
              age: age,
              difficulty: difficulty,
              topic: topic,
              instruction: instruction,
              metadata: {
                complexity: ageComplexity[getAgeGroup(age)],
                detail: difficultyDetail[difficulty],
                generatedAt: new Date().toISOString(),
                version: '1.0'
              }
            });
          }
        });
      });
    });
  });
  
  return instructions;
}

// Ana fonksiyon
function main() {
  console.log('🚀 Talimat Dataset\'i Oluşturuluyor...\n');
  
  const instructions = generateInstructionsDataset();
  
  // data klasörünü oluştur (eğer yoksa)
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Dataset'i kaydet
  const outputPath = path.join(dataDir, 'instructions-dataset.json');
  fs.writeFileSync(outputPath, JSON.stringify(instructions, null, 2));
  
  console.log(`✅ ${instructions.length} talimat başarıyla oluşturuldu!`);
  console.log(`📁 Dataset kaydedildi: ${outputPath}`);
  
  // İstatistikler
  console.log('\n📊 İstatistikler:');
  const typeStats = {};
  const ageStats = {};
  const difficultyStats = {};
  
  instructions.forEach(inst => {
    typeStats[inst.type] = (typeStats[inst.type] || 0) + 1;
    ageStats[inst.ageGroup] = (ageStats[inst.ageGroup] || 0) + 1;
    difficultyStats[inst.difficulty] = (difficultyStats[inst.difficulty] || 0) + 1;
  });
  
  console.log('\n🎮 Aktivite Tipi Dağılımı:');
  Object.keys(typeStats).forEach(type => {
    console.log(`  ${type}: ${typeStats[type]} talimat`);
  });
  
  console.log('\n👶 Yaş Grubu Dağılımı:');
  Object.keys(ageStats).forEach(ageGroup => {
    console.log(`  ${ageGroup}: ${ageStats[ageGroup]} talimat`);
  });
  
  console.log('\n🎯 Zorluk Seviyesi Dağılımı:');
  Object.keys(difficultyStats).forEach(difficulty => {
    console.log(`  ${difficulty}: ${difficultyStats[difficulty]} talimat`);
  });
  
  console.log(`\n📝 Toplam Talimat: ${instructions.length}`);
}

// Script'i çalıştır
main(); 