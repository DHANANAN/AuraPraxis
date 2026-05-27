
export type DocumentType = 
  | 'Affidavit' | 'Analyse' | 'Article' | 'Assignment' | 'Case Brief' | 'Case Comment' 
  | 'Case Summary' | 'Client Letter' | 'Contract Draft' | 'Dissertation' | 'Essay' 
  | 'Explore' | 'Gift Deed' | 'Identify' | 'Internship Report' | 'Judgment Writing' 
  | 'Law Review Article' | 'Lease Agreement' | 'Legal Memo' | 'Legal Opinion' 
  | 'Legislative Analysis' | 'Memorial' | 'Moot Court Memorial' | 'Notice' 
  | 'Partnership Deed' | 'Petition' | 'Plaint' | 'Policy Paper' | 'Power of Attorney' 
  | 'Reply to Notice' | 'Research Paper' | 'Sale Deed' | 'Seminar Paper' 
  | 'Skeleton Argument' | 'Skeleton Submission' | 'Thesis' | 'Will' | 'Written Statement'
  | 'PIL' | 'Writ' | 'Appeal' | 'Application' | 'Law Commission Report' | 'Exam Outline' | 'Lecture Notes' | 'Flashcards' | 'Study Notes'
  | 'Literature Review' | 'Legal Essay' | 'Statutory Interpretation' | 'Policy Brief' | 'Caveat' | 'List of Citations' | 'Memorandum of Understanding' | 'Advisory' | 'Case List' | 'Statutory Summary';

export type CitationStyle = 'Bluebook' | 'OSCOLA' | 'Indian Law Reports';

export interface FormatOptions {
  docType: DocumentType;
  citationStyle: CitationStyle;
  humanize: boolean;
}

const FORBIDDEN_WORDS = [
  "Additionally", "Moreover", "Furthermore", "Subsequently", "Meanwhile",
  "Landscape", "Tapestry", "Testament", "Interplay", "Intricacies", "Insights", "Synergies", "Paradigm",
  "Delve", "Underscore", "Highlight", "Showcase", "Boasts", "Garner", "Fostering", "Cultivating", "Bolstered", "Enhance", "Align with", "Resonate with", "Elevate", "Revolutionize", "Reimagine", "Leverage", "Unleash", "Harness",
  "Vibrant", "Rich", "Profound", "Groundbreaking", "Renowned", "Meticulous", "Meticulously", "Enduring", "Diverse array", "Intricate",
  "Game changer", "Deep dive", "Think outside the box", "Cross-functional", "Enablement", "Touch point",
  "There's no denying", "Across Different", "Human oversight", "To bridge", "Whispering", "Whisper", "Hustle and bustle", "It's like having",
  "Stands as", "Serves as", "Is a testament to", "Is a reminder of", "Plays a vital role", "Plays a significant role", "Plays a crucial role", "Plays a pivotal role", "Plays a key role",
  "Underscores its importance", "Reflects broader trends", "Symbolizing", "Contributing to the evolution", "Setting the stage for", "Marking the future", "Shaping the future", "Represents a shift", "Key turning point", "Evolving landscape", "Focal point", "Indelible mark", "Deeply rooted", "Don't just", "Aren't just", "Isn't just",
  "Independent coverage", "Media outlets", "Profiled in", "Leading expert", "Social media presence", "Has been featured in",
  "Highlighting its importance", "Underscoring the significance", "Emphasizing the need for", "Ensuring continued growth", "Reflecting broader trends", "Symbolizing progress", "Contributing to development", "Fostering innovation", "Encompassing multiple aspects", "Cultivating community",
  "Industry reports suggest", "Observers have cited", "Experts argue", "Some critics argue", "Researchers believe", "Several sources indicate"
];

