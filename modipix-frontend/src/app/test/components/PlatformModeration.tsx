import React from 'react';
import Image from 'next/image';
import { Platform } from '../types';

interface PlatformModerationProps {
  platforms: Platform[];
}

const PlatformModeration: React.FC<PlatformModerationProps> = ({ platforms }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-foreground mb-4">Platform-Specific Moderation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, index) => (
          <div key={index} className="p-4 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-3">
              {/* <Image 
                alt={`${platform.name} Logo`} 
                className="w-8 h-8 rounded-full" 
                src={platform.logo}
                width={32}
                height={32}
              /> */}
              <h4 className="font-bold text-foreground">{platform.name}</h4>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-2xl">{platform.emoji}</p>
              <p className={`font-semibold ${platform.statusColor}`}>{platform.status}</p>
              <p className="text-sm text-muted-foreground ml-auto">Score: {platform.score}</p>
            </div>
            <p className="text-sm text-muted-foreground">{platform.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformModeration;
