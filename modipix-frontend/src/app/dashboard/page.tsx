'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, X, ImageIcon, Loader2, CheckCircle, XCircle, Clock, Search, Zap, ListChecks } from 'lucide-react';
import NextImage from 'next/image';
import { useAuth } from '@clerk/nextjs';

// Types
type ImageStatus = 'pending' | 'processing' | 'approved' | 'rejected';

interface ImageData {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  status: ImageStatus;
  created_at: string;
  user_id: string;
}

interface ModerationCategory {
  name?: string;
  class?: string;
  level?: string;
  score?: number;
}

interface ModerationLog {
  id: string;
  image_id: string;
  user_id: string;
  verdict: ImageStatus;
  result: {
    categories?: ModerationCategory[];
    [key: string]: any;
  };
  created_at: string;
}

interface ImageWithLogs extends ImageData {
  moderation_logs?: ModerationLog[];
}

// API functions with Clerk authentication
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const createApiClient = (getToken: () => Promise<string | null>) => ({
  // uploadImage function logic remains commented out for logic preservation
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = await getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/v1/moderation/uploads`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }
    return response.json();
  },

  // fetchImages function logic remains commented out for logic preservation
  fetchImages: async ({ pageParam = 0, status }: { pageParam?: number; status: string }) => {
    const url = new URL(`${API_BASE}/api/v2/image/allImages`);
    if (status && status !== 'all') url.searchParams.set('status', status);
    url.searchParams.set('limit', '20');
    url.searchParams.set('offset', pageParam.toString());

    const token = await getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) throw new Error('Failed to fetch images');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  // fetchImageStatus function logic remains commented out for logic preservation
  fetchImageStatus: async (imageId: string) => {
    const token = await getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/v2/image/image/${imageId}/status`, { headers });

    if (!response.ok) throw new Error('Failed to fetch status');
    return response.json();
  },

  // fetchImageDetails function logic remains commented out for logic preservation
  fetchImageDetails: async (imageId: string) => {
    const token = await getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/v2/image/userImage/${imageId}`, { headers });

    if (!response.ok) throw new Error('Failed to fetch details');
    return response.json();
  },
});

// Helper function to get color based on score (for better consistency)
const getScoreColor = (score: number) => {
  if (score >= 7) return 'red';
  if (score >= 5) return 'orange';
  if (score >= 3) return 'yellow';
  return 'green';
};

// Status Badge Component
const StatusBadge = ({ status }: { status: ImageStatus }) => {
  const variants = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: Clock },
    processing: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Loader2 },
    approved: { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
  };

  const variant = variants[status] || variants.pending;
  const Icon = variant.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variant.bg} ${variant.text} backdrop-blur-sm`}>
      <Icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

