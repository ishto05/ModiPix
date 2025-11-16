"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/nextjs";

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

/* -------------------------------------------------------
   STATE MANAGEMENT & UPLOAD LOGIC
------------------------------------------------------- */
interface UploadState {
  file: File | null;
  response: ModerationResponse | null;
  isLoading: boolean;
  isVisible: boolean;
  error: ModerationError | null;
  safetyScores: SafetyScores | null;
}

const useImageUpload = () => {
  const { getToken } = useAuth();
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
      setState((prev) => ({ ...prev, error: "INVALID_FILE_TYPE" }));
      return;
    }

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
      /* 🔥 FETCH CLERK JWT FOR BACKEND */
      const token = await getToken({ template: "modipixBackend" });
      if (!token) throw new Error("No Clerk JWT. User not authenticated.");

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUTS.UPLOAD
      );

      const res = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MODERATE}`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 SEND JWT TO BACKEND
          },
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data: ModerationResponse = await res.json();
      const safetyScores = calculateComprehensiveSafetyScore(
        data.moderationResult
      );

      setState((prev) => ({
        ...prev,
        response: data,
        safetyScores,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      let errorType: ModerationError = "UNKNOWN_ERROR";

      if (err instanceof Error) {
        if (err.name === "AbortError") errorType = "TIMEOUT_ERROR";
        else if (err.message.includes("fetch")) errorType = "NETWORK_ERROR";
        else if (err.message.includes("50")) errorType = "SERVER_ERROR";
      }

      setState((prev) => ({
        ...prev,
        error: errorType,
        isLoading: false,
        isVisible: false,
      }));
    }
  }, [state.file, getToken]);

  return {
    ...state,
    handleFileChange,
    handleUpload,
  };
};

/* -------------------------------------------------------
   SAFETY SCORE DISPLAY
------------------------------------------------------- */
const SafetyScoreDisplay = React.memo(({ scores }: { scores: SafetyScores }) => {
  const overallSafety = getSafetyLevel(scores.overall);
  const categories = [
    { label: "Nudity", value: scores.nudity, icon: Eye },
    { label: "Violence", value: scores.violence, icon: Shield },
    { label: "Offensive", value: scores.offensive, icon: AlertCircle },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-full ${
              overallSafety.level === "safe"
                ? "bg-green-100 dark:bg-green-900"
                : overallSafety.level === "caution"
                ? "bg-yellow-100 dark:bg-yellow-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            {overallSafety.level === "safe" ? (
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {categories.map(({ label, value, icon: Icon }) => {
          const level = getSafetyLevel(value);
          return (
            <div key={label} className="p-2 rounded border bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className={`text-sm font-semibold ${level.color}`}>
                  {value}%
                </div>

                <div className="w-12 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      value >= 80
                        ? "bg-green-500"
                        : value >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
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

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */
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

  const { getToken } = useAuth();

  /* Debug print of actual backend JWT */
  useEffect(() => {
    async function run() {
      const token = await getToken({ template: "modipixBackend" });
      console.log("Backend JWT:", token);
    }
    run();
  }, [getToken]);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <>
      <SignedIn>
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto min-h-48 bg-white dark:bg-black border border-neutral-400 rounded-lg">
            <FileUpload onChange={handleFileChange} />

            <div className="p-4 flex justify-end">
              <Button
                className="relative px-4 h-9"
                onClick={handleUpload}
                disabled={!file || isLoading}
              >
                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                {isLoading ? "Validating..." : "Validate"}
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert className="mt-4 mx-auto max-w-7xl border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{ERROR_MESSAGES[error]}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          <div className="mt-8 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
            {isVisible && previewUrl && (
              <div className="lg:w-auto flex justify-center">
                <MorphingDialog>
                  <MorphingDialogTrigger>
                    <MorphingDialogImage
                      src={previewUrl}
                      alt="alt.....check this section dev"
                      className="max-h-96 object-cover rounded shadow-md cursor-pointer"
                    />
                  </MorphingDialogTrigger>

                  <MorphingDialogContainer>
                    <MorphingDialogContent>
                      <MorphingDialogImage
                        src={previewUrl}
                        alt="alt.....check this section dev"
                        className="max-h-[85vh] rounded object-contain"
                      />
                    </MorphingDialogContent>

                    <MorphingDialogClose className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg">
                      <XIcon className="h-5 w-5 text-zinc-700" />
                    </MorphingDialogClose>
                  </MorphingDialogContainer>
                </MorphingDialog>
              </div>
            )}

            <div className="flex-1">
              {isVisible && (
                <div className="pl-6 border-l border-gray-500">
                  {response && safetyScores ? (
                    <div>
                      <SafetyScoreDisplay scores={safetyScores} />
                      <Disclosure className="mt-6 border px-4">
                        <DisclosureTrigger>Full details</DisclosureTrigger>
                        <DisclosureContent>
                          <ModerationHelper result={response.moderationResult} />
                        </DisclosureContent>
                      </Disclosure>
                    </div>
                  ) : isLoading ? (
                    <TextShimmer>Analyzing image...</TextShimmer>
                  ) : (
                    <TextShimmer>Ready to analyze</TextShimmer>
                  )}
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
