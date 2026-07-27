
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InspectionForm from './components/InspectionForm';
import ReportModal from './components/ReportModal';
import HistoryView from './components/HistoryView';
import { InspectionData, InspectionStatus } from './types';

const INITIAL_FORM_STATE: InspectionData = {
  id: '',
  date: '',
  client: { name: '', phone: '' },
  vehicle: { brandModel: '', year: '', plate: '', mileage: '' },
  tires: {
    grooves: InspectionStatus.GOOD,
    pressure: InspectionStatus.GOOD,
    spare: InspectionStatus.GOOD,
  },
  fluids: {
    engineOil: InspectionStatus.OK,
    brakeFluid: InspectionStatus.OK,
    transmissionFluid: InspectionStatus.OK,
    coolant: InspectionStatus.OK,
    wiperFluid: InspectionStatus.OK,
  },
  electrical: {
    batteryHealth: 5,
    alternator: InspectionStatus.OK,
    belts: InspectionStatus.OK,
    dashboardLights: true,
  },
  safety: {
    headlights: InspectionStatus.OK,
    tailLights: InspectionStatus.OK,
    turnSignals: InspectionStatus.OK,
    wipers: InspectionStatus.OK,
    horn: true,
  },
  equipment: {
    triangle: true,
    extinguisher: true,
    tireWrench: true,
    jack: true,
  },
  checkout: {
    testDrive: false,
    wheelTorque: false,
    cleaning: false,
    personalObjects: true,
  },
  partsUsed: '',
  observations: ''
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [showReport, setShowReport] = useState(false);
  const [formData, setFormData] = useState<InspectionData>(INITIAL_FORM_STATE);
  
  // Inicialização segura: Lê do LocalStorage ANTES da primeira renderização
  const [history, setHistory] = useState<InspectionData[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('autocheck_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Sincroniza com LocalStorage apenas quando o histórico REALMENTE muda
  useEffect(() => {
    try {
      localStorage.setItem('autocheck_history', JSON.stringify(history));
    } catch (e) {
      console.warn('AutoCheck: Falha ao salvar histórico no localStorage (quota excedida?)', e);
    }
  }, [history]);

  const handleSubmit = (data: InspectionData) => {
    setFormData(data);
    setShowReport(true);
  };

  const handleSaveToHistory = (data: InspectionData) => {
    setHistory(prev => {
      const exists = prev.find(item => item.id === data.id);
      if (exists) {
        return prev.map(item => item.id === data.id ? data : item);
      }
      return [data, ...prev];
    });
    
    setShowReport(false);
    setActiveTab('history');
    setFormData(INITIAL_FORM_STATE);
  };

  const handleDeleteHistory = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro permanentemente?')) {
      setHistory(prev => {
        const newHistory = prev.filter(item => item.id !== id);
        return newHistory;
      });
    }
  };

  const handleViewReport = (data: InspectionData) => {
    setFormData(data);
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 pt-28">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit mb-12 mx-auto sm:mx-0">
          <button 
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'form' ? 'bg-white text-[#1D63BD] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Nova Inspeção
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[#1D63BD] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Histórico ({history.length})
          </button>
        </div>

        {activeTab === 'form' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 text-center sm:text-left">
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Inspeção <span className="text-[#1D63BD]">Premium</span></h1>
              <p className="text-slate-400 font-medium mt-1">Checklist intuitivo para saída de oficina.</p>
            </div>
            <InspectionForm initialData={formData} onSubmit={handleSubmit} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 text-center sm:text-left">
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Histórico de <span className="text-[#1D63BD]">Serviços</span></h1>
              <p className="text-slate-400 font-medium mt-1">Clique para ver detalhes ou excluir registros.</p>
            </div>
            <HistoryView 
              history={history} 
              onDelete={handleDeleteHistory} 
              onViewReport={handleViewReport}
            />
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal 
          data={formData} 
          onClose={() => setShowReport(false)} 
          onSaveToHistory={handleSaveToHistory}
        />
      )}
    </div>
  );
};

export default App;