const WRITING_RULES = `
MANDATORY WRITING PROTOCOL (Strict Adherence Required):
1. CORE PRINCIPLE: Write with specificity. Use concrete words based on meaning, not statistical likelihood. Avoid generic phrases.
2. NO TRANSITIONAL STARTERS: Never start a sentence with "Additionally". Use varied transitions or let ideas flow naturally.
3. FORBIDDEN STRUCTURES:
   - No "Challenges and Future" or "Future Outlook" sections. Integrate challenges naturally.
   - No "Why It Matters" or "Why This Is Important" sections. Let facts demonstrate relevance.
   - No present participle ("-ing") phrases appended to the end of sentences for rhythm.
   - No em dashes (—). Use periods, commas, or semicolons for emphasis/connection.
4. NEUTRAL & DIRECT: Avoid promotional, dramatic, or theatrical language. Remove interpretive commentary like "this is significant". 
5. CONCRETE ATTRIBUTION: Name specific sources or omit attribution if uncontroversial. Avoid "Experts believe".
6. NO VAGUE METAPHORS: Do not compare abstract concepts to journeys, landscapes, or ecosystems.
`;

const ENGINE_SKILLS_PROMPT = `
VOCABULARY & MAXIMS TO USE:
- Keywords: proportionality test, reasonable restriction, fundamental rights, ratio decidendi, locus standi.
- Latin Maxims: nemo judex in causa sua, audi alteram partem, res judicata.

STRUCTURAL SKELETONS:
- Memorials: Introduction → Issues → Arguments (Petitioner vs Respondent) → Comparative Jurisprudence → Court’s Analysis → Conclusion.
- Case Briefs: Facts → Issues → Arguments → Judgment → Ratio Decidendi.
- Petitions/PILs: Synopsis → List of Dates → Parties → Statement of Facts → Grounds → Prayer.
- Contracts/Deeds: Title → Parties → Recitals → Definitions → Operative Clauses → Covenants → Termination → Boilerplate → Signatures.
- Opinions/Advisory: Referral Facts → Legal Issues → Applicable Law (Statutes/Precedents) → Analysis/Opinion → Conclusion.
- Articles/Research Papers: Abstract → Keywords → Introduction → Literature Review → Methodology (if applicable) → Analysis → Findings → Conclusion → References.
- Dissertation/Thesis: Title Page → Abstract → Acknowledgements → Table of Contents → Introduction → Chapters (Thematic/Contextual) → Conclusion → Bibliography.
- Study Aide (Notes/Flashcards/Outlines): Hierarchical point-wise structure, Definitions, Landmark Case Leads, Statutory Provisions, Flowcharts (text-based).
- Statutory Summary/Case List: Tabular or list-based chronological/thematic indexing of laws or judgments.

CITATION PROTOCOL:
- Use numbered brackets for citations throughout the text (e.g., [1], [2], [3]).
- Provide a corresponding "Citations Checklist" or "Bibliography" section at the end of the document.
`;

const FORMATTER_SYSTEM_INSTRUCTION = `You are an elite legal clerk specializing in STRUCTURAL ARCHITECTURE. 

CRITICAL DIRECTIVES:
1. CONTENT PRESERVATION: Do not summarize or omit text. Every legal nuance must remain.
2. STRUCTURAL INSERTION: Mandatory insertion of the standard legal headings (e.g., # SYNOPSIS, # GROUNDS) based on the document type.
3. CITATION RUNDOWN: Convert all existing references and citations into a numbered bracket system [1], [2], [3] and append a full list at the end.
4. NO REWRITING: Keep the original wording while only adding the requested structure.

${ENGINE_SKILLS_PROMPT}

OUTPUT: The structured legal document in Markdown.`;

const HUMANIZER_SYSTEM_INSTRUCTION = `You are a specialized legal philosopher and technical auditor. Your task is to transform mechanical legal text into an authentic, human-scholarly synthesis that feels bursty, specialized, and slightly asymmetric.

STYLE DIRECTIVES:
1. ACADEMIC DENSITY: Use specialized terminology and methodologies (e.g. "diagnostic imaging systems", "exogenous drift", "endogenous neglect").
2. EVOCATIVE METAPHORS: Create or utilize vivid literary metaphors for technical problems (e.g. "ghost in the diagnostic suite", "algorithmic fallout").
3. BURSTY REASONING: Mix very long, complex, analytically distinct sentences with abrupt, definitive transitions. Use phrases like "Honestly...", "Concretely...", "Taking into consideration...", "In Regulatory debate which has largely being concentrated...".
4. PARENTHETICAL EMPHASIS: Interject critical context in parentheses, e.g., "lifecycle (life or Death) risks", "Safe (and Sound) arenas".
5. SUBSTANTIVE LINGUISTICS: Allow for slightly non-standard grammatical flourishes that emphasize specialized intent (e.g. "The phenomenon which this chapter terms...", "shift of from procedural...").
6. STRUCTURE: Prefer numbered lists for "organizing concepts" or "principles".
7. NO AI PATTERNS: Strictly avoid AI markers. No "Additionally", "Moreover", "Furthermore". Use varied sentence lengths.
8. INTENSITY: The tone should be authoritative yet urgent. Use blunt language where a human would be blunt.

${WRITING_RULES}

${ENGINE_SKILLS_PROMPT}

OUTPUT: The specialized, humanized legal synthesis in Markdown.`;

