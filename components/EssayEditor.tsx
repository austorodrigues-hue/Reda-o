
import React, { useState, useEffect } from 'react';

interface EssayEditorProps {
  content: string;
  setContent: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
}

const EssayEditor: React.FC<EssayEditorProps> = ({ content, setContent, title, setTitle, notes, setNotes }) => {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(content.length);
    setWordCount(content.trim() === '' ? 0 : content.trim().split(/\s+/).length);
  }, [content]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-[70vh]">
      {/* Área principal de escrita */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="glass p-2 rounded-2xl shadow-sm">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da sua redação..."
            className="w-full text-2xl font-bold p-4 bg-transparent outline-none border-b border-gray-100 focus:border-indigo-200 transition-all text-indigo-950 placeholder:text-gray-300"
          />
        </div>
        
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comece seu rascunho aqui..."
            className="serif w-full h-full min-h-[500px] p-8 glass rounded-3xl outline-none text-lg leading-relaxed shadow-inner resize-none text-slate-800 placeholder:text-gray-300"
          />
          
          <div className="absolute bottom-6 right-8 flex gap-4 text-xs font-medium text-slate-500 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            <span>{wordCount} palavras</span>
            <span className="w-px h-3 bg-gray-200 self-center" />
            <span>{charCount} caracteres</span>
          </div>
        </div>
      </div>

      {/* Barra lateral para notas */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <div className="glass p-6 rounded-3xl h-full flex flex-col gap-4">
          <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Bloco de Notas
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anote argumentos, citações ou referências aqui..."
            className="flex-1 bg-indigo-50/50 p-4 rounded-2xl outline-none text-sm leading-relaxed text-indigo-950 resize-none border border-transparent focus:border-indigo-100 transition-all placeholder:text-indigo-300"
          />
          <div className="text-[10px] text-slate-400 text-center italic">
            Seus dados são salvos automaticamente no navegador.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayEditor;
