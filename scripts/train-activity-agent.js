const fs = require('fs');
const path = require('path');

// Eğitim fonksiyonları
class ActivityAgentTrainer {
  constructor() {
    this.dataset = [];
    this.trainedData = {};
    this.categories = {};
    this.ageGroups = {};
    this.difficultyLevels = {};
  }

  // Dataset'i yükle
  loadDataset() {
    try {
      const datasetPath = path.join(process.cwd(), 'data', 'activities-full-dataset.json');
      const datasetContent = fs.readFileSync(datasetPath, 'utf-8');
      this.dataset = JSON.parse(datasetContent);
      console.log(`✅ Dataset yüklendi: ${this.dataset.length} aktivite`);
      return true;
    } catch (error) {
      console.error('❌ Dataset yüklenirken hata:', error);
      return false;
    }
  }

  // Kategorileri analiz et
  analyzeCategories() {
    console.log('\n📊 Kategori Analizi...');
    
    this.dataset.forEach(activity => {
      // Aktivite tipi analizi
      if (!this.categories[activity.type]) {
        this.categories[activity.type] = {
          count: 0,
          activities: [],
          avgDifficulty: 0,
          ageRanges: []
        };
      }
      this.categories[activity.type].count++;
      this.categories[activity.type].activities.push(activity);
      this.categories[activity.type].ageRanges.push(activity.ageRange);

      // Yaş grubu analizi
      const avgAge = (activity.ageRange.min + activity.ageRange.max) / 2;
      const ageGroup = this.getAgeGroup(avgAge);
      if (!this.ageGroups[ageGroup]) {
        this.ageGroups[ageGroup] = {
          count: 0,
          activities: [],
          types: {}
        };
      }
      this.ageGroups[ageGroup].count++;
      this.ageGroups[ageGroup].activities.push(activity);
      
      if (!this.ageGroups[ageGroup].types[activity.type]) {
        this.ageGroups[ageGroup].types[activity.type] = 0;
      }
      this.ageGroups[ageGroup].types[activity.type]++;

      // Zorluk seviyesi analizi
      if (!this.difficultyLevels[activity.difficulty]) {
        this.difficultyLevels[activity.difficulty] = {
          count: 0,
          activities: [],
          avgAge: 0
        };
      }
      this.difficultyLevels[activity.difficulty].count++;
      this.difficultyLevels[activity.difficulty].activities.push(activity);
    });

    // Ortalama zorluk hesapla
    Object.keys(this.categories).forEach(type => {
      const difficulties = this.categories[type].activities.map(a => 
        a.difficulty === 'easy' ? 1 : a.difficulty === 'medium' ? 2 : 3
      );
      this.categories[type].avgDifficulty = 
        difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    });

    // Ortalama yaş hesapla
    Object.keys(this.difficultyLevels).forEach(difficulty => {
      const ages = this.difficultyLevels[difficulty].activities.map(a => 
        (a.ageRange.min + a.ageRange.max) / 2
      );
      this.difficultyLevels[difficulty].avgAge = 
        ages.reduce((a, b) => a + b, 0) / ages.length;
    });

    this.printAnalysis();
  }

  // Yaş grubu belirleme
  getAgeGroup(age) {
    if (age < 3) return '0-3';
    if (age < 6) return '3-6';
    if (age < 9) return '6-9';
    if (age < 12) return '9-12';
    return '12+';
  }

  // Analiz sonuçlarını yazdır
  printAnalysis() {
    console.log('\n📈 Aktivite Tipi Dağılımı:');
    Object.keys(this.categories).forEach(type => {
      const cat = this.categories[type];
      console.log(`  ${type}: ${cat.count} aktivite (${(cat.count/this.dataset.length*100).toFixed(1)}%)`);
    });

    console.log('\n👶 Yaş Grubu Dağılımı:');
    Object.keys(this.ageGroups).forEach(ageGroup => {
      const group = this.ageGroups[ageGroup];
      console.log(`  ${ageGroup}: ${group.count} aktivite (${(group.count/this.dataset.length*100).toFixed(1)}%)`);
    });

    console.log('\n🎯 Zorluk Seviyesi Dağılımı:');
    Object.keys(this.difficultyLevels).forEach(difficulty => {
      const level = this.difficultyLevels[difficulty];
      console.log(`  ${difficulty}: ${level.count} aktivite (${(level.count/this.dataset.length*100).toFixed(1)}%)`);
    });
  }

  // Eğitim verilerini oluştur
  generateTrainingData() {
    console.log('\n🤖 Eğitim Verileri Oluşturuluyor...');
    
    this.trainedData = {
      categories: this.categories,
      ageGroups: this.ageGroups,
      difficultyLevels: this.difficultyLevels,
      recommendations: this.generateRecommendations(),
      patterns: this.analyzePatterns(),
      metadata: {
        totalActivities: this.dataset.length,
        trainingDate: new Date().toISOString(),
        version: '1.0'
      }
    };

    console.log('✅ Eğitim verileri oluşturuldu');
  }

