import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, CheckCircle, AlertCircle, Video } from "lucide-react";
import { uploadMeeting } from "../api/client";

export default function AudioUpload({ onUploadComplete }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        if (!title) {
          const name = acceptedFiles[0].name.replace(/\.[^/.]+$/, "");
          setTitle(name.replace(/[_-]/g, " "));
        }
      }
    },
    [title]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mkv", ".mov", ".avi"],
      "audio/*": [".wav", ".mp3", ".m4a", ".webm", ".ogg"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setStatus("uploading");
    setError("");
    setProgress("Uploading file...");

    try {
      // Simulate pipeline stages for UX
      setTimeout(() => setProgress("🎬 Extracting audio from video..."), 3000);
      setTimeout(() => setProgress("🎤 Transcribing with Whisper..."), 8000);
      setTimeout(() => setProgress("🤖 Generating AI summary..."), 15000);
      setTimeout(() => setProgress("📋 Extracting action items..."), 20000);
      setTimeout(() => setProgress("🔍 Building search index..."), 25000);

      const result = await uploadMeeting(title.trim(), file);
      setStatus("success");
      setFile(null);
      setTitle("");
      setProgress("");
      if (onUploadComplete) onUploadComplete(result);
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
      setProgress("");
    }
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h2 className="section-title mb-5">
        <div className="p-2 rounded-lg bg-accent/15">
          <Upload className="h-4 w-4 text-accent" />
        </div>
        Upload Meeting Recording
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input */}
        <input
          id="meeting-title-input"
          type="text"
          placeholder="Meeting title (e.g., Sprint Planning — Week 12)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="glass-input w-full"
          required
        />

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`group relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-accent bg-accent/5 scale-[1.01]"
              : file
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-white/[0.08] hover:border-accent/40 hover:bg-accent/5"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="text-emerald-400">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 animate-fade-in" />
              <p className="font-semibold text-lg">{file.name}</p>
              <p className="text-sm text-emerald-400/70 mt-1">
                {(file.size / (1024 * 1024)).toFixed(1)} MB — Click or drop
                to replace
              </p>
            </div>
          ) : (
            <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
              <Video className="h-10 w-10 mx-auto mb-3 group-hover:text-accent transition-colors" />
              <p className="font-semibold text-lg">Drop your video or audio file here</p>
              <p className="text-sm mt-1">
                MP4, MKV, MOV, AVI, WAV, MP3, M4A — up to 100 MB
              </p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          id="upload-submit-btn"
          type="submit"
          disabled={!file || !title.trim() || status === "uploading"}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {progress}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload & Process
            </>
          )}
        </button>

        {/* Status messages */}
        {status === "success" && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 animate-fade-in">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Meeting processed successfully! View it below.
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}