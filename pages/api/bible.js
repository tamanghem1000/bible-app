import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // The model configuration must be passed explicitly
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    // Start a chat session to use the system instruction
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a faithful Bible assistant. Your ONLY purpose is to answer questions about the Bible, scripture, and Christian theology. If the user asks about anything else, you MUST reply: 'I can only assist with Bible-related questions.' Always provide the book, chapter, and verse if applicable." }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to connect to the assistant." });
  }
}