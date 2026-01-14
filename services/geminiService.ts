
import { GoogleGenAI, Modality } from "@google/genai";

// Using the API key provided by the user for the preview environment
const ai = new GoogleGenAI({ apiKey: "AIzaSyDsahkdj6IyjyT9FKWaqGCoQnzhnv5keak" });

/**
 * Uses the latest flash model for multimodal (text + image) generation.
 */
export async function getGeminiResponse(
  prompt: string, 
  history: { role: 'user' | 'model', parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[]
) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are 'Gemini-chan', a helpful and cheerful AI anime companion in the Connectifyr app. Keep responses natural, concise, and professional. If a user shares an image, acknowledge its contents warmly. Prioritize brevity."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Gomen! Connection error. Please try again.";
  }
}

/**
 * Generates speech using the high-speed TTS preview model.
 */
export async function generateSpeech(text: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Plays the raw PCM data immediately.
 */
export async function playPCM(base64Audio: string) {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const data = decodeBase64(base64Audio);
  
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = audioCtx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
}
