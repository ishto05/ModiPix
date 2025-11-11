import React from 'react';
import { RiskCategory } from '../types';

interface RiskAssessmentProps {
  riskLevel: string;
  riskScore: number;
  riskChange: string;
  riskChangeType: 'increase' | 'decrease';
  categories: RiskCategory[];
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  riskLevel,
  riskScore,
  riskChange,
  riskChangeType,
  categories
}) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">Risk Assessment</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Risk Card */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-base font-medium">Overall Risk</p>
              <p className="text-destructive text-3xl font-bold tracking-tight">{riskLevel}</p>
            </div>
            <div className={`flex items-center gap-1 ${riskChangeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              <span className="material-symbols-outlined text-lg">
                {riskChangeType === 'increase' ? 'arrow_upward' : 'arrow_downward'}
              </span>
              <p className="text-base font-medium">{riskChange}</p>
            </div>
          </div>
          <div className="h-48 flex items-end gap-4 px-2">
            {categories.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 w-full h-full">
                <div className="w-full h-full flex items-end">
                  <div 
                    className="chart-bar w-full rounded-t-md" 
                    style={{ height: item.height }}
                  />
                </div>
                <p className="text-muted-foreground text-xs font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Score Card */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-base font-medium">Risk Score</p>
              <p className="text-foreground text-3xl font-bold tracking-tight">{riskScore}</p>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <span className="material-symbols-outlined text-lg">arrow_downward</span>
              <p className="text-base font-medium">-5%</p>
            </div>
          </div>
          <div className="w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="#e7edf3" 
                strokeWidth="4"
              />
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" 
                fill="none" 
                stroke="#f87171" 
                strokeDasharray="85, 100" 
                strokeLinecap="round" 
                strokeWidth="4"
              />
              <text 
                className="text-xs font-bold fill-foreground" 
                textAnchor="middle" 
                x="18" 
                y="22"
              >
                85%
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
