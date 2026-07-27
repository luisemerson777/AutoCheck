
import React from 'react';
import { InspectionData } from '../types';

interface Props {
  data: InspectionData;
  onClose: () => void;
  onSaveToHistory: (data: InspectionData) => void;
}

const ReportModal: React.FC<Props> = ({ data, onClose, onSaveToHistory }) => {
  
  const handleWhatsApp = () => {
    const phone = data.client.phone.replace(/\D/g, '');
    if (!phone || phone.length < 10) {
      alert('Número de telefone inválido ou não informado. Verifique os dados do cliente.');
      return;
    }

    const message =
      `*CERTIFICADO DE INSPEÇÃO - AUTOCHECK PRO*\n\n` +
      `*Cliente:* ${data.client.name}\n` +
      `*Veículo:* ${data.vehicle.brandModel} (${data.vehicle.plate})\n\n` +
      `*Resumo Técnico:*\n` +
      `• Pneus: ${data.tires.grooves}\n` +
      `• Bateria: ${data.electrical.batteryHealth}/5\n` +
      `• Óleo Motor: ${data.fluids.engineOil}\n\n` +
      `*Peças Utilizadas:*\n${data.partsUsed || 'Manutenção preventiva básica'}\n\n` +
      `*Seu veículo está pronto e seguro para rodar!*`;
    
    window.open(
      `https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handleSave = () => {
    onSaveToHistory(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl my-auto overflow-y-auto flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Banner de Perfil de Relatório */}
        <div className="p-8 bg-gradient-to-br from-[#1D63BD] to-cyan-500 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <i className="fas fa-file-invoice text-3xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Perfil do Relatório</h2>
              <p className="text-white/80 font-medium">Análise final completa</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-bold uppercase opacity-60">Proprietário</p>
              <p className="font-bold truncate">{data.client.name}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] font-bold uppercase opacity-60">Status de Entrega</p>
              <p className="font-bold">✓ Pronto para Uso</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 space-y-8">
          {/* Resumo da Verificação */}
          <section className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-6 bg-[#1D63BD] rounded-full"></div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Resumo da Verificação</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <i className="fas fa-dharmachakra text-[#1D63BD]"></i>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pneus</p>
                  <p className="text-sm font-bold text-slate-700">{data.tires.grooves}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <i className="fas fa-bolt text-[#1D63BD]"></i>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Bateria</p>
                  <p className="text-sm font-bold text-slate-700">{data.electrical.batteryHealth}/5 Saúde</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <i className="fas fa-oil-can text-[#1D63BD]"></i>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Óleo Motor</p>
                  <p className="text-sm font-bold text-slate-700">{data.fluids.engineOil}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <i className="fas fa-sparkles text-[#1D63BD]"></i>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Limpeza</p>
                  <p className="text-sm font-bold text-slate-700">{data.checkout.cleaning ? 'Completa' : 'Não Solicitada'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Dados do Veículo */}
          <section className="p-6 border-2 border-[#1D63BD]/10 rounded-3xl bg-blue-50/20">
            <div className="flex justify-between items-center mb-4">
               <div>
                 <h3 className="text-xl font-black text-slate-800">{data.vehicle.brandModel}</h3>
                 <p className="text-xs font-bold text-[#1D63BD]">{data.vehicle.mileage} KM Rodados</p>
               </div>
               <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-lg font-mono font-bold text-slate-800">
                 {data.vehicle.plate || "S/ PLACA"}
               </span>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Peças Substituídas</h5>
              <p className="text-sm font-semibold text-slate-700">{data.partsUsed || "Nenhuma peça informada."}</p>
            </div>
          </section>

          {/* Observações */}
          <section>
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notas Técnicas Adicionais</h4>
             <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
               "{data.observations || "Nenhuma observação relevante."}"
             </p>
          </section>
        </div>

        {/* Rodapé com Ações */}
        <div className="p-8 border-t border-slate-50 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleWhatsApp}
              className="flex-[2] py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl shadow-lg shadow-green-100 transition-all flex items-center justify-center space-x-3"
            >
              <i className="fab fa-whatsapp text-xl"></i>
              <span>Enviar para Cliente</span>
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-4 bg-[#1D63BD] hover:bg-[#154A8D] text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center space-x-3"
            >
              <i className="fas fa-save"></i>
              <span>Salvar Histórico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
