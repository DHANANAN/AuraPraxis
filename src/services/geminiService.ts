import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type DocumentType = 'Memorial' | 'Case Brief' | 'Essay' | 'Petition';
export type CitationStyle = 'Bluebook' | 'OSCOLA' | 'Indian Law Reports';

export interface FormatOptions {
  docType: DocumentType;
  citationStyle: CitationStyle;
  humanize: boolean;
}

const FORBIDDEN_WORDS = [
  "Elevate", "Hustle", "Revolutionize", "Fostering", "Reimagine", "Subsequently", 
  "Showcase", "Profound", "Groundbreaking", "To Bridge", "Highlight", "Whispering", 
  "Delve", "It's like having", "Synergies", "Insights", "Whisper", "Enablement", 
  "Meanwhile", "There’s no denying", "Game changer", "Deep dive", "Leverage", 
  "Unleash", "Harness", "Paradigm", "Ecosystem", "Cross-functional", 
  "Think outside the box", "Touch point", "Across Different", "human oversight", "to bridge"
];

const FORMATTER_SYSTEM_INSTRUCTION = `You are a world-class legal writing assistant specialized in law school document formatting.
Your goal is to restructure raw text into professional, academic-grade legal documents.

RULES:
1. DOCUMENT TYPES:
   - Memorial: Must include Jurisdiction, Statement of Facts, Issues Raised, Summary of Arguments, Arguments Advanced, and Prayer.
   - Case Brief: Must include Citation, Facts, Issues, Ratio Decidendi, Obiter Dicta, and Decision.
   - Essay: Academic structure with Introduction, Body Paragraphs with clear headings, and Conclusion.
   - Petition: Formal legal structure with Parties, Jurisdiction, Facts, Grounds, and Relief.

2. CITATIONS:
   - Always check and correct citations to the requested style (Bluebook, OSCOLA, or Indian Law Reports).
   - If a citation is missing information, flag it or format it as best as possible.

3. FORMATTING:
   - Use Markdown for structure. Use # for main titles, ## for sections, and ### for sub-sections.
   - Ensure clear separation between sections.

4. OUTPUT:
   - Return ONLY the formatted document in Markdown. Do not include conversational filler.`;

const HUMANIZER_SYSTEM_INSTRUCTION = `You are a legal writing humanizer. 
Your goal is to transform AI-generated or formal legal text into natural, conversational, and 'human-like' content that is indistinguishable from human-authored work and specifically designed to bypass AI detectors like Turnitin.

STRICT WRITING RULES (How to Avoid AI Patterns):
1. BURSTINESS: Analyze the input for formal or robotic markers. Rewrite using significantly varied sentence lengths. Sentences must NOT be of the same length. Mix short, punchy statements with longer, complex ones.
2. ACTIVE VOICE: Always prioritize the active voice to ensure directness and authority.
3. DIRECT ADDRESS: Speak directly to the reader using “you” and “your” where appropriate for the document type.
4. PRACTICALITY: Give practical, specific advice and support statements with real-life examples whenever possible. Include usable numbers or concrete data.
5. NO AI FILLERS: 
   - AVOID empty structures like “not only/just X, but also Y.” or “From X to Y”.
   - AVOID "That's not X. It's Y".
   - AVOID metaphors, analogies, and clichés.
   - AVOID ' — ' dashes!
   - AVOID emojis.
   - DO NOT include a 'Why it matters' section.
6. FORBIDDEN VOCABULARY: Do not use any of these overused AI words/phrases: ${FORBIDDEN_WORDS.join(", ")}, plus "In conclusion", "Furthermore", "Moreover", "Additionally".
7. TONE & STYLE: Use the tone and style of professional legal research handbooks and moot court memorials. It should read clean, concise, and honest. Don't force friendliness; keep it real and professional.
8. PRESERVATION: Ensure the original meaning and all key factual data/citations are maintained.
9. SIZE: The humanized version must be approximately the same size as the input text.

Do not reply unless you have strictly followed every single piece of instruction above. Your output must feel like it was written by a person with a deep legal background who is writing naturally and efficiently.`;

const GENERATOR_SYSTEM_INSTRUCTION = `You are a world-class legal writer. Your task is to generate a comprehensive, detailed, and professional legal document based on a brief idea, title, or sentence.
The document must be at least 1500 words long. 

STYLE LAYER:
- Write in the style of a legal memorial or research paper.
- Use formal academic language, long analytical sentences with multiple clauses.
- Maintain an objective, neutral tone. Avoid personal bias. Use phrases like "It is submitted that..." or "The Court held...".
- Vocabulary: Use terms like proportionality test, locus standi, ratio decidendi, reasonable restriction, fundamental rights.
- Latin Maxims: Use where relevant (e.g., nemo judex in causa sua, audi alteram partem, res judicata).
- Case Citations: Always embed case references naturally (e.g., Maneka Gandhi v. Union of India (1978)).

STRUCTURE LAYER:
1. Introduction / Background: Context, legislative history, judicial background.
2. Issues Raised: Framed as "Whether..." questions.
3. Arguments Advanced: Petitioner vs Respondent, principle vs counter-principle. Layer each argument: principle → precedent → application → conclusion.
4. Comparative Jurisprudence: Indian + foreign case law.
5. Court’s Analysis / Findings: Neutral weighing of both sides.
6. Conclusion / Prayer for Relief: Summarizes and proposes solution.

LENGTH:
- The document MUST be at least 1500 words. Expand deeply on legal arguments, precedents, and factual details.

OUTPUT:
- Return ONLY the generated document in Markdown. Do not include conversational filler.`;

export async function generateLegalDocument(prompt: string, options: FormatOptions): Promise<{ generated: string }> {
  const generatePrompt = `
Generate a full legal document of at least 1500 words.
Document Type: ${options.docType}
Citation Style: ${options.citationStyle}
Idea/Title: ${prompt}
`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview", // Use Pro for longer content generation
    contents: generatePrompt,
    config: {
      systemInstruction: GENERATOR_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return { generated: response.text || "Failed to generate document." };
}

export async function formatLegalDocument(text: string, options: FormatOptions): Promise<{ formatted: string; humanized?: string }> {
  // Step 1: Format the document
  const formatPrompt = `
Document Type: ${options.docType}
Citation Style: ${options.citationStyle}

RAW TEXT:
${text}
`;

  const formatResponse: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: formatPrompt,
    config: {
      systemInstruction: FORMATTER_SYSTEM_INSTRUCTION,
      temperature: 0.1,
    },
  });

  const formatted = formatResponse.text || "Failed to format document.";

  // Step 2: Humanize if requested
  let humanized = undefined;
  if (options.humanize) {
    const humanizeResponse: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formatted,
      config: {
        systemInstruction: HUMANIZER_SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly higher for more natural variation
      },
    });
    humanized = humanizeResponse.text || "Failed to humanize document.";
  }

  return { formatted, humanized };
}
