import React from 'react';
import { ImprovementTip } from '../types';

interface ImprovementTipsProps {
  tips: ImprovementTip[];
}

const ImprovementTips: React.FC<ImprovementTipsProps> = ({ tips }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">Improvement Tips</h3>
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition">
            <span className="material-symbols-outlined text-blue-500 mt-1">{tip.icon}</span>
            <div>
              <p className="font-semibold text-foreground">{tip.title}</p>
              <p className="text-muted-foreground text-sm">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImprovementTips;