  // Öneri sistemi oluştur
  generateRecommendations() {
    const recommendations = {
      byAge: {},
      byType: {},
      byDifficulty: {},
      byTags: {}
    };

    // Yaşa göre öneriler
    Object.keys(this.ageGroups).forEach(ageGroup => {
      const group = this.ageGroups[ageGroup];
      const popularTypes = Object.entries(group.types)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([type]) => type);
      
      recommendations.byAge[ageGroup] = {
        popularTypes,
        totalActivities: group.count,
        bestActivities: group.activities.slice(0, 5)
      };
    });

    // Tipe göre öneriler
    Object.keys(this.categories).forEach(type => {
      const cat = this.categories[type];
      const avgAge = cat.ageRanges.reduce((sum, range) => 
        sum + (range.min + range.max) / 2, 0) / cat.ageRanges.length;
      
      recommendations.byType[type] = {
        avgAge: Math.round(avgAge),
        avgDifficulty: cat.avgDifficulty,
        bestActivities: cat.activities.slice(0, 5)
      };
    });

    return recommendations;
  }

  // Pattern analizi
  analyzePatterns() {
    const patterns = {
      commonMaterials: {},
      commonTags: {},
      titlePatterns: {},
      instructionPatterns: {}
    };

    // Ortak malzemeler
    this.dataset.forEach(activity => {
      activity.content.materials.forEach(material => {
        if (!patterns.commonMaterials[material]) {
          patterns.commonMaterials[material] = 0;
        }
        patterns.commonMaterials[material]++;
      });
    });

    // Ortak etiketler
    this.dataset.forEach(activity => {
      activity.tags.forEach(tag => {
        if (!patterns.commonTags[tag]) {
          patterns.commonTags[tag] = 0;
        }
        patterns.commonTags[tag]++;
      });
    });

    // En popüler malzemeler ve etiketler
    patterns.commonMaterials = Object.entries(patterns.commonMaterials)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    patterns.commonTags = Object.entries(patterns.commonTags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    return patterns;
  }

  // Eğitim verilerini kaydet
  saveTrainingData() {
    try {
      const outputPath = path.join(process.cwd(), 'data', 'trained-activity-agent.json');
      fs.writeFileSync(outputPath, JSON.stringify(this.trainedData, null, 2));
      console.log(`✅ Eğitim verileri kaydedildi: ${outputPath}`);
      return true;
    } catch (error) {
      console.error('❌ Eğitim verileri kaydedilirken hata:', error);
      return false;
    }
  }

  // Performans testi
  testPerformance() {
    console.log('\n🧪 Performans Testi...');
    
    const testCases = [
      { prompt: 'matematik', ageGroup: 8 },
      { prompt: 'renkler', ageGroup: 4 },
      { prompt: 'hayvanlar', ageGroup: 6 },
      { prompt: 'müzik', ageGroup: 10 },
      { prompt: 'bilim', ageGroup: 12 }
    ];

    testCases.forEach((testCase, index) => {
      console.log(`\nTest ${index + 1}: "${testCase.prompt}" (${testCase.ageGroup} yaş)`);
      
      const relevantActivities = this.dataset.filter(activity => {
        const titleMatch = activity.title.toLowerCase().includes(testCase.prompt.toLowerCase());
        const descriptionMatch = activity.description.toLowerCase().includes(testCase.prompt.toLowerCase());
        const tagMatch = activity.tags.some(tag => tag.toLowerCase().includes(testCase.prompt.toLowerCase()));
        const ageMatch = activity.ageRange.min <= testCase.ageGroup && activity.ageRange.max >= testCase.ageGroup;
        
        return (titleMatch || descriptionMatch || tagMatch) && ageMatch;
      });

      console.log(`  Bulunan aktivite sayısı: ${relevantActivities.length}`);
      if (relevantActivities.length > 0) {
        console.log(`  Önerilen: ${relevantActivities[0].title}`);
        console.log(`  Tip: ${relevantActivities[0].type}, Zorluk: ${relevantActivities[0].difficulty}`);
      }
    });
  }

  // Eğitim sürecini başlat
  train() {
    console.log('🚀 Etkinlik Agentı Eğitimi Başlıyor...\n');
    
    if (!this.loadDataset()) {
      return false;
    }

    this.analyzeCategories();
    this.generateTrainingData();
    this.testPerformance();
    
    if (this.saveTrainingData()) {
      console.log('\n🎉 Eğitim başarıyla tamamlandı!');
      console.log('\n📋 Özet:');
      console.log(`  - Toplam aktivite: ${this.dataset.length}`);
      console.log(`  - Kategori sayısı: ${Object.keys(this.categories).length}`);
      console.log(`  - Yaş grubu sayısı: ${Object.keys(this.ageGroups).length}`);
      console.log(`  - Zorluk seviyesi: ${Object.keys(this.difficultyLevels).length}`);
      return true;
    }

    return false;
  }
}

// Eğitimi başlat
const trainer = new ActivityAgentTrainer();
trainer.train(); 