export interface Platform {
  name: string;
  logo: string;
  emoji: string;
  status: 'Safe' | 'Risk' | 'Unsafe';
  statusColor: string;
  score: string;
  description: string;
}

export interface RiskCategory {
  label: string;
  height: string;
}

export interface ImprovementTip {
  icon: string;
  title: string;
  description: string;
}

export interface ModerationData {
  imageId: string;
  timestamp: string;
  riskScore: number;
  riskLevel: string;
  categories: {
    hate: number;
    violence: number;
    nudity: number;
    spam: number;
  };
}

