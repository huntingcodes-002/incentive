import { LucideIcon, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string; // Legacy support
  onAction?: () => void; // Legacy support
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel, // Legacy support
  onAction, // Legacy support
}: EmptyStateProps) {
  const DisplayIcon = Icon || FileText;
  const displayAction = action || (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <DisplayIcon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-gray-900 mb-2 text-center">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {displayAction && (
        <button
          onClick={displayAction.onClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {displayAction.label}
        </button>
      )}
    </div>
  );
}
