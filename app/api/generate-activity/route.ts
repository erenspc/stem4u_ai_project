import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import connectDB from '@/lib/mongodb'
import Activity from '@/lib/models/Activity'
import User from '@/lib/models/User'
import fs from 'fs'
import path from 'path'

export const maxDuration = 30

const activitySchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['game', 'quiz', 'lesson', 'exercise']),
  ageRange: z.object({
    min: z.number(),
    max: z.number()
  }),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  content: z.object({
    instructions: z.string(),
  materials: z.array(z.string()),
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.number().optional(),
      explanation: z.string().optional()
    })).optional()
  }),
  tags: z.array(z.string())
})

// Dataset'i yükle
function loadActivityDataset() {
  try {
    const datasetPath = path.join(process.cwd(), 'data', 'activities-full-dataset.json')
    const datasetContent = fs.readFileSync(datasetPath, 'utf-8')
    return JSON.parse(datasetContent)
  } catch (error) {
    console.error('Dataset yüklenirken hata:', error)
    return []
  }
}

// Talimat dataset'ini yükle
function loadInstructionsDataset() {
  try {
    const instructionsPath = path.join(process.cwd(), 'data', 'instructions-dataset.json')
    const instructionsContent = fs.readFileSync(instructionsPath, 'utf-8')
    return JSON.parse(instructionsContent)
  } catch (error) {
    console.error('Talimat dataset yüklenirken hata:', error)
    return []
  }
}

// Eğitilmiş agent verilerini yükle
function loadTrainedAgent() {
  try {
    const trainedPath = path.join(process.cwd(), 'data', 'trained-activity-agent.json')
    const trainedContent = fs.readFileSync(trainedPath, 'utf-8')
    return JSON.parse(trainedContent)
  } catch (error) {
    console.error('Eğitilmiş agent yüklenirken hata:', error)
    return null
  }
}

// Uygun talimat bulma fonksiyonu
function findSuitableInstruction(activityType: string, age: number, difficulty: string, topic: string, instructionsDataset: any[]) {
  const ageGroup = getAgeGroup(age)
  
  // Filtreleme kriterleri
  const suitableInstructions = instructionsDataset.filter(inst => {
    const typeMatch = inst.type === activityType
    const ageMatch = inst.ageGroup === ageGroup
    const difficultyMatch = inst.difficulty === difficulty
    const topicMatch = inst.topic.toLowerCase().includes(topic.toLowerCase()) || 
                      topic.toLowerCase().includes(inst.topic.toLowerCase())
    
    return typeMatch && ageMatch && difficultyMatch && topicMatch
  })
  
  if (suitableInstructions.length > 0) {
    // En uygun talimatı seç
    return suitableInstructions[Math.floor(Math.random() * suitableInstructions.length)]
  }
  
  // Tam eşleşme bulunamazsa, kısmi eşleşme ara
  const partialMatches = instructionsDataset.filter(inst => {
    const typeMatch = inst.type === activityType
    const ageMatch = inst.ageGroup === ageGroup
    const difficultyMatch = inst.difficulty === difficulty
    
    return typeMatch && ageMatch && difficultyMatch
  })
  
  if (partialMatches.length > 0) {
    return partialMatches[Math.floor(Math.random() * partialMatches.length)]
  }
  
  // Hiç eşleşme bulunamazsa, varsayılan talimat
  return null
}

