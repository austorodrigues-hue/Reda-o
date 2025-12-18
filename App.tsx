
import React, { useState, useEffect } from 'react';
import { AppTab, SavedEssay, EssayFeedback } from './types';
import { STORAGE_KEY } from './constants';
import { getEssayFeedback } from './services/geminiService';
import PomodoroTimer from './components/PomodoroTimer';
import EssayEditor from './components/EssayEditor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.EDITOR);
  const [essayContent, setEssayContent] = useState('');
  const [essayTitle, setEssayTitle] = useState('');
  const [essayNotes, setEssayNotes] = useState('');
  const [history, setHistory] = useState<SavedEssay[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<SavedEssay | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.history) setHistory(parsed.history);
        if (parsed.draft) {
          setEssayContent(parsed.draft.content || '');
          setEssayTitle(parsed.draft.title || '');
          setEssayNotes(parsed.draft.notes || '');
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Auto-save draft and history to localStorage
  useEffect(() => {
    const data = {
      history,
      draft: { content: essayContent, title: essayTitle, notes: essayNotes }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [essayContent, essayTitle, essayNotes, history]);

  const handleAnalyze = async () => {
    if (!essayContent || essayContent.length < 300) {
      alert("Escreva uma redação mais longa para receber feedback útil (mínimo 300 caracteres).");
      return;
    }
    
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const result = await getEssayFeedback(essayContent, essayTitle || "Sem Título");
      setFeedback(result);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com a IA. Verifique sua chave API ou tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveEssay = () => {
    if (!essayContent.trim()) {
      alert("Escreva algo antes de salvar!");
      return;
    }
    
    const newEntry: SavedEssay = {
      id: Date.now().toString(),
      title: essayTitle || "Redação sem Título",
      content: essayContent,
      notes: essayNotes,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      feedback: feedback || undefined
    };

    setHistory([newEntry, ...history]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const downloadEssay = () => {
    if (!essayContent.trim()) return;
    const element = document.createElement("a");
    const file = new Blob([
      `TÍTULO: ${essayTitle || 'Sem Título'}\n`,
      `DATA: ${new Date().toLocaleString()}\n`,
      `------------------------------------------\n\n`,
      essayContent,
      `\n\n------------------------------------------\n`,
      `NOTAS:\n${essayNotes}`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${essayTitle || 'redacao'}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const clearDraft = () => {
    if (confirm("Deseja realmente limpar o rascunho atual?")) {
      setEssayContent('');
      setEssayTitle('');
      setEssayNotes('');
      setFeedback(null);
    }
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remover esta redação do histórico?")) {
      setHistory(history.filter(h => h.id !== id));
      if (selectedEssay?.id === id) setSelectedEssay(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">WriteMaster <span className="text-indigo-600">AI</span></h1>
          </div>

          <nav className="flex bg-slate-200/50 p-1 rounded-2xl">
            {(Object.values(AppTab)).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedEssay(null); }}
                className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === AppTab.EDITOR ? 'Editor' : tab === AppTab.HISTORY ? 'Histórico' : 'Guia'}
              </button>
            ))}
          </nav>

          <div className="flex gap-3">
            <button 
              onClick={saveEssay}
              className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Salvar
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              {isAnalyzing ? 'Analisando...' : 'Analisar'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {activeTab === AppTab.EDITOR && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
              <div className="xl:col-span-3 space-y-6">
                <EssayEditor 
                  content={essayContent} setContent={setEssayContent}
                  title={essayTitle} setTitle={setEssayTitle}
                  notes={essayNotes} setNotes={setEssayNotes}
                />
                
                {/* Ações Inferiores do Editor */}
                <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
                   <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={saveEssay} 
                        className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 transform active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        SALVAR AGORA
                      </button>
                      <button 
                        onClick={downloadEssay} 
                        className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Baixar .TXT
                      </button>
                      <button 
                        onClick={clearDraft} 
                        className="px-6 py-4 rounded-2xl bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 font-semibold transition-all"
                      >
                        Limpar Texto
                      </button>
                   </div>
                   <button 
                     onClick={handleAnalyze} 
                     disabled={isAnalyzing}
                     className="md:hidden flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
                   >
                     Analisar com IA
                   </button>
                </div>

                {/* Feedback Display */}
                {feedback && (
                  <div className="glass p-8 rounded-[2rem] border-indigo-100 space-y-8 animate-in slide-in-from-bottom-4 duration-700 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div>
                        <h2 className="text-4xl font-black text-slate-900">Nota Final: <span className="text-indigo-600">{feedback.score}</span></h2>
                        <p className="text-slate-500 mt-1">Sua redação foi analisada conforme os critérios oficiais.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {feedback.competencies.map((comp, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">{comp.label}</span>
                            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">{comp.score}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed italic">"{comp.comment}"</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 text-lg">Comentários Gerais</h3>
                      <p className="text-slate-700 leading-relaxed bg-white/80 p-6 rounded-3xl border border-white shadow-sm">{feedback.generalComments}</p>
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
                      <h3 className="font-bold text-indigo-300 text-lg mb-4">Plano de Ação (Melhorias)</h3>
                      <ul className="space-y-3">
                        {feedback.suggestions.map((sug, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="text-indigo-400 font-bold">•</span>
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="xl:col-span-1 space-y-6">
                <PomodoroTimer onTimeUp={() => alert("Hora de pausar!")} />
                
                <div className="glass p-6 rounded-3xl shadow-sm border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4 border-b pb-2">Checklist</h4>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex gap-2 items-center"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600" /> Título impactante</li>
                    <li className="flex gap-2 items-center"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600" /> Repertório Legitimado</li>
                    <li className="flex gap-2 items-center"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600" /> Conectivos (C4)</li>
                    <li className="flex gap-2 items-center"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600" /> 5 Elementos na Proposta</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            {selectedEssay ? (
              <div className="space-y-6">
                <button onClick={() => setSelectedEssay(null)} className="text-indigo-600 font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar
                </button>
                <div className="glass p-8 rounded-[2rem] space-y-6 shadow-xl">
                  <h2 className="text-3xl font-bold text-slate-900">{selectedEssay.title}</h2>
                  <div className="serif text-lg leading-relaxed text-slate-800 whitespace-pre-wrap p-8 bg-white/90 rounded-2xl border border-slate-100">
                    {selectedEssay.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-slate-400">Nenhuma redação salva.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedEssay(item)}
                      className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-400 transition-all cursor-pointer shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
                        {item.feedback && <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full">{item.feedback.score}</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase mb-4">{item.date}</p>
                      <button onClick={(e) => deleteFromHistory(item.id, e)} className="text-xs text-rose-500 font-bold">Excluir</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === AppTab.GUIDE && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
             <div className="glass p-8 rounded-[2rem] border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Como tirar nota 1000?</h2>
                <div className="space-y-6">
                   <p className="text-slate-600">Siga o modelo estrutural clássico e certifique-se de cumprir as 5 competências do ENEM.</p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-100">
                         <h4 className="font-bold text-indigo-600">Tese</h4>
                         <p className="text-[10px] text-slate-500">Deixe claro seu posicionamento logo no início.</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100">
                         <h4 className="font-bold text-indigo-600">Repertório</h4>
                         <p className="text-[10px] text-slate-500">Use citações, fatos históricos ou filmes.</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100">
                         <h4 className="font-bold text-indigo-600">Proposta</h4>
                         <p className="text-[10px] text-slate-500">Quem fará o quê? Como? Para quê?</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Botão Flutuante de Salvar para Celular */}
      <button 
        onClick={saveEssay}
        className="fixed bottom-6 right-6 sm:hidden z-[60] w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transform active:scale-90 transition-transform"
        title="Salvar Redação"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      </button>

      {/* Toast de Sucesso */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold">Redação salva no histórico!</span>
        </div>
      )}

      {/* Loading de Análise */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-2xl font-black text-slate-900">Analisando sua redação...</h2>
        </div>
      )}
    </div>
  );
};

export default App;
