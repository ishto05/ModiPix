
"use client";

import React from "react";
import { ModerationItem, calculateSafetyScore, SAFE_CLASSES, UNSAFE_CLASSES } from "@/lib/moderation";

interface ModerationHelperProps {
  result: ModerationItem[];
}

const ModerationHelper: React.FC<ModerationHelperProps> = ({ result }) => {
  if (!result || result.length === 0) {
    return (
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
        No moderation details available.
      </div>
    );
  }

  const safetyScore = calculateSafetyScore(result);
  const safeDetections = result.filter(item => SAFE_CLASSES.includes(item.class));
  const unsafeDetections = result.filter(item => UNSAFE_CLASSES.includes(item.class));

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-900 shadow-sm">
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Overall Safety Score
          </h4>
          <div className="flex items-center gap-2">
            <div className={`text-lg font-bold ${
              safetyScore >= 80 
                ? 'text-green-600 dark:text-green-400' 
                : safetyScore >= 60 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {safetyScore}%
            </div>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  safetyScore >= 80 
                    ? 'bg-green-500' 
                    : safetyScore >= 60 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${safetyScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Detection Details
      </h3>
      
      <div className="space-y-3">
        {safeDetections.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
              Safe Content ({safeDetections.length})
            </h4>
            <ul className="space-y-1">
              {safeDetections.map((item, index) => (
                <li
                  key={`safe-${index}`}
                  className="p-2 border rounded flex justify-between items-center bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.class.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {(item.score * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {unsafeDetections.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
              Flagged Content ({unsafeDetections.length})
            </h4>
            <ul className="space-y-1">
              {unsafeDetections.map((item, index) => (
                <li
                  key={`unsafe-${index}`}
                  className="p-2 border rounded flex justify-between items-center bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.class.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {(item.score * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationHelper;