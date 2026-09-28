import React from 'react';

interface HealthScoreBadgeProps {
  score: number;
  category?: string;
  showCategory?: boolean;
}

export const HealthScoreBadge: React.FC<HealthScoreBadgeProps> = ({
  score,
  category,
  showCategory = true,
}) => {
  const getBadgeStyle = () => {
    if (score >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (score >= 30) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const displayCategory = category || (
    score >= 85 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : score >= 30 ? 'POOR' : 'CRITICAL'
  );

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getBadgeStyle()}`}>
        {score}/100
      </span>
      {showCategory && (
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
          {displayCategory}
        </span>
      )}
    </div>
  );
};
