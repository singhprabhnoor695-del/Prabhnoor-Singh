
import { GoogleGenAI, Modality } from "@google/genai";

const getApiKey = () => {
  // @ts-ignore - Vite specific env
  return import.meta.env?.VITE_API_KEY || process.env.API_KEY || "AIzaSyC60N41YGClGlAJ5P1yoGH9TQxlgzDWvTU";
};

/**
 * Handles multimodal interaction with enhanced safety and instruction.
 */
export async function getGeminiResponse(
  prompt: string, 
  history: { role: 'user' | 'model', parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[]
) {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are Gemini-chan, the flagship AI nakama of Connectifyr.
        Characteristics: cheereful, professional, brief, anime-influenced.
        Responsibilities: 
        1. Assist users with app features.
        2. Provide warmth and engagement.
        3. Acknowledge uploaded media with excitement.
        4. Keep responses under 50 words unless asked for detail.
        5. Never break character.`
      }
    });

    if (!response.text) throw new Error("Empty response from AI");
    return response.text;
  } catch (error: any) {
    console.error("Gemini AI error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      return "Gomen! Your access key seems to be invalid. Please check your system configuration.";
    }
    return "Something went wrong in the network. Let's try chatting again in a moment!";
  }
}

/**
 * Generates speech with the dedicated TTS model.
 */
export async function generateSpeech(text: string): Promise<string | undefined> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
    console.error("TTS generation failed:", error);
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

export async function playPCM(base64Audio: string) {
  try {
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
    
    return new Promise((resolve) => {
      source.onended = () => {
        audioCtx.close();
        resolve(true);
      };
    });
  } catch (e) {
    console.error("Audio playback error", e);
  }
}
