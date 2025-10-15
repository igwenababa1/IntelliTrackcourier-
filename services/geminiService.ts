import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import { AIAnalysisResult, DeliveryEvidence, TrackingEvent } from "../types";


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

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

const THEMATIC_PROMPTS = [
    "A powerful, cinematic photograph of a massive cargo ship navigating the open ocean at sunrise, containers stacked high, conveying global trade and reliability.",
    "Dynamic, realistic action shot of a modern cargo semi-trailer truck driving on a highway through mountains at dusk, headlights creating lens flare, representing speed and cross-country logistics.",
    "An awesome, low-angle photograph of a huge cargo plane taking off from an airport runway, powerful engines blazing against a dramatic sky, symbolizing speed and international reach.",
    "Hyper-realistic, detailed photo of a busy port at twilight, with massive cranes loading colorful containers onto a cargo ship, showcasing the immense scale of global logistics.",
    "A sleek, branded courier semi-truck on a rain-slicked highway at night, reflections of neon lights on the wet road, creating a sense of urgency and 24/7 operation.",
    "A stunning aerial shot of a container ship majestically entering a harbor, guided by tugboats, illustrating precision and care in handling."
];

/**
 * Generates a thematic image representing the courier service.
 * @param itemDescription A summary of the items in the package (no longer used in prompt).
 * @returns A promise that resolves to a base64 data URL of the generated image.
 */
export async function generatePackageImage(itemDescription: string): Promise<string> {
    try {
        const prompt = THEMATIC_PROMPTS[Math.floor(Math.random() * THEMATIC_PROMPTS.length)];
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        if (base64ImageBytes) {
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error('Image generation failed, no image data received.');
        }
    } catch (error) {
        console.error('Error generating package image with Gemini API:', error);
        throw error;
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

/**
 * Generates a professional goodbye voice message using the Text-to-Speech API.
 * @returns A base64 encoded string of the raw audio data.
 */
export async function generateGoodbyeSpeech(): Promise<string> {
    try {
        const goodbyeText = "Thank you for choosing IntelliTrack. Your session has been securely terminated. We wish you a pleasant day and look forward to assisting you again soon.";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say in a clear, professional, and reassuring voice: ${goodbyeText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Using the same professional voice as welcome
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            return base64Audio;
        } else {
            throw new Error('TTS generation failed for goodbye message, no audio data received.');
        }

    } catch (error) {
        console.error('Error generating goodbye speech with Gemini API:', error);
        throw error;
    }
}