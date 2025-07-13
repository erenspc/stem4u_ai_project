"use client"

import { useState } from "react"
import {
  User,
  MessageCircle,
  BookOpen,
  ActivityIcon,
  Settings,
  FileText,
  Play,
  X,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Tab = "development" | "assistant" | "activities"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: Date
}

interface Activity {
  id: string
  title: string
  description: string
  materials: string[]
  steps: string[]
  category: string
  duration: string
  ageGroup: string
  completed?: boolean
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface Quiz {
  id: string
  activityId: string
  questions: QuizQuestion[]
}

interface DevelopmentData {
  scientificThinking: number
  creativity: number
  curiosity: number
  collaboration: number
  completedProjects: string[]
  weeklyProgress: {
    stemActivities: { completed: number; total: number }
    creativity: { completed: number; total: number }
    problemSolving: { completed: number; total: number }
  }
}

const initialDevelopmentData: DevelopmentData = {
  scientificThinking: 85,
  creativity: 78,
  curiosity: 92,
  collaboration: 73,
  completedProjects: ["Renk Değiştiren Volkan", "Mıknatıslı Araba"],
  weeklyProgress: {
    stemActivities: { completed: 3, total: 4 },
    creativity: { completed: 2, total: 3 },
    problemSolving: { completed: 4, total: 5 },
  },
}

const mockActivities: Activity[] = [
  {
    id: "1",
    title: "Renk Değiştiren Volkan",
    description: "Evde basit malzemelerle volkan patlaması simülasyonu yaparak kimyasal reaksiyonları öğrenin.",
    materials: ["Karbonat", "Sirke", "Kırmızı gıda boyası", "Deterjan", "Plastik şişe"],
    steps: [
      "Plastik şişeyi masaya yerleştirin",
      "İçine 2 yemek kaşığı karbonat koyun",
      "Kırmızı gıda boyası ve birkaç damla deterjan ekleyin",
      "Yavaşça sirke dökerek reaksiyonu gözlemleyin",
    ],
    category: "Kimya",
    duration: "15 dakika",
    ageGroup: "6-10 yaş",
    completed: true,
  },
  {
    id: "2",
    title: "Mıknatıslı Araba Yarışı",
    description: "Mıknatısların çekim gücünü kullanarak hareket eden arabalar yapın.",
    materials: ["Küçük arabalar", "Güçlü mıknatıslar", "Karton", "Bant"],
    steps: [
      "Arabaların altına mıknatıs yapıştırın",
      "Karton üzerinde yarış pisti çizin",
      "Pistin altından mıknatısla arabaları hareket ettirin",
      "Farklı mıknatıs güçleriyle deneyin",
    ],
    category: "Fizik",
    duration: "20 dakika",
    ageGroup: "5-9 yaş",
    completed: true,
  },
  {
    id: "3",
    title: "Müzik Yapan Su Bardakları",
    description: "Farklı su seviyelerindeki bardaklarla müzik yaparak ses dalgalarını keşfedin.",
    materials: ["8 adet cam bardak", "Su", "Kaşık", "Gıda boyası (isteğe bağlı)"],
    steps: [
      "Bardakları sıraya dizin",
      "Her birine farklı miktarda su koyun",
      "Kaşıkla bardakları vurarak ses farklarını dinleyin",
      "Basit melodiler çalmaya çalışın",
    ],
    category: "Ses ve Müzik",
    duration: "25 dakika",
    ageGroup: "4-8 yaş",
  },
]

export default function FamilyEducationPlatform() {
  const [activeTab, setActiveTab] = useState<Tab>("development")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Merhaba! Çocuğunuzun gelişimi hakkında nasıl yardımcı olabilirim?",
      sender: "ai",
      timestamp: new Date(Date.now() - 3600000),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [customActivityPrompt, setCustomActivityPrompt] = useState("")
  const [customActivityAge, setCustomActivityAge] = useState("8")
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [showInterestForm, setShowInterestForm] = useState(false)
  const [showVideoIntro, setShowVideoIntro] = useState(true)
  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showActivityDetail, setShowActivityDetail] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [developmentData, setDevelopmentData] = useState<DevelopmentData>(initialDevelopmentData)
  const [isGeneratingActivity, setIsGeneratingActivity] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Video kapatma
  const closeVideoIntro = () => {
    setShowVideoIntro(false)
  }

