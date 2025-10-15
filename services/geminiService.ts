import { GoogleGenAI, Chat, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

// A list of high-quality, professional prompts to generate convincing service-oriented images.
const THEMATIC_PROMPTS = [
  "A satisfied customer smiling as they receive a package from a friendly, uniformed IntelliTrack courier at their doorstep. The scene is bright, professional, and shot with a shallow depth of field.",
  "A state-of-the-art, clean IntelliTrack warehouse with automated conveyor belts moving packages. Workers in safety vests are efficiently scanning and sorting goods under bright, clean lighting.",
  "A close-up shot of a customer signing for a delivery on a digital tablet held by an IntelliTrack courier. Focus on the secure, professional handover of the package.",
  "A diverse team of logistics professionals collaborating in a modern IntelliTrack control center, with large screens showing world maps and tracking data. The atmosphere is high-tech and efficient.",
];

/**
 * Generates a thematic, professional image representing the courier service,
 * rather than the literal contents of the package.
 * @param _prompt This parameter is ignored; a random thematic prompt is used instead.
 * @returns A base64 encoded data URL for the generated image.
 */
export async function generatePackageImage(_prompt: string): Promise<string> {
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
      throw new Error('Image generation failed, no image data received.');
    }
  } catch (error) {
    console.error('Error generating package image with Gemini API:', error);
    // Re-throw the error to be handled by the calling component
    throw error;
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