// Image Card Component (Enhanced for gallery style)
const ImageCard = ({ image, onClick, api }: {
  image: ImageData;
  onClick: (image: ImageData) => void;
  api: ReturnType<typeof createApiClient>;
}) => {
  const queryClient = useQueryClient();

  // Poll for status updates if pending/processing
  useQuery({
    queryKey: ['imageStatus', image.id],
    queryFn: () => api.fetchImageStatus(image.id),
    enabled: image.status === 'pending' || image.status === 'processing',
    refetchInterval: 3000,
    // Add logic to refresh the main query on status change (optional, but good for real-time)
    onSuccess: (data: ImageData) => {
      if (data.status !== 'pending' && data.status !== 'processing' && data.status !== image.status) {
         queryClient.invalidateQueries({ queryKey: ['images'] });
      }
    }
  });

  // Note: The useEffect polling logic from the original code is redundant with the react-query polling
  // and has been removed for simplicity and modern practice. The minimal polling is kept in useQuery above.

  return (
    <div
      onClick={() => onClick(image)}
      className="group relative aspect-square rounded-xl overflow-hidden shadow-xl bg-gray-900/50 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/50"
    >
      <NextImage
        src={image.file_url}
        alt={image.file_name}
        fill
        className="object-cover transition-opacity duration-300 group-hover:opacity-80"
        unoptimized
      />

      {/* Overlay for details and hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className="text-sm font-semibold truncate mb-1">{image.file_name}</p>
          <p className="text-xs opacity-75">{new Date(image.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <StatusBadge status={image.status} />
      </div>

      {/* View Details Icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Search className="w-8 h-8 text-white p-1 rounded-full bg-black/50" />
      </div>
    </div>
  );
};

// Moderation Drawer Component (with visual improvements)
const ModerationDrawer = ({ image, isOpen, onClose, api }: {
  image: ImageData | null;
  isOpen: boolean;
  onClose: () => void;
  api: ReturnType<typeof createApiClient>;
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');

  const { data: imageDetails, isLoading } = useQuery<ImageWithLogs>({
    queryKey: ['imageDetails', image?.id],
    queryFn: () => api.fetchImageDetails(image!.id),
    enabled: !!image && isOpen,
  });

  // Reset tab on image change
  useEffect(() => {
    setActiveTab('summary');
  }, [image]);


  if (!isOpen || !image) return null;

  const logs = imageDetails?.moderation_logs || [];
  const latestLog = logs[0];

  // Helper function to calculate a danger score (0-10) and level from API response fragments
  const getSafetyScore = (data: any) => {
    if (!data) return { score: 0, level: 'SAFE', color: 'green', confidence: 0 };

    let confidence = 0;

    // Handle different SightEngine response formats
    if (typeof data === 'number') {
      confidence = data;
    } else if (data.prob !== undefined) {
      confidence = data.prob;
    } else if (data.none !== undefined) {
      confidence = 1 - (data.none || 0);
    } else if (data.suggestive !== undefined || data.sexual !== undefined) {
      confidence = Math.max(
        data.suggestive || 0,
        data.sexual || 0,
        data.very_suggestive || 0,
        data.partial_nudity || 0,
        data.safe || 0, // Fallback, though usually 'safe' means low confidence in danger
        data.face_mask || 0, // Non-safety related check, should not affect danger score normally
      );
    }
    // Convert to danger score (0-10, where 10 is most dangerous)
    const dangerScore = Math.round(confidence * 10);

    let level = 'SAFE';
    let color = 'green';

    if (dangerScore >= 7) {
      level = 'CRITICAL';
      color = 'red';
    } else if (dangerScore >= 5) {
      level = 'HIGH';
      color = 'orange';
    } else if (dangerScore >= 3) {
      level = 'MEDIUM';
      color = 'yellow';
    }

    return { score: dangerScore, level, color, confidence };
  };

  const categories = [
    { key: 'nudity', label: 'Nudity/Sexual Content', data: latestLog?.result?.nudity },
    { key: 'weapon', label: 'Weapons', data: latestLog?.result?.weapon },
    { key: 'alcohol', label: 'Alcohol', data: latestLog?.result?.alcohol },
    { key: 'drugs', label: 'Drugs', data: latestLog?.result?.drugs || latestLog?.result?.recreational_drug },
    { key: 'violence', label: 'Violence/Injury', data: latestLog?.result?.violence },
    { key: 'gore', label: 'Gore/Mutilation', data: latestLog?.result?.gore },
    { key: 'offensive', label: 'Offensive Content', data: latestLog?.result?.offensive },
    { key: 'gambling', label: 'Gambling', data: latestLog?.result?.gambling },
    { key: 'medical', label: 'Medical/Needles', data: latestLog?.result?.medical },
    { key: 'self_harm', label: 'Self Harm', data: latestLog?.result?.['self-harm'] || latestLog?.result?.self_harm },
    { key: 'tobacco', label: 'Tobacco', data: latestLog?.result?.tobacco },
    { key: 'text', label: 'Text/Language', data: latestLog?.result?.text },
    { key: 'qr', label: 'QR Code/Barcode', data: latestLog?.result?.['qr-content'] || latestLog?.result?.qr },
    { key: 'genai', label: 'AI Generated', data: latestLog?.result?.genai },
    { key: 'money', label: 'Money/Counterfeit', data: latestLog?.result?.money },
  ];

  const categoriesWithScores = categories
    .map(cat => ({
      ...cat,
      ...getSafetyScore(cat.data)
    }))
    .filter(cat => cat.data && cat.score > 0) // Only show categories with a positive danger score

  const overallDanger = categoriesWithScores.length > 0
    ? Math.max(...categoriesWithScores.map(c => c.score))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ backdropFilter: 'blur(5px)' }}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 transition-opacity duration-300" onClick={onClose} />

      {/* Drawer Content */}
      <div className="relative ml-auto w-full max-w-xl bg-[#1a1a1a] shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" /> Moderation Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Image Preview and Info */}
              <div className="mb-6 bg-gray-900 p-4 rounded-xl border border-white/10 shadow-lg">
                <div className="relative w-full h-64 mb-4">
                  <NextImage
                    src={image.file_url}
                    alt={image.file_name}
                    fill
                    className="object-contain rounded-lg"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg text-white">{image.file_name}</p>
                    <p className="text-sm text-gray-400">
                      {(image.file_size / 1024).toFixed(2)} KB • {new Date(image.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={image.status} />
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/10 mb-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`pb-3 px-1 text-base font-medium border-b-2 transition-colors ${
                      activeTab === 'summary'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`pb-3 px-1 text-base font-medium border-b-2 transition-colors ${
                      activeTab === 'raw'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Raw Response
                  </button>
                </div>
              </div>

              {/* Summary Tab Content */}
              {activeTab === 'summary' && latestLog && (
                <div className="space-y-6">

                  {/* Overall Verdict & Recommendation */}
                  <div className={`p-4 rounded-xl border-2 ${
                    overallDanger >= 5
                      ? 'border-red-500/50 bg-red-500/10'
                      : overallDanger >= 3
                      ? 'border-yellow-500/50 bg-yellow-500/10'
                      : 'border-green-500/50 bg-green-500/10'
                  } shadow-md`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" /> Overall Moderation Score
                      </h3>
                      <div className="text-3xl font-extrabold text-white">
                        {10 - overallDanger}<span className="text-base text-gray-400">/10</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden mb-2">
                      <div
                        className={`h-full transition-all ${
                          overallDanger >= 7 ? 'bg-red-500' :
                          overallDanger >= 5 ? 'bg-orange-500' :
                          overallDanger >= 3 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(10 - overallDanger) * 10}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-300 mt-3">
                        <span className="font-bold">Verdict:</span> {latestLog.verdict.toUpperCase()}.
                        <span className="ml-2">
                          {overallDanger >= 5
                            ? 'Critical content detected. Strong recommendation to block or manually review.'
                            : overallDanger >= 3
                            ? 'Moderate risk detected. Recommend caution and policy review.'
                            : 'No significant concerns. Safe for general use.'}
                        </span>
                    </p>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">Content Analysis Breakdown</h3>
                    <div className="space-y-3">
                      {categoriesWithScores.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4 bg-gray-900 rounded-lg">
                          No concerning content detected across categories.
                        </p>
                      ) : (
                        categoriesWithScores.map((cat, idx) => {
                          const scoreColor = getScoreColor(cat.score);
                          return (
                            <div key={idx} className="p-4 rounded-lg bg-gray-900 border border-white/10">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base font-medium text-white">{cat.label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                      scoreColor === 'red' ? 'bg-red-500/20 text-red-400' :
                                      scoreColor === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                      scoreColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-green-500/20 text-green-400'
                                    }`}>
                                      {cat.level}
                                    </span>
                                  </div>

                                  {/* Danger Score Bar */}
                                  <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden mb-1">
                                    <div
                                      className={`h-full transition-all ${
                                        scoreColor === 'red' ? 'bg-red-500' :
                                        scoreColor === 'orange' ? 'bg-orange-500' :
                                        scoreColor === 'yellow' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${cat.score * 10}%` }}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400">
                                      Danger Level: <span className="font-mono text-white">{cat.score}/10</span>
                                    </span>
                                    <span className="text-gray-400">
                                      Confidence: <span className="font-mono text-white">{(cat.confidence * 100).toFixed(1)}%</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Details (nested scores) */}
                              {cat.data && typeof cat.data === 'object' && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <details className="text-xs text-gray-400">
                                    <summary className="cursor-pointer text-sm hover:text-white transition-colors list-none flex items-center justify-between">
                                      <span className="font-medium">View Sub-Category Scores</span>
                                      <span className="text-white">...</span>
                                    </summary>
                                    <div className="mt-2 space-y-1 pl-4 pt-1 bg-gray-800 rounded p-2">
                                      {Object.entries(cat.data).map(([key, value]) => {
                                        if (typeof value === 'number' && key !== 'prob' && key !== 'confidence') {
                                          return (
                                            <div key={key} className="flex justify-between">
                                              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                              <span className="font-mono text-white">{(value * 100).toFixed(1)}%</span>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  </details>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Response Tab Content */}
              {activeTab === 'raw' && latestLog && (
                <pre className="p-4 rounded-lg bg-gray-900 text-xs text-gray-300 overflow-auto max-h-96 border border-white/10">
                  {JSON.stringify(latestLog.result, null, 2)}
                </pre>
              )}

              {/* No Logs Found */}
              {!latestLog && !isLoading && (
                <p className="text-sm text-gray-400 text-center py-8 bg-gray-900 rounded-lg">
                  No moderation logs available for this image.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function ModipixDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<ImageStatus | 'all'>('all');
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Create API client with Clerk auth
  const api = createApiClient(getToken);

  // Fetch images with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['images', selectedStatus],
    queryFn: ({ pageParam }) => api.fetchImages({ pageParam: pageParam as number, status: selectedStatus }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Logic for pagination remains commented out for logic preservation
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    refetchOnWindowFocus: true,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: api.uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
    // Enhanced error handling could be added here
  });

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles: File[]) => {
      setUploadQueue(prev => [...prev, ...acceptedFiles]);
    },
  });

  // Sequential upload handler
  const handleUploadAll = useCallback(async () => {
    if (uploadQueue.length === 0 || isUploading) return;

    setIsUploading(true);
    // Use a copy to allow immediate clearing of the queue
    const queueToUpload = [...uploadQueue];
    setUploadQueue([]);

    for (const file of queueToUpload) {
      try {
        await uploadMutation.mutateAsync(file);
      } catch (error) {
        console.error('Upload failed:', error);
        // Re-add failed upload to a new queue or show an error state
        // For simplicity, we just log and continue for now.
      }
    }

    setIsUploading(false);
  }, [uploadQueue, isUploading, uploadMutation]);


  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allImages = data?.pages.flatMap(page => page) || [];
  const statusOptions = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    // Replaced original 'bg-background' with a specific dark color
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 md:p-10">

          {/* Header/Title - Aligned with the reference image aesthetic */}
          <header className="max-w-6xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center text-white mb-2">
              Modipix: <span className="text-primary">Image Moderation</span>
            </h1>
            <p className="text-center text-gray-400 text-lg">
              Analyze, categorize, and approve your content for compliance and safety.
            </p>
          </header>

          {/* Upload Zone (Max width increased for better aesthetic) */}
          <div className="max-w-6xl mx-auto mb-12">
            <div
              {...getRootProps()}
              className={`border-4 border-dashed rounded-2xl p-12 transition-all cursor-pointer shadow-2xl ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-primary/50 bg-[#1a1a1a] hover:bg-gray-800'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-xl font-bold mb-1">
                  {isDragActive ? 'Drop files to upload instantly' : 'Drag & drop new images here'}
                </p>
                <p className="text-sm text-gray-400">
                  or click to browse. Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                </p>
              </div>
            </div>

            {/* Upload Queue Preview */}
            {uploadQueue.length > 0 && (
              <div className="mt-6 p-4 bg-[#1a1a1a] rounded-xl border border-gray-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-base font-semibold text-white">{uploadQueue.length} file(s) in queue</p>
                  <button
                    onClick={() => setUploadQueue([])}
                    className="text-sm text-primary hover:text-primary/70 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-8 gap-3 mb-4">
                  {uploadQueue.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border-2 border-primary/50 overflow-hidden shadow-md">
                      <NextImage
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadQueue(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUploadAll}
                  disabled={isUploading}
                  className="w-full py-3 px-4 bg-primary text-white rounded-xl text-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading Images...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Start Moderation
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
            <p className="text-lg font-semibold text-white">Filter by Status:</p>
            <div className="flex items-center gap-3 flex-wrap">
              {statusOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelectedStatus(option.key as ImageStatus | 'all')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedStatus === option.key
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Grid */}
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-gray-400">Loading moderation history...</p>
              </div>
            ) : allImages.length === 0 ? (
              <div className="text-center py-20 bg-[#1a1a1a] rounded-xl border border-gray-700">
                <ImageIcon className="w-20 h-20 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-xl font-medium">No moderated images found</p>
                <p className="text-gray-500">Upload your first image above to begin moderation.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {allImages.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onClick={setSelectedImage}
                      api={api}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Loader */}
                <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
                  {isFetchingNextPage && (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  )}
                  {!hasNextPage && allImages.length > 0 && (
                    <p className="text-gray-500 text-sm">You've reached the end of the list.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Moderation Drawer */}
      <ModerationDrawer
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        api={api}
      />
    </div>
  );
}