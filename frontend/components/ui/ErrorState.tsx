import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the backend API.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-rose-200 bg-rose-50/40">
      <div className="p-3 mb-3 bg-white rounded-full text-rose-600 shadow-xs border border-rose-200">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-rose-950 tracking-tight">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-rose-700/80 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-4 border-rose-300 text-rose-900 hover:bg-rose-100"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
