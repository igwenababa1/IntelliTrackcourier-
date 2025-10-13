import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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