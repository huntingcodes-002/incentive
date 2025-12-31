import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, description, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200'
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    info: 'text-blue-900',
    warning: 'text-amber-900'
  };

  return (
    <div className={`${backgrounds[type]} border rounded-lg p-4 shadow-lg min-w-[320px] max-w-md`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className={`${textColors[type]} font-medium`}>{message}</p>
          {description && (
            <p className={`${textColors[type]} text-sm mt-1 opacity-90`}>{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  duration?: number;
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastData[], onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          description={toast.description}
          onClose={() => onRemove(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
