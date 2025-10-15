import { GoogleGenAI, Chat, Modality, Type, TrackingEvent } from "@google/genai";
import { AIAnalysisResult, DeliveryEvidence } from "../types";


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

// A list of high-quality, professional prompts to generate convincing service-oriented images.
const THEMATIC_PROMPTS = [
  "A satisfied customer smiling as they receive a package from a friendly, uniformed IntelliTrack courier at their doorstep. The scene is bright, professional, and shot with a shallow depth of field.",
  "A state-of-the-art, clean IntelliTrack warehouse with automated conveyor belts moving packages. Workers in safety vests are efficiently scanning and sorting goods under bright, clean lighting.",
  "A close-up shot of a customer signing for a digital tablet held by an IntelliTrack courier. Focus on the secure, professional handover of the package.",
  "A diverse team of logistics professionals collaborating in a modern IntelliTrack control center, with large screens showing world maps and tracking data. The atmosphere is high-tech and efficient.",
];

/**
 * Generates a thematic, professional image representing the courier service,
 * rather than the literal contents of the package.
 * @param _prompt This parameter is ignored; a random thematic prompt is used instead.
 * @returns A base64 encoded data URL for the generated image, or null on failure.
 */
export async function generatePackageImage(_prompt: string): Promise<string | null> {
  try {
    // Select a random prompt from the predefined list to ensure high-quality, relevant imagery.
    const randomPrompt = THEMATIC_PROMPTS[Math.floor(Math.random() * THEMATIC_PROMPTS.length)];

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: randomPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      console.warn('Gemini API returned no image data.');
      return null;
    }
  } catch (error: any) {
    // Gracefully handle API errors, especially rate limiting (429).
    if (error.toString().includes('429') || (error.httpStatus && error.httpStatus === 429)) {
        console.warn('Gemini API rate limit exceeded. Skipping package image generation.');
    } else {
        console.error('Error generating package image with Gemini API:', error);
    }
    // Return null to allow the UI to degrade gracefully.
    return null;
  }
}

/**
 * Generates a welcome voice message using the Text-to-Speech API.
 * @returns A base64 encoded string of the raw audio data.
 */
export async function generateWelcomeSpeech(): Promise<string> {
    try {
        const welcomeText = "Welcome to IntelliTrack. The world's most advanced, secure, and reliable courier service. We combine global logistics with real-time AI to give you unparalleled insight and peace of mind. Let's get started.";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: welcomeText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // A professional and clear voice
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            return base64Audio;
        } else {
            throw new Error('TTS generation failed, no audio data received.');
        }

    } catch (error) {
        console.error('Error generating welcome speech with Gemini API:', error);
        throw error;
    }
}


/**
 * Initializes a new chat session with the Gemini API.
 * @param packageId The current package ID for context.
 */
export function initializeChat(packageId: string | null): void {
  const systemInstruction = `You are a friendly and professional customer support assistant for IntelliTrack, a global courier service. 
    Your goal is to help users with their shipments. 
    Be concise and helpful. 
    If you are asked about a specific shipment, refer to Package ID: ${packageId || 'N/A'}. 
    Do not promise actions you cannot perform, like changing delivery details or issuing refunds directly. Instead, guide the user on how they could hypothetically do so through the official channels or by contacting support.`;
    
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    // FIX: systemInstruction should be a string, not an object.
    config: { systemInstruction: systemInstruction },
  });
}

/**
 * Sends a message to the initialized Gemini chat.
 * @param message The user's message.
 * @returns The assistant's text response.
 */
export async function sendMessage(message: string): Promise<string> {
  if (!chat) {
    throw new Error('Chat not initialized. Call initializeChat first.');
  }
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error('Error sending message to Gemini API:', error);
    return "I'm sorry, I'm having trouble connecting to my services right now. Please try again later.";
  }
}

/**
 * Generates a creative description for an item.
 * @param item The item to describe.
 * @returns A short, engaging description.
 */
export async function generateCreativeDescription(item: string): Promise<string> {
  try {
    const prompt = `Generate a short, intriguing, one-sentence description for the following item, as if it were on a collectible card: "${item}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error generating creative description:', error);
    return `A closer look at: ${item}`;
  }
}

/**
 * Analyzes delivery evidence using a multimodal model.
 * @param evidence An object containing base64 strings for photo and signature.
 * @returns An AI-generated analysis of the delivery.
 */
export async function analyzeDeliveryEvidence(evidence: { photo: string; signature: string; }): Promise<AIAnalysisResult> {
    const photoPart = {
        inlineData: { mimeType: 'image/jpeg', data: evidence.photo.split(',')[1] }
    };
    const signaturePart = {
        inlineData: { mimeType: 'image/png', data: evidence.signature.split(',')[1] }
    };

    const prompt = `
        As a security auditor for a courier company, analyze the provided delivery evidence.
        1.  **Photo Analysis:** Examine the first image (the delivery photo). Describe where the package was left. Is it a safe location? Are there any visible obstructions or risks?
        2.  **Signature Analysis:** Examine the second image (the signature). Is it legible? Does it appear to be a coherent signature or just a scribble?
        3.  **Overall Assessment:** Based on both pieces of evidence, provide a summary and a confidence score (0-100) for this delivery's validity.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: [{ text: prompt }, photoPart, signaturePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        confidence: { type: Type.NUMBER },
                        verificationPoints: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    key: { type: Type.STRING },
                                    value: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as AIAnalysisResult;

    } catch (error) {
        console.error("Error analyzing delivery evidence:", error);
        throw new Error("Failed to get AI analysis for the delivery.");
    }
}


/**
 * Generates a calming, reassuring voice message about the shipment status.
 * @param status The current status of the package.
 * @returns A base64 encoded string of the raw audio data.
 */
export async function generateCalmingUpdateSpeech(status: string): Promise<string> {
  const statusLower = status.toLowerCase();
  let text = "Your package is being carefully monitored. All is proceeding as expected. Take a moment to relax.";

  if (statusLower.includes('out for delivery')) {
    text = "A moment of calm. Your package is nearby and will be with you soon. All is well.";
  } else if (statusLower.includes('transit')) {
    text = "Your package is safely on its journey. Take a deep breath. We are monitoring it every step of the way.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say in a calm, soothing voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error('TTS generation failed for calming update.');
    }
  } catch (error) {
    console.error('Error generating calming speech:', error);
    throw error;
  }
}

/**
 * Generates a human-readable summary of the shipment journey.
 * @param history The array of tracking events.
 * @returns A string summary of the journey.
 */
export async function summarizeShipmentJourney(history: TrackingEvent[]): Promise<string> {
  const historyString = history
    .map(event => `${event.date} at ${event.location}: ${event.status} - ${event.details || ''}`)
    .join('\n');
  
  const prompt = `
    Analyze the following shipment history and provide a brief, easy-to-read summary for a customer.
    Focus on key milestones like pickup, international departure, customs clearance, and final delivery.
    Mention the total transit time if possible.

    History:
    ${historyString}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error generating journey summary:', error);
    return "Could not generate summary at this time.";
  }
}