import React, { useState } from 'react';
import FormCard from './FormCard';
import { INITIAL_FORM_STATE } from '../constants';

const MotoInspectionForm = ({ 
  initialData,
  onSubmit, 
  customSections = [], 
  onAddSection, 
  onRemoveSection, 
  onAddFieldToSection, 
  onRemoveFieldFromSection, 
  savedVehicles = [], 
  onDeleteVehicle 
}) => {
  const [data, setData] = useState({
    ...INITIAL_FORM_STATE,
    ...initialData,
    type: 'moto',
    motos: initialData?.motos || {
      tires: { twi: 'OK', pressure: 'OK', wheelCondition: 'OK' },
      electrical: { battery: 'OK', lights: 'OK', signals: 'OK' },
      mechanical: { oilLevel: 'OK', airFilter: 'OK', leaks: 'OK' },
      transmission: { chainTension: 'OK', kitWear: 'OK', lubrication: 'OK' },
      brakes: { pads: 'OK', fluidLevel: 'OK', discs: 'OK' },
      scanner: { serviceReset: 'OK', dtcErrors: 'OK' },
      general: { steeringHead: 'OK', suspension: 'OK' }
    },
    dynamic: initialData?.dynamic || {}
  });

  React.useEffect(() => {
    setData(prev => ({
      ...prev,
      ...initialData,
      motos: initialData?.motos || prev.motos || {
        tires: { twi: 'OK', pressure: 'OK', wheelCondition: 'OK' },
        electrical: { battery: 'OK', lights: 'OK', signals: 'OK' },
        mechanical: { oilLevel: 'OK', airFilter: 'OK', leaks: 'OK' },
        transmission: { chainTension: 'OK', kitWear: 'OK', lubrication: 'OK' },
        brakes: { pads: 'OK', fluidLevel: 'OK', discs: 'OK' },
        scanner: { serviceReset: 'OK', dtcErrors: 'OK' },
        general: { steeringHead: 'OK', suspension: 'OK' }
      },
      dynamic: initialData?.dynamic || prev.dynamic || {},
      photos: initialData?.photos || prev.photos || []
    }));
  }, [initialData]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newFieldLabels, setNewFieldLabels] = useState({});
  const [showVehicleList, setShowVehicleList] = useState(false);

  // Real-time camera & upload state
  const videoRef = React.useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [activeStream, setActiveStream] = useState(null);

  React.useEffect(() => {
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeStream]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setActiveStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 150);
    } catch (err) {
      console.error("Erro ao acessar a câmera: ", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setActiveStream(stream);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 150);
      } catch (fallbackErr) {
        setCameraError("Não foi possível acessar a câmera do dispositivo. Use a opção de upload ou conceda permissão de câmera.");
      }
    }
  };

  const stopCamera = () => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
      setActiveStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      setData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), dataUrl]
      }));
      stopCamera();
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== idx)
    }));
  };

  const handleInputChange = (category, field, value) => {
    setData(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'object' && field
        ? { ...prev[category], [field]: value }
        : value
    }));
  };

  const handleDynamicChange = (label, value) => {
    setData(prev => ({
      ...prev,
      dynamic: { ...prev.dynamic, [label]: value }
    }));
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    onAddSection(newSectionTitle);
    setNewSectionTitle('');
  };

  const handleAddFieldLocal = (sectionId) => {
    const label = newFieldLabels[sectionId];
    if (!label?.trim()) return;
    onAddFieldToSection(sectionId, label);
    setNewFieldLabels(prev => ({ ...prev, [sectionId]: '' }));
  };

  const handleMotoChange = (group, field, value) => {
    setData(prev => ({
      ...prev,
      motos: {
        ...prev.motos,
        [group]: { ...prev.motos[group], [field]: value }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...data,
      id: data.id || `moto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: data.date || new Date().toISOString()
    };
    onSubmit(finalData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end sticky top-4 z-40">
        <button 
          type="button"
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
            isEditMode 
              ? 'bg-green-500 text-white shadow-green-100' 
              : 'bg-white dark:bg-slate-900 text-[#1D63BD] border border-blue-50 dark:border-slate-800'
          }`}
        >
          <i className={`fas ${isEditMode ? 'fa-save' : 'fa-gear'}`}></i>
          <span>{isEditMode ? 'Finalizar Edição' : 'Personalizar Checklist'}</span>
        </button>
      </div>

      {/* Dados do Cliente */}
      <FormCard title="Dados do Cliente" icon="fa-user">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            required
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white"
            placeholder="Nome Completo *"
            value={data.client.name}
            onChange={(e) => handleInputChange('client', 'name', e.target.value)}
          />
          <input 
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white"
            placeholder="Telefone (WhatsApp)"
            value={data.client.phone}
            onChange={(e) => handleInputChange('client', 'phone', e.target.value)}
          />
        </div>
      </FormCard>

      <FormCard title="Dados da Moto" icon="fa-motorcycle">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <input 
              required
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white"
              placeholder="Marca / Modelo *"
              value={data.vehicle.brandModel}
              onChange={(e) => handleInputChange('vehicle', 'brandModel', e.target.value)}
              onFocus={() => setShowVehicleList(true)}
            />
            {showVehicleList && savedVehicles.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 max-h-48 overflow-y-auto animate-in scale-in">
                <div className="flex justify-between items-center px-3 py-1 mb-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Motos Usadas</span>
                  <button type="button" onClick={() => setShowVehicleList(false)} className="text-slate-400"><i className="fas fa-times"></i></button>
                </div>
                {savedVehicles.map(v => (
                  <div key={v} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl group">
                    <button 
                      type="button"
                      className="flex-1 text-left text-sm font-bold text-slate-600 dark:text-slate-300"
                      onClick={() => { handleInputChange('vehicle', 'brandModel', v); setShowVehicleList(false); }}
                    >
                      {v}
                    </button>
                    <button 
                      type="button"
                      onClick={() => onDeleteVehicle(v)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 transition-all"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input 
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white font-mono uppercase"
            placeholder="Placa"
            value={data.vehicle.plate}
            onChange={(e) => handleInputChange('vehicle', 'plate', e.target.value)}
          />
        </div>
      </FormCard>

      {/* Mecânica */}
      <FormCard title="Mecânica" icon="fa-wrench">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'oilLevel', label: 'Nível do Óleo', icon: 'fa-oil-can' },
            { id: 'airFilter', label: 'Filtro de Ar', icon: 'fa-wind' },
            { id: 'leaks', label: 'Vazamentos', icon: 'fa-droplet-slash' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Regular', 'Crítico'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMotoChange('mechanical', item.id, status)}
                    className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.motos.mechanical?.[item.id] === status
                        ? 'bg-[#1D63BD] border-[#1D63BD] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Transmissão */}
      <FormCard title="Transmissão" icon="fa-gears">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'chainTension', label: 'Tensão da Corrente', icon: 'fa-link' },
            { id: 'kitWear', label: 'Desgaste do Kit', icon: 'fa-gear' },
            { id: 'lubrication', label: 'Lubrificação', icon: 'fa-oil-can' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Regular', 'Crítico'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMotoChange('transmission', item.id, status)}
                    className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.motos.transmission?.[item.id] === status
                        ? 'bg-[#1D63BD] border-[#1D63BD] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Freios */}
      <FormCard title="Sistema de Freios" icon="fa-circle-stop">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'pads', label: 'Pastilhas/Lonas', icon: 'fa-hockey-puck' },
            { id: 'fluidLevel', label: 'Nível do Fluido', icon: 'fa-droplet' },
            { id: 'discs', label: 'Discos de Freio', icon: 'fa-compact-disc' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Regular', 'Crítico'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMotoChange('brakes', item.id, status)}
                    className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.motos.brakes?.[item.id] === status
                        ? 'bg-[#1D63BD] border-[#1D63BD] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Scanner */}
      <FormCard title="Scanner e Diagnóstico" icon="fa-microchip">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'serviceReset', label: 'Reset de Serviço', icon: 'fa-rotate-left' },
            { id: 'dtcErrors', label: 'Leitura de Erros (DTC)', icon: 'fa-triangle-exclamation' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['Realizado', 'Pendente', 'N/A'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMotoChange('scanner', item.id, status)}
                    className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.motos.scanner?.[item.id] === status
                        ? 'bg-[#1D63BD] border-[#1D63BD] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Geral */}
      <FormCard title="Verificação Geral" icon="fa-magnifying-glass">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'steeringHead', label: 'Caixa de Direção', icon: 'fa-compass' },
            { id: 'suspension', label: 'Suspensão (Vazamentos)', icon: 'fa-wrench' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Folga', 'Crítico'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMotoChange('general', item.id, status)}
                    className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.motos.general?.[item.id] === status
                        ? 'bg-[#1D63BD] border-[#1D63BD] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>
      <FormCard title="Pneus e Rodas" icon="fa-dharmachakra">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'twi', label: 'Sulco (TWI)', icon: 'fa-gauge-high' },
            { id: 'pressure', label: 'Calibragem', icon: 'fa-wind' },
            { id: 'wheelCondition', label: 'Estado da Roda', icon: 'fa-circle-dot' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Regular', 'Crítico'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMotoChange('tires', item.id, status)}
                    className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.motos.tires[item.id] === status
                        ? 'bg-[#1D63BD] border-[#1D63BD] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Elétrica */}
      <FormCard title="Sistema Elétrico" icon="fa-bolt">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'battery', label: 'Nível da Bateria', icon: 'fa-car-battery' },
            { id: 'lights', label: 'Faróis / Lanternas', icon: 'fa-lightbulb' },
            { id: 'signals', label: 'Setas / Buzina', icon: 'fa-bullhorn' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Falha', 'Revisar'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleMotoChange('electrical', item.id, status)}
                    className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.motos.electrical[item.id] === status
                        ? 'bg-[#1D63BD] border-[#1D63BD] text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Seções Personalizadas */}
      <div className="space-y-6">
        {isEditMode && (
          <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border-2 border-dashed border-[#1D63BD]/20 text-center">
            <label className="block text-xs font-black text-[#1D63BD] uppercase tracking-widest mb-4">Criar Novo Grupo de Itens</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 px-5 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-bold text-slate-800 dark:text-white"
                placeholder="Ex: Pintura, Acessórios..."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSection())}
              />
              <button 
                type="button" 
                onClick={handleAddSection}
                className="px-6 bg-[#1D63BD] text-white font-bold rounded-2xl hover:bg-[#154A8D] transition-all"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        )}

        {customSections.map(section => (
          <FormCard 
            key={section.id} 
            title={section.title} 
            icon="fa-list-check"
            onRemove={isEditMode ? () => { if(window.confirm(`Excluir o grupo "${section.title}"?`)) onRemoveSection(section.id) } : null}
          >
            <div className="space-y-4">
              {isEditMode && (
                <div className="flex gap-2">
                  <input 
                    className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white"
                    placeholder="Novo item..."
                    value={newFieldLabels[section.id] || ''}
                    onChange={(e) => setNewFieldLabels(prev => ({ ...prev, [section.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFieldLocal(section.id))}
                  />
                  <button 
                    type="button" 
                    onClick={() => handleAddFieldLocal(section.id)}
                    className="px-4 bg-[#1D63BD] text-white font-bold rounded-xl hover:bg-[#154A8D] transition-all"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {section.fields.map(field => (
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      {isEditMode && (
                        <button 
                          type="button"
                          onClick={() => onRemoveFieldFromSection(section.id, field.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all focus:outline-none"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      )}
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{field.label}</span>
                    </div>
                    <div className="flex gap-2">
                      {['OK', 'Regular', 'Crítico'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleDynamicChange(field.label, status)}
                          className={`flex-1 px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                            data.dynamic[field.label] === status
                              ? 'bg-[#1D63BD] border-[#1D63BD] text-white shadow-lg shadow-blue-100 dark:shadow-none'
                              : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-blue-200'
                          }`}
                        >
                          {status.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormCard>
        ))}
      </div>

      <FormCard title="Resumo e Valor" icon="fa-receipt">
         <div className="space-y-4">
            <textarea 
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white"
              placeholder="Peças Utilizadas (ex: Óleo, Filtro...)"
              value={data.partsUsed || ''}
              onChange={(e) => handleInputChange('partsUsed', '', e.target.value)}
            />
            <textarea 
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white"
              placeholder="Observações..."
              value={data.observations}
              onChange={(e) => handleInputChange('observations', '', e.target.value)}
            />

            {/* Fotos da Inspeção */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Fotos da Inspeção (Opcional)</label>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <button 
                  type="button" 
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                    isCameraActive 
                      ? 'bg-red-500 text-white' 
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-100 dark:shadow-none'
                  }`}
                >
                  <i className={`fas ${isCameraActive ? 'fa-video-slash' : 'fa-camera'}`}></i>
                  <span>{isCameraActive ? 'Desativar Câmera' : 'Tirar Foto (Câmera)'}</span>
                </button>
                
                <label className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center space-x-2 cursor-pointer transition-all">
                  <i className="fas fa-images"></i>
                  <span>Anexar da Galeria</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={handlePhotoUpload} 
                  />
                </label>
              </div>

              {/* Câmera em tempo real */}
              {isCameraActive && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 overflow-hidden flex flex-col items-center space-y-4 animate-in zoom-in duration-200">
                  <div className="w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden relative border-2 border-cyan-500/30">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-white/10 flex flex-col justify-between">
                      <div className="h-1/3 border-b border-white/5 flex justify-between">
                        <div className="w-1/3 border-r border-white/5"></div>
                        <div className="w-1/3 border-r border-white/5"></div>
                      </div>
                      <div className="h-1/3 border-b border-white/5 flex justify-between">
                        <div className="w-1/3 border-r border-white/5"></div>
                        <div className="w-1/3 border-r border-white/5"></div>
                      </div>
                    </div>
                  </div>
                  
                  {cameraError && <p className="text-xs text-red-400 text-center font-semibold px-4">{cameraError}</p>}
                  
                  <div className="flex space-x-3">
                    <button 
                      type="button" 
                      onClick={capturePhoto}
                      className="px-6 py-3 bg-[#1D63BD] text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                      <i className="fas fa-circle-dot text-red-500 animate-pulse"></i>
                      <span>Tirar Foto</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={stopCamera}
                      className="px-6 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-700 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Fotos anexadas */}
              {data.photos && data.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {data.photos.map((photo, index) => (
                    <div key={index} className="aspect-video relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 group bg-slate-100 dark:bg-slate-800">
                      <img src={photo} alt={`FotoAnexa-${index}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-transform hover:scale-110 shadow-md"
                      >
                        <i className="fas fa-trash-alt text-[10px]"></i>
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/40 text-white text-[9px] font-mono p-1 text-center font-bold">
                        FOTO {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative pt-2">
               <span className="absolute left-5 top-[60%] -translate-y-1/2 font-bold text-slate-400">R$</span>
               <input 
                required
                className="w-full pl-12 pr-5 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-transparent focus:border-[#1D63BD] rounded-2xl outline-none font-black text-2xl text-[#1D63BD]"
                placeholder="0,00"
                value={data.totalValue}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val === '') val = '0';
                  const formatted = (parseInt(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                  handleInputChange('totalValue', '', formatted);
                }}
               />
            </div>
         </div>
      </FormCard>

      <button 
        type="submit"
        className="w-full py-6 bg-[#1D63BD] hover:bg-[#154A8D] text-white font-black text-lg rounded-3xl shadow-2xl shadow-blue-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95"
      >
        GERAR RELATÓRIO MOTO
      </button>
    </form>
  );
};

export default MotoInspectionForm;
