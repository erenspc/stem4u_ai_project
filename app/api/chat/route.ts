import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `Sen bir aile eğitim platformunun AI asistanısın. İlkokul çağındaki çocukların velilerine yardım ediyorsun. 
    
    Görevlerin:
    - Çocukların gelişimi hakkında bilgi vermek
    - STEM etkinlikleri önermek
    - Eğitici tavsiyelerde bulunmak
    - Velilerin sorularını yanıtlamak
    
    Türkçe konuş ve samimi, yardımsever bir ton kullan. Cevapların kısa ve anlaşılır olsun.`,
  })

  return result.toDataStreamResponse()
} 