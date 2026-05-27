
import React, { useState } from 'react';

const HistoryView = ({ history, onDelete, onViewReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const parseCurrency = (val) => {
    if (!val) return 0;
    return parseFloat(val.replace(/\./g, '').replace(',', '.'));
  };

  // Parte do resumo financeiro
  const totalBilling = history.reduce((acc, current) => acc + parseCurrency(current.totalValue), 0);

  const filtered = history.filter(item => 
    item.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle.brandModel.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleToggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const confirmAndDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1D63BD] p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100 dark:shadow-none flex items-center justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-blue-100/70 text-xs font-bold uppercase tracking-wider mb-2">Faturamento Total</p>
            <h2 className="text-3xl font-black">
              <span className="text-lg font-medium opacity-60 mr-1">R$</span>
              {totalBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Serviços Realizados</p>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">
              {history.length}
              <span className="text-lg font-medium text-slate-300 dark:text-slate-700 ml-2">unid.</span>
            </h2>
          </div>
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-3xl text-[#1D63BD] group-hover:scale-110 transition-transform">
            <i className="fas fa-clipboard-check"></i>
          </div>
        </div>
      </div>

      {/* Parte da busca */}
      <div className="relative group">
        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-[#1D63BD] transition-colors"></i>
        <input 
          type="text"
          placeholder="Buscar por cliente, placa ou modelo..."
          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1D63BD] focus:border-transparent outline-none font-medium text-slate-900 dark:text-white transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
          <i className="fas fa-folder-open text-4xl text-slate-200 dark:text-slate-800 mb-4"></i>
          <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div 
              key={item.id}
              className={`bg-white dark:bg-slate-900 border transition-all duration-300 overflow-hidden ${
                expandedId === item.id 
                  ? 'rounded-[2rem] border-blue-200 dark:border-blue-900 shadow-xl shadow-blue-50 dark:shadow-none' 
                  : 'rounded-2xl border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 shadow-sm'
              }`}
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer select-none"
                onClick={() => handleToggleExpand(item.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${expandedId === item.id ? 'bg-[#1D63BD] text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-[#1D63BD]'}`}>
                    <i className={`fas ${item.type === 'moto' ? 'fa-motorcycle' : 'fa-car'}`}></i>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{item.client.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">{item.vehicle.brandModel} • <span className="font-mono uppercase">{item.vehicle.plate || "S/P"}</span></p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1 shrink-0 ml-4">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-tight">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </span>
                  <i className={`fas fa-chevron-down text-slate-300 dark:text-slate-700 transition-transform ${expandedId === item.id ? 'rotate-180 text-[#1D63BD]' : ''}`}></i>
                </div>
              </div>

              {expandedId === item.id && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 pt-4">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase mb-1">Status Pneus</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.type === 'moto' ? item.motos?.tires?.twi : item.tires?.grooves}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase mb-1">Bateria</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.type === 'moto' ? item.motos?.electrical?.battery : `${item.electrical?.batteryHealth || 5}/5`}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase mb-1">Motor / Óleo</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.type === 'moto' ? item.motos?.mechanical?.oilLevel : item.fluids?.engineOil}
                      </p>
                    </div>
                    <div className="bg-[#1D63BD]/5 dark:bg-[#1D63BD]/10 p-3 rounded-xl border border-[#1D63BD]/10 col-span-2 sm:col-span-1">
                      <p className="text-[9px] font-bold text-[#1D63BD] uppercase mb-1">Valor Total</p>
                      <p className="text-xs font-black text-[#1D63BD]">R$ {item.totalValue || '0,00'}</p>
                    </div>
                  </div>

                  {item.photos && item.photos.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Fotos Anexas ({item.photos.length})</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {item.photos.map((photo, index) => (
                          <div 
                            key={index} 
                            onClick={(e) => { e.stopPropagation(); onViewReport(item); }} 
                            className="w-24 h-16 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 cursor-pointer hover:border-[#1D63BD] transition-all transform hover:scale-105"
                          >
                            <img src={photo} alt={`Anexo ${index}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewReport(item);
                      }}
                      className="flex-[2] py-3.5 bg-[#1D63BD] text-white text-xs font-bold rounded-xl hover:bg-[#154A8D] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 dark:shadow-none"
                    >
                      <i className="fas fa-file-invoice"></i>
                      <span>Ver Relatório Completo</span>
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => confirmAndDelete(e, item.id)}
                      className="flex-1 py-3.5 bg-red-50 dark:bg-red-900/10 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-2 border border-red-100 dark:border-red-900/30"
                    >
                      <i className="fas fa-trash-alt"></i>
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
