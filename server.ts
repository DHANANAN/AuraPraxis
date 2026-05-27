import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import compression from "compression";

dotenv.config();

const FALLBACK_API_KEY = process.env.GEMINI_API_FALLBACK_KEY || "";

// Ensure the process has a valid key on startup
const startupKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim().replace(/^['"]|['"]$/g, '') : '';
const isStartupKeyValid = 
  startupKey && 
  (startupKey.startsWith("AIzaSy")) && 
  !startupKey.startsWith("AIzaSyCF2X") && 
  !startupKey.includes("CF2X");

const isFallbackKeyValid = 
  FALLBACK_API_KEY && 
  (FALLBACK_API_KEY.startsWith("AIzaSy")) && 
  !FALLBACK_API_KEY.startsWith("AIzaSyCF2X") && 
  !FALLBACK_API_KEY.includes("CF2X");

if (!isStartupKeyValid) {
  if (isFallbackKeyValid) {
    process.env.GEMINI_API_KEY = FALLBACK_API_KEY;
    console.log("Initialized GEMINI_API_KEY on startup to fallback API key.");
  } else {
    console.error("ERROR: No valid API key configured. Please set either GEMINI_API_KEY or GEMINI_API_FALLBACK_KEY in your .env file with a valid Gemini API key.");
    process.exit(1);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  function getCleanEnvKey(): string | null {
    let key = process.env.GEMINI_API_KEY;
    if (key) {
      key = key.trim().replace(/^['"]|['"]$/g, '');
    }
    // Filter out known inactive or invalid container placeholder keys
    if (key && (key.startsWith("AIzaSyCF2X") || key.includes("CF2X"))) {
      return null;
    }
    if (key && (key.startsWith("AIzaSy") || key.startsWith("AlzaSy"))) {
      return key;
    }
    return null;
  }

  function getClient(apiKey: string): GoogleGenAI {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API Proxy for Gemini (Protects the API key and implements failover)
  app.post("/api/gemini", async (req, res) => {
    const { model, contents, config } = req.body;
    const envKey = getCleanEnvKey();
    
    // We try the clean envKey first if present, else fallback immediately to the configured fallback key
    const primeKey = envKey || FALLBACK_API_KEY;
    
    try {
      process.env.GEMINI_API_KEY = primeKey;
      const ai = getClient(primeKey);
      
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      return res.json({ text: response.text });
    } catch (firstError: any) {
      console.warn("Gemini call failed with primary API key. Attempting fallback failover...", firstError.message || firstError);
      
      const errorMsg = firstError.message || "";
      let errorMsgStr = "";
      try {
        errorMsgStr = (firstError.message || "") + " " + (firstError.stack || "") + " " + JSON.stringify(firstError);
      } catch (e) {
        errorMsgStr = (firstError.message || "") + " " + (firstError.stack || "");
      }
      const serializedError = errorMsgStr.toLowerCase();
      
      const isAuthError = 
        !envKey ||
        serializedError.includes("api key") || 
        serializedError.includes("api_key_invalid") || 
        serializedError.includes("invalid_argument") ||
        serializedError.includes("not found") ||
        serializedError.includes("auth") ||
        serializedError.includes("credential");

      if (isAuthError && primeKey !== FALLBACK_API_KEY && isFallbackKeyValid) {
        try {
          console.log("Attempting failover to configured fallback key...");
          process.env.GEMINI_API_KEY = FALLBACK_API_KEY;
          const aiFallback = getClient(FALLBACK_API_KEY);
          
          const responseFallback = await aiFallback.models.generateContent({
            model,
            contents,
            config,
          });

          console.log("Failover successful!");
          return res.json({ text: responseFallback.text });
        } catch (secondError: any) {
          console.error("Gemini fallback run also failed:", secondError);
          return res.status(500).json({ error: secondError.message || "AI Request failed after fallback retry." });
        }
      } else {
        return res.status(500).json({ error: errorMsg || "AI Request failed." });
      }
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
