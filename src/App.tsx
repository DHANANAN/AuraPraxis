import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle2, 
  Scale, 
  BookOpen, 
  FileSignature, 
  Gavel,
  Copy,
  Check,
  History,
  FileUp,
  Moon,
  Sun,
  Settings,
  LayoutGrid,
  Menu,
  Maximize2,
  X,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from './lib/utils';
import { useDebounce } from './hooks/useDebounce';
import { 
  formatLegalDocument, 
  generateLegalDocument, 
  DocumentType, 
  CitationStyle, 
  FormatOptions,
  getDocumentArchetype 
} from './services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite native worker import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const CATEGORIES = {
  'Litigation': [
    'Petition', 'PIL', 'Writ', 'Appeal', 'Application', 'Memorial', 'Moot Court Memorial', 
    'Plaint', 'Written Statement', 'Affidavit', 'Judgment Writing', 'Skeleton Argument',
    'Caveat', 'List of Citations'
  ],
  'Drafting': [
    'Contract Draft', 'Gift Deed', 'Sale Deed', 'Partnership Deed', 'Lease Agreement', 
    'Memorandum of Understanding', 'Notice', 'Reply to Notice', 'Power of Attorney', 'Will', 'Advisory'
  ],
  'Research': [
    'Case Brief', 'Case Comment', 'Case Summary', 'Research Paper', 'Law Review Article', 
    'Article', 'Dissertation', 'Thesis', 'Literature Review', 'Legal Essay',
    'Law Commission Report', 'Legal Opinion', 'Legal Memo', 'Legislative Analysis', 'Policy Brief'
  ],
  'Study Aide': [
    'Lecture Notes', 'Study Notes', 'Flashcards', 'Exam Outline', 'Assignment', 'Seminar Paper',
    'Case List', 'Statutory Summary'
  ]
};

const AVAILABLE_MODELS = [
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    badge: 'Flagship • Argonne',
    desc: 'Peak doctrinal reasoning, statutory synthesis & landmark judicial authorities',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'High Speed',
    desc: 'Fast, balanced drafting and precision structure',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra-Fast',
    desc: 'Instant turnaround and rapid structural outlines',
  },
];