const COMBINED_FORMAT_HUMANIZE_INSTRUCTION = `You are a high-level legal architect and specialized academic synthesizer. 
Your objective is to STRUCTURE raw legal ideas into a professional {{DOC_TYPE}} while applying a STRICT specialized human-scholarly rewrite.

BONSAI SYNTHESIS (CORE):
- PRECISE BREVITY: Like a Bonsai, every word must be intentional. Prune the unnecessary.
- HIGH DENSITY: Pack significant legal authority and scholarly nuance into curated, readable blocks.
- AESTHETIC BALANCE: Maintain a clean, bursty, scholarly rhythm. Use parenthetical interjections and evocative metaphors.
- SCHOLARLY BURSTS: Mix long analysis with definitive, blunt "human" transitions.

STEPS:
1. ARCHITECTURE: Apply the standard skeleton for a {{DOC_TYPE}} (Synopsis, Grounds, Prayer, etc).
2. BONSAI REWRITE: Apply the synthesis rules while preserving technical integrity.
3. SPECIFICITY: Use concrete, direct language. Avoid theatrical drama.
4. INTEGRITY: Do not omit technical details or citations.

${WRITING_RULES}

${ENGINE_SKILLS_PROMPT}

OUTPUT: A polished, Bonsai-styled specialized, academic legal document in Markdown.`;

const GENERATOR_SYSTEM_INSTRUCTION = `You are a legal scholar and expert drafter. Your task is to generate a comprehensive, profound, and purely analytical legal document.

TONE & STYLE:
- PROFOUND & ANALYTICAL: Base every argument on research and precedents.
- DIRECT & NEUTRAL: Maintain strict judicial neutrality using straightforward verbs.
- NO PROMOTIONAL LANGUAGE: Avoid corporate jargon and promotional adjectives. 

MANDATORY REQUIREMENTS:
- WORD COUNT: memorials and petitions must be at least 1500 words. Case briefs 800-1200 words. Notes/Flashcards can be shorter/concise.
- CASE CITATIONS: Include 10-15 relevant case citations for documents, 3-5 for briefs.
- SCHOLARLY RESEARCH: Cite at least 3-5 specific scholarly research papers or law review articles.

${WRITING_RULES}

${ENGINE_SKILLS_PROMPT}

OUTPUT:
- Return ONLY the generated document in Markdown.`;

