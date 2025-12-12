import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry, { AbortError } from "p-retry";
import { Buffer } from "node:buffer";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chatWithAI(
  messages: ChatMessage[]
): Promise<string> {
  return pRetry(
    async () => {
      try {
        const response = await openai.chat.completions.create({
          // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          model: "gpt-5",
          messages: messages,
          max_completion_tokens: 8192,
        });
        return response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      } catch (error: any) {
        if (isRateLimitError(error)) {
          throw error;
        }
        throw new AbortError(error);
      }
    },
    {
      retries: 7,
      minTimeout: 2000,
      maxTimeout: 128000,
      factor: 2,
    }
  );
}

export async function generateInvitationCardImage(
  eventType: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
): Promise<string> {
  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "Date to be announced";

  const prompt = `Create a beautiful, elegant invitation card design for an Indian ${eventType} celebration. 

Event Details:
- Title: "${eventTitle}"
- Date: ${formattedDate}
- Location: ${eventLocation || "Venue to be announced"}

Design Requirements:
- Vibrant, festive color palette appropriate for ${eventType} (use warm colors like orange, amber, gold for Indian celebrations)
- Beautiful decorative borders and patterns inspired by Indian art (rangoli, mandala, or floral patterns)
- Clear, elegant typography with the event title prominently displayed
- Include "You're Invited!" text at the top
- Include the date and location information
- Professional event invitation layout
- Aspect ratio: 4:3 landscape
- High-quality, print-ready design
- No people or faces in the design
- Focus on decorative elements, patterns, and typography`;

  return pRetry(
    async () => {
      try {
        const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
        });
        
        // Debug: Log the response structure
        console.log("Image API Response:", JSON.stringify(response, null, 2));
        
        const imageData = response.data?.[0];
        
        // Handle both URL and base64 response formats
        if (imageData?.url) {
          console.log("Returning URL format");
          return imageData.url;
        }
        
        if (imageData?.b64_json) {
          console.log("Returning base64 format");
          // Return as data URL if base64 is provided
          return `data:image/png;base64,${imageData.b64_json}`;
        }
        
        throw new Error("No image data received from AI");
      } catch (error: any) {
        console.error("Error generating invitation card:", error);
        if (isRateLimitError(error)) {
          throw error;
        }
        throw new AbortError(error);
      }
    },
    {
      retries: 3,
      minTimeout: 2000,
      maxTimeout: 30000,
      factor: 2,
    }
  );
}
