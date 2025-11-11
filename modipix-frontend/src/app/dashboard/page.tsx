"use client";
import React, { useState, useCallback, useMemo } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

import { BorderTrail } from "../../components/motion-primitives/border-trail";
import { Button } from "@/components/ui/button";
import { TextShimmer } from "../../components/motion-primitives/text-shimmer";

import {
  ModerationResponse,
  calculateComprehensiveSafetyScore,
  getSafetyLevel,
  API_CONFIG,
  validateFile,
  ERROR_MESSAGES,
  type ModerationError,
  type SafetyScores,
} from "@/lib/moderation";
import { ShineBorder } from "@/components/magicui/shine-border";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "../../components/motion-primitives/disclosure";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogImage,
  MorphingDialogContainer,
} from "../../components/motion-primitives/morphing-dialog";
import { XIcon, AlertCircle, CheckCircle, Shield, Eye, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import ModerationHelper from "@/components/moderation-helper";
import { FileUpload } from "@/components/ui/file-upload";

const BORDER_TRAIL_CONFIG = {
  size: 120,
  transition: {
    ease: [0, 0.5, 0.8, 0.5] as const,
    duration: 4,
    repeat: 2,
  },
};

// Enhanced Types
interface UploadState {
  file: File | null;
  response: ModerationResponse | null;
  isLoading: boolean;
  isVisible: boolean;
  error: ModerationError | null;
  safetyScores: SafetyScores | null;
}

// Enhanced upload hook
const useImageUpload = () => {
  const [state, setState] = useState<UploadState>({
    file: null,
    response: null,
    isLoading: false,
    isVisible: false,
    error: null,
    safetyScores: null,
  });

  const handleFileChange = useCallback((file: File | null) => {
    setState((prev) => ({
      ...prev,
      file,
      error: null,
      response: null,
      isVisible: false,
      safetyScores: null,
    }));
  }, []);

  const handleUpload = useCallback(async () => {
    if (!state.file) {
      setState((prev) => ({ ...prev, error: 'INVALID_FILE_TYPE' }));
      return;
    }

    // Enhanced validation
    const validationError = validateFile(state.file);
    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    const formData = new FormData();
    formData.append("image", state.file);

    setState((prev) => ({
      ...prev,
      isLoading: true,
      isVisible: true,
      error: null,
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUTS.UPLOAD);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODERATE}`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data: ModerationResponse = await res.json();
      const safetyScores = calculateComprehensiveSafetyScore(data.moderationResult);

      setState((prev) => ({
        ...prev,
        response: data,
        safetyScores,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      let errorType: ModerationError = 'UNKNOWN_ERROR';

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorType = 'TIMEOUT_ERROR';
        } else if (err.message.includes('fetch')) {
          errorType = 'NETWORK_ERROR';
        } else if (err.message.includes('50')) {
          errorType = 'SERVER_ERROR';
        }
      }

      setState((prev) => ({
        ...prev,
        error: errorType,
        isLoading: false,
        isVisible: false,
      }));
    }
  }, [state.file]);

  return {
    ...state,
    handleFileChange,
    handleUpload,
  };
};

// Enhanced Safety Score Display Component
const SafetyScoreDisplay = React.memo(({ scores }: { scores: SafetyScores }) => {
  const overallSafety = getSafetyLevel(scores.overall);

  const scoreCategories = [
    { label: "Nudity", value: scores.nudity, icon: Eye },
    { label: "Violence", value: scores.violence, icon: Shield },
    { label: "Offensive", value: scores.offensive, icon: AlertCircle },
  ];

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${
            overallSafety.level === 'safe' ? 'bg-green-100 dark:bg-green-900' :
            overallSafety.level === 'caution' ? 'bg-yellow-100 dark:bg-yellow-900' :
            'bg-red-100 dark:bg-red-900'
          }`}>
            {overallSafety.level === 'safe' ? (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">Overall Safety</p>
            <p className={`text-xs ${overallSafety.color}`}>
              {overallSafety.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${overallSafety.color}`}>
            {scores.overall}%
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {scoreCategories.map(({ label, value, icon: Icon }) => {
          const safety = getSafetyLevel(value);
          return (
            <div key={label} className="p-2 rounded border bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className={`text-sm font-semibold ${safety.color}`}>
                  {value}%
                </div>
                <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      value >= 80 ? "bg-green-500" :
                      value >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

SafetyScoreDisplay.displayName = "SafetyScoreDisplay";

// Enhanced Moderation Results Component
const ModerationResults = React.memo(
  ({
    response,
    safetyScores,
    isLoading,
  }: {
    response: ModerationResponse | null;
    safetyScores: SafetyScores | null;
    isLoading: boolean;
  }) => {
    if (!response || response.status !== "success") {
      return (
        <TextShimmer className="font-mono text-sm" duration={1}>
          {isLoading ? "Analyzing image..." : "Ready to analyze"}
        </TextShimmer>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold">Moderation Results</h2>
          {response.provider && (
            <Badge variant="secondary" className="text-xs">
              {response.provider.toUpperCase()}
            </Badge>
          )}
        </div>

        {safetyScores && <SafetyScoreDisplay scores={safetyScores} />}

        {/* Processing Info */}
        {response.metadata && (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-4">
            {response.processingTime && (
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {response.processingTime}ms
              </span>
            )}
            {response.metadata.detectedObjects && (
              <span>{response.metadata.detectedObjects} objects detected</span>
            )}
          </div>
        )}

        {/* Full Results Disclosure */}
        <Disclosure className="rounded-md border border-zinc-200 px-3 dark:border-zinc-700">
          <DisclosureTrigger>
            <button
              className="w-full py-2 sm:py-3 text-left text-sm sm:text-base hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              type="button"
              aria-expanded="false"
            >
              View Detailed Analysis ({response.moderationResult.length} detections)
            </button>
          </DisclosureTrigger>
          <DisclosureContent>
            <div className="overflow-hidden pb-3">
              <div className="pt-1 font-mono text-xs sm:text-sm">
                <ModerationHelper result={response.moderationResult} />
              </div>
            </div>
          </DisclosureContent>
        </Disclosure>
      </div>
    );
  }
);

ModerationResults.displayName = "ModerationResults";

// Enhanced Upload Button
const UploadButton = React.memo(
  ({ onUpload, disabled }: { onUpload: () => void; disabled: boolean }) => (
    <Button
      className="relative ml-1 flex h-8 sm:h-9 lg:h-10 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-zinc-950/10 bg-white px-3 sm:px-4 text-xs sm:text-sm text-black focus-visible:ring-2 active:scale-[0.96] dark:border-zinc-50/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      type="button"
      aria-label="Validate image"
      onClick={onUpload}
      disabled={disabled}
    >
      <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
      {disabled ? "Validating..." : "Validate"}
    </Button>
  )
);

UploadButton.displayName = "UploadButton";

// Loading Indicator
const LoadingIndicator = React.memo(() => (
  <BorderTrail
    className="bg-gradient-to-r from-blue-300 via-purple-500 to-blue-300 transition-opacity duration-300 dark:from-blue-700/30 dark:via-purple-500 dark:to-blue-700/30"
    {...BORDER_TRAIL_CONFIG}
  />
));

LoadingIndicator.displayName = "LoadingIndicator";

export default function ModerationPage() {
  const {
    file,
    response,
    safetyScores,
    isLoading,
    isVisible,
    error,
    handleFileChange,
    handleUpload,
  } = useImageUpload();

  // Create object URL for preview (with cleanup)
  const previewUrl = useMemo(() => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    return url;
  }, [file]);

  // Cleanup object URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      <SignedIn>
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto min-h-48 sm:min-h-60 lg:min-h-76 border border-dashed bg-white dark:bg-black border-neutral-400 dark:border-neutral-400 rounded-lg">
            <FileUpload onChange={handleFileChange} />
            <div className="p-3 sm:p-4 flex h-full flex-col items-end justify-end">
              <UploadButton
                onUpload={handleUpload}
                disabled={!file || isLoading}
              />
            </div>
          </div>

          {error && (
            <Alert className="mt-4 mx-auto max-w-7xl border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                {ERROR_MESSAGES[error]}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-7xl mx-auto">
            {isVisible && previewUrl && (
              <div className="w-full lg:w-auto lg:flex-shrink-0 flex justify-center lg:justify-start">
                <MorphingDialog
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-xs xl:max-w-sm">
                    {isLoading && <LoadingIndicator />}
                    <MorphingDialogTrigger>
                      <MorphingDialogImage
                        src={previewUrl}
                        alt="Uploaded image for moderation"
                        className="w-full h-auto max-h-48 sm:max-h-64 lg:max-h-80 xl:max-h-96 object-cover rounded-[4px] cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                      />
                    </MorphingDialogTrigger>
                  </div>
                  <MorphingDialogContainer>
                    <MorphingDialogContent className="relative">
                      <MorphingDialogImage
                        src={previewUrl}
                        alt="Uploaded image for moderation"
                        className="h-auto w-full max-w-[90vw] sm:max-w-[85vw] max-h-[80vh] sm:max-h-[85vh] rounded-[4px] object-contain"
                      />
                    </MorphingDialogContent>
                    <MorphingDialogClose
                      className="fixed right-3 top-3 sm:right-4 sm:top-4 lg:right-6 lg:top-6 h-fit w-fit rounded-full bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 shadow-lg hover:bg-white transition-colors z-50"
                      variants={{
                        initial: { opacity: 0 },
                        animate: {
                          opacity: 1,
                          transition: { delay: 0.3, duration: 0.1 },
                        },
                        exit: { opacity: 0, transition: { duration: 0 } },
                      }}
                    >
                      <XIcon className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500" />
                    </MorphingDialogClose>
                  </MorphingDialogContainer>
                </MorphingDialog>
              </div>
            )}

            <div className="flex-1 mt-4 lg:mt-0">
              {isVisible && (
                <div className="pl-0 lg:pl-4 xl:pl-6 border-l-0 lg:border-l-2 border-t-2 lg:border-t-0 pt-4 lg:pt-0 border-black dark:border-white">
                  <ModerationResults
                    response={response}
                    safetyScores={safetyScores}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}