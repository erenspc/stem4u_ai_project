import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 30

const quizSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
      explanation: z.string().optional(),
    }),
  ),
})

// Mock quiz data for fallback
const generateMockQuiz = (activityTitle: string, activityDescription: string, category: string) => {
  const mockQuestions = [
    {
      id: "1",
      question: `${activityTitle} etkinliğinde hangi beceri geliştirilir?`,
      options: [
        "Sadece el becerisi",
        "Sadece düşünme becerisi", 
        "Hem el hem düşünme becerisi"
      ],
      correctAnswer: 2,
      explanation: "Bu etkinlik hem el becerilerini hem de problem çözme yeteneklerini geliştirir."
    },
    {
      id: "2", 
      question: "Etkinlik sırasında en önemli güvenlik kuralı nedir?",
      options: [
        "Hızlı çalışmak",
        "Yetişkin gözetimi",
        "Sessiz olmak"
      ],
      correctAnswer: 1,
      explanation: "Her zaman bir yetişkinin gözetiminde çalışmak güvenlik için önemlidir."
    },
    {
      id: "3",
      question: `${activityTitle} etkinliğinin amacı nedir?`,
      options: [
        "Sadece eğlenmek",
        "Sadece öğrenmek",
        "Hem eğlenmek hem öğrenmek"
      ],
      correctAnswer: 2,
      explanation: "Bu etkinlik hem eğlenceli hem de öğretici bir deneyim sunar."
    },
    {
      id: "4",
      question: "Etkinlik sonunda ne yapılmalıdır?",
      options: [
        "Materyalleri dağıtmak",
        "Temizlik yapmak",
        "Hemen ayrılmak"
      ],
      correctAnswer: 1,
      explanation: "Etkinlik sonunda kullanılan materyalleri temizlemek önemlidir."
    },
    {
      id: "5",
      question: `${category} kategorisindeki etkinlikler neyi hedefler?`,
      options: [
        "Sadece bilgi vermek",
        "Sadece beceri geliştirmek",
        "Bilgi ve beceri geliştirmek"
      ],
      correctAnswer: 2,
      explanation: "Bu kategori hem bilgi hem de pratik becerileri geliştirmeyi hedefler."
    }
  ]

  return {
    id: Date.now().toString(),
    activityId: Date.now().toString(),
    questions: mockQuestions
  }
}

export async function POST(req: Request) {
  try {
    const { activityTitle, activityDescription, category } = await req.json()

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not found, using mock quiz data")
      const mockQuiz = generateMockQuiz(activityTitle, activityDescription, category)
      return Response.json(mockQuiz)
    }

    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: quizSchema,
      prompt: `"${activityTitle}" etkinliği için 5 soruluk bir quiz oluştur.

      Etkinlik açıklaması: ${activityDescription}
      Kategori: ${category}
      
      Quiz şartları:
      - 5 adet çoktan seçmeli soru
      - Her soru 3 seçenekli (A, B, C)
      - İlkokul 1-4. sınıf seviyesinde sorular (6-10 yaş)
      - Etkinlikle ilgili bilgileri test eden sorular
      - Türkçe sorular
      - Eğitici ve öğretici içerik
      - Her soru için kısa açıklama ekle
      
      Sorular etkinlikte öğrenilen kavramları, gözlemleri ve bilimsel prensipleri test etmeli.
      Seçenekler net ve anlaşılır olmalı.`,
    })

    const quizData = result.object as z.infer<typeof quizSchema>
    
    return Response.json({
      id: Date.now().toString(),
      activityId: Date.now().toString(),
      questions: quizData.questions
    })
  } catch (error) {
    console.error("Quiz generation error:", error)
    
    // Fallback to mock data on error
    const { activityTitle, activityDescription, category } = await req.json()
    const mockQuiz = generateMockQuiz(activityTitle, activityDescription, category)
    
    return Response.json(mockQuiz)
  }
}
