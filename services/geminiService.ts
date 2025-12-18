
import { GoogleGenAI, Type } from "@google/genai";
import { EssayFeedback } from "../types";

export const getEssayFeedback = async (essayContent: string, title: string): Promise<EssayFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise a seguinte redação com o título "${title}". Avalie de 0 a 1000 seguindo os critérios do ENEM (5 competências). Retorne um feedback detalhado. Texto: ${essayContent}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          generalComments: { type: Type.STRING },
          competencies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                score: { type: Type.NUMBER },
                comment: { type: Type.STRING }
              },
              required: ["label", "score", "comment"]
            }
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "generalComments", "competencies", "suggestions"]
      }
    }
  });

  const feedbackData = JSON.parse(response.text);
  return feedbackData as EssayFeedback;
};
