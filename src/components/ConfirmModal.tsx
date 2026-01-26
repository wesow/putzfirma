import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2, Info, AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({ 
  isOpen, title, message, onConfirm, onCancel, 
  confirmText = "Bestätigen", cancelText = "Abbrechen", variant = 'danger' 
}: ConfirmModalProps) {
  
  // Mapping für Farben und Icons je nach Typ
  const config = {
    danger: {
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200 text-white',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      icon: <Trash2 size={32} />
    },
    warning: {
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 text-white',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      icon: <AlertTriangle size={32} />
    },
    info: {
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      icon: <Info size={32} />
    }
  };

  const current = config[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP mit Blur-Effekt */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9998]"
          />
          
          {/* MODAL WRAPPER */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={onCancel} 
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Dynamisches Icon Badge */}
                <div className={`w-20 h-20 rounded-[1.5rem] mb-8 flex items-center justify-center shadow-inner border border-white ${current.iconBg} ${current.iconColor}`}>
                  {current.icon}
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter uppercase">
                  {title}
                </h3>
                
                <p className="text-slate-500 font-medium leading-relaxed mb-10 px-2">
                  {message}
                </p>
                
                {/* Button Group */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button 
                    onClick={onCancel}
                    className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
                  >
                    {cancelText}
                  </button>
                  <button 
                    onClick={() => { onConfirm(); onCancel(); }}
                    className={`flex-1 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${current.btn}`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>

              {/* Deko-Element im Hintergrund */}
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-slate-50 rounded-full -z-10 opacity-50"></div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}