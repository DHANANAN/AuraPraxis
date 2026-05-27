import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  BookOpen, 
  FileSignature, 
  Gavel,
  Loader2,
  Copy,
  Check,
  Eye,
  History,
  FileUp,
  ExternalLink,
  Linkedin,
  Globe,
  Moon,
  Sun,
  Settings,
  LayoutGrid,
  Menu,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from './lib/utils';
import { useDebounce } from './hooks/useDebounce';
import { formatLegalDocument, generateLegalDocument, DocumentType, CitationStyle, FormatOptions } from './services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
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

const DOCUMENT_TYPES: DocumentType[] = (Object.values(CATEGORIES).flat() as DocumentType[]).sort();

export default function App() {
  const [inputText, setInputText] = useState(() => localStorage.getItem('aura_input') || '');
  const [formattedText, setFormattedText] = useState(() => localStorage.getItem('aura_formatted') || '');
  const [humanizedText, setHumanizedText] = useState(() => localStorage.getItem('aura_humanized') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('Litigation');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('aura_dark_mode') === 'true');
  const [showMoreStructures, setShowMoreStructures] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [history, setHistory] = useState<{ id: string; type: string; date: string; content: string }[]>(() => {
    const saved = localStorage.getItem('aura_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | 'formatted' | 'humanized'>(() => 
    (localStorage.getItem('aura_active_tab') as any) || 'original'
  );
  const [options, setOptions] = useState<FormatOptions>(() => {
    const saved = localStorage.getItem('aura_options');
    return saved ? JSON.parse(saved) : {
      docType: 'Memorial',
      citationStyle: 'OSCOLA',
      humanize: false,
    };
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep selectedCategory synchronized with options.docType on load or change
  useEffect(() => {
    const parentCategory = Object.entries(CATEGORIES).find(([_, list]) => 
      list.includes(options.docType)
    )?.[0];
    if (parentCategory && selectedCategory !== parentCategory) {
      setSelectedCategory(parentCategory);
    }
  }, [options.docType]);

  // Debounced values for performance-optimized synchronization
  const debouncedInput = useDebounce(inputText, 1500);
  const debouncedFormatted = useDebounce(formattedText, 1500);
  const debouncedHumanized = useDebounce(humanizedText, 1500);

  useEffect(() => {
    localStorage.setItem('aura_input', debouncedInput);
  }, [debouncedInput]);

  useEffect(() => {
    localStorage.setItem('aura_formatted', debouncedFormatted);
  }, [debouncedFormatted]);

  useEffect(() => {
    localStorage.setItem('aura_humanized', debouncedHumanized);
  }, [debouncedHumanized]);

  useEffect(() => {
    localStorage.setItem('aura_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('aura_options', JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem('aura_active_tab', activeTab);
  }, [activeTab]);

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

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
      } else if (extension === 'pdf') {
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
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Structuring Content...');
    try {
      if (options.humanize) {
        setStatusMessage('Structuring & Humanizing Draft...');
      }
      const { formatted, humanized } = await formatLegalDocument(inputText, options);
      setFormattedText(formatted);
      
      const resultText = options.humanize && humanized ? humanized : formatted;
      setHistory(prev => [{
        id: Date.now().toString(),
        type: `Format: ${options.docType}`,
        date: new Date().toLocaleTimeString(),
        content: resultText
      }, ...prev].slice(0, 10));

      if (options.humanize && humanized) {
        setHumanizedText(humanized);
        setActiveTab('humanized');
      } else {
        setActiveTab('formatted');
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Transformation protocol failed. If document is very long, try processing sections.';
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Initializing Legal Engine...');
    try {
      setStatusMessage('Researching Jurisprudence & Synthesizing...');
      const { generated } = await generateLegalDocument(inputText, options);
      setFormattedText(generated);
      
      let finalContent = generated;
      if (options.humanize) {
        setStatusMessage('Refining & Humanizing Generated Text...');
        const { formatted, humanized } = await formatLegalDocument(generated, { ...options, humanize: true });
        if (formatted) {
          setFormattedText(formatted);
        }
        if (humanized) {
          setHumanizedText(humanized);
          setActiveTab('humanized');
          finalContent = humanized;
        } else {
          setActiveTab('formatted');
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 500)); // Graceful UI beat
        setActiveTab('formatted');
      }

      setHistory(prev => [{
        id: Date.now().toString(),
        type: `Generate: ${options.docType}`,
        date: new Date().toLocaleTimeString(),
        content: finalContent
      }, ...prev].slice(0, 10));

    } catch (error: any) {
      const errorMsg = error?.message || 'Content generation failed. The legal engine encountered an unexpected interruption.';
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
    let contribution = options.humanize ? 'Humanized' : 'Formatted';

    // Try to find a title in the first 3 non-empty lines (ignoring HTML tags)
    const titleCandidates = lines.slice(0, 5).filter(l => {
      const clean = l.replace(/<[^>]*>/g, '').trim();
      return clean.startsWith('#') || clean.length > 20;
    });

    if (titleCandidates.length > 0) {
      const bestCandidate = titleCandidates[0]
        .replace(/<[^>]*>/g, '') // Strip HTML
        .replace(/^[#\s*]+/, '') // Strip Markdown headers/bolds
        .trim();
      
      subject = bestCandidate.split(' ').slice(0, 6).join('_').replace(/[^a-zA-Z0-9_]/g, '');
    }

    return { subject, contribution };
  };

  const exportToDocx = async (content: string) => {
    const { subject, contribution } = extractFileNameData(content);
    const lines = content.split('\n');
    const children = lines.map(line => {
      // Strip HTML comments and tags for DOCX export
      const cleanLine = line.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '').trim();
      
      if (!cleanLine && line.trim()) return null; // Skip if line was just invisible noise

      if (line.startsWith('# ')) {
        return new Paragraph({
          children: [new TextRun({
            text: line.replace('# ', '').replace(/<[^>]*>/g, ''),
            bold: true,
            size: 48, // 24pt
            font: "Times New Roman",
            color: "000000",
          })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200, line: 360 },
        });
      }
      if (line.startsWith('## ')) {
        return new Paragraph({
          children: [new TextRun({
            text: line.replace('## ', '').replace(/<[^>]*>/g, ''),
            bold: true,
            size: 36, // 18pt
            font: "Times New Roman",
            color: "000000",
          })],
          spacing: { before: 200, after: 100, line: 360 },
        });
      }
      return new Paragraph({
        children: [new TextRun({
          text: cleanLine,
          size: 24, // 12pt
          font: "Times New Roman",
          color: "000000",
        })],
        spacing: { line: 360 }, 
      });
    }).filter(p => p !== null) as Paragraph[];

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
    <div className="min-h-screen bg-gold-sand text-[#1A1A1A] font-serif selection:bg-gold-rich/30 paper-texture text-xl">
      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <span className="text-sm font-bold uppercase tracking-widest">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
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
            className="fixed inset-0 z-[100] bg-gold-sand paper-texture overflow-y-auto p-10 md:p-20"
          >
            <div className="max-w-4xl mx-auto relative">
              <div className="sticky top-0 flex justify-end gap-4 mb-10 z-10 opacity-20 hover:opacity-100 transition-opacity duration-500">
                <button 
                  onClick={() => copyToClipboard(activeTab === 'formatted' ? formattedText : humanizedText)}
                  className="p-4 bg-white/80 backdrop-blur rounded-2xl shadow-xl text-gold-dark hover:text-gold-rich transition-all"
                  title="Copy"
                >
                  {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
                <button 
                  onClick={() => exportToDocx(activeTab === 'formatted' ? formattedText : humanizedText)}
                  className="p-4 bg-white/80 backdrop-blur rounded-2xl shadow-xl text-gold-dark hover:text-gold-rich transition-all"
                  title="Download"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsFullScreen(false)}
                  className="p-4 bg-gold-dark text-white rounded-2xl shadow-xl hover:bg-gold-rich transition-all"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="vibrant-card p-16 md:p-24 min-h-screen shadow-2xl">
                <div className="prose max-w-none prose-xl">
                  <Markdown rehypePlugins={[rehypeRaw]}>{activeTab === 'formatted' ? formattedText : humanizedText}</Markdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Header */}
      <header className="border-b border-gold-rich/30 bg-gold-light/90 backdrop-blur-md sticky top-0 z-50 gold-shadow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 bg-gold-rich/10 hover:bg-gold-rich/20 rounded-xl transition-all text-gold-dark active:scale-90"
              title="Toggle Navigation"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-gold-dark to-gold-rich rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Scale className="text-white w-5 h-5 md:w-8 md:h-8" />
              </div>
              <div>
                <span className="text-lg md:text-3xl font-black tracking-[0.2em] gold-gradient-text block leading-none">AURAPRAXIS</span>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-gold-dark/60">Elite Legal Workspace</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 md:p-3 bg-gold-rich/10 hover:bg-gold-rich/20 rounded-full transition-colors text-gold-dark"
            >
              {isDarkMode ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <nav className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-[0.2em] text-gold-dark/80">
              <a href="https://djlexfolio.netlify.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold-dark transition-all group">
                <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" /> djlexfolio
              </a>
              <a href="https://www.linkedin.com/in/dhananjay-chouhan-30a51b334/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold-dark transition-all group">
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" /> Dhananjay
              </a>
              <a href="https://aistudio.google.com/apps/ba92f899-0258-461b-8dad-e73684575251?fullscreenApplet=true&showPreview=true&showAssistant=true" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold-dark transition-all group">
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Juris Lens
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row gap-0 items-stretch bg-white/40 backdrop-blur-xl rounded-3xl md:rounded-[3rem] border border-gold-rich/20 overflow-hidden shadow-2xl">
          
          {/* Sidebar Controls - Integrated Drawer for Mobile */}
          <aside className={cn(
            "fixed inset-0 z-[60] bg-gold-sand/95 backdrop-blur-md p-6 overflow-y-auto transition-all duration-500 lg:relative lg:inset-auto lg:z-0 lg:bg-gold-light/20 lg:p-10 lg:w-[clamp(300px,30vw,420px)] lg:border-r border-gold-rich/10 lg:block lg:overflow-visible",
            isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100 hidden"
          )}>
            <div className="flex justify-between items-center mb-8 lg:hidden">
              <div className="flex items-center gap-2">
                <Scale className="text-gold-dark w-6 h-6" />
                <span className="text-sm font-black tracking-widest text-gold-dark">WORKSPACE</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 bg-gold-rich/20 rounded-full text-gold-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8 md:space-y-10">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gold-dark mb-6 md:mb-8 flex items-center gap-3">
                  <FileUp className="w-4 h-4" /> Document Intake
                </h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-4 p-6 md:p-10 bg-white/50 border-2 border-dashed border-gold-rich/30 rounded-2xl md:rounded-[2rem] hover:border-gold-rich transition-all group"
                >
                  <Upload className="w-8 h-8 text-gold-rich group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <span className="text-lg font-black block uppercase tracking-widest">Upload Draft</span>
                    <span className="text-xs text-gold-dark/60 font-sans font-bold">DOCX, PDF, or TXT</span>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.md,.docx,.pdf" />
                </button>
              </div>

              <div className="space-y-8">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gold-dark flex items-center gap-3">
                  <Settings className="w-4 h-4" /> Specifications
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gold-dark/60 uppercase tracking-[0.3em] flex items-center gap-2">
                       <LayoutGrid className="w-3 h-3" /> Area of Practice
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(CATEGORIES).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            selectedCategory === cat
                              ? "bg-gold-dark text-white shadow-lg scale-[1.02]"
                              : "bg-white/50 text-gold-dark border border-gold-rich/20 hover:border-gold-rich"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gold-dark/60 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Settings className="w-3 h-3" /> Select Structure
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(CATEGORIES as any)[selectedCategory].map((type: string) => (
                        <button
                          key={type}
                          onClick={() => setOptions(prev => ({ ...prev, docType: type as DocumentType }))}
                          className={cn(
                            "flex items-center justify-center gap-2 px-3 py-4 rounded-xl border text-[9px] font-black uppercase tracking-[0.05em] transition-all leading-tight text-center",
                            options.docType === type 
                              ? "bg-gold-rich/20 text-gold-dark border-gold-rich shadow-inner ring-1 ring-gold-rich" 
                              : "bg-white/30 text-gold-dark/70 border-gold-rich/10 hover:bg-white/60 hover:border-gold-rich/30"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gold-dark/60 uppercase tracking-[0.3em]">Citation Protocol</label>
                  <select 
                    value={options.citationStyle}
                    onChange={(e) => setOptions(prev => ({ ...prev, citationStyle: e.target.value as CitationStyle }))}
                    className="w-full bg-white/80 border border-gold-rich/20 rounded-2xl px-6 py-4 text-sm font-black text-gold-dark focus:outline-none focus:border-gold-rich appearance-none shadow-sm"
                  >
                    <option value="Bluebook">Bluebook (21st Ed.)</option>
                    <option value="OSCOLA">OSCOLA</option>
                    <option value="Indian Law Reports">Indian Law Reports</option>
                  </select>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, humanize: !prev.humanize }))}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-5 rounded-2xl border transition-all gold-shadow",
                      options.humanize 
                        ? "bg-gold-dark text-white border-gold-dark" 
                        : "bg-white/80 border-gold-rich/20 text-gold-dark hover:border-gold-rich"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Sparkles className={cn("w-5 h-5", options.humanize ? "text-gold-light" : "text-gold-rich")} />
                      <span className="text-sm font-black uppercase tracking-[0.2em]">Humanize Draft</span>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      options.humanize ? "bg-gold-light border-gold-light" : "border-gold-rich/30"
                    )}>
                      {options.humanize && <Check className="w-4 h-4 text-gold-dark" />}
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleFormat}
                  disabled={isProcessing || !inputText}
                  className="elegant-button bg-gradient-to-r from-gold-dark to-gold-rich text-white py-6 shadow-2xl shadow-gold-dark/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Format Draft"
                  )}
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={isProcessing || !inputText}
                  className="elegant-button bg-white border-2 border-gold-rich text-gold-dark py-6 shadow-2xl shadow-gold-dark/10 hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Generate Content"
                  )}
                </button>
              </div>

              {history.length > 0 && (
                <div className="pt-6 border-t border-gold-rich/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gold-dark flex items-center gap-3">
                      <History className="w-4 h-4" /> Recent History
                    </h2>
                    {history.length > 1 && (
                      <button 
                        onClick={() => setShowFullHistory(!showFullHistory)}
                        className="text-[10px] font-black uppercase tracking-widest text-gold-rich hover:text-gold-dark transition-colors"
                      >
                        {showFullHistory ? 'View Less' : 'View More'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {(showFullHistory ? history : history.slice(0, 1)).map((item) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onClick={() => {
                            setFormattedText(item.content);
                            setActiveTab('formatted');
                          }}
                          className="w-full text-left p-4 bg-gold-light/30 rounded-xl border border-gold-rich/10 hover:border-gold-rich transition-all group overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gold-dark">{item.type}</span>
                            <span className="text-[8px] font-bold text-gold-dark/40">{item.date}</span>
                          </div>
                          <p className="text-[10px] text-gold-dark/60 line-clamp-1 font-medium">{item.content.substring(0, 50)}...</p>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Editor/Preview Area - Integrated */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-6 md:px-10 py-4 md:py-6 border-b border-gold-rich/10 bg-gold-light/10">
              <div className="flex items-center gap-4 md:gap-10">
                {[
                  { id: 'original', label: 'Raw Draft' },
                  { id: 'formatted', label: 'Formatted', condition: formattedText },
                  { id: 'humanized', label: 'Humanized', condition: humanizedText }
                ].map((tab) => (
                  (tab.condition === undefined || tab.condition) && (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "relative text-[10px] md:text-xs font-black uppercase tracking-[0.3em] pb-2 transition-all",
                        activeTab === tab.id ? "text-gold-dark" : "text-gold-dark/40"
                      )}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gold-dark rounded-full"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  )
                ))}
                {statusMessage && (
                  <div className="flex items-center gap-2 animate-pulse text-gold-dark ml-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{statusMessage}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 md:gap-6">
                {activeTab !== 'original' && (
                  <div className="flex items-center gap-2 md:gap-4">
                    <button 
                      onClick={() => setIsFullScreen(true)}
                      className="p-2 md:p-3 hover:bg-gold-sand/50 rounded-xl transition-colors text-gold-dark"
                      title="Full Screen"
                    >
                      <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button 
                      onClick={() => copyToClipboard(activeTab === 'formatted' ? formattedText : humanizedText)}
                      className="p-2 md:p-3 hover:bg-gold-sand/50 rounded-xl transition-colors text-gold-dark"
                    >
                      {copied ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Copy className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                    <button 
                      onClick={() => exportToDocx(activeTab === 'formatted' ? formattedText : humanizedText)}
                      className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gold-dark text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gold-rich transition-all shadow-lg"
                    >
                      <Download className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Export</span>
                    </button>
                  </div>
                )}
                <div className="text-[10px] font-black uppercase tracking-tighter text-gold-dark/40 hidden sm:block">
                  {activeTab === 'original' ? inputText.length : (activeTab === 'formatted' ? formattedText.length : humanizedText.length)} chars
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[400px] md:min-h-[700px] p-4 md:p-16 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'original' && (
                  <motion.textarea
                    key="original"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your legal text to format, or a title/idea to generate a full document..."
                    className="w-full h-full min-h-[300px] md:min-h-[600px] text-base md:text-2xl leading-[1.8] focus:outline-none resize-none font-serif bg-transparent font-medium"
                  />
                )}
                {(activeTab === 'formatted' || activeTab === 'humanized') && (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="prose-container"
                  >
                    <div className="prose max-w-none">
                      <Markdown rehypePlugins={[rehypeRaw]}>{activeTab === 'formatted' ? formattedText : humanizedText}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!formattedText && !isProcessing && activeTab !== 'original' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-16">
                  <div className="w-20 h-20 bg-gold-light rounded-3xl flex items-center justify-center mb-8 gold-shadow rotate-3">
                    <Gavel className="w-10 h-10 text-gold-rich" />
                  </div>
                  <h3 className="text-3xl font-black text-gold-dark mb-4 uppercase tracking-widest">Awaiting Protocol</h3>
                  <p className="text-gold-dark/60 text-lg max-w-md font-medium leading-relaxed">
                    The transformation engine is primed. Select your document class and execute the transformation protocol.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gold-rich/20 mt-16 md:mt-32 py-10 md:py-20 bg-gold-light/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16">
          <div className="flex items-center gap-4">
            <Scale className="w-6 h-6 md:w-8 md:h-8 text-gold-dark" />
            <span className="text-xl md:text-2xl font-black tracking-[0.3em] gold-gradient-text">AURAPRAXIS</span>
          </div>
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-dark/40 text-center">© 2026 AuraPraxis Elite. All Rights Reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-10 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark/60">
              <a href="#" className="hover:text-gold-dark transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold-dark transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold-dark transition-colors">Ethics Board</a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gold-dark/40">
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">MIT License Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
