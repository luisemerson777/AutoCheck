
import React, { useState, useEffect } from 'react';
import { InspectionStatus } from '../constants';
import FormCard from './FormCard';
import RatingSelector from './RatingSelector';

const InspectionForm = ({ 
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
    ...initialData,
    type: 'carro',
    dynamic: initialData.dynamic || {},
    mechanical: { airFilter: 'OK', leaks: 'OK' },
    brakes: { pads: 'OK', discs: 'OK' },
    scanner: { serviceReset: 'OK', dtcErrors: 'OK' },
    general: { steering: 'OK', suspension: 'OK' }
  });

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newFieldLabels, setNewFieldLabels] = useState({});
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Real-time camera & upload state
  const videoRef = React.useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [activeStream, setActiveStream] = useState(null);

  useEffect(() => {
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

  useEffect(() => {
    setData(prev => ({
      ...prev,
      ...initialData,
      dynamic: initialData.dynamic || prev.dynamic || {},
      photos: initialData.photos || prev.photos || []
    }));
  }, [initialData]);

  const handleInputChange = (section, field, value) => {
    setData(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData)) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return { ...prev, [section]: value };
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...data,
      id: data.id || `insp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: data.date || new Date().toISOString()
    };
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      {/* Parte do cliente */}
      <FormCard title="Dados do Cliente" icon="fa-user-tie">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Nome Completo *</label>
            <input 
              required
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-semibold text-slate-900 dark:text-white"
              placeholder="Ex: João da Silva"
              value={data.client.name}
              onChange={(e) => handleInputChange('client', 'name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">WhatsApp / Telefone *</label>
            <input 
              required
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-semibold text-slate-900 dark:text-white"
              placeholder="11 99999-9999"
              value={data.client.phone}
              onChange={(e) => handleInputChange('client', 'phone', e.target.value)}
            />
          </div>
        </div>
      </FormCard>

      {/* Parte do veículo */}
      <FormCard title="Dados do Veículo" icon="fa-car-side">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Marca / Modelo / Ano *</label>
            <input 
              required
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 font-semibold text-slate-900 dark:text-white"
              placeholder="Ex: BMW 320i M Sport 2023"
              value={data.vehicle.brandModel}
              onChange={(e) => handleInputChange('vehicle', 'brandModel', e.target.value)}
              onFocus={() => setShowVehicleList(true)}
            />
            
            {showVehicleList && savedVehicles.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center px-3 py-1 mb-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Modelos Usados</span>
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
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-500 transition-all hover:scale-110"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Placa / KM</label>
            <div className="flex gap-2">
              <input 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-mono font-bold uppercase text-slate-900 dark:text-white"
                placeholder="ABC-1234"
                value={data.vehicle.plate}
                onChange={(e) => handleInputChange('vehicle', 'plate', e.target.value)}
              />
              <input 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-bold text-slate-900 dark:text-white"
                placeholder="KM"
                value={data.vehicle.mileage}
                onChange={(e) => handleInputChange('vehicle', 'mileage', e.target.value)}
              />
            </div>
          </div>
        </div>
      </FormCard>

      {/* Mecânica */}
      <FormCard title="Mecânica" icon="fa-wrench">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'airFilter', label: 'Filtro de Ar', icon: 'fa-wind' },
            { id: 'leaks', label: 'Vazamentos de Motor/Câmbio', icon: 'fa-droplet-slash' }
          ].map(item => (
            <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <i className={`fas ${item.icon} text-[#1D63BD] text-xs`}></i>
                <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Atenção', 'Urgente'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('mechanical', item.id, status)}
                    className={`flex-1 py-2 text-[9px] font-bold rounded-lg border transition-all ${
                      data.mechanical?.[item.id] === status
                        ? 'bg-[#1D63BD] text-white border-[#1D63BD]'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'pads', label: 'Pastilhas e Lonas', icon: 'fa-hockey-puck' },
            { id: 'discs', label: 'Discos e Tambores', icon: 'fa-compact-disc' }
          ].map(item => (
            <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <i className={`fas ${item.icon} text-[#1D63BD] text-xs`}></i>
                <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Atenção', 'Urgente'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('brakes', item.id, status)}
                    className={`flex-1 py-2 text-[9px] font-bold rounded-lg border transition-all ${
                      data.brakes?.[item.id] === status
                        ? 'bg-[#1D63BD] text-white border-[#1D63BD]'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'serviceReset', label: 'Reset de Serviço', icon: 'fa-rotate-left' },
            { id: 'dtcErrors', label: 'Leitura de Erros (DTC)', icon: 'fa-triangle-exclamation' }
          ].map(item => (
            <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <i className={`fas ${item.icon} text-[#1D63BD] text-xs`}></i>
                <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['Realizado', 'Pendente', 'N/A'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('scanner', item.id, status)}
                    className={`flex-1 py-2 text-[9px] font-bold rounded-lg border transition-all ${
                      data.scanner?.[item.id] === status
                        ? 'bg-[#1D63BD] text-white border-[#1D63BD]'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
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
      <FormCard title="Suspensão e Direção" icon="fa-arrows-up-down-left-right">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'steering', label: 'Caixa de Direção/Folgas', icon: 'fa-steering-wheel' },
            { id: 'suspension', label: 'Amortecedores/Suspensão', icon: 'fa-wrench' }
          ].map(item => (
            <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <i className={`fas ${item.icon} text-[#1D63BD] text-xs`}></i>
                <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {['OK', 'Folga', 'Urgente'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('general', item.id, status)}
                    className={`flex-1 py-2 text-[9px] font-bold rounded-lg border transition-all ${
                      data.general?.[item.id] === status
                        ? 'bg-[#1D63BD] text-white border-[#1D63BD]'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
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

      {/* Parte dos pneus */}
      <FormCard title="Rodagem e Pneus" icon="fa-tire">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'grooves', label: 'Sulcos dos Pneus', icon: 'fa-gauge-simple-high' },
            { id: 'pressure', label: 'Pressão / Calibragem', icon: 'fa-compress' },
            { id: 'spare', label: 'Estado do Estepe', icon: 'fa-life-ring' }
          ].map(item => (
            <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <i className={`fas ${item.icon} text-[#1D63BD] text-xs`}></i>
                <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
              </div>
              <div className="flex flex-col gap-2">
                {[InspectionStatus.GOOD, InspectionStatus.ACCEPTABLE, InspectionStatus.REPLACE].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('tires', item.id, status)}
                    className={`py-2 text-[9px] font-bold rounded-lg border transition-all ${
                      data.tires[item.id] === status
                        ? 'bg-[#1D63BD] text-white border-[#1D63BD]'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status?.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Parte dos fluidos */}
      <FormCard title="Verificação de Fluidos" icon="fa-oil-can">
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'engineOil', label: 'Óleo do Motor', icon: 'fa-oil-can' },
            { id: 'brakeFluid', label: 'Fluido de Freio', icon: 'fa-circle-exclamation' },
            { id: 'coolant', label: 'Líquido de Arrefecimento', icon: 'fa-temperature-half' },
            { id: 'wiperFluid', label: 'Limpador de Para-brisa', icon: 'fa-droplet' },
            { id: 'transmissionFluid', label: 'Fluido de Transmissão', icon: 'fa-gears' }
          ].map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1D63BD]">
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[InspectionStatus.OK, InspectionStatus.LOW, InspectionStatus.CHANGE_REQUIRED].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('fluids', item.id, status)}
                    className={`px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
                      data.fluids[item.id] === status
                        ? 'bg-[#1D63BD] text-white border-[#1D63BD] shadow-md shadow-blue-100 dark:shadow-none scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
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

      {/* Parte de segurança */}
      <FormCard title="Segurança e Iluminação" icon="fa-shield-halved">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'headlights', label: 'Faróis Principais', icon: 'fa-lightbulb' },
            { id: 'tailLights', label: 'Lanternas Traseiras', icon: 'fa-lightbulb' },
            { id: 'turnSignals', label: 'Setas / Piscas', icon: 'fa-arrows-left-right' },
            { id: 'wipers', label: 'Limpadores / Palhetas', icon: 'fa-windshield' }
          ].map(item => (
            <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <i className={`fas ${item.icon} text-[#1D63BD] text-xs`}></i>
                <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
              </div>
              <div className="flex gap-2">
                {[InspectionStatus.OK, InspectionStatus.MINOR_DEFECT, InspectionStatus.MAJOR_DEFECT].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleInputChange('safety', item.id, status)}
                    className={`flex-1 py-2 text-[9px] font-bold rounded-lg border transition-all ${
                      data.safety[item.id] === status
                        ? 'bg-[#1D63BD] text-white border-[#1D63BD]'
                        : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    {status.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            data.safety.horn ? 'border-[#1D63BD] bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
          }`}>
            <div className="flex items-center space-x-3">
              <i className={`fas fa-bullhorn ${data.safety.horn ? 'text-[#1D63BD]' : 'text-slate-300 dark:text-slate-700'}`}></i>
              <span className={`text-sm font-bold ${data.safety.horn ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>Buzina OK</span>
            </div>
            <input 
              type="checkbox"
              className="w-5 h-5 accent-[#1D63BD]"
              checked={data.safety.horn}
              onChange={(e) => handleInputChange('safety', 'horn', e.target.checked)}
            />
          </label>
        </div>
      </FormCard>

      {/* Parte elétrica */}
      <FormCard title="Sistema Elétrico" icon="fa-bolt">
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
            <RatingSelector 
              label="Saúde da Bateria (Voltagem/Amperagem)" 
              value={data.electrical.batteryHealth} 
              onChange={(val) => handleInputChange('electrical', 'batteryHealth', val)} 
              labels={['Crítica', '2', '3', '4', '100% OK']}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {[
               { id: 'alternator', label: 'Carga do Alternador', icon: 'fa-charging-station' },
               { id: 'belts', label: 'Estado das Correias', icon: 'fa-life-ring' }
             ].map(item => (
               <div key={item.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col space-y-3">
                 <div className="flex items-center space-x-2">
                   <i className={`fas ${item.icon} text-[#1D63BD] text-xs`}></i>
                   <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
                 </div>
                 <div className="flex gap-2">
                   {[InspectionStatus.OK, InspectionStatus.MINOR_DEFECT, InspectionStatus.MAJOR_DEFECT].map(status => (
                     <button
                       key={status}
                       type="button"
                       onClick={() => handleInputChange('electrical', item.id, status)}
                       className={`flex-1 py-2 text-[9px] font-bold rounded-lg border transition-all ${
                         data.electrical[item.id] === status
                           ? 'bg-[#1D63BD] text-white border-[#1D63BD]'
                           : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800'
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

      {/* Parte do checkout */}
      <FormCard title="Checkout Final" icon="fa-clipboard-check">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'testDrive', label: 'Test Drive Realizado', icon: 'fa-gauge-high' },
            { id: 'wheelTorque', label: 'Torque de Rodas OK', icon: 'fa-wrench' },
            { id: 'cleaning', label: 'Limpeza Externa/Interna', icon: 'fa-sparkles' },
            { id: 'personalObjects', label: 'Sem Objetos Esquecidos', icon: 'fa-suitcase' }
          ].map(item => (
            <label key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              data.checkout[item.id] 
                ? 'border-[#1D63BD] bg-blue-50/50 dark:bg-blue-900/10' 
                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
            }`}>
              <div className="flex items-center space-x-3">
                <i className={`fas ${item.icon} ${data.checkout[item.id] ? 'text-[#1D63BD]' : 'text-slate-300 dark:text-slate-700'}`}></i>
                <span className={`text-sm font-bold ${data.checkout[item.id] ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>{item.label}</span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-[#1D63BD]"
                checked={data.checkout[item.id]}
                onChange={(e) => handleInputChange('checkout', item.id, e.target.checked)}
              />
            </label>
          ))}
        </div>
      </FormCard>

      {/* Parte de Seções Personalizadas */}
      <div className="space-y-8">
        {isEditMode && (
          <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] border-2 border-dashed border-[#1D63BD]/20">
            <label className="block text-xs font-black text-[#1D63BD] uppercase tracking-[0.2em] mb-4 text-center">Criar Nova Seção de Checklist</label>
            <div className="flex gap-3">
              <input 
                className="flex-1 px-6 py-4 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-bold text-slate-800 dark:text-white shadow-sm"
                placeholder="Ex: Estado da Pintura, Tapeçaria..."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSection())}
              />
              <button 
                type="button" 
                onClick={handleAddSection}
                className="px-8 bg-[#1D63BD] text-white font-black rounded-2xl hover:bg-[#154A8D] transition-all flex items-center space-x-2 shadow-lg shadow-blue-100 dark:shadow-none"
              >
                <i className="fas fa-plus"></i>
                <span>CRIAR SEÇÃO</span>
              </button>
            </div>
          </div>
        )}

        {customSections.map(section => (
          <FormCard 
            key={section.id} 
            title={section.title} 
            icon="fa-list-check"
            onRemove={isEditMode ? () => { if(window.confirm(`Deseja excluir a seção "${section.title}"?`)) onRemoveSection(section.id) } : null}
          >
            <div className="space-y-6">
              {isEditMode && (
                <div className="flex gap-2">
                  <input 
                    className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white"
                    placeholder="Novo item para esta seção..."
                    value={newFieldLabels[section.id] || ''}
                    onChange={(e) => setNewFieldLabels(prev => ({ ...prev, [section.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFieldLocal(section.id))}
                  />
                  <button 
                    type="button" 
                    onClick={() => handleAddFieldLocal(section.id)}
                    className="px-6 bg-[#1D63BD] text-white font-bold rounded-2xl hover:bg-[#154A8D] transition-all"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {section.fields.map(field => (
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-2">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      {isEditMode && (
                        <button 
                          type="button"
                          onClick={() => onRemoveFieldFromSection(section.id, field.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      )}
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{field.label}</span>
                    </div>
                    <div className="flex gap-2">
                      {['OK', 'Atenção', 'Urgente'].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleDynamicChange(field.label, status)}
                          className={`px-4 py-2 text-[10px] font-bold rounded-xl border-2 transition-all ${
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

      {/* Parte do valor e notas */}
      <FormCard title="Resumo do Serviço" icon="fa-file-lines">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Peças Utilizadas</label>
            <textarea 
              rows={3}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              placeholder="Ex: Óleo 5W30, Filtro, Velas..."
              value={data.partsUsed}
              onChange={(e) => handleInputChange('partsUsed', '', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Notas Adicionais para o Cliente</label>
            <textarea 
              rows={3}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-[#1D63BD] outline-none font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              placeholder="Ex: Próxima troca em 10.000km..."
              value={data.observations}
              onChange={(e) => handleInputChange('observations', '', e.target.value)}
            />
          </div>

          {/* Fotos da Inspeção */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 col-span-2">Fotos da Inspeção (Opcional)</label>
            
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Valor Total da Inspeção / Serviço *</label>
            <div className="relative">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-600">R$</span>
               <input 
                required
                type="text"
                className="w-full pl-12 pr-5 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-transparent focus:border-[#1D63BD] rounded-2xl outline-none font-black text-2xl text-[#1D63BD] placeholder:text-blue-200 dark:placeholder:text-blue-900/30 transition-all"
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
        </div>
      </FormCard>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button 
          type="submit"
          className="flex-[2] py-5 bg-[#1D63BD] hover:bg-[#154A8D] text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-3"
        >
          <i className="fas fa-check-double"></i>
          <span className="text-lg">Gerar Certificado de Inspeção</span>
        </button>
      </div>
    </form>
  );
};

export default InspectionForm;
