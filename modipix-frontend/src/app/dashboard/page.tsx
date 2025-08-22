"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { useState, useCallback, useMemo } from "react";

import { BorderTrail } from "../../components/motion-primitives/border-trail";

import { Button } from "@/components/ui/button";
import { TextShimmer } from "../../components/motion-primitives/text-shimmer";

import {
  isImageSafe,
  ModerationResponse,
  calculateSafetyScore,
} from "@/lib/moderation";
import { ShineBorder } from "@/components/magicui/shine-border";
import { TextAnimate } from "@/components/magicui/text-animate";
import {
  Disclosure,
  DisclosureContent,
  DisclosureTrigger,
} from "../../components/motion-primitives/disclosure"; //
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogImage,
  MorphingDialogContainer,
} from "../../components/motion-primitives/morphing-dialog"; //
import { XIcon, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ModerationHelper from "@/components/moderation-helper";
import { FileUpload } from "@/components/ui/file-upload";

// Constants
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SIDEBAR_STYLES = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
} as React.CSSProperties;

const BORDER_TRAIL_CONFIG = {
  size: 120,
  transition: {
    ease: [0, 0.5, 0.8, 0.5] as const,
    duration: 4,
    repeat: 2,
  },
};

// Types
interface UploadState {
  file: File | null;
  response: ModerationResponse | null;
  isLoading: boolean;
  isVisible: boolean;
  error: string | null;
}

// Custom hook for upload logic
const useImageUpload = () => {
  const [state, setState] = useState<UploadState>({
    file: null,
    response: null,
    isLoading: false,
    isVisible: false,
    error: null,
  });

  const handleFileChange = useCallback((file: File | null) => {
    setState((prev) => ({
      ...prev,
      file,
      error: null,
      response: null,
      isVisible: false,
    }));
  }, []);

  const handleUpload = useCallback(async () => {
    if (!state.file) {
      setState((prev) => ({ ...prev, error: "Please select a file" }));
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(state.file.type)) {
      setState((prev) => ({
        ...prev,
        error: "Please select a valid image file (JPEG, PNG)",
      }));
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (state.file.size > maxSize) {
      setState((prev) => ({
        ...prev,
        error: "File size must be less than 5MB",
      }));
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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(`${API_ENDPOINT}/api/v1/moderation/uploads`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }

      const data: ModerationResponse = await res.json();

      setState((prev) => ({
        ...prev,
        response: data,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage =
        err instanceof Error
          ? err.name === "AbortError"
            ? "Upload timed out. Please try again."
            : err.message
          : "Upload failed. Please try again.";

      setState((prev) => ({
        ...prev,
        error: errorMessage,
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

// Memoized components
const LoadingIndicator = React.memo(() => (
  <BorderTrail
    className="bg-gradient-to-r from-green-300 via-green-500 to-green-300 transition-opacity duration-300 dark:from-green-700/30 dark:via-green-500 dark:to-green-700/30"
    {...BORDER_TRAIL_CONFIG}
  />
));

LoadingIndicator.displayName = "LoadingIndicator";

const ModerationResults = React.memo(
  ({
    response,
    isLoading,
  }: {
    response: ModerationResponse | null;
    isLoading: boolean;
  }) => {
    const isImageSafeResult = useMemo(
      () => (response ? isImageSafe(response.moderationResult) : false),
      [response]
    );

    const safetyScore = useMemo(
      () => (response ? calculateSafetyScore(response.moderationResult) : null),
      [response]
    );

    if (!response || response.status !== "success") {
      return (
        <TextShimmer className="font-mono text-sm" duration={1}>
          {isLoading ? "Analyzing image..." : "Ready to analyze"}
        </TextShimmer>
      );
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold">Moderation Results</h2>

        <div className="space-y-2">
          <div
            className={`flex items-center gap-2 rounded-lg font-medium text-sm sm:text-base ${
              isImageSafeResult
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {isImageSafeResult ? (
              <>
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <TextAnimate animation="blurInUp" by="character" once>
                  This image is safe to use.
                </TextAnimate>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>This image may contain unsafe content.</span>
              </>
            )}
          </div>

          {safetyScore !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Safety Score:
              </span>
              <span
                className={`font-semibold ${
                  safetyScore >= 80
                    ? "text-green-600 dark:text-green-400"
                    : safetyScore >= 60
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {safetyScore}%
              </span>
              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    safetyScore >= 80
                      ? "bg-green-500"
                      : safetyScore >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${safetyScore}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <Disclosure className="rounded-md border border-zinc-200 px-3 dark:border-zinc-700">
          <DisclosureTrigger>
            <button
              className="w-full py-2 sm:py-3 text-left text-sm sm:text-base hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              type="button"
              aria-expanded="false"
            >
              View Full Scan Results
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

export default function ModerationPage() {
  const {
    file,
    response,
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
    <SidebarProvider style={SIDEBAR_STYLES}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
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
                {error}
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
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
