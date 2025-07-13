'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAPI() {
  const [prompt, setPrompt] = useState('matematik')
  const [ageGroup, setAgeGroup] = useState('8')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const testAPI = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/generate-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ageGroup: parseInt(ageGroup),
          userId: null
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'API hatası')
      }
    } catch (err) {
      setError('Bağlantı hatası: ' + err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Test Sayfası</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prompt:</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="matematik"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Yaş Grubu:</label>
            <Input
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              placeholder="8"
            />
          </div>
          
          <Button onClick={testAPI} disabled={loading}>
            {loading ? 'Test Ediliyor...' : 'API Test Et'}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <strong>Hata:</strong> {error}
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold mb-2">Başarılı!</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 