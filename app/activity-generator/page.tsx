'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles } from 'lucide-react'

interface GeneratedActivity {
  _id: string
  title: string
  description: string
  type: 'game' | 'quiz' | 'lesson' | 'exercise'
  ageRange: { min: number; max: number }
  difficulty: 'easy' | 'medium' | 'hard'
  content: {
    instructions: string
    materials: string[]
    questions?: Array<{
      question: string
      options?: string[]
      correctAnswer?: number
      explanation?: string
    }>
  }
  tags: string[]
  createdBy?: {
    name: string
    email: string
  }
  createdAt: string
}

export default function ActivityGenerator() {
  const [prompt, setPrompt] = useState('')
  const [ageGroup, setAgeGroup] = useState('8')
  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState<GeneratedActivity | null>(null)
  const [error, setError] = useState('')

  const generateActivity = async () => {
    if (!prompt.trim()) {
      setError('Lütfen bir konu girin')
      return
    }

    setLoading(true)
    setError('')
    setActivity(null)

    try {
      const response = await fetch('/api/generate-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ageGroup: parseInt(ageGroup),
          userId: null // Test için null
        }),
      })

      const data = await response.json()

      if (data.success) {
        setActivity(data.activity)
      } else {
        setError(data.error || 'Aktivite oluşturulamadı')
      }
    } catch (err) {
      setError('Bir hata oluştu')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'game': return 'bg-green-100 text-green-800'
      case 'quiz': return 'bg-blue-100 text-blue-800'
      case 'lesson': return 'bg-purple-100 text-purple-800'
      case 'exercise': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🎯 Aktivite Üretici</h1>
        <p className="text-gray-600">
          Bir konu girin ve AI size uygun bir eğitici aktivite önersin!
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Yeni Aktivite Oluştur
          </CardTitle>
          <CardDescription>
            Çocuğunuzun yaşına ve ilgi alanlarına uygun aktivite önerileri alın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Konu veya İlgi Alanı</Label>
            <Input
              id="prompt"
              placeholder="Örn: matematik, hayvanlar, renkler, uzay, müzik..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateActivity()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Yaş Grubu</Label>
            <Select value={ageGroup} onValueChange={setAgeGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Yaş seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3-5 yaş</SelectItem>
                <SelectItem value="6">6-8 yaş</SelectItem>
                <SelectItem value="9">9-11 yaş</SelectItem>
                <SelectItem value="12">12-15 yaş</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={generateActivity} 
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aktivite Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Aktivite Oluştur
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {activity && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{activity.title}</CardTitle>
                <CardDescription className="text-base">
                  {activity.description}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={getTypeColor(activity.type)}>
                  {activity.type === 'game' && '🎮 Oyun'}
                  {activity.type === 'quiz' && '❓ Quiz'}
                  {activity.type === 'lesson' && '📚 Ders'}
                  {activity.type === 'exercise' && '💪 Egzersiz'}
                </Badge>
                <Badge className={getDifficultyColor(activity.difficulty)}>
                  {activity.difficulty === 'easy' && 'Kolay'}
                  {activity.difficulty === 'medium' && 'Orta'}
                  {activity.difficulty === 'hard' && 'Zor'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Yaş: {activity.ageRange.min}-{activity.ageRange.max}</span>
              <span>Oluşturan: {activity.createdBy?.name || 'Sistem'}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Malzemeler */}
            <div>
              <h3 className="font-semibold mb-2">📦 Gerekli Malzemeler</h3>
              <div className="flex flex-wrap gap-2">
                {activity.content.materials.map((material, index) => (
                  <Badge key={index} variant="outline">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Talimatlar */}
            <div>
              <h3 className="font-semibold mb-2">📋 Talimatlar</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {activity.content.instructions}
              </p>
            </div>

            {/* Sorular (Quiz tipi için) */}
            {activity.type === 'quiz' && activity.content.questions && (
              <div>
                <h3 className="font-semibold mb-2">❓ Sorular</h3>
                <div className="space-y-4">
                  {activity.content.questions.map((question, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                      {question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <strong>Açıklama:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Etiketler */}
            <div>
              <h3 className="font-semibold mb-2">🏷️ Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {activity.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 