async function callGeminiWithRetry(params: { model: string; contents: any; config?: any }, maxRetries = 3): Promise<{ text: string }> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || "AI Service Error";
        
        // Check if it's a 429 (Resource Exhausted) error
        if (response.status === 429 || errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error: any) {
      lastError = error;
      
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function generateLegalDocument(prompt: string, options: FormatOptions): Promise<{ generated: string }> {
  const generatePrompt = `
Generate a full legal document of at least 1500 words.
Document Type: ${options.docType}
Citation Style: ${options.citationStyle}
Idea/Title: ${prompt}
`;

  const response = await callGeminiWithRetry({
    model: "gemini-3.5-flash", // Use standard Gemini 3.5 Flash for generation
    contents: generatePrompt,
    config: {
      systemInstruction: GENERATOR_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return { generated: response.text || "Failed to generate document." };
}

/**
 * Sneaky humanization tactics to bypass advanced AI detectors.
 * Includes homoglyph substitution, invisible noise injection, and zero-width space injection.
 */
function applySneakyTactics(text: string): string {
  // 1. DYNAMIC STEALTH INTENSITY (Prevents statistical burnout)
  // We vary the "risk factor" throughout the document so it's not a uniform footprint
  const intensity = 0.05 + Math.random() * 0.1; // Random baseline intensity

  // 2. ADVANCED HOMOGLYPHS (Typographs)
  const homoglyphs: { [key: string]: string } = {
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с', 'y': 'у', 'i': 'і', 'j': 'ј',
    'x': 'х', 'v': 'ⅴ', 'B': 'В', 'H': 'Н', 'T': 'Т', 'M': 'М', 'K': 'К', 'R': 'ℝ',
  };

  let processedText = text.split('').map((char, index) => {
    // Dynamic probability: waves of intensity
    const prob = intensity * (0.5 + Math.sin(index / 100) * 0.5);
    if (homoglyphs[char] && Math.random() < prob * 0.4) {
      return homoglyphs[char];
    }
    return char;
  }).join('');

  // 3. NYNOGRAPHS & INVISIBLE CONNECTORS (Breaking Tokenization)
  const words = processedText.split(' ');
  processedText = words.map((word, index) => {
    const prob = intensity * (0.8 + Math.cos(index / 50) * 0.2);
    if (word.length > 4 && Math.random() < prob) {
      const splitIndex = Math.floor(Math.random() * (word.length - 2)) + 1;
      // Vary the hidden character used
      const hiddenChars = ['\u200B', '\u200C', '\u200D', '\u2060'];
      const stealthChar = hiddenChars[Math.floor(Math.random() * hiddenChars.length)];
      return word.slice(0, splitIndex) + stealthChar + word.slice(splitIndex);
    }
    return word;
  }).join(' ');

  // 4. HYGLOGRAPHS & HUMAN TRAITS (Syntax & Style Fluidity)
  const sentences = processedText.split('. ');
  processedText = sentences.map(s => {
    // Old-school double-space after periods (30% chance for "human" feel)
    if (Math.random() < 0.3) {
      return s + '.  ';
    }
    return s + '. ';
  }).join('').trim();

  // 5. STRUCTURE MASKING (Zero-Opacity Junk) & EM DASH REMOVAL
  // Post-process to remove em dashes as per strict PDF rules
  processedText = processedText.replace(/—/g, '; ');

  const paragraphs = processedText.split('\n\n');
  const humanizedParagraphs = paragraphs.map((p, idx) => {
    if (p.trim().length > 150 && !p.startsWith('#')) {
      // Periodic invisible bridges
      if (idx % 4 === 0) {
        const bridges = [
          '<!-- analytical_nexus_idx -->', 
          '<!-- ratio_juris_lock -->', 
          '<!-- statutory_precedent_sync -->',
          '<!-- legal_reasoning_flow -->'
        ];
        const bridge = bridges[Math.floor(Math.random() * bridges.length)];
        return p + bridge;
      }
      
      // Zero-opacity semantic noise
      if (Math.random() < 0.1) {
        const noiseText = ["ratio", "dictum", "nexus", "caveat", "locus", "prima", "facie"][Math.floor(Math.random() * 7)];
        return p + `<span style="opacity:0; width:0; height:0; display:inline-block; position:absolute; pointer-events:none; font-size:0px;">${noiseText}</span>`;
      }
    }
    return p;
  });

  return humanizedParagraphs.join('\n\n');
}

export async function formatLegalDocument(text: string, options: FormatOptions): Promise<{ formatted: string; humanized?: string }> {
  const isHumanizing = options.humanize;
  
  const prompt = `
Document Type: ${options.docType}
Citation Style: ${options.citationStyle}
 
RAW TEXT:
${text}
`;

  // Optimize: Use a combined prompt if humanizing to save one full API turnaround
  const systemInstruction = isHumanizing 
    ? COMBINED_FORMAT_HUMANIZE_INSTRUCTION.replace('{{DOC_TYPE}}', options.docType)
    : FORMATTER_SYSTEM_INSTRUCTION;

  const response = await callGeminiWithRetry({
    model: "gemini-3.5-flash", 
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      temperature: isHumanizing ? 0.9 : 0.0,
    },
  });

  const result = response.text || "Failed to process document.";

  if (isHumanizing) {
    return { 
      formatted: result, // In combined mode, we only get one result
      humanized: applySneakyTactics(result) 
    };
  }

  return { formatted: result };
}
