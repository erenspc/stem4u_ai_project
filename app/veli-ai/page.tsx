"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Heart, 
  Clock,
  RotateCcw,
  MessageSquare,
  Plus,
  Trash2,
  Settings,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  messages: any[]
  createdAt: Date
}

const SUGGESTED_QUESTIONS = [
  "Çocuğum matematikte zorlanıyor, nasıl yardım edebilirim?",
  "Evde yapabileceğimiz eğitici aktiviteler neler?",
  "Çocuğumun okuma alışkanlığını nasıl geliştirebilirim?",
  "Teknoloji kullanımı konusunda nasıl sınır koymalıyım?",
  "Çocuğumun sosyal becerilerini nasıl destekleyebilirim?",
  "Okul ile nasıl daha iyi iletişim kurabilirim?",
  "Çocuğumun özgüvenini nasıl artırabilirim?",
  "STEM etkinlikleri için önerileriniz neler?"
]

const QUICK_ACTIONS = [
  { icon: BookOpen, label: "Öğrenme Stratejileri", prompt: "Çocuğumun öğrenme stillerine uygun stratejiler önerir misin?" },
  { icon: Lightbulb, label: "Yaratıcı Aktiviteler", prompt: "Evde yapabileceğimiz yaratıcı ve eğitici aktiviteler önerir misin?" },
  { icon: Heart, label: "Duygusal Destek", prompt: "Çocuğumun duygusal gelişimini nasıl destekleyebilirim?" },
  { icon: Sparkles, label: "STEM Projeleri", prompt: "Yaşına uygun STEM projeleri ve deneyler önerir misin?" }
]

export default function VeliAI() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
    reload,
    stop
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `👋 Merhaba! Ben Veli AI Asistanınız. 

Çocuğunuzun eğitimi ve gelişimi konusunda size yardımcı olmak için buradayım. 

💡 Size nasıl yardımcı olabilirim:
• Öğrenme stratejileri ve teknikleri
• Evde eğitici aktiviteler ve projeler
• Davranış ve gelişim rehberliği
• Okul-veli iletişimi
• STEM etkinlikleri ve deneyler

Aşağıdaki örnek sorulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.`
      }
    ]
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Yeni Konuşma",
      messages: [],
      createdAt: new Date()
    }
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `👋 Merhaba! Ben Veli AI Asistanınız. 

Çocuğunuzun eğitimi ve gelişimi konusunda size yardımcı olmak için buradayım. 

💡 Size nasıl yardımcı olabilirim:
• Öğrenme stratejileri ve teknikleri
• Evde eğitici aktiviteler ve projeler
• Davranış ve gelişim rehberliği
• Okul-veli iletişimi
• STEM etkinlikleri ve deneyler

Aşağıdaki örnek sorulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.`
      }
    ])
  }

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id))
    if (currentConversationId === id) {
      createNewConversation()
    }
  }

  const handleQuickAction = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Veli AI</h1>
              <p className="text-sm text-gray-500">Ebeveyn Asistanı</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Konuşma
          </Button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                  currentConversationId === conversation.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                )}
                onClick={() => setCurrentConversationId(conversation.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(conversation.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteConversation(conversation.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <HelpCircle className="w-4 h-4" />
            <span>Yardım için soru sorun</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="font-semibold text-gray-900">Veli AI Asistanı</h2>
                <p className="text-sm text-gray-500">Çocuğunuzun eğitimi için yanınızdayım</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Yazıyor...
                </Badge>
              )}
                             <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => reload()}
                 disabled={isLoading}
               >
                 <RotateCcw className="w-4 h-4" />
               </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={cn(
                    "text-xs mt-2",
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  )}>
                    {formatTime(new Date())}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Hızlı Eylemler</h3>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Önerilen Sorular</h3>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="justify-start text-left h-auto p-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleQuickAction(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Çocuğunuz hakkında bir soru sorun..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            
            {error && (
              <div className="mt-2 text-sm text-red-600">
                Bir hata oluştu. Lütfen tekrar deneyin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 