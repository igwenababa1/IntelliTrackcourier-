import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import { AIAnalysisResult, DeliveryEvidence, TrackingEvent, PackageDetails } from "../types";


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


let currentPackageDetails: PackageDetails | null = null;

/**
 * Initializes a new chat session with the Gemini API.
 * @param packageDetails The current package details for context.
 */
export function initializeChat(packageDetails: PackageDetails | null): void {
  currentPackageDetails = packageDetails;
  const packageId = packageDetails?.id || 'N/A';
  const systemInstruction = `You are a friendly and professional customer support assistant for IntelliTrack, a global courier service. 
    Your goal is to help users with their shipments. 
    Be concise and helpful. 
    If you are asked about a specific shipment, refer to Package ID: ${packageId}. Current Time: ${new Date().toISOString()}.
    The package's current status is "${currentPackageDetails?.status || 'Unknown'}".
    Do not promise actions you cannot perform, like changing delivery details or issuing refunds directly. Instead, guide the user on how they could hypothetically do so through the official channels or by contacting support.
    You have access to tools to generate thematic images and provide shipment summaries. Use them when requested.
    When you generate an image using the generatePackageImage tool, the tool will return a base64 image URL. You MUST display the image to the user using Markdown syntax: ![Thematic Image](<base64_image_url>).`;
    
  chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { 
      systemInstruction: systemInstruction,
      tools: [{
        functionDeclarations: [
          {
            name: 'generatePackageImage',
            description: 'Generates a thematic image representing the courier service or the package. Returns a base64 image URL.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                itemDescription: {
                  type: Type.STRING,
                  description: 'A description of the item to generate an image for.'
                }
              },
              required: ['itemDescription']
            }
          },
          {
            name: 'summarizeShipmentJourney',
            description: 'Generates a human-readable summary of the shipment journey based on the tracking history.',
            parameters: {
              type: Type.OBJECT,
              properties: {}
            }
          }
        ]
      }]
    },
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
    let response = await chat.sendMessage({ message });
    
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        if (call.name === 'generatePackageImage') {
          const args = call.args as any;
          const imageUrl = await generatePackageImage(args.itemDescription);
          response = await chat.sendMessage({
            message: [{
              functionResponse: {
                name: call.name,
                response: { imageUrl }
              }
            }] as any
          });
        } else if (call.name === 'summarizeShipmentJourney') {
          const summary = currentPackageDetails ? await summarizeShipmentJourney(currentPackageDetails.history) : "No shipment history available.";
          response = await chat.sendMessage({
            message: [{
              functionResponse: {
                name: call.name,
                response: { summary }
              }
            }] as any
          });
        }
      }
    }
    
    return response.text || "I'm sorry, I couldn't generate a response.";
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
        const brandName = "IntelliTrack";
        // To make it functional, we use gemini-3.1-flash-image-preview to generate a specific image.
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: `A highly realistic, professional product photo of ${itemDescription} inside a high-tech shipping facility. The package or item prominently features a futuristic, glowing logo with the exact text "${brandName}". Cinematic lighting, 8k resolution, highly detailed.`,
              },
            ],
          },
        });
        
        let imageUrl = '';
        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
        
        if (imageUrl) {
            return imageUrl;
        } else {
            console.warn('AI image generation returned no inline data. Falling back.');
            return 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=800&auto=format&fit=crop';
        }
    } catch (error) {
        console.error('Error generating package image with AI:', error);
        // Fallback
        return 'https://images.unsplash.com/photo-1624021422744-9387ef91a5db?q=80&w=800&auto=format&fit=crop';
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
      model: 'gemini-3-flash-preview',
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
 * @param evidence An object containing base64 strings for photo, signature, and audio.
 * @returns An AI-generated analysis of the delivery.
 */
export async function analyzeDeliveryEvidence(evidence: { photo?: string; signature?: string; audio?: string; }): Promise<AIAnalysisResult> {
    const parts: any[] = [];
    let prompt = `As a security auditor for a courier company, analyze the provided delivery evidence. Provide a concise analysis in JSON format based on the defined schema.\n\n`;

    if (evidence.photo) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: evidence.photo.split(',')[1] } });
        prompt += `1. **Package Condition:** Based on the photo, describe the package's condition. Is it intact, damaged, or wet?\n`;
        prompt += `2. **Location Safety:** Assess the safety of where the package was left. Is it hidden from public view, exposed to weather, or in a secure lobby?\n`;
    } else {
        prompt += `1. **Package Condition:** Not available as no photo was provided.\n`;
        prompt += `2. **Location Safety:** Not available as no photo was provided.\n`;
    }

    if (evidence.signature) {
        parts.push({ inlineData: { mimeType: 'image/png', data: evidence.signature.split(',')[1] } });
        prompt += `3. **Signature Legibility:** Analyze the signature. Is it a clear name, a scribble, or just a line?\n`;
    } else {
        prompt += `3. **Signature Legibility:** Not available as no signature was provided.\n`;
    }

    if (evidence.audio) {
        parts.push({ inlineData: { mimeType: 'audio/webm', data: evidence.audio.split(',')[1] } });
        prompt += `4. **Audio Analysis:** Analyze the audio recording. Is it a clear confirmation of delivery? Does the speaker sound like the recipient?\n`;
    } else {
        prompt += `4. **Audio Analysis:** Not available as no audio was provided.\n`;
    }

    prompt += `\nProvide an Overall Summary (one sentence) and a Confidence Score (0-100) based on all available evidence.`;

    parts.unshift({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A brief, one-sentence summary of the delivery quality."
                        },
                        confidence: {
                            type: Type.NUMBER,
                            description: "A numerical score from 0 to 100 for delivery validity."
                        },
                        packageCondition: { 
                            type: Type.STRING,
                            description: "Assessment of the package's physical condition from the photo (e.g., 'Good', 'Damaged', 'Not visible')."
                        },
                        locationSafety: {
                            type: Type.STRING,
                            description: "Assessment of the delivery location's safety (e.g., 'Secure', 'Visible from street', 'Weather-exposed')."
                        },
                        signatureLegibility: {
                            type: Type.STRING,
                            description: "Assessment of the signature's clarity (e.g., 'Legible', 'Scribbled', 'Illegible')."
                        },
                        audioAnalysis: {
                            type: Type.STRING,
                            description: "Assessment of the audio recording (e.g., 'Clear confirmation', 'Unclear', 'Not provided')."
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
      model: 'gemini-3-flash-preview',
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

/**
 * Analyzes user feedback using Gemini for categorization and prioritization.
 * @param feedback An object containing the user's rating and comment.
 * @returns A structured analysis of the feedback.
 */
export async function analyzeFeedback(feedback: { rating: number; category: string; comment: string }): Promise<{ priority: string; summary: string; }> {
    const prompt = `
        You are a product feedback analyst for a high-tech logistics company called IntelliTrack.
        Analyze the following user feedback.
        1. Assign a priority level from 'Low', 'Medium', 'High', or 'Critical'. High/Critical should be reserved for major bugs or security issues.
        2. Provide a brief one-sentence summary of the user's core point.

        User Feedback:
        - Rating: ${feedback.rating}/5
        - Category: ${feedback.category}
        - Comment: "${feedback.comment}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priority: {
                            type: Type.STRING,
                            description: "Priority level (Low, Medium, High, Critical)."
                        },
                        summary: {
                            type: Type.STRING,
                            description: "A one-sentence summary of the feedback."
                        }
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error analyzing feedback with Gemini:", error);
        // Return a default response on error
        return {
            priority: 'Medium',
            summary: 'Could not automatically analyze feedback. Needs manual review.'
        };
    }
}