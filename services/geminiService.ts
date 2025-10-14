import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

/**
 * Generates an image based on a text prompt describing package contents.
 * @param prompt A description of the items in the package.
 * @returns A base64 encoded data URL for the generated image.
 */
export async function generatePackageImage(prompt: string): Promise<string> {
  try {
    // Enhance the prompt for better image quality and context
    const fullPrompt = `A high-quality, professional product photograph of the following item(s) on a neutral, clean studio background: ${prompt}. The image should be clear and well-lit.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
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
    config: { systemInstruction },
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