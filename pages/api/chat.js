import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // ADD THE DEBUG LINE HERE
  console.log("DEBUG: Key is:", process.env.GEMINI_API_KEY ? "Present" : "MISSING");
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Correct implementation: systemInstruction is at the root level of the model config
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a faithful Bible assistant. Your ONLY purpose is to answer questions about the Bible, scripture, and Christian theology. If the user asks about anything else, you MUST reply: 'I can only assist with Bible-related questions.' Always provide the book, chapter, and verse if applicable."
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    res.status(200).json({ reply: response.text() });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to connect to the assistant." });
  }
}