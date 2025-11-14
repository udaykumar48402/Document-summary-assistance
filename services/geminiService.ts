import { GoogleGenAI } from "@google/genai";
import { SummaryLength } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

export const summarizeDocument = async (fileBase64: string, mimeType: string, length: SummaryLength): Promise<string> => {
  try {
    const imagePart = fileToGenerativePart(fileBase64, mimeType);
    const prompt = `Please provide ${length} of the content in this document. Highlight the key points and main ideas. If the document is an image of text, perform OCR first. Format the output using markdown.`;
    
    // FIX: Directly call ai.models.generateContent as per the coding guidelines.
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    
    return result.text;
  } catch (error) {
    console.error("Error summarizing document:", error);
    throw new Error("Failed to generate summary. Please check the console for details.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        // FIX: Directly call ai.models.generateImages as per the coding guidelines.
        const result = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (result.generatedImages && result.generatedImages.length > 0) {
            const base64ImageBytes = result.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check the console for details.");
    }
}