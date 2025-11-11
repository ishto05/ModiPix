"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadImageMutation } from "../api/hooks";
import toast from "react-hot-toast";

export default function UploadBox() {
  const { mutateAsync, isPending } = useUploadImageMutation();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await mutateAsync(formData);
      toast.success("Upload queued for moderation");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Upload failed";
      toast.error(msg);
    }
  }, [mutateAsync]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border border-dashed rounded-lg p-8 text-center cursor-pointer bg-card hover:bg-accent transition-colors"
    >
      <input {...getInputProps()} />
      <p className="text-sm text-muted-foreground">
        {isPending ? "Validating..." : isDragActive ? "Drop the image here..." : "Drag & drop an image, or click to select"}
      </p>
    </div>
  );
}

