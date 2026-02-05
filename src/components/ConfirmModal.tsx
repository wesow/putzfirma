import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';
import React from 'react'; // Wichtig für React.ReactNode

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  // Geändert: Akzeptiert jetzt String ODER JSX-Elemente
  message: string | React.ReactNode; 
  // Geändert: Optional gemacht, damit das Modal auch nur Infos zeigen kann
  onConfirm?: () => void | Promise<void>; 
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmModal({ 
  isOpen, title, message, onConfirm, onCancel, 
  confirmText = "Bestätigen", cancelText = "Abbrechen", variant = 'danger' 
}: ConfirmModalProps) {
  
  const config = {
    danger: {
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200 text-white',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      icon: <Trash2 size={24} />
    },
    warning: {
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 text-white',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      icon: <AlertTriangle size={24} />
    },
    info: {
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      icon: <Info size={24} />
    },
    success: {
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 text-white',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      icon: <CheckCircle2 size={24} />
    }
  };

  const current = config[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 max-w-[380px] w-full shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center shadow-sm ${current.iconBg} ${current.iconColor}`}>
                  {current.icon}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                  {title}
                </h3>
                
                {/* Geändert: div statt p, damit verschachtelte Elemente (Liste) erlaubt sind */}
                <div className="text-[13px] text-slate-500 font-medium leading-relaxed mb-6">
                  {message}
                </div>
                
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                  >
                    {cancelText}
                  </button>

                  {/* Bedingtes Rendering: Nur zeigen, wenn confirmText nicht leer ist */}
                  {confirmText && onConfirm && (
                    <button 
                      onClick={() => { onConfirm(); onCancel(); }}
                      className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-lg transition-all active:scale-95 ${current.btn}`}
                    >
                      {confirmText}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}