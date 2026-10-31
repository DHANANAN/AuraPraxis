import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Client } from "@gradio/client";
import dotenv from "dotenv";
import compression from "compression";
import fs from "fs";

const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

// Manual robust loading to override any pre-existing environment placeholders
try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
    if (match && match[1]) {
      const parsedKey = match[1].trim();
      const isValid = parsedKey && !parsedKey.startsWith("AIzaSyCF2X") && !parsedKey.includes("CF2X") && parsedKey.length >= 10;
      if (isValid) {
        process.env.GEMINI_API_KEY = parsedKey;
      }
    }
  }
} catch (e: any) {
  // Silent catch to prevent any leaks or intrusive warnings
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
    // Accept any valid key of sufficient length
    if (key && key.length >= 10) {
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

  // Helper to wait
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper to detect retryable errors
  function isTransientError(err: any): boolean {
    const errMsg = String(err?.message || err || "").toLowerCase();
    return (
      errMsg.includes("503") ||
      errMsg.includes("502") ||
      errMsg.includes("504") ||
      errMsg.includes("429") ||
      errMsg.includes("unavailable") ||
      errMsg.includes("high demand") ||
      errMsg.includes("resource_exhausted") ||
      errMsg.includes("overloaded") ||
      errMsg.includes("timeout") ||
      errMsg.includes("econnrefused") ||
      errMsg.includes("etimedout")
    );
  }

  // Helper to scrub any API key pattern from error logs
  function scrubApiKey(err: any): string {
    if (!err) return "";
    const rawMessage = typeof err === "string" ? err : String(err?.message || err?.stack || JSON.stringify(err));
    // Match common API key formats (AIzaSy..., AQ....)
    const keyRegex = /(AIzaSy[A-Za-z0-9_\-]{33}|AQ\.[A-Za-z0-9_\-]{30,60})/g;
    return rawMessage.replace(keyRegex, "[REDACTED_API_KEY]");
  }

  // Available models route with latest Argonne flagship
  app.get("/api/models", (req, res) => {
    res.json({
      models: [
        {
          id: "gemini-4-argon",
          name: "Gemini 4 Argon",
          tag: "Latest Flagship",
          badge: "Argonne",
          description: "Peak doctrinal reasoning, exhaustive statutory analysis & landmark authorities",
        },
        {
          id: "gemini-3.8-flash",
          name: "Gemini 3.8 Flash",
          tag: "High Speed",
          description: "Fast, balanced legal drafting and precision layout",
        },
        {
          id: "gemini-3.1-flash-lite",
          name: "Gemini 3.1 Flash Lite",
          tag: "Ultra-Fast",
          description: "Instant turnaround and rapid structural drafting",
        },
      ],
      default: "gemini-4-argon",
    });
  });

  // API Proxy for Gemini with Argonne router update (resilient retry and intelligent fallback)
  app.post("/api/gemini", async (req, res) => {
    const { model, contents, config } = req.body;
    const envKey = getCleanEnvKey();
    
    if (!envKey) {
      console.error("Gemini call failed: No valid GEMINI_API_KEY environment variable is set.");
      return res.status(400).json({
        error: "GEMINI_API_KEY environment variable is missing or invalid. Please configure it in your Settings under API Keys, or in your local .env file."
      });
    }

    // Resolve model name including latest Argonne aliases
    let primaryModel = model || "gemini-4-argon";
    const normalized = String(primaryModel).toLowerCase().trim();
    if (
      normalized === "argonne" || 
      normalized === "argon" || 
      normalized === "gemini-argon" || 
      normalized === "gemini-4" || 
      normalized === "gemini-4-argonne"
    ) {
      primaryModel = "gemini-4-argon";
    }

    // Dynamic resilient fallback chain
    const fallbackCandidates = ["gemini-4-argon", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
    const fallbackModels = fallbackCandidates.filter(m => m !== primaryModel);

    const ai = getClient(envKey);
    const maxRetries = 3;

    async function attemptGeneration(selectedModel: string, isFallbackAttempt: boolean = false): Promise<any> {
      let currentDelay = 1000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[GEMINI] Model: ${selectedModel} (Attempt ${attempt}/${maxRetries}${isFallbackAttempt ? " - FALLBACK" : ""})`);
          const response = await ai.models.generateContent({
            model: selectedModel,
            contents,
            config,
          });
          return response;
        } catch (error: any) {
          const isRetryable = isTransientError(error);
          console.warn(
            `[GEMINI] Attempt ${attempt} failed for model ${selectedModel}. Error: ${scrubApiKey(error)}. Retryable: ${isRetryable}`
          );

          if (isRetryable && attempt < maxRetries) {
            const jitter = Math.floor(Math.random() * 200);
            const sleepTime = currentDelay + jitter;
            console.log(`[GEMINI] Waiting ${sleepTime}ms before retrying...`);
            await delay(sleepTime);
            currentDelay *= 2;
          } else {
            throw error;
          }
        }
      }
    }

    try {
      // First attempt with primary requested model (defaulting to latest gemini-4-argon)
      const response = await attemptGeneration(primaryModel, false);
      return res.json({ text: response.text });
    } catch (primaryError: any) {
      console.error(`[GEMINI] Primary model '${primaryModel}' failed: ${scrubApiKey(primaryError)}. Attempting fallback models...`);
      
      for (const fallbackModel of fallbackModels) {
        try {
          console.log(`[GEMINI] Attempting fallback to '${fallbackModel}'...`);
          const fallbackResponse = await attemptGeneration(fallbackModel, true);
          console.log(`[GEMINI] Fallback to '${fallbackModel}' succeeded!`);
          return res.json({ text: fallbackResponse.text });
        } catch (fbErr: any) {
          console.warn(`[GEMINI] Fallback to '${fallbackModel}' also failed: ${scrubApiKey(fbErr)}`);
        }
      }

      return res.status(500).json({
        error: `AI Request failed across available models. Please try again in a few moments. (Details: ${scrubApiKey(primaryError)})`
      });
    }
  });

  // Hugging Face conversantech/humanizer-ai API Proxy
  app.post("/api/humanize-hf", async (req, res) => {
    const { text, intensity = "heavy", hf_token } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Input text is required for humanization." });
    }

    const validIntensity = ["light", "standard", "heavy"].includes(intensity) ? intensity : "heavy";
    const resolvedToken = (hf_token && typeof hf_token === "string" && hf_token.trim())
      ? hf_token.trim()
      : (process.env.HF_TOKEN || process.env.HUGGINGFACE_API_TOKEN || undefined);

    console.log(`[HF-HUMANIZER] Request received with intensity: ${validIntensity}. Custom token provided: ${Boolean(hf_token)}`);

    try {
      // Connect to Hugging Face space conversantech/humanizer-ai
      const connectOptions = resolvedToken ? { hf_token: resolvedToken as any } : undefined;
      const client = await Client.connect("conversantech/humanizer-ai", connectOptions);

      // Handle chunking if document is exceptionally long (> 2000 words)
      const words = text.trim().split(/\s+/);
      if (words.length > 2000) {
        console.log(`[HF-HUMANIZER] Document is long (${words.length} words). Processing in chunks...`);
        const chunkSize = 1200;
        const chunks: string[] = [];
        for (let i = 0; i < words.length; i += chunkSize) {
          chunks.push(words.slice(i, i + chunkSize).join(" "));
        }

        const humanizedChunks: string[] = [];
        let aggregatedAnalysis = "";

        for (let idx = 0; idx < chunks.length; idx++) {
          const chunkResult = await client.predict("/process_text_advanced", {
            input_text: chunks[idx],
            intensity: validIntensity,
          });

          const data = chunkResult.data as [string, string];
          let chunkText = data[0] || chunks[idx];
          chunkText = chunkText.replace(/^Paraphrase:\s*/i, "").trim();
          humanizedChunks.push(chunkText);
          if (!aggregatedAnalysis && data[1]) {
            aggregatedAnalysis = data[1];
          }
        }

        return res.json({
          humanizedText: humanizedChunks.join("\n\n"),
          analysis: aggregatedAnalysis,
          source: "hf_api",
        });
      }

      // Standard single-pass execution
      const result = await client.predict("/process_text_advanced", {
        input_text: text,
        intensity: validIntensity,
      });

      const data = result.data as [string, string];
      let humanizedText = data[0] || text;
      // Strip any accidental 'Paraphrase: ' prefix from the model
      humanizedText = humanizedText.replace(/^Paraphrase:\s*/i, "").trim();
      const analysis = data[1] || "";

      console.log(`[HF-HUMANIZER] Successfully humanized content via conversantech/humanizer-ai.`);
      return res.json({
        humanizedText,
        analysis,
        source: "hf_api",
      });

    } catch (error: any) {
      const errMsg = String(error?.message || error || "");
      console.error("[HF-HUMANIZER] Error calling conversantech/humanizer-ai:", errMsg);

      const isRateLimit = errMsg.includes("429") || 
                          errMsg.toLowerCase().includes("rate limit") || 
                          errMsg.toLowerCase().includes("too many requests") ||
                          errMsg.toLowerCase().includes("quota");

      const isUnavailable = errMsg.toLowerCase().includes("sleeping") ||
                            errMsg.toLowerCase().includes("queue") ||
                            errMsg.toLowerCase().includes("timeout") ||
                            errMsg.toLowerCase().includes("econnrefused") ||
                            errMsg.toLowerCase().includes("failed to fetch");

      return res.status(isRateLimit ? 429 : 502).json({
        error: isRateLimit
          ? "Hugging Face Space rate limit reached. Provide a personal Hugging Face API token in Settings to bypass public queues."
          : `Hugging Face Space temporarily unavailable (${errMsg.slice(0, 120)}). Local processing fallback recommended.`,
        isRateLimit,
        isUnavailable,
        rawError: errMsg,
      });
    }
  });

  // Hugging Face Token Validation endpoint
  app.post("/api/hf-token/validate", async (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== "string" || !token.trim()) {
      return res.status(400).json({ valid: false, error: "Please enter a Hugging Face API token." });
    }

    const cleanToken = token.trim();
    if (!cleanToken.startsWith("hf_")) {
      return res.status(400).json({ 
        valid: false, 
        error: "Invalid token format. Hugging Face Access Tokens should begin with 'hf_'." 
      });
    }

    try {
      const hfRes = await fetch("https://huggingface.co/api/whoami-v2", {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      if (hfRes.ok) {
        const userInfo: any = await hfRes.json();
        return res.json({
          valid: true,
          username: userInfo.name || userInfo.fullname || "Hugging Face User",
          type: userInfo.type || "user",
          email: userInfo.email || undefined,
        });
      }

      if (hfRes.status === 401) {
        return res.status(401).json({
          valid: false,
          error: "Invalid or expired Hugging Face token. Please check your token at huggingface.co/settings/tokens."
        });
      }

      return res.status(hfRes.status).json({
        valid: false,
        error: `Validation error (HTTP ${hfRes.status}).`
      });
    } catch (e: any) {
      return res.status(500).json({
        valid: false,
        error: `Could not connect to Hugging Face: ${e?.message || e}`
      });
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
