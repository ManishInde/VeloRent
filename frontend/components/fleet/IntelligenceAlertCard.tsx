import React from 'react';
import { FleetInsight } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface IntelligenceAlertCardProps {
  insight: FleetInsight;
}

export const IntelligenceAlertCard: React.FC<IntelligenceAlertCardProps> = ({ insight }) => {
  const getSeverityIcon = () => {
    switch (insight.severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const getSeverityBadge = () => {
    switch (insight.severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <Badge variant="rose">{insight.severity}</Badge>;
      case 'MEDIUM':
        return <Badge variant="amber">{insight.severity}</Badge>;
      case 'LOW':
        return <Badge variant="blue">{insight.severity}</Badge>;
      default:
        return <Badge variant="slate">{insight.severity}</Badge>;
    }
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between gap-3 transition-all hover:border-slate-300">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getSeverityIcon()}
            <span className="font-bold text-xs text-slate-900 tracking-tight">{insight.metricName}</span>
          </div>
          {getSeverityBadge()}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{insight.explanation}</p>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-400 font-medium">Recommended Action:</span>
        <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 flex items-center gap-1.5">
          <span>{insight.suggestedAction}</span>
          <ArrowRight className="w-3 h-3 text-blue-600" />
        </span>
      </div>
    </div>
  );
};
