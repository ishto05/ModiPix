// modipix-frontend/src/components/moderation-helper.tsx - Fixed Version

import React from 'react';
import { 
  ModerationItem, 
  SAFE_CLASSES, 
  ALL_UNSAFE_CLASSES as UNSAFE_CLASSES,
  calculateComprehensiveSafetyScore,
  getSafetyLevel
} from '@/lib/moderation';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Shield, Eye } from 'lucide-react';

interface ModerationHelperProps {
  result: ModerationItem[];
}

const ModerationHelper: React.FC<ModerationHelperProps> = ({ result }) => {
  if (!result || result.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No detections found in this image.
      </div>
    );
  }

  // Use the enhanced comprehensive scoring
  const safetyScores = calculateComprehensiveSafetyScore(result);
  const overallSafety = getSafetyLevel(safetyScores.overall);
  
  const safeDetections = result.filter(item => SAFE_CLASSES.includes(item.class));
  const unsafeDetections = result.filter(item => UNSAFE_CLASSES.includes(item.class));

  const getDetectionIcon = (className: string) => {
    if (SAFE_CLASSES.includes(className)) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
    
    // Category-specific icons for unsafe content
    const nudityClasses = ["SEXUAL_ACTIVITY", "SEXUAL_DISPLAY", "FEMALE_BREAST_EXPOSED", "MALE_GENITALIA_EXPOSED"];
    const violenceClasses = ["WEAPON", "GORE", "VIOLENCE"];
    
    if (nudityClasses.some(cls => className.includes(cls.split('_')[0]))) {
      return <Eye className="h-3 w-3 text-red-500" />;
    }
    
    if (violenceClasses.some(cls => className.includes(cls))) {
      return <Shield className="h-3 w-3 text-red-500" />;
    }
    
    return <AlertCircle className="h-3 w-3 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-red-600 bg-red-50 dark:bg-red-900/20";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    if (score >= 0.4) return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
    return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
  };

  const formatClassName = (className: string) => {
    return className
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Detection Summary</h3>
          <Badge variant={overallSafety.level === 'safe' ? 'default' : 'destructive'}>
            {overallSafety.level.toUpperCase()}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Detections:</span>
            <span className="ml-1 font-medium">{result.length}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Overall Score:</span>
            <span className={`ml-1 font-medium ${overallSafety.color}`}>
              {safetyScores.overall}%
            </span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {(safetyScores.nudity < 100 || safetyScores.violence < 100 || safetyScores.offensive < 100) && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Category Scores</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { label: 'Nudity', score: safetyScores.nudity, icon: Eye },
              { label: 'Violence', score: safetyScores.violence, icon: Shield },
              { label: 'Offensive', score: safetyScores.offensive, icon: AlertCircle }
            ].map(({ label, score, icon: Icon }) => (
              <div key={label} className="p-2 rounded border bg-white dark:bg-gray-800">
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="h-3 w-3 text-gray-500" />
                  <span className="font-medium">{label}</span>
                </div>
                <div className={`text-xs font-semibold ${getSafetyLevel(score).color}`}>
                  {score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Detections */}
      {safeDetections.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Safe Content ({safeDetections.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {safeDetections.map((detection, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded border bg-green-50 dark:bg-green-900/20"
              >
                <div className="flex items-center gap-2">
                  {getDetectionIcon(detection.class)}
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {formatClassName(detection.class)}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs text-green-600">
                  {(detection.score * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unsafe Detections */}
      {unsafeDetections.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Flagged Content ({unsafeDetections.length})
          </h4>
          <div className="space-y-2">
            {unsafeDetections.map((detection, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded border ${getScoreColor(detection.score)}`}
              >
                <div className="flex items-center gap-2">
                  {getDetectionIcon(detection.class)}
                  <div>
                    <span className="text-sm font-medium">
                      {formatClassName(detection.class)}
                    </span>
                    {detection.provider && (
                      <div className="text-xs text-gray-500">
                        via {detection.provider}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={detection.score >= 0.8 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {(detection.score * 100).toFixed(1)}%
                  </Badge>
                  {detection.box && detection.box.some(coord => coord > 0) && (
                    <div className="text-xs text-gray-500 mt-1">
                      Box: [{detection.box.map(coord => coord.toFixed(0)).join(', ')}]
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data (for debugging) */}
      <details className="text-xs">
        <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          Show Raw Detection Data
        </summary>
        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default ModerationHelper;