export default function App() {
  const [inputText, setInputText] = useState(() => localStorage.getItem('aura_input') || '');
  const [formattedText, setFormattedText] = useState(() => localStorage.getItem('aura_formatted') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('Litigation');
  const [selectedModel, setSelectedModel] = useState<string>(() => 
    localStorage.getItem('aura_model') || 'gemini-4-argon'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('aura_dark_mode') === 'true');
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [history, setHistory] = useState<{ id: string; type: string; date: string; content: string }[]>(() => {
    const saved = localStorage.getItem('aura_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | 'formatted'>('original');
  const [options, setOptions] = useState<FormatOptions>(() => {
    const saved = localStorage.getItem('aura_options_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      docType: 'Petition',
      citationStyle: 'Indian Law Reports',
      model: localStorage.getItem('aura_model') || 'gemini-4-argon',
    };
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize category with docType
  useEffect(() => {
    const parentCategory = Object.entries(CATEGORIES).find(([_, list]) => 
      list.includes(options.docType)
    )?.[0];
    if (parentCategory && selectedCategory !== parentCategory) {
      setSelectedCategory(parentCategory);
    }
  }, [options.docType]);

  // Synchronize options with selected model
  useEffect(() => {
    setOptions(prev => ({ ...prev, model: selectedModel }));
    localStorage.setItem('aura_model', selectedModel);
  }, [selectedModel]);

  // Debounced values
  const debouncedInput = useDebounce(inputText, 1500);
  const debouncedFormatted = useDebounce(formattedText, 1500);

  useEffect(() => {
    localStorage.setItem('aura_input', debouncedInput);
  }, [debouncedInput]);

  useEffect(() => {
    localStorage.setItem('aura_formatted', debouncedFormatted);
  }, [debouncedFormatted]);

  useEffect(() => {
    localStorage.setItem('aura_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('aura_options_v4', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem('aura_dark_mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } else if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';
        }
        
        setInputText(fullText.trim());
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setInputText(event.target?.result as string);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      setErrorMessage('Failed to read file. Please ensure it is a valid document.');
    }
  };

  const handleFormat = async () => {
    if (!inputText.trim()) {
      setErrorMessage('Please type, paste, or upload draft words to structure. Or click "Generate" to draft a new document from scratch.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage(`Structuring input via ${AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Argonne'}...`);
    try {
      const { formatted } = await formatLegalDocument(inputText, {
        ...options,
        model: selectedModel,
      });
      setFormattedText(formatted);
      setActiveTab('formatted');

      setHistory(prev => [{
        id: Date.now().toString(),
        type: `Structure: ${options.docType}`,
        date: new Date().toLocaleTimeString(),
        content: formatted
      }, ...prev].slice(0, 10));

    } catch (error: any) {
      const errorMsg = error?.message || 'Structuring protocol encountered an issue.';
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    const targetTopic = inputText.trim() || `${options.docType} on Constitutional Framework and Statutory Standards`;
    setStatusMessage(`Generating authoritative ${options.docType} via ${AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Argonne'}...`);
    try {
      const { generated } = await generateLegalDocument(targetTopic, {
        ...options,
        model: selectedModel,
      });
      setFormattedText(generated);
      setActiveTab('formatted');

      setHistory(prev => [{
        id: Date.now().toString(),
        type: `Generate: ${options.docType}`,
        date: new Date().toLocaleTimeString(),
        content: generated
      }, ...prev].slice(0, 10));

    } catch (error: any) {
      const errorMsg = error?.message || 'Content generation encountered an issue.';
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractFileNameData = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim());
    let subject: string = options.docType;
    let contribution = 'Legal_Doc';

    const titleCandidates = lines.slice(0, 5).filter(l => {
      const clean = l.replace(/<[^>]*>/g, '').trim();
      return clean.startsWith('#') || clean.length > 20;
    });

    if (titleCandidates.length > 0) {
      const bestCandidate = titleCandidates[0]
        .replace(/<[^>]*>/g, '')
        .replace(/^[#\s*]+/, '')
        .trim();
      
      subject = bestCandidate.split(' ').slice(0, 6).join('_').replace(/[^a-zA-Z0-9_]/g, '');
    }

    return { subject, contribution };
  };

  const exportToDocx = async (content: string) => {
    const { subject, contribution } = extractFileNameData(content);
    const lines = content.split('\n');
    const children: (Paragraph | Table)[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Markdown table parsing
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
          const rows: TableRow[] = [];

          rows.push(new TableRow({
            children: headerCells.map(cellText => new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: cellText.replace(/<[^>]*>/g, '').replace(/\*\*/g, ''),
                  bold: true,
                  size: 22,
                  font: "Times New Roman"
                })],
                alignment: AlignmentType.LEFT,
              })],
              shading: { fill: "F2EBD9" },
            })),
          }));

          for (let r = 2; r < tableLines.length; r++) {
            const dataCells = tableLines[r].split('|').slice(1, -1).map(c => c.trim());
            rows.push(new TableRow({
              children: dataCells.map(cellText => new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: cellText.replace(/<[^>]*>/g, '').replace(/\*\*/g, ''),
                    size: 20,
                    font: "Times New Roman"
                  })],
                  alignment: AlignmentType.LEFT,
                })],
              })),
            }));
          }

          children.push(new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }));
          continue;
        }
      }

      const cleanLine = line.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '').trim();
      
      if (!cleanLine && line.trim()) {
        i++;
        continue;
      }

      if (line.startsWith('# ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace('# ', '').replace(/<[^>]*>/g, ''),
            bold: true,
            size: 44,
            font: "Times New Roman",
            color: "000000",
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 180, line: 360 },
        }));
      } else if (line.startsWith('## ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace('## ', '').replace(/<[^>]*>/g, ''),
            bold: true,
            size: 32,
            font: "Times New Roman",
            color: "000000",
          })],
          spacing: { before: 200, after: 100, line: 360 },
        }));
      } else if (line.startsWith('### ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace('### ', '').replace(/<[^>]*>/g, ''),
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "000000",
          })],
          spacing: { before: 160, after: 80, line: 360 },
        }));
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1'),
            size: 24,
            font: "Times New Roman",
            color: "000000",
          })],
          bullet: { level: 0 },
          spacing: { after: 60, line: 360 },
        }));
      } else if (cleanLine) {
        children.push(new Paragraph({
          children: [new TextRun({
            text: cleanLine.replace(/\*\*(.*?)\*\*/g, '$1'),
            size: 24,
            font: "Times New Roman",
            color: "000000",
          })],
          spacing: { after: 120, line: 360 },
          alignment: AlignmentType.JUSTIFIED,
        }));
      }
      i++;
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${subject}_${options.docType}_${contribution}.docx`);
  };

  return (
    <div className="min-h-screen bg-[#F7F2E7] dark:bg-[#000000] text-[#1C1917] dark:text-[#F4F4F5] font-sans selection:bg-[#B45309]/20 dark:selection:bg-[#F59E0B]/30 paper-texture text-sm md:text-base transition-colors duration-150">
      {/* Error Message Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-[#991B1B] dark:bg-[#7F1D1D] text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-red-800 dark:border-red-600"
          >
            <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
            <span className="text-xs md:text-sm font-semibold tracking-wide">{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2 cursor-pointer"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'linear' }}
            className="fixed inset-0 z-[100] bg-[#F7F2E7] dark:bg-[#000000] paper-texture overflow-y-auto p-4 md:p-12 transition-colors duration-150"
          >
            <div className="max-w-4xl mx-auto relative">
              <div className="sticky top-4 flex justify-end gap-3 mb-6 z-20">
                <button 
                  onClick={() => copyToClipboard(formattedText)}
                  className="px-4 py-2.5 bg-white dark:bg-[#0A0A0E] border border-[#E7E1D4] dark:border-[#222226] rounded-xl shadow-md text-[#1C1917] dark:text-[#F4F4F5] hover:bg-[#F7F2E7] dark:hover:bg-[#15151B] transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
                  title="Copy Document"
                >
                  {copied ? <Check className="w-4 h-4 text-[#854D0E] dark:text-[#F59E0B]" /> : <Copy className="w-4 h-4 text-[#854D0E] dark:text-[#F59E0B]" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button 
                  onClick={() => exportToDocx(formattedText)}
                  className="px-4 py-2.5 bg-[#854D0E] dark:bg-[#D97706] text-white rounded-xl shadow-md hover:bg-[#713F12] dark:hover:bg-[#B45309] transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
                  title="Export to Word (.docx)"
                >
                  <Download className="w-4 h-4" />
                  <span>Export .docx</span>
                </button>
                <button 
                  onClick={() => setIsFullScreen(false)}
                  className="p-2.5 bg-white dark:bg-[#0A0A0E] border border-[#E7E1D4] dark:border-[#222226] text-[#1C1917] dark:text-[#F4F4F5] hover:bg-[#F7F2E7] dark:hover:bg-[#15151B] rounded-xl shadow-md transition-all cursor-pointer"
                  title="Exit Fullscreen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="prose-container shadow-2xl">
                <div className="prose max-w-none">
                  <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {formattedText}
                  </Markdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="border-b border-[#E7E1D4] dark:border-[#1E1E22] bg-[#FAF7F0]/95 dark:bg-[#000000]/95 backdrop-blur-md sticky top-0 z-50 shadow-xs transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 bg-white dark:bg-[#0A0A0E] border border-[#E7E1D4] dark:border-[#222226] hover:bg-[#F7F2E7] dark:hover:bg-[#15151B] rounded-lg text-[#1C1917] dark:text-white transition-all cursor-pointer"
              title="Toggle Navigation Menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#854D0E] dark:bg-[#D97706] rounded-xl flex items-center justify-center shadow-sm text-white shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black tracking-[0.16em] text-[#1C1917] dark:text-white block leading-tight">
                  AURAPRAXIS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#57534E] dark:text-[#A1A1AA]">
                  Legal Structures & Jurisprudence Engine
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Active Model Indicator Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#070709] border border-[#E7E1D4] dark:border-[#1E1E22] shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#F59E0B]" />
              <span className="text-xs font-bold text-[#1C1917] dark:text-white uppercase tracking-wider">
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Gemini 4 Argon'}
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FAF2E3] dark:bg-[#1C150A] text-[#854D0E] dark:text-[#FBBF24]">
                Argonne
              </span>
            </div>

            {/* AMOLED / Ivory Mode Switch */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Switch to Ivory Stationery" : "Switch to AMOLED Pitch Black"}
              title={isDarkMode ? "Active: AMOLED Pitch Black (Click for Ivory Stationery)" : "Active: Ivory Stationery (Click for AMOLED Pitch Black)"}
              className={cn(
                "relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold text-xs uppercase tracking-wider shadow-xs",
                isDarkMode 
                  ? "bg-[#070709] border-[#1E1E22] text-[#F5F5F4] hover:border-[#D97706]/60 shadow-[0_0_15px_rgba(217,119,6,0.15)]"
                  : "bg-white border-[#E7E1D4] text-[#1C1917] hover:bg-[#F7F2E7]"
              )}
            >
              {isDarkMode ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
                  <Moon className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="hidden sm:inline text-[#F59E0B]">AMOLED Black</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#854D0E]" />
                  <Sun className="w-3.5 h-3.5 text-[#854D0E]" />
                  <span className="hidden sm:inline text-[#1C1917]">Ivory Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
          
          {/* Sidebar / Specifications Control */}
          <aside className={cn(
            "w-full lg:w-96 shrink-0 bg-[#FAF7F0] dark:bg-[#000000] rounded-2xl border border-[#E7E1D4] dark:border-[#1E1E22] p-5 md:p-6 shadow-sm transition-all duration-150",
            isSidebarOpen ? "block" : "hidden lg:block"
          )}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E1D4] dark:border-[#1E1E22]">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#1C1917] dark:text-white">
                Workspace Controls
              </span>
              <button 
                onClick={() => {
                  setInputText('');
                  setFormattedText('');
                  setActiveTab('original');
                }}
                className="text-[11px] font-bold uppercase tracking-wider text-[#854D0E] dark:text-[#F59E0B] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {/* Document Intake */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#1C1917] dark:text-white mb-3 flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-[#854D0E] dark:text-[#F59E0B]" /> Document Intake
                </h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 p-5 bg-white dark:bg-[#070709] border-2 border-dashed border-[#D6CDBC] dark:border-[#222226] hover:border-[#854D0E] dark:hover:border-[#F59E0B] rounded-xl hover:bg-[#FDFBF7] dark:hover:bg-[#101014] transition-all group cursor-pointer shadow-xs"
                >
                  <Upload className="w-6 h-6 text-[#854D0E] dark:text-[#F59E0B] group-hover:scale-105 transition-transform" />
                  <div className="text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-white block">Upload Draft</span>
                    <span className="text-[11px] text-[#57534E] dark:text-[#A1A1AA] font-medium">DOCX, PDF, or TXT</span>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.docx,.pdf" />
                </button>
              </div>

              {/* Specifications */}
              <div className="space-y-5">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#1C1917] dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#854D0E] dark:text-[#F59E0B]" /> Specifications
                </h2>
                
                {/* Area of Practice */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A1A1AA] flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#F59E0B]" /> Area of Practice
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(CATEGORIES).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-center cursor-pointer",
                          selectedCategory === cat
                            ? "bg-[#854D0E] dark:bg-[#D97706] text-white shadow-sm"
                            : "bg-white dark:bg-[#070709] text-[#1C1917] dark:text-[#E4E4E7] border border-[#E7E1D4] dark:border-[#222226] hover:bg-[#F7F2E7] dark:hover:bg-[#121217]"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Structure */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A1A1AA] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#F59E0B]" /> Select Structure
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                    {(CATEGORIES as any)[selectedCategory].map((type: string) => (
                      <button
                        key={type}
                        onClick={() => setOptions(prev => ({ ...prev, docType: type as DocumentType }))}
                        className={cn(
                          "px-2.5 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all leading-tight text-center truncate cursor-pointer",
                          options.docType === type 
                            ? "bg-[#FAF2E3] dark:bg-[#181105] text-[#854D0E] dark:text-[#FBBF24] border-[#854D0E] dark:border-[#F59E0B] shadow-2xs ring-1 ring-[#854D0E] dark:ring-[#F59E0B]" 
                            : "bg-white dark:bg-[#070709] text-[#1C1917] dark:text-[#E4E4E7] border-[#E7E1D4] dark:border-[#222226] hover:border-[#854D0E]/50 dark:hover:border-[#F59E0B]/50"
                        )}
                        title={type}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Active Archetype Confirmation Card */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#070709] border border-[#E7E1D4] dark:border-[#222226] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-white">
                        Target: {options.docType}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#854D0E] dark:bg-[#D97706] text-white">
                        {getDocumentArchetype(options.docType).category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#57534E] dark:text-[#A1A1AA] leading-relaxed">
                      {getDocumentArchetype(options.docType).description}
                    </p>
                  </div>
                </div>

                {/* Citation Protocol */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A1A1AA]">
                    Citation Protocol
                  </label>
                  <select 
                    value={options.citationStyle}
                    onChange={(e) => setOptions(prev => ({ ...prev, citationStyle: e.target.value as CitationStyle }))}
                    className="w-full bg-white dark:bg-[#070709] border border-[#E7E1D4] dark:border-[#222226] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1C1917] dark:text-[#F5F5F4] focus:outline-none focus:border-[#854D0E] dark:focus:border-[#F59E0B] appearance-none shadow-xs cursor-pointer"
                  >
                    <option value="Bluebook">Bluebook (21st Ed.)</option>
                    <option value="OSCOLA">OSCOLA</option>
                    <option value="Indian Law Reports">Indian Law Reports</option>
                  </select>
                </div>

                {/* Model Selection (Argonne Flagship Engine) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A1A1AA] flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#F59E0B]" /> Model Selection
                    </label>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF2E3] dark:bg-[#1C150A] text-[#854D0E] dark:text-[#FBBF24] border border-[#E7E1D4] dark:border-[#3B2506]">
                      Argonne Ready
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {AVAILABLE_MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m.id)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                          selectedModel === m.id
                            ? "bg-[#FAF2E3] dark:bg-[#181105] border-[#854D0E] dark:border-[#F59E0B] shadow-2xs ring-1 ring-[#854D0E] dark:ring-[#F59E0B]"
                            : "bg-white dark:bg-[#070709] border-[#E7E1D4] dark:border-[#222226] hover:border-[#854D0E]/40 dark:hover:border-[#F59E0B]/40"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-bold uppercase tracking-wider",
                              selectedModel === m.id ? "text-[#854D0E] dark:text-[#FBBF24]" : "text-[#1C1917] dark:text-white"
                            )}>
                              {m.name}
                            </span>
                            <span className={cn(
                              "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                              selectedModel === m.id ? "bg-[#854D0E] dark:bg-[#D97706] text-white" : "bg-[#F0ECE1] dark:bg-[#18181D] text-[#78716C] dark:text-[#A1A1AA]"
                            )}>
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#57534E] dark:text-[#A1A1AA] truncate mt-0.5">
                            {m.desc}
                          </p>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                          selectedModel === m.id
                            ? "border-[#854D0E] dark:border-[#F59E0B] bg-[#854D0E] dark:bg-[#F59E0B]"
                            : "border-[#D6CDBC] dark:border-[#3A3A40] bg-transparent"
                        )}>
                          {selectedModel === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons (Clean text indicator without spinning disk) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleFormat}
                  disabled={isProcessing}
                  title="Structure your inputted words into the target layout with minimal added text"
                  className={cn(
                    "bg-[#854D0E] dark:bg-[#D97706] hover:bg-[#713F12] dark:hover:bg-[#B45309] text-white py-3.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md dark:shadow-[0_0_20px_rgba(217,119,6,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    isProcessing && "opacity-90"
                  )}
                >
                  <FileSignature className="w-4 h-4 text-white" />
                  <span>{isProcessing ? "Structuring..." : "Structure"}</span>
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  title="Generate an authoritative, publication-grade document from scratch with numbered citations"
                  className={cn(
                    "bg-white dark:bg-[#070709] hover:bg-[#F7F2E7] dark:hover:bg-[#121217] border-2 border-[#854D0E] dark:border-[#D97706] text-[#854D0E] dark:text-[#F59E0B] hover:text-[#713F12] dark:hover:text-[#FBBF24] py-3.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
                    isProcessing && "opacity-90"
                  )}
                >
                  <BookOpen className="w-4 h-4 text-[#854D0E] dark:text-[#F59E0B]" />
                  <span>{isProcessing ? "Generating..." : "Generate"}</span>
                </button>
              </div>

              {/* Recent History */}
              {history.length > 0 && (
                <div className="pt-4 border-t border-[#E7E1D4] dark:border-[#1E1E22]">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#1C1917] dark:text-white flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#F59E0B]" /> History
                    </h2>
                    {history.length > 1 && (
                      <button 
                        onClick={() => setShowFullHistory(!showFullHistory)}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#854D0E] dark:text-[#F59E0B] hover:underline cursor-pointer"
                      >
                        {showFullHistory ? 'Less' : 'More'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {(showFullHistory ? history : history.slice(0, 1)).map((item) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          onClick={() => {
                            setFormattedText(item.content);
                            setActiveTab('formatted');
                          }}
                          className="w-full text-left p-2.5 bg-white dark:bg-[#070709] rounded-lg border border-[#E7E1D4] dark:border-[#222226] hover:border-[#854D0E] dark:hover:border-[#F59E0B] transition-all cursor-pointer shadow-2xs"
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1917] dark:text-white truncate">{item.type}</span>
                            <span className="text-[9px] text-[#57534E] dark:text-[#A1A1AA] shrink-0 ml-1">{item.date}</span>
                          </div>
                          <p className="text-[10px] text-[#57534E] dark:text-[#A1A1AA] line-clamp-1 font-medium">{item.content.substring(0, 45)}...</p>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Editor/Preview Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#000000] rounded-2xl border border-[#E7E1D4] dark:border-[#1E1E22] overflow-hidden shadow-sm">
            {/* Top Workspace Toolbar */}
            <div className="flex items-center justify-between px-4 md:px-8 py-3.5 border-b border-[#E7E1D4] dark:border-[#1E1E22] bg-[#FAF7F0] dark:bg-[#040405]">
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {[
                  { id: 'original', label: 'Raw Draft' },
                  ...(formattedText ? [{ id: 'formatted', label: `Document: ${options.docType}` }] : []),
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "relative text-xs font-bold uppercase tracking-wider pb-1.5 transition-all cursor-pointer",
                      activeTab === tab.id ? "text-[#1C1917] dark:text-white font-extrabold" : "text-[#57534E] dark:text-[#A1A1AA] hover:text-[#1C1917] dark:hover:text-white"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#854D0E] dark:bg-[#F59E0B] rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                  </button>
                ))}
                {statusMessage && (
                  <div className="flex items-center gap-2 text-[#854D0E] dark:text-[#F59E0B] font-semibold text-xs ml-2">
                    <span className="w-2 h-2 rounded-full bg-[#854D0E] dark:bg-[#F59E0B] animate-pulse shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {activeTab !== 'original' && formattedText && (
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setIsFullScreen(true)}
                      className="p-1.5 bg-white dark:bg-[#0A0A0E] border border-[#E7E1D4] dark:border-[#222226] hover:bg-[#F7F2E7] dark:hover:bg-[#15151B] rounded-lg text-[#1C1917] dark:text-[#F5F5F4] transition-colors cursor-pointer"
                      title="Full Screen Preview"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => copyToClipboard(formattedText)}
                      className="p-1.5 bg-white dark:bg-[#0A0A0E] border border-[#E7E1D4] dark:border-[#222226] hover:bg-[#F7F2E7] dark:hover:bg-[#15151B] rounded-lg text-[#1C1917] dark:text-[#F5F5F4] transition-colors cursor-pointer"
                      title="Copy content"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => exportToDocx(formattedText)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#0A0A0E] border border-[#E7E1D4] dark:border-[#222226] hover:bg-[#F7F2E7] dark:hover:bg-[#15151B] text-[#1C1917] dark:text-[#F5F5F4] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                      title="Export Word Document (.docx)"
                    >
                      <Download className="w-3.5 h-3.5 text-[#854D0E] dark:text-[#F59E0B]" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                )}
                
                <div className="text-xs font-mono font-semibold text-[#57534E] dark:text-[#A1A1AA] hidden sm:block">
                  {activeTab === 'original' ? inputText.length : formattedText.length} chars
                </div>
              </div>
            </div>

            {/* Editor & Document View Body */}
            <div className="flex-1 min-h-[480px] md:min-h-[720px] p-4 md:p-8 overflow-y-auto bg-[#FAF7F0]/40 dark:bg-[#000000]">
              <AnimatePresence mode="wait">
                {activeTab === 'original' && (
                  <motion.div
                    key="original"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="h-full flex flex-col space-y-3"
                  >
                    {/* Context Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#070709] rounded-xl border border-[#E7E1D4] dark:border-[#1E1E22] shadow-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#854D0E] dark:text-[#F59E0B]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-white">
                          Raw Draft Intake
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#854D0E] dark:bg-[#D97706] text-white font-bold uppercase tracking-wider">
                          Target: {options.docType}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-medium text-[#57534E] dark:text-[#A1A1AA]">
                        {inputText.length} characters • {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
                      </div>
                    </div>

                    {/* Textarea */}
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Enter your raw draft, instructions, title, or list of citations here.\n\n• Flexible Input: This can be anything: a prompt, drafting directions, factual notes, a simple paper title, or a list of citations and sources (cases, statutory Acts, treatises, law reviews, treaties).\n• "Structure": Structures your inputted words into the target layout (${options.docType}) and keeps added words as minimal as possible.\n• "Generate": Generates an authoritative, peak-level publication-grade document from scratch with numbered in-text citations [1], [2] and a comprehensive numbered Table of Authorities.\n• Active Engine: Powered by ${AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Gemini 4 Argon'} (choose model in the sidebar).`}
                      className="w-full flex-1 min-h-[480px] md:min-h-[620px] text-sm md:text-base leading-relaxed focus:outline-none resize-none font-sans bg-white dark:bg-[#000000] text-[#1C1917] dark:text-[#F5F5F4] placeholder:text-[#78716C] dark:placeholder:text-[#52525B] p-5 md:p-6 rounded-xl border border-[#E7E1D4] dark:border-[#1E1E22] focus:border-[#854D0E] dark:focus:border-[#F59E0B] focus:ring-1 focus:ring-[#854D0E] dark:focus:ring-[#F59E0B] shadow-sm transition-all selection:bg-[#B45309]/20 dark:selection:bg-[#F59E0B]/30"
                    />
                  </motion.div>
                )}

                {activeTab === 'formatted' && formattedText && (
                  <motion.div
                    key="formatted"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="prose-container shadow-md"
                  >
                    <div className="prose max-w-none">
                      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {formattedText}
                      </Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!formattedText && !isProcessing && activeTab !== 'original' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-16 h-16 bg-white dark:bg-[#070709] border border-[#E7E1D4] dark:border-[#222226] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <Gavel className="w-8 h-8 text-[#854D0E] dark:text-[#F59E0B]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1C1917] dark:text-white mb-2 uppercase tracking-wider">
                    Awaiting Document
                  </h3>
                  <p className="text-[#57534E] dark:text-[#A1A1AA] text-xs max-w-md font-medium leading-relaxed">
                    Select your document structure and execute "Structure" or "Generate" to create your document with the selected model.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E1D4] dark:border-[#1E1E22] mt-12 md:mt-20 py-8 bg-[#FAF7F0] dark:bg-[#000000] transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-[#854D0E] dark:text-[#F59E0B]" />
            <span className="text-base font-black tracking-[0.18em] text-[#1C1917] dark:text-white">AURAPRAXIS</span>
          </div>
          <p className="text-xs text-[#57534E] dark:text-[#A1A1AA] text-center font-medium">
            © 2026 AuraPraxis. Authoritative Legal Structures & Flagship Jurisprudence Architecture.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#57534E] dark:text-[#A1A1AA]">
            <CheckCircle2 className="w-4 h-4 text-[#854D0E] dark:text-[#F59E0B]" />
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
