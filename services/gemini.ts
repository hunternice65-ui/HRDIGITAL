import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

/**
 * Fetches a response from Gemini AI.
 * Follows @google/genai guidelines by initializing the client inside the function call
 * and using the process.env.API_KEY directly.
 */
export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  // Always use {apiKey: process.env.API_KEY} for initialization.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    // Access response.text as a property directly, not as a method.
    return response.text || "ขออภัย ระบบขัดข้อง กรุณาลองใหม่ภายหลัง";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";
  }
}