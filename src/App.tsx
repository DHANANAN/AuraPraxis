import React, { useState, useRef } from 'react';
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
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { formatLegalDocument, generateLegalDocument, DocumentType, CitationStyle, FormatOptions } from './services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | 'formatted' | 'humanized'>('original');
  const [options, setOptions] = useState<FormatOptions>({
    docType: 'Memorial',
    citationStyle: 'Bluebook',
    humanize: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

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
        console.warn("PDF text extraction is not supported.");
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setInputText(event.target?.result as string);
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('File read error:', error);
    }
  };

  const handleFormat = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const { formatted, humanized } = await formatLegalDocument(inputText, options);
      setFormattedText(formatted);
      
      if (options.humanize && humanized) {
        setHumanizedText(humanized);
        setActiveTab('humanized');
      } else {
        setActiveTab('formatted');
      }
    } catch (error) {
      console.error('Formatting failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const { generated } = await generateLegalDocument(inputText, options);
      setFormattedText(generated);
      
      if (options.humanize) {
        const { humanized } = await formatLegalDocument(generated, { ...options, humanize: true });
        if (humanized) {
          setHumanizedText(humanized);
          setActiveTab('humanized');
        } else {
          setActiveTab('formatted');
        }
      } else {
        setActiveTab('formatted');
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToDocx = async (content: string) => {
    const lines = content.split('\n');
    const children = lines.map(line => {
      if (line.startsWith('# ')) {
        return new Paragraph({
          children: [new TextRun({
            text: line.replace('# ', ''),
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
            text: line.replace('## ', ''),
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
          text: line,
          size: 24, // 12pt
          font: "Times New Roman",
          color: "000000",
        })],
        spacing: { line: 360 }, 
      });
    });

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
    saveAs(blob, `AuraPraxis_${options.docType}_${options.humanize ? 'Humanized' : 'Formatted'}.docx`);
  };

  return (
    <div className="min-h-screen bg-gold-sand text-[#1A1A1A] font-serif selection:bg-gold-rich/30 paper-texture text-xl">
      {/* Premium Header */}
      <header className="border-b border-gold-rich/30 bg-gold-light/90 backdrop-blur-md sticky top-0 z-50 gold-shadow">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-dark to-gold-rich rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="text-white w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-black tracking-[0.2em] gold-gradient-text block leading-none">AURAPRAXIS</span>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-gold-dark/60">Elite Legal Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button 
              onClick={toggleDarkMode}
              className="p-3 bg-gold-rich/10 hover:bg-gold-rich/20 rounded-full transition-colors text-gold-dark"
            >
              {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <nav className="flex items-center gap-8 text-xs font-black uppercase tracking-[0.2em] text-gold-dark/80">
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

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid lg:grid-cols-[420px_1fr] gap-16 items-start">
          
          {/* Sidebar Controls */}
          <aside className="space-y-10 sticky top-36">
            <div className="vibrant-card p-10 space-y-10">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-gold-dark mb-8 flex items-center gap-3">
                  <FileUp className="w-4 h-4" /> Document Intake
                </h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-4 p-10 bg-white/50 border-2 border-dashed border-gold-rich/30 rounded-[2rem] hover:border-gold-rich transition-all group"
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
                
                <div className="space-y-4">
                  <label className="text-xs font-black text-gold-dark/60 uppercase tracking-[0.3em]">Document Class</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Memorial', 'Case Brief', 'Essay', 'Petition'] as DocumentType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setOptions(prev => ({ ...prev, docType: type }))}
                        className={cn(
                          "flex items-center justify-center gap-2 px-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all",
                          options.docType === type 
                            ? "bg-gold-dark text-white border-gold-dark shadow-xl scale-105" 
                            : "bg-white/80 text-gold-dark border-gold-rich/20 hover:border-gold-rich"
                        )}
                      >
                        {type}
                      </button>
                    ))}
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
            </div>
          </aside>

          {/* Main Editor/Preview Area */}
          <div className="space-y-10">
            <div className="vibrant-card overflow-hidden">
              <div className="flex items-center justify-between px-10 py-6 border-b border-gold-rich/10 bg-gold-light/30">
                <div className="flex items-center gap-10">
                  <button 
                    onClick={() => setActiveTab('original')}
                    className={cn(
                      "text-xs font-black uppercase tracking-[0.3em] pb-2 transition-all",
                      activeTab === 'original' ? "text-gold-dark border-b-4 border-gold-dark" : "text-gold-dark/40"
                    )}
                  >
                    Raw Draft
                  </button>
                  {formattedText && (
                    <button 
                      onClick={() => setActiveTab('formatted')}
                      className={cn(
                        "text-xs font-black uppercase tracking-[0.3em] pb-2 transition-all",
                        activeTab === 'formatted' ? "text-gold-dark border-b-4 border-gold-dark" : "text-gold-dark/40"
                      )}
                    >
                      Formatted
                    </button>
                  )}
                  {humanizedText && (
                    <button 
                      onClick={() => setActiveTab('humanized')}
                      className={cn(
                        "text-xs font-black uppercase tracking-[0.3em] pb-2 transition-all",
                        activeTab === 'humanized' ? "text-gold-dark border-b-4 border-gold-dark" : "text-gold-dark/40"
                      )}
                    >
                      Humanized
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  {activeTab !== 'original' && (
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => copyToClipboard(activeTab === 'formatted' ? formattedText : humanizedText)}
                        className="p-3 hover:bg-gold-sand/50 rounded-xl transition-colors text-gold-dark"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => exportToDocx(activeTab === 'formatted' ? formattedText : humanizedText)}
                        className="flex items-center gap-3 px-6 py-3 bg-gold-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gold-rich transition-all shadow-lg"
                      >
                        <Download className="w-4 h-4" /> Export
                      </button>
                    </div>
                  )}
                  <div className="text-xs font-black uppercase tracking-tighter text-gold-dark/40">
                    {activeTab === 'original' ? inputText.length : (activeTab === 'formatted' ? formattedText.length : humanizedText.length)} chars
                  </div>
                </div>
              </div>

              <div className="min-h-[700px] p-16">
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
                      className="w-full h-[600px] text-2xl leading-[1.8] focus:outline-none resize-none font-serif bg-transparent font-medium"
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
                        <Markdown>{activeTab === 'formatted' ? formattedText : humanizedText}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {!formattedText && !isProcessing && (
              <div className="h-[400px] border-4 border-dashed border-gold-rich/20 rounded-[3rem] flex flex-col items-center justify-center text-center p-16 bg-white/30">
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
      </main>

      <footer className="border-t border-gold-rich/20 mt-32 py-20 bg-gold-light/50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-4">
            <Scale className="w-8 h-8 text-gold-dark" />
            <span className="text-2xl font-black tracking-[0.3em] gold-gradient-text">AURAPRAXIS</span>
          </div>
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-gold-dark/40">© 2026 AuraPraxis Elite. All Rights Reserved.</p>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gold-dark/60">
              <a href="#" className="hover:text-gold-dark transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold-dark transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold-dark transition-colors">Ethics Board</a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gold-dark/40">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">MIT License Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
