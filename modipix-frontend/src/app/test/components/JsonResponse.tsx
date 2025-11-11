import React from 'react';
import { ModerationData } from '../types';

interface JsonResponseProps {
  data: ModerationData;
}

const JsonResponse: React.FC<JsonResponseProps> = ({ data }) => {
  return (
    <div>
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <h3 className="text-xl font-bold text-foreground">JSON Response</h3>
          <span className="material-symbols-outlined text-muted-foreground transition-transform duration-300 group-open:rotate-180">
            expand_more
          </span>
        </summary>
        <div className="mt-4">
          <pre className="w-full p-4 text-sm text-foreground bg-muted rounded-lg overflow-x-auto">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      </details>
    </div>
  );
};

export default JsonResponse;
