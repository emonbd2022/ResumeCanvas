import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  let apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  // Sanitize API Key
  apiKey = apiKey.trim();
  if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
    apiKey = apiKey.slice(1, -1);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const schema = JSON.stringify({
      "basics": {
        "name": "string",
        "title": "string",
        "email": "string",
        "phone": "string",
        "location": { "city": "string", "region": "string", "country": "string" },
        "summary": "string"
      },
      "work": [
        {
          "company": "string",
          "position": "string",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM or Present",
          "summary": "string",
          "highlights": ["string"]
        }
      ],
      "education": [
        {
          "institution": "string",
          "area": "string",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM or Present",
          "gpa": "string or null"
        }
      ],
      "skills": [
        { "name": "string", "level": "string", "keywords": ["string"] }
      ]
    }, null, 2);

    const prompt = `
      You are an expert resume writer. 
      Generate a structured JSON resume based on the user's raw input below.
      
      STRICT RULES:
      1. Output ONLY valid JSON matching this schema: ${schema}
      2. Do not include markdown formatting like \`\`\`json.
      3. Normalize dates to YYYY-MM.
      4. Expand the 'summary' to be professional, max 560 chars.
      5. Generate 3-5 strong, action-oriented 'highlights' for each work experience entry based on the user's input.
      6. Fix typos and improve grammar.
      7. Infer missing location data if obvious, otherwise leave blank.
      
      USER INPUT:
      Name: ${answers.name}
      Title: ${answers.title}
      Email: ${answers.email}
      Summary Input: ${answers.summary}
      Experience Input: ${answers.experience}
      Education Input: ${answers.education}
      Skills Input: ${answers.skills}
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    let text = result.text;
    
    // Clean up markdown code blocks if Gemini adds them despite instructions
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const resume = JSON.parse(text);

    res.status(200).json({ resume });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate resume', details: error.message });
  }
}
