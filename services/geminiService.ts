import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DocumentAnalysis } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

// Helper to get API client
const getClient = () => {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem("GEMINI_API_KEY") : null;
  const apiKey = localKey || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please click the Settings/Key icon at the top right to configure your Google Gemini API key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeDocument = async (
  input: { base64?: string; textContent?: string; mimeType: string }
): Promise<DocumentAnalysis> => {
  const ai = getClient();
  
  const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "A concise summary of the document content." },
      documentType: { type: Type.STRING, description: "The type of document (e.g., Receipt, Invoice, Contract, Graph, Research Paper, Note)." },
      kvPairs: { 
        type: Type.ARRAY, 
        description: "List of key data points extracted from the document.",
        items: {
          type: Type.OBJECT,
          properties: {
            key: { type: Type.STRING, description: "The label of the data point" },
            value: { type: Type.STRING, description: "The value of the data point" }
          },
          required: ["key", "value"]
        },
        nullable: true
      },
      rawText: { type: Type.STRING, description: "The main textual content extracted from the document." }
    },
    required: ["summary", "documentType", "rawText"]
  };

  const parts = [];

  if (input.base64) {
    // Handle Images and PDFs
    parts.push({
      inlineData: {
        data: input.base64,
        mimeType: input.mimeType
      }
    });
    parts.push({
      text: "Analyze this document. Provide a summary, identify the type, extract all relevant key entities as key-value pairs, and transcribe the main text."
    });
  } else if (input.textContent) {
    // Handle Text-based content (DOCX, TXT, HTML)
    parts.push({
      text: `Here is the content of a document (${input.mimeType}):\n\n${input.textContent}\n\nAnalyze this content. Provide a summary, identify the type, extract all relevant key entities as key-value pairs, and extract the main text.`
    });
  } else {
    throw new Error("No content to analyze");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are DocuLens, an expert document analysis AI. Your goal is to extract accurate information from images and documents.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean markdown if present
    const cleanText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    let rawResult;
    try {
      rawResult = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Invalid JSON response from model");
    }

    // Transform array back to Record object for the UI
    const keyEntities: Record<string, string | number | boolean> = {};
    if (rawResult.kvPairs && Array.isArray(rawResult.kvPairs)) {
      rawResult.kvPairs.forEach((item: any) => {
        if (item.key) {
          keyEntities[item.key] = item.value || "";
        }
      });
    }

    return {
      summary: rawResult.summary,
      documentType: rawResult.documentType,
      keyEntities: keyEntities,
      rawText: rawResult.rawText
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export class DocumentChatSession {
  private chat: any;
  private history: any[] = [];
  private contextPart: any;

  constructor(input: { base64?: string; textContent?: string; mimeType: string }) {
    const ai = getClient();
    
    if (input.base64) {
      this.contextPart = {
        inlineData: {
          data: input.base64,
          mimeType: input.mimeType
        }
      };
    } else if (input.textContent) {
      this.contextPart = {
        text: `Context Document Content:\n${input.textContent}`
      };
    }

    this.chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are a helpful assistant analyzing a specific document provided by the user. Answer questions based on the document content.",
      }
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      let response;
      if (this.history.length === 0) {
        // First message: Include the context (Image/PDF or Text)
        response = await this.chat.sendMessage({
          message: {
            parts: [
              this.contextPart,
              { text: message }
            ]
          }
        });
      } else {
        // Subsequent messages: Text only
        response = await this.chat.sendMessage({
          message: {
            parts: [{ text: message }]
          }
        });
      }

      this.history.push({ role: 'user', text: message });
      const responseText = response.text || "I couldn't generate a response.";
      this.history.push({ role: 'model', text: responseText });

      return responseText;
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  }
}
