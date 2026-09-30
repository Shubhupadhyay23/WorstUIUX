import { GoogleGenAI, Type } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set in the environment variables.');
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });

export const analyzeComplaint = async (title: string, description: string, location: string = '') => {
  const prompt = `Analyze this civic complaint. 
Title: ${title}
Description: ${description}
Location: ${location}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are an AI Civic Issue Analyzer. You must output JSON only, analyzing the complaint and determining category, severity (LOW|MEDIUM|HIGH|CRITICAL), priority (1-10), responsible department, summary, recommended_action, confidence (0-1), requires_immediate_attention (boolean), and duplicate_keywords (array of strings). Do not invent facts.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          priority: { type: Type.NUMBER },
          department: { type: Type.STRING },
          summary: { type: Type.STRING },
          recommended_action: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          requires_immediate_attention: { type: Type.BOOLEAN },
          duplicate_keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['category', 'severity', 'priority', 'department', 'summary', 'recommended_action', 'confidence', 'requires_immediate_attention', 'duplicate_keywords']
      }
    }
  });

  if (!response.text) throw new Error('Failed to generate AI response');
  return JSON.parse(response.text);
};
