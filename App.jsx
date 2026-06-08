import React, { useState, useEffect } from 'react';
import { INITIAL_FORM_STATE } from './constants';
import InspectionForm from './components/InspectionForm';
import MotoInspectionForm from './components/MotoInspectionForm';
import HistoryView from './components/HistoryView';
import ReportModal from './components/ReportModal';
import Logo from './components/Logo';
import Login from './components/Login';
import { supabase } from './services/supabaseClient';

// Função auxiliar para gerar um novo estado de formulário com ID e data únicos
const getFreshFormState = () => ({
  ...INITIAL_FORM_STATE,
  id: `insp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  date: new Date().toISOString()
});

// Componente principal - App
// Gerencia: autenticação, temas (dark/light), navegação entre abas, histórico de inspeções
const App = () => {
  // Estado para tema escuro (persiste em localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  // Estado para controlar sidebar (desktop responsivo)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Aba ativa: 'carros', 'motos' ou 'history'
  const [activeTab, setActiveTab] = useState('carros');

  // Estados de autenticação (persistem em localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('autocheck_auth') === 'true');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('autocheck_user'));

  // Estado para exibir modal de relatório
  const [showReport, setShowReport] = useState(false);
  // Dados do formulário atual (a ser exibido no relatório)
  const [formData, setFormData] = useState(getFreshFormState);

  // Histórico de inspeções realizadas (persiste em localStorage)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('autocheck_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { return []; }
    }
    return [];
  });

  // Largura da janela (para responsividade)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Monitora mudanças de tamanho da janela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carrega dados do Supabase e configura listener em tempo real
  useEffect(() => {
    // Função para carregar inspeções do Supabase
    const loadInspectionsFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('inspecoes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar inspeções:', error);
          return;
        }

        // Transforma dados do Supabase para o formato da aplicação
        if (data && data.length > 0) {
          const formattedData = data.map(item => ({
            id: item.id?.toString() || `insp-${item.created_at}`,
            date: item.created_at || new Date().toISOString(),
            client: {
              name: item.cliente_nome || 'Cliente',
              phone: item.cliente_telefone || ''
            },
            vehicle: {
              plate: item.veiculo_placa || 'S/P',
              brandModel: item.veiculo_modelo || 'Não especificado',
              year: item.veiculo_ano || ''
            },
            type: item.tipo_veiculo || 'carro',
            totalValue: item.valor_total || '0,00',
            photos: item.fotos_url ? item.fotos_url.split('|').filter(f => f) : [],
            observations: item.observacoes || '',
            status: item.status || 'completo'
          }));

          // Mescla com dados locais, dando preferência aos do Supabase
          setHistory(prevHistory => {
            const localIds = new Set(prevHistory.map(h => h.id));
            const supabaseIds = new Set(formattedData.map(f => f.id));

            // Mantém dados locais que não existem no Supabase
            const onlyLocal = prevHistory.filter(h => !supabaseIds.has(h.id));
            
            // Combina, colocando dados do Supabase na frente
            return [...formattedData, ...onlyLocal];
          });
        }
      } catch (err) {
        console.error('Erro ao carregar inspeções do Supabase:', err);
      }
    };

    // Carrega dados inicialmente
    loadInspectionsFromSupabase();

    // Configura listener em tempo real para a tabela 'inspecoes'
    const channel = supabase
      .channel('inspecoes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inspecoes' },
        (payload) => {
          console.log('Mudança detectada no Supabase:', payload);
          // Recarrega os dados quando há qualquer mudança (INSERT, UPDATE, DELETE)
          loadInspectionsFromSupabase();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Listener Supabase Realtime ativado');
        }
      });

    // Cleanup: desinscreve do canal quando o componente é desmontado
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Seções personalizadas para carros e motos (persiste em localStorage)
  const [customSections, setCustomSections] = useState(() => {
    const saved = localStorage.getItem('autocheck_custom_sections');
    return saved ? JSON.parse(saved) : { carros: [], motos: [] };
  });

  // Veículos já inspecionados (para autocompletar)
  const [savedVehicles, setSavedVehicles] = useState(() => {
    const saved = localStorage.getItem('autocheck_vehicles');
    return saved ? JSON.parse(saved) : [];
  });

  // Persiste dados em localStorage e aplica tema escuro se ativado
  useEffect(() => {
    localStorage.setItem('autocheck_history', JSON.stringify(history));
    localStorage.setItem('autocheck_custom_sections', JSON.stringify(customSections));
    localStorage.setItem('autocheck_vehicles', JSON.stringify(savedVehicles));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [history, customSections, savedVehicles, isDarkMode]);

  // Manipula envio do formulário (exibe relatório)
  const handleSubmit = (data) => {
    setFormData(data);
    setShowReport(true);
  };

  // Salva inspeção no histórico após confirmação
  const handleSaveToHistory = (data) => {
    // Adiciona veículo à lista de salvos se for novo
    if (data.vehicle?.brandModel) {
      setSavedVehicles(prev => {
        const brands = prev.map(v => v.toLowerCase());
        if (!brands.includes(data.vehicle.brandModel.toLowerCase())) {
          return [...prev, data.vehicle.brandModel];
        }
        return prev;
      });
    }

    // Cria registro com ID e data únicos
    const recordWithId = {
      ...data,
      id: data.id || `insp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: data.date || new Date().toISOString()
    };

    // Adiciona no início do histórico
    setHistory(prev => [recordWithId, ...prev]);
    setShowReport(false);
    setActiveTab('history');
    setFormData(getFreshFormState());
  };

  // Adiciona nova seção personalizada
  const handleAddSection = (category, title) => {
    setCustomSections(prev => ({
      ...prev,
      [category]: [...prev[category], { id: Date.now(), title, fields: [] }]
    }));
  };

  // Remove seção personalizada
  const handleRemoveSection = (category, sectionId) => {
    setCustomSections(prev => ({
      ...prev,
      [category]: prev[category].filter(s => String(s.id) !== String(sectionId))
    }));
  };

  // Adiciona campo a uma seção
  const handleAddFieldToSection = (category, sectionId, label) => {
    setCustomSections(prev => ({
      ...prev,
      [category]: prev[category].map(s => s.id === sectionId ? {
        ...s,
        fields: [...s.fields, { id: Date.now(), label }]
      } : s)
    }));
  };

  // Remove campo de uma seção
  const handleRemoveFieldFromSection = (category, sectionId, fieldId) => {
    setCustomSections(prev => ({
      ...prev,
      [category]: prev[category].map(s => String(s.id) === String(sectionId) ? {
        ...s,
        fields: s.fields.filter(f => String(f.id) !== String(fieldId))
      } : s)
    }));
  };

  // Delete um veículo da lista de salvos
  const handleDeleteSavedVehicle = (modelName) => {
    setSavedVehicles(prev => prev.filter(v => v !== modelName));
  };

  // Deleta inspeção do histórico e do Supabase
  const handleDeleteInspection = async (id) => {
    if (!window.confirm('Excluir registro? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Remove do estado local imediatamente
      setHistory(prev => prev.filter(i => i.id !== id));

      // Tenta deletar do Supabase se o ID parece um número (registros do Supabase)
      if (!id.startsWith('insp-')) {
        const { error } = await supabase
          .from('inspecoes')
          .delete()
          .eq('id', parseInt(id));

        if (error) {
          console.error('Erro ao deletar do Supabase:', error);
          // Recarrega os dados para sincronizar se algo deu errado
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Erro ao deletar inspeção:', err);
      // Recarrega os dados para manter sincronização
      window.location.reload();
    }
  };

  // Processa login
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('autocheck_auth', 'true');
    localStorage.setItem('autocheck_user', user);
  };

  // Processa logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('autocheck_auth');
    localStorage.removeItem('autocheck_user');
  };

  // Se não autenticado, mostra página de login
  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  // Verifica se é desktop (largura >= 1024px)
  const isDesktop = windowWidth >= 1024;

  // Menu lateral com abas disponíveis
  const menuItems = [
    { id: 'carros', label: 'Carros', icon: 'fa-car' },
    { id: 'motos', label: 'Motos', icon: 'fa-motorcycle' },
    { id: 'history', label: 'Histórico', icon: 'fa-calendar-check' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Overlay da sidebar em mobile */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Barra lateral com navegação */}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[100] transition-all duration-300 transform
        ${!isDesktop ? (isSidebarOpen ? 'w-72 translate-x-0 shadow-2xl' : 'w-72 -translate-x-full') : (isSidebarOpen ? 'w-72' : 'w-20')}`}>

        <div className="flex flex-col h-full">
          {/* Header da sidebar com logo */}
          <div className="p-4 h-20 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
            {(isSidebarOpen || !isDesktop) ? (
              <Logo className="h-6" />
            ) : (
              <div className="w-full flex justify-center">
                <i className="fas fa-check-circle text-[#1D63BD] text-3xl"></i>
              </div>
            )}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-400">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Menu de navegação com abas */}
          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if(!isDesktop) setIsSidebarOpen(false); }}
                className={`w-full flex items-center ${isSidebarOpen || !isDesktop ? 'space-x-4 p-4' : 'justify-center p-3'} rounded-2xl transition-all group ${activeTab === item.id ? 'bg-[#1D63BD] text-white shadow-xl shadow-blue-100 dark:shadow-none' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${activeTab === item.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                {(isSidebarOpen || !isDesktop) && <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer da sidebar com controles de tema e logout */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {/* Botão de toggle tema escuro/claro */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center ${isSidebarOpen || !isDesktop ? 'space-x-4 p-4' : 'justify-center p-3'} text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all`}
            >
              <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-lg">
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </div>
              {(isSidebarOpen || !isDesktop) && <span className="font-bold">Tema</span>}
            </button>
            {/* Botão de logout */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${isSidebarOpen || !isDesktop ? 'space-x-4 p-4' : 'justify-center p-3'} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all`}
            >
              <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-lg">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              {(isSidebarOpen || !isDesktop) && <span className="font-bold">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal da aplicação */}
      <main className={`transition-all duration-300 min-h-screen ${isDesktop ? (isSidebarOpen ? 'pl-72' : 'pl-20') : 'pl-0'}`}>
        {/* Header fixo com título e info do usuário */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[60] flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            {/* Botão para abrir/fechar sidebar */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <i className="fas fa-bars text-slate-600 dark:text-white text-xl"></i>
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-[#1D63BD] uppercase tracking-wider leading-none mb-1">AutoCheck Pro</h2>
              {/* Título da aba ativa */}
              <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Info do usuário logado */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Logado como</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">{currentUser}</p>
            </div>
            {/* Avatar com primeira letra do usuário */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1D63BD] to-cyan-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100 dark:shadow-none">
              {currentUser?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Conteúdo dinâmico baseado na aba ativa */}
        <div className="max-w-4xl mx-auto p-6 sm:p-10">
          {/* ABA 1: Formulário de inspeção de CARROS */}
          {activeTab === 'carros' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InspectionForm
                initialData={formData}
                onSubmit={handleSubmit}
                customSections={customSections.carros}
                onAddSection={(title) => handleAddSection('carros', title)}
                onRemoveSection={(id) => handleRemoveSection('carros', id)}
                onAddFieldToSection={(sId, label) => handleAddFieldToSection('carros', sId, label)}
                onRemoveFieldFromSection={(sId, fId) => handleRemoveFieldFromSection('carros', sId, fId)}
                savedVehicles={savedVehicles}
                onDeleteVehicle={handleDeleteSavedVehicle}
              />
            </div>
          )}

          {/* ABA 2: Formulário de inspeção de MOTOS */}
          {activeTab === 'motos' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MotoInspectionForm
                initialData={formData}
                onSubmit={handleSubmit}
                customSections={customSections.motos}
                onAddSection={(title) => handleAddSection('motos', title)}
                onRemoveSection={(id) => handleRemoveSection('motos', id)}
                onAddFieldToSection={(sId, label) => handleAddFieldToSection('motos', sId, label)}
                onRemoveFieldFromSection={(sId, fId) => handleRemoveFieldFromSection('motos', sId, fId)}
                savedVehicles={savedVehicles}
                onDeleteVehicle={handleDeleteSavedVehicle}
              />
            </div>
          )}

          {/* ABA 3: Histórico de inspeções realizadas */}
          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <HistoryView
                history={history}
                onDelete={handleDeleteInspection}
                onViewReport={(data) => { setFormData(data); setShowReport(true); }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modal de relatório/certificado de inspeção */}
      {showReport && <ReportModal data={formData} onClose={() => setShowReport(false)} onSaveToHistory={handleSaveToHistory} />}
    </div>
  );
};

export default App;
