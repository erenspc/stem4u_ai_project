'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Brain, Database, TrendingUp, Target, Users, BookOpen } from 'lucide-react'

interface Activity {
  _id: string
  title: string
  description: string
  type: 'game' | 'quiz' | 'lesson' | 'exercise'
  ageRange: {
    min: number
    max: number
  }
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
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalActivities: number
  totalInstructions: number
  similarFound: number
  datasetUsed: boolean
  instructionsUsed: boolean
  trainedAgentUsed: boolean
  prompt: string
  ageGroup: number
  ageGroupKey: string
  recommendations: string[]
  patterns: string[]
}

export default function TestTrainedAgent() {
  const [prompt, setPrompt] = useState('')
  const [ageGroup, setAgeGroup] = useState('8')
  const [activity, setActivity] = useState<Activity | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateActivity = async () => {
    if (!prompt.trim()) {
      setError('Lütfen bir konu girin')
      return
    }

    setLoading(true)
    setError('')
    setActivity(null)
    setStats(null)

    try {
      const response = await fetch('/api/generate-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ageGroup: parseInt(ageGroup),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setActivity(data.activity)
        setStats(data.stats)
      } else {
        setError(data.error || 'Aktivite oluşturulurken bir hata oluştu')
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu')
    } finally {
      setLoading(false)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game': return '🎮'
      case 'quiz': return '❓'
      case 'lesson': return '📚'
      case 'exercise': return '💪'
      default: return '📋'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 Eğitilmiş Etkinlik Agentı Testi</h1>
        <p className="text-gray-600">
          2000 etkinliklik dataset ile eğitilmiş agent'ı test edin ve performansını görün.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Giriş */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Agent Testi
              </CardTitle>
              <CardDescription>
                Konu ve yaş grubunu belirleyin, agent'ın önerisini alın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Konu / Etkinlik Türü</Label>
                <Input
                  id="prompt"
                  placeholder="Örn: matematik, renkler, hayvanlar, müzik..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ageGroup">Yaş Grubu</Label>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">1. Sınıf (6-7 yaş)</SelectItem>
                    <SelectItem value="7">2. Sınıf (7-8 yaş)</SelectItem>
                    <SelectItem value="8">3. Sınıf (8-9 yaş)</SelectItem>
                    <SelectItem value="9">4. Sınıf (9-10 yaş)</SelectItem>
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
                    Etkinlik Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Etkinlik Oluştur
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* İstatistikler */}
          {stats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Agent İstatistikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Etkinlik:</span>
                  <Badge variant="secondary">{stats.totalActivities}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Toplam Talimat:</span>
                  <Badge variant="secondary">{stats.totalInstructions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Benzer Bulunan:</span>
                  <Badge variant="outline">{stats.similarFound}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dataset Kullanıldı:</span>
                  <Badge variant={stats.datasetUsed ? "default" : "destructive"}>
                    {stats.datasetUsed ? "Evet" : "Hayır"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Talimat Dataset:</span>
                  <Badge variant={stats.instructionsUsed ? "default" : "destructive"}>
                    {stats.instructionsUsed ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Eğitilmiş Agent:</span>
                  <Badge variant={stats.trainedAgentUsed ? "default" : "destructive"}>
                    {stats.trainedAgentUsed ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Yaş Grubu:</span>
                  <Badge variant="outline">{stats.ageGroupKey}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sağ Panel - Sonuçlar */}
        <div className="lg:col-span-2">
          {activity ? (
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Etkinlik</TabsTrigger>
                <TabsTrigger value="details">Detaylar</TabsTrigger>
                <TabsTrigger value="analysis">Analiz</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{activity.title}</CardTitle>
                        <CardDescription className="mt-2">{activity.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getDifficultyColor(activity.difficulty)}>
                          {activity.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeIcon(activity.type)} {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Yaş Aralığı
                      </h3>
                      <p className="text-sm text-gray-600">
                        {activity.ageRange.min} - {activity.ageRange.max} yaş arası
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Talimatlar
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{activity.content.instructions}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Gerekli Malzemeler</h3>
                      <div className="flex flex-wrap gap-2">
                        {activity.content.materials.map((material, index) => (
                          <Badge key={index} variant="secondary">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {activity.content.questions && activity.content.questions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Sorular</h3>
                        <div className="space-y-3">
                          {activity.content.questions.map((question, index) => (
                            <div key={index} className="border p-3 rounded-lg">
                              <p className="font-medium mb-2">{question.question}</p>
                              {question.options && (
                                <div className="space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="text-sm text-gray-600">
                                      {optIndex + 1}. {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {question.explanation && (
                                <p className="text-sm text-green-600 mt-2">
                                  💡 {question.explanation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-2">Etiketler</h3>
                      <div className="flex flex-wrap gap-2">
                        {activity.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Teknik Detaylar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Aktivite Bilgileri</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">ID:</span>
                            <p className="font-mono">{activity._id}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tip:</span>
                            <p>{activity.type}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Zorluk:</span>
                            <p>{activity.difficulty}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Durum:</span>
                            <p>{activity.isActive ? 'Aktif' : 'Pasif'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Zaman Bilgileri</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Oluşturulma:</span>
                            <p>{new Date(activity.createdAt).toLocaleString('tr-TR')}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Güncellenme:</span>
                            <p>{new Date(activity.updatedAt).toLocaleString('tr-TR')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Analizi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">Öneri Sistemi</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Yaş Grubu:</span>
                              <p>{stats.ageGroupKey}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Prompt:</span>
                              <p>{stats.prompt}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Popüler Malzemeler</h3>
                          <div className="flex flex-wrap gap-2">
                            {stats.patterns.map((pattern, index) => (
                              <Badge key={index} variant="secondary">
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Öneri Kategorileri</h3>
                          <div className="flex flex-wrap gap-2">
                            {stats.recommendations.map((rec, index) => (
                              <Badge key={index} variant="outline">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Etkinlik Önerisi</CardTitle>
                <CardDescription>
                  Sol panelden konu ve yaş grubunu belirleyin, agent'ın önerisini alın.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Henüz bir etkinlik oluşturulmadı. <br />
                  Agent'ı test etmek için yukarıdaki formu kullanın.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 