// Gelişmiş aktivite bulma algoritması
function findSimilarActivities(prompt: string, ageGroup: number, dataset: any[], trainedAgent: any) {
  const promptLower = prompt.toLowerCase()
  const age = parseInt(ageGroup.toString()) || 8
  
  // Skorlama sistemi
  const scoredActivities = dataset.map(activity => {
    let score = 0
    
    // Başlık eşleşmesi (en yüksek puan)
    if (activity.title.toLowerCase().includes(promptLower)) {
      score += 10
    }
    
    // Açıklama eşleşmesi
    if (activity.description.toLowerCase().includes(promptLower)) {
      score += 8
    }
    
    // Etiket eşleşmesi
    const tagMatches = activity.tags.filter((tag: string) => 
      tag.toLowerCase().includes(promptLower)
    ).length
    score += tagMatches * 5
    
    // Yaş uygunluğu
    const ageMatch = activity.ageRange.min <= age && activity.ageRange.max >= age
    if (ageMatch) {
      score += 6
    } else {
      // Yaş uygun değilse puan düşür
      score -= 3
    }
    
    // Eğitilmiş agent'tan gelen öneriler
    if (trainedAgent && trainedAgent.recommendations) {
      const ageGroup = getAgeGroup(age)
      const ageRecommendations = trainedAgent.recommendations.byAge[ageGroup]
      
      if (ageRecommendations && ageRecommendations.popularTypes.includes(activity.type)) {
        score += 3
      }
    }
    
    return { activity, score }
  })
  
  // Skora göre sırala ve en iyi 5'ini döndür
  return scoredActivities
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.activity)
}

// Yaş grubu belirleme
function getAgeGroup(age: number) {
  if (age >= 6 && age <= 7) return '1-sinif'
  if (age >= 7 && age <= 8) return '2-sinif'
  if (age >= 8 && age <= 9) return '3-sinif'
  if (age >= 9 && age <= 10) return '4-sinif'
  return '1-sinif' // varsayılan
}

// Gelişmiş aktivite önerisi oluştur
function generateActivitySuggestion(prompt: string, ageGroup: number, similarActivities: any[], trainedAgent: any, instructionsDataset: any[]) {
  if (similarActivities.length === 0) {
    // Benzer aktivite bulunamazsa eğitilmiş agent'tan öneri al
    if (trainedAgent && trainedAgent.recommendations) {
      const ageGroupKey = getAgeGroup(ageGroup)
      const ageRecommendations = trainedAgent.recommendations.byAge[ageGroupKey]
      
      if (ageRecommendations && ageRecommendations.bestActivities.length > 0) {
        const bestActivity = ageRecommendations.bestActivities[0]
        
        // Uygun talimat bul
        const suitableInstruction = findSuitableInstruction(
          bestActivity.type, 
          ageGroup, 
          bestActivity.difficulty, 
          prompt, 
          instructionsDataset
        )
        
        return {
          title: `${prompt} ${bestActivity.title.split(' ').slice(1).join(' ')}`,
          description: `${prompt} konusunu öğrenmek için ${bestActivity.description}`,
          type: bestActivity.type,
          ageRange: bestActivity.ageRange,
          difficulty: bestActivity.difficulty,
          content: {
            instructions: suitableInstruction ? suitableInstruction.instruction : bestActivity.content.instructions,
            materials: bestActivity.content.materials,
            questions: bestActivity.content.questions || []
          },
          tags: [prompt.toLowerCase(), ...bestActivity.tags]
        }
      }
    }
    
    // Varsayılan aktivite
    const defaultType = 'game'
    const defaultDifficulty = ageGroup < 6 ? 'easy' : ageGroup < 10 ? 'medium' : 'hard'
    
    // Varsayılan talimat bul
    const defaultInstruction = findSuitableInstruction(
      defaultType, 
      ageGroup, 
      defaultDifficulty, 
      prompt, 
      instructionsDataset
    )
    
    return {
      title: `${prompt} Öğrenme Oyunu`,
      description: `${prompt} konusunu öğrenmek için eğlenceli bir aktivite`,
      type: defaultType,
      ageRange: {
        min: Math.max(ageGroup - 2, 3),
        max: Math.min(ageGroup + 2, 15)
      },
      difficulty: defaultDifficulty,
      content: {
        instructions: defaultInstruction ? defaultInstruction.instruction : "1. Malzemeleri hazırlayın\n2. Adım adım talimatları takip edin\n3. Sonucu gözlemleyin\n4. Öğrendiklerinizi paylaşın",
        materials: ["kağıt", "kalem", "renkli malzemeler"],
        questions: []
      },
      tags: [prompt.toLowerCase(), "eğlenceli", "öğretici"]
    }
  }
  
  // Benzer aktivitelerden en uygun olanını seç
  const baseActivity = similarActivities[0]
  
  // Uygun talimat bul
  const suitableInstruction = findSuitableInstruction(
    baseActivity.type, 
    ageGroup, 
    baseActivity.difficulty, 
    prompt, 
    instructionsDataset
  )
  
  // Eğitilmiş agent'tan gelen pattern'ları kullan
  let enhancedInstructions = suitableInstruction ? suitableInstruction.instruction : baseActivity.content.instructions
  let enhancedMaterials = [...baseActivity.content.materials]
  
  if (trainedAgent && trainedAgent.patterns) {
    // En popüler malzemeleri ekle (eğer yoksa)
    const popularMaterials = Object.keys(trainedAgent.patterns.commonMaterials).slice(0, 3)
    popularMaterials.forEach(material => {
      if (!enhancedMaterials.includes(material)) {
        enhancedMaterials.push(material)
      }
    })
  }
  
  return {
    title: `${prompt} ${baseActivity.title.split(' ').slice(1).join(' ')}`,
    description: `${prompt} konusunu öğrenmek için ${baseActivity.description}`,
    type: baseActivity.type,
    ageRange: baseActivity.ageRange,
    difficulty: baseActivity.difficulty,
    content: {
      instructions: enhancedInstructions,
      materials: enhancedMaterials,
      questions: baseActivity.content.questions || []
    },
    tags: [prompt.toLowerCase(), ...baseActivity.tags]
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, ageGroup, userId, preferences } = await req.json()

    // MongoDB'ye bağlan
    await connectDB()

    // Kullanıcı bilgilerini al (eğer userId varsa)
    let user = null
    if (userId) {
      user = await User.findById(userId).select('name role preferences')
    }

    // Dataset'leri yükle
    const dataset = loadActivityDataset()
    const instructionsDataset = loadInstructionsDataset()
    const trainedAgent = loadTrainedAgent()
    
    if (dataset.length === 0) {
      throw new Error('Aktivite dataset\'i yüklenemedi')
    }

    // Gelişmiş algoritma ile benzer aktiviteleri bul
    const similarActivities = findSimilarActivities(prompt, ageGroup, dataset, trainedAgent)
    
    // Gelişmiş aktivite önerisi oluştur
    const generatedActivity = generateActivitySuggestion(prompt, ageGroup, similarActivities, trainedAgent, instructionsDataset)

    // Aktiviteyi hazırla
    const activity = {
      _id: Date.now().toString(),
      title: generatedActivity.title,
      description: generatedActivity.description,
      type: generatedActivity.type,
      ageRange: generatedActivity.ageRange,
      difficulty: generatedActivity.difficulty,
      content: generatedActivity.content,
      tags: generatedActivity.tags,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Gelişmiş istatistikler
    const stats = {
      totalActivities: dataset.length,
      totalInstructions: instructionsDataset.length,
      similarFound: similarActivities.length,
      datasetUsed: true,
      instructionsUsed: true,
      trainedAgentUsed: !!trainedAgent,
      prompt: prompt,
      ageGroup: ageGroup,
      ageGroupKey: getAgeGroup(ageGroup),
      recommendations: trainedAgent ? Object.keys(trainedAgent.recommendations?.byAge || {}) : [],
      patterns: trainedAgent ? Object.keys(trainedAgent.patterns?.commonMaterials || {}).slice(0, 5) : []
    }

    return Response.json({
      success: true,
      activity: activity,
      stats: stats,
      message: 'Aktivite başarıyla oluşturuldu!'
    })

  } catch (error) {
    console.error('Aktivite oluşturma hatası:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Aktivite oluşturulurken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}
