'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ImageSection from './components/ImageSection';
import RiskAssessment from './components/RiskAssessment';
import PlatformModeration from './components/PlatformModeration';
import ImprovementTips from './components/ImprovementTips';
import JsonResponse from './components/JsonResponse';
import { platforms, riskCategories, improvementTips, moderationData } from './data';

const ImageDetailsModal: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get('id') ?? 'unknown';
  const imageUrl = searchParams.get('image') ?? "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0BRebbwiSKBzi38CQMrvcMRB0EecmRAaG3SHCwnE_juYsGjbsLoksgbDoQBVrQLJUqSv4UlBMzfALrCiRDhBysM3a6HvRUIjGjL8oWVEN4b00hlv02R_vuoom34jTevMMb2z574TmeL_bCgfwSeOMXBOmOARnr_-j1sfhg99fIVeZ9kV24jlJB_jcOHUb9cCWzRr1nBAHeTdB74iQ1mSP_fjSGNambPe24vQmBoC_HDtnnf1vN0AcIp7tGecHL3pX8lgDcyuh3I";
  const uploadedDate = searchParams.get('timestamp') ?? "—";
  const title = searchParams.get('title') ?? `Image ${id}`;
  const verdict = searchParams.get('verdict') ?? searchParams.get('decision') ?? undefined;
  const riskScorePct = searchParams.get('riskScore');

  // Example flexible mapping to RiskAssessment props
  const riskScore = riskScorePct ? Math.max(0, Math.min(1, parseInt(riskScorePct.replace('%', ''), 10) / 100)) : 0.5;
  const riskLevel = riskScore >= 0.75 ? "High" : riskScore >= 0.4 ? "Medium" : "Low";
  const riskChange = "+0%";
  const riskChangeType: "increase" | "decrease" | "neutral" = "neutral";

  const handleClose = () => {
    setIsOpen(false);
    // Return to previous page
    router.back();
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share clicked', { id });
  };

  const handleDelete = () => {
    // Implement delete functionality
    console.log('Delete clicked', { id });
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        :root {
          --primary-color: #1773cf;
        }
        .chart-bar {
          background-color: #e7edf3;
          transition: background-color 0.3s ease;
        }
        .chart-bar:hover {
          background-color: var(--primary-color);
        }
      `}</style>

      <div 
        className="relative flex size-full min-h-screen flex-col bg-background group/design-root overflow-x-hidden" 
        style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
      >
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-background border border-border rounded-2xl shadow-xl">
            <header className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Image Details</h2>
              <button 
                className="p-2 rounded-full hover:bg-accent"
                onClick={handleClose}
              >
                <span className="material-symbols-outlined text-muted-foreground">close</span>
              </button>
            </header>
            
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <ImageSection
                  imageUrl={imageUrl}
                  uploadedDate={uploadedDate}
                  imageId={String(id)}
                  title={title}
                  verdict={verdict}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />

                <RiskAssessment
                  riskLevel={riskLevel}
                  riskScore={riskScore}
                  riskChange={riskChange}
                  riskChangeType={riskChangeType}
                  categories={riskCategories}
                />

                <PlatformModeration platforms={platforms} />

                <ImprovementTips tips={improvementTips} />

                <JsonResponse data={moderationData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageDetailsModal;
