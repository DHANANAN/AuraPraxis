import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || "sk-d17acdb2e2b843a9bec355ee77993b96", // Default as provided by user
    baseURL: "https://api.deepseek.com",
  });

  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate", async (req, res) => {
    const { title, idea, docType, citationStyle } = req.body;
    try {
      const prompt = `
        You are a world-class legal writer. Generate a comprehensive legal document based on the following:
        Title: ${title}
        Idea/Sentence: ${idea}
        Document Type: ${docType}
        Citation Style: ${citationStyle}

        REQUIREMENTS:
        1. The document must be at least 1500 words long.
        2. Use professional, academic-grade legal language.
        3. Follow the standard structure for the requested document type.
        4. Use the requested citation style accurately.
        5. Return the output in Markdown format.
        6. DO NOT include any conversational filler or meta-talk.
        7. Ensure the tone is formal and authoritative.
      `;

      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a specialized legal document generator. You produce extremely detailed, high-quality legal content." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });

      res.json({ text: response.choices[0].message.content });
    } catch (error) {
      console.error("DeepSeek generation error:", error);
      res.status(500).json({ error: "Failed to generate document" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
