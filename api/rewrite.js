import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, instruction } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are a professional resume editor.
      
      TASK: Rewrite the following text based on this instruction: "${instruction || 'Make it more professional and concise'}".
      
      ORIGINAL TEXT:
      "${text}"
      
      RULES:
      1. Return ONLY the rewritten text.
      2. Do not add quotes or markdown formatting.
      3. Keep the meaning but improve the tone/clarity.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    let rewrittenText = result.text.trim();
    
    // Cleanup
    if (rewrittenText.startsWith('"') && rewrittenText.endsWith('"')) {
      rewrittenText = rewrittenText.slice(1, -1);
    }

    res.status(200).json({ text: rewrittenText });
  } catch (error) {
    console.error('Gemini Rewrite Error:', error);
    res.status(500).json({ error: 'Failed to rewrite text', details: error.message });
  }
}