  // AI Chatbot fonksiyonu
  const sendMessage = async () => {
    if (!inputMessage.trim() || isSendingMessage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsSendingMessage(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let aiResponseText = ""
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                aiResponseText += parsed.choices[0].delta.content
                setMessages((prev) =>
                  prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, text: aiResponseText } : msg)),
                )
              }
            } catch (e) {
              // JSON parse hatası, devam et
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Üzgünüm, bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}. Lütfen daha sonra tekrar deneyin.`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Özel etkinlik oluşturma
  const generateCustomActivity = async () => {
    if (!customActivityPrompt.trim()) return

    setIsGeneratingActivity(true)

    try {
      const response = await fetch("/api/generate-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: customActivityPrompt,
          ageGroup: customActivityAge,
          userId: null
        }),
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const data = await response.json()
      
      if (data.success && data.activity) {
        // API'den gelen aktiviteyi eski formata çevir
        const newActivity: Activity = {
          id: data.activity._id,
          title: data.activity.title,
          description: data.activity.description,
          materials: data.activity.content?.materials || [],
          steps: (data.activity.content?.instructions?.split('\n') || []).filter((step: string) => step.trim()),
          category: data.activity.tags?.[0] || 'Genel',
          duration: '15-30 dakika',
          ageGroup: `${data.activity.ageRange?.min || 6}-${data.activity.ageRange?.max || 10} yaş`,
          completed: false
        }
        setActivities((prev) => [newActivity, ...prev])
        setCustomActivityPrompt("")
      } else {
        throw new Error(data.error || 'Aktivite oluşturulamadı')
      }
      setCustomActivityPrompt("")
    } catch (error) {
      console.error("Activity generation error:", error)
      alert("Etkinlik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsGeneratingActivity(false)
    }
  }

  // Etkinlik detayını aç
  const openActivityDetail = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowActivityDetail(true)
  }

  // Etkinliği tamamla ve quiz oluştur
  const completeActivity = async (activity: Activity) => {
    setIsGeneratingQuiz(true)

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityTitle: activity.title,
          activityDescription: activity.description,
          category: activity.category,
        }),
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const quiz: Quiz = await response.json()
      setCurrentQuiz(quiz)
      setShowQuiz(true)
      setShowActivityDetail(false)

      // Etkinliği tamamlandı olarak işaretle
      setActivities((prev) => prev.map((act) => (act.id === activity.id ? { ...act, completed: true } : act)))
    } catch (error) {
      console.error("Quiz generation error:", error)
      alert("Quiz oluşturulurken bir hata oluştu.")
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // Quiz tamamla ve gelişimi güncelle
  const completeQuiz = () => {
    if (!currentQuiz) return

    const correctAnswers = currentQuiz.questions.filter((q) => quizAnswers[q.id] === q.correctAnswer).length
    const score = (correctAnswers / currentQuiz.questions.length) * 100

    setQuizScore(score)
    setQuizCompleted(true)
    setShowResults(true)

    // Gelişim verilerini güncelle
    setDevelopmentData((prev) => ({
      ...prev,
      scientificThinking: Math.min(100, prev.scientificThinking + Math.floor(score / 10)),
      creativity: Math.min(100, prev.creativity + Math.floor(score / 15)),
      curiosity: Math.min(100, prev.curiosity + Math.floor(score / 12)),
      collaboration: Math.min(100, prev.collaboration + Math.floor(score / 20)),
      completedProjects: [...prev.completedProjects, selectedActivity?.title || ""],
      weeklyProgress: {
        stemActivities: {
          completed: Math.min(
            prev.weeklyProgress.stemActivities.total,
            prev.weeklyProgress.stemActivities.completed + 1,
          ),
          total: prev.weeklyProgress.stemActivities.total,
        },
        creativity: prev.weeklyProgress.creativity,
        problemSolving: {
          completed: Math.min(
            prev.weeklyProgress.problemSolving.total,
            prev.weeklyProgress.problemSolving.completed + 1,
          ),
          total: prev.weeklyProgress.problemSolving.total,
        },
      },
    }))
  }

  // Quiz'i yeniden başlat
  const retakeQuiz = () => {
    setQuizAnswers({})
    setQuizCompleted(false)
    setQuizScore(0)
    setShowResults(false)
  }

  // Quiz'i kapat
  const closeQuiz = () => {
    setShowQuiz(false)
    setCurrentQuiz(null)
    setQuizAnswers({})
    setQuizCompleted(false)
    setQuizScore(0)
    setShowResults(false)
  }



  const renderVideoIntro = () => (
    <Dialog open={showVideoIntro} onOpenChange={setShowVideoIntro}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Aile Eğitim Platformuna Hoş Geldiniz!
            <Button variant="ghost" size="sm" onClick={closeVideoIntro}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Tanıtım videonuz buraya eklenecek</p>
            <p className="text-sm text-gray-500">
              Video dosyanızı buraya yükleyerek platformun nasıl kullanılacağını gösterebilirsiniz.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button onClick={closeVideoIntro}>Platformu Keşfetmeye Başla</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderDevelopmentTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tamamlanan Projeler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {developmentData.completedProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{project}</span>
                  <Badge variant="secondary">Tamamlandı</Badge>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm">Müzik Bardakları</span>
                <Badge variant="outline">Devam Ediyor</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bu Hafta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>STEM Etkinlikleri</span>
                  <span>
                    {developmentData.weeklyProgress.stemActivities.completed}/
                    {developmentData.weeklyProgress.stemActivities.total}
                  </span>
                </div>
                <Progress
                  value={
                    (developmentData.weeklyProgress.stemActivities.completed /
                      developmentData.weeklyProgress.stemActivities.total) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Yaratıcılık</span>
                  <span>
                    {developmentData.weeklyProgress.creativity.completed}/
                    {developmentData.weeklyProgress.creativity.total}
                  </span>
                </div>
                <Progress
                  value={
                    (developmentData.weeklyProgress.creativity.completed /
                      developmentData.weeklyProgress.creativity.total) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Problem Çözme</span>
                  <span>
                    {developmentData.weeklyProgress.problemSolving.completed}/
                    {developmentData.weeklyProgress.problemSolving.total}
                  </span>
                </div>
                <Progress
                  value={
                    (developmentData.weeklyProgress.problemSolving.completed /
                      developmentData.weeklyProgress.problemSolving.total) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gelişim Çizelgesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{developmentData.scientificThinking}%</div>
              <div className="text-sm text-gray-600">Bilimsel Düşünce</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{developmentData.creativity}%</div>
              <div className="text-sm text-gray-600">Yaratıcılık</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{developmentData.curiosity}%</div>
              <div className="text-sm text-gray-600">Merak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{developmentData.collaboration}%</div>
              <div className="text-sm text-gray-600">İşbirliği</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Son Etkinlik Fotoğrafları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Fotoğraf {i}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAssistantTab = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Veli AI Asistanı</h2>
        <p className="text-gray-600 max-w-md">
          Çocuğunuzun eğitimi ve gelişimi konusunda uzman tavsiyeler almak için 
          gelişmiş AI asistanımızı kullanın.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/veli-ai'}>
          <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">ChatGPT Benzeri Arayüz</h3>
          <p className="text-sm text-gray-600">
            Modern ve kullanıcı dostu sohbet arayüzü ile AI asistanla konuşun
          </p>
        </Card>
        
        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/veli-ai'}>
          <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Gelişmiş Özellikler</h3>
          <p className="text-sm text-gray-600">
            Konuşma geçmişi, hızlı eylemler ve önerilen sorular
          </p>
        </Card>
      </div>
      
      <Button 
        size="lg"
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        onClick={() => window.location.href = '/veli-ai'}
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        Veli AI'ya Git
      </Button>
    </div>
  )

  const renderActivitiesTab = () => (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Özel Etkinlik Önerisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Hangi konuda etkinlik istiyorsunuz? (örn: uzay, hayvanlar, müzik)"
                value={customActivityPrompt}
                onChange={(e) => setCustomActivityPrompt(e.target.value)}
                disabled={isGeneratingActivity}
              />
              <Select value={customActivityAge} onValueChange={setCustomActivityAge}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Yaş" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3-5 yaş</SelectItem>
                  <SelectItem value="6">6-8 yaş</SelectItem>
                  <SelectItem value="9">9-11 yaş</SelectItem>
                  <SelectItem value="12">12-15 yaş</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={generateCustomActivity} disabled={isGeneratingActivity}>
                {isGeneratingActivity ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-64">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Aktivite Üretici
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Gelişmiş AI ile özelleştirilmiş aktiviteler oluşturun
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => window.open('/activity-generator', '_blank')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Aktivite Üretici
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="h-fit cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openActivityDetail(activity)}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {activity.title}
                {activity.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{activity.category}</Badge>
                <Badge variant="secondary">{activity.duration}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{activity.description}</p>

              <div>
                <h4 className="font-semibold text-sm mb-2">Gerekli Malzemeler:</h4>
                <ul className="text-sm space-y-1">
                  {activity.materials.slice(0, 3).map((material, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {material}
                    </li>
                  ))}
                  {activity.materials.length > 3 && (
                    <li className="text-xs text-gray-500">+{activity.materials.length - 3} malzeme daha...</li>
                  )}
                </ul>
              </div>

              <Button className="w-full bg-transparent" variant="outline">
                <ArrowRight className="h-4 w-4 mr-2" />
                Etkinlik Detayları
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderActivityDetail = () => (
    <Dialog open={showActivityDetail} onOpenChange={setShowActivityDetail}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {selectedActivity?.title}
            {selectedActivity?.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
          </DialogTitle>
        </DialogHeader>
        {selectedActivity && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Badge variant="outline">{selectedActivity.category}</Badge>
              <Badge variant="secondary">{selectedActivity.duration}</Badge>
              <Badge variant="outline">{selectedActivity.ageGroup}</Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Açıklama</h3>
              <p className="text-gray-600">{selectedActivity.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Gerekli Malzemeler</h3>
              <ul className="space-y-2">
                {selectedActivity.materials.map((material, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    {material}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Adım Adım Talimatlar</h3>
              <ol className="space-y-3">
                {selectedActivity.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => completeActivity(selectedActivity)}
                disabled={selectedActivity.completed || isGeneratingQuiz}
              >
                {isGeneratingQuiz
                  ? "Quiz Hazırlanıyor..."
                  : selectedActivity.completed
                    ? "Tamamlandı"
                    : "Etkinliği Tamamla"}
              </Button>
              <Button variant="outline" onClick={() => setShowActivityDetail(false)}>
                Kapat
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  const renderQuiz = () => (
    <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Etkinlik Quiz - {selectedActivity?.title}</DialogTitle>
        </DialogHeader>
        {currentQuiz && (
          <div className="space-y-6">
            {!showResults ? (
              <>
                <p className="text-gray-600">
                  Etkinliği tamamladığınız için tebrikler! Şimdi öğrendiklerinizi test edelim.
                </p>

                {currentQuiz.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <h3 className="font-semibold">
                      {index + 1}. {question.question}
                    </h3>
                    <RadioGroup
                      value={quizAnswers[question.id]?.toString()}
                      onValueChange={(value) =>
                        setQuizAnswers((prev) => ({ ...prev, [question.id]: Number.parseInt(value) }))
                      }
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                          <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <Button
                  className="w-full"
                  onClick={completeQuiz}
                  disabled={Object.keys(quizAnswers).length < currentQuiz.questions.length}
                >
                  Quiz'i Tamamla
                </Button>
              </>
            ) : (
              <>
                {/* Quiz Sonuçları */}
                <div className="text-center space-y-4">
                  <div className={`text-2xl font-bold ${quizScore >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                    {quizScore >= 80 ? '🎉 Tebrikler!' : '📚 Daha fazla çalışman gerekiyor'}
                  </div>
                  <div className="text-lg">
                    Puanınız: <span className="font-bold">{Math.round(quizScore)}%</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Doğru: {currentQuiz.questions.filter((q) => quizAnswers[q.id] === q.correctAnswer).length}/{currentQuiz.questions.length}
                  </div>
                  
                  {quizScore < 80 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-800 font-medium">
                        ⚠️ 4/5 doğru cevap gerekli. Quiz'i tekrar çözmeniz önerilir.
                      </p>
                    </div>
                  )}
                </div>

                {/* Yanlış Cevaplar ve Açıklamalar */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">📝 Yanlış Cevaplar ve Açıklamalar</h3>
                  {currentQuiz.questions.map((question, index) => {
                    const userAnswer = quizAnswers[question.id]
                    const isCorrect = userAnswer === question.correctAnswer
                    
                    return (
                      <div key={question.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                            {isCorrect ? '✓' : '✗'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">
                              {index + 1}. {question.question}
                            </h4>
                            <div className="space-y-1 mb-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className={`text-sm ${optIndex === question.correctAnswer ? 'text-green-700 font-medium' : optIndex === userAnswer && !isCorrect ? 'text-red-700 font-medium' : 'text-gray-600'}`}>
                                  {optIndex === question.correctAnswer && '✓ '}
                                  {optIndex === userAnswer && !isCorrect && '✗ '}
                                  {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                                <strong>Açıklama:</strong> {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex gap-3">
                  {quizScore < 80 ? (
                    <Button onClick={retakeQuiz} className="flex-1">
                      🔄 Quiz'i Tekrar Çöz
                    </Button>
                  ) : (
                    <Button onClick={closeQuiz} className="flex-1">
                      ✅ Tamamla
                    </Button>
                  )}
                  <Button variant="outline" onClick={closeQuiz}>
                    Kapat
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  const renderUserInfoDialog = () => (
    <Dialog open={showUserInfo} onOpenChange={setShowUserInfo}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bilgilerim</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="font-semibold">Veli Bilgileri</Label>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <strong>Ad Soyad:</strong> Ayşe Yılmaz
              </p>
              <p>
                <strong>E-posta:</strong> ayse.yilmaz@email.com
              </p>
              <p>
                <strong>Telefon:</strong> +90 555 123 4567
              </p>
            </div>
          </div>
          <div>
            <Label className="font-semibold">Öğrenci Bilgileri</Label>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <strong>Ad Soyad:</strong> Elif Yılmaz
              </p>
              <p>
                <strong>Yaş:</strong> 8
              </p>
              <p>
                <strong>Sınıf:</strong> 2. Sınıf
              </p>
              <p>
                <strong>Okul:</strong> Atatürk İlkokulu
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderInterestFormDialog = () => (
    <Dialog open={showInterestForm} onOpenChange={setShowInterestForm}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İlgi Formu</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Bir deney yapsan hangisi seni daha çok heyecanlandırır?</Label>
            <RadioGroup className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bubbling" id="bubbling" />
                <Label htmlFor="bubbling">Köpüren şeyler</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="color-change" id="color-change" />
                <Label htmlFor="color-change">Renk değiştiren karışımlar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moving" id="moving" />
                <Label htmlFor="moving">Hareket eden/dönen araçlar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="magnets" id="magnets" />
                <Label htmlFor="magnets">Mıknatıslarla ilgili olanlar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sound" id="sound" />
                <Label htmlFor="sound">Ses ve müzikle ilgili deneyler</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-semibold">En çok hangi konular ilgini çeker?</Label>
            <div className="mt-2 space-y-2">
              {["Hayvanlar ve doğa", "Makineler", "İnsan vücudu", "Uzay", "Elektrik ve ışık", "Renkler ve boyalar"].map(
                (topic) => (
                  <div key={topic} className="flex items-center space-x-2">
                    <Checkbox id={topic} />
                    <Label htmlFor={topic}>{topic}</Label>
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">En çok neyle oynamayı seviyorsun?</Label>
            <RadioGroup className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cars" id="cars" />
                <Label htmlFor="cars">Arabalar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dolls" id="dolls" />
                <Label htmlFor="dolls">Oyuncak bebekler</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ball-games" id="ball-games" />
                <Label htmlFor="ball-games">Top oyunları</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="legos" id="legos" />
                <Label htmlFor="legos">Legolar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kitchen" id="kitchen" />
                <Label htmlFor="kitchen">Mutfak etkinlikleri</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-semibold">En sevdiğin ders hangisi?</Label>
            <RadioGroup className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="math" id="math" />
                <Label htmlFor="math">Matematik</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="turkish" id="turkish" />
                <Label htmlFor="turkish">Türkçe</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="life-science" id="life-science" />
                <Label htmlFor="life-science">Hayat Bilgisi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="arts" id="arts" />
                <Label htmlFor="arts">Görsel Sanatlar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="science" id="science" />
                <Label htmlFor="science">Bilim-Teknoloji/Kodlama</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-semibold">
              Bir bilim insanı olduğunu düşün, hangisini icat etmek isterdin?
            </Label>
            <RadioGroup className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flying-car" id="flying-car" />
                <Label htmlFor="flying-car">Uçan araba</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="self-building-lego" id="self-building-lego" />
                <Label htmlFor="self-building-lego">Kendi kendine toplanan lego</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mini-kitchen" id="mini-kitchen" />
                <Label htmlFor="mini-kitchen">Her şeyi pişirebilen mini mutfak</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="music-ball" id="music-ball" />
                <Label htmlFor="music-ball">Müzik yapan bir top</Label>
              </div>
            </RadioGroup>
          </div>

          <Button className="w-full">Formu Kaydet</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Logo ve Başlık Alanı */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white shadow-sm">
        <img src="/stem4u-logo.png" alt="STEM4U Logo" className="w-14 h-14 rounded-lg" />
        <span className="text-3xl font-extrabold tracking-tight text-gray-900" style={{fontFamily: 'inherit'}}>STEM4U</span>
      </header>
      {/* Ana içerik */}
      <main className="p-4 md:p-8">
        {activeTab === "development" && renderDevelopmentTab()}
        {activeTab === "assistant" && renderAssistantTab()}
        {activeTab === "activities" && renderActivitiesTab()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab("development")}
              className={`flex flex-col items-center py-3 px-4 ${
                activeTab === "development" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <ActivityIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Öğrenci Gelişimi</span>
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex flex-col items-center py-3 px-4 ${
                activeTab === "assistant" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Veli AI Asistanı</span>
            </button>

            <button
              onClick={() => setActiveTab("activities")}
              className={`flex flex-col items-center py-3 px-4 ${
                activeTab === "activities" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-xs mt-1">Etkinlikler</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Dialogs */}
      {renderUserInfoDialog()}
      {renderInterestFormDialog()}
      {renderActivityDetail()}
      {renderQuiz()}
    </div>
  )
}
