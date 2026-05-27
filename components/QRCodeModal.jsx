
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeModal = ({ url, onClose }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 250,
        margin: 2,
        color: {
          dark: '#1D63BD',
          light: '#FFFFFF',
        },
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [url]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300 text-center">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Acesso Rápido</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-3xl inline-block mb-6 border border-slate-100">
          <canvas ref={canvasRef} className="mx-auto rounded-xl"></canvas>
        </div>

        <p className="text-slate-500 text-sm font-medium mb-8">
          Escaneie para abrir o <span className="text-[#1D63BD] font-bold">AutoCheck</span> em outro dispositivo.
        </p>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-[#1D63BD] text-white font-bold rounded-2xl hover:bg-[#154A8D] transition-all"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
