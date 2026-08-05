import React, { useState } from 'react';
import { UploadCloud, FileText, Activity, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function ReportUploaderModal({ isOpen, onClose, onUploadSuccess }: ReportUploaderModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setComplete(true);
          setTimeout(() => {
            onUploadSuccess();
            onClose();
            // reset state after closing
            setTimeout(() => {
              setUploading(false);
              setComplete(false);
              setProgress(0);
            }, 500);
          }, 1500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 5;
      });
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl p-4 md:p-6 w-full max-w-lg shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            Upload Emergency Report
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Upload MRI, CT, ECG, or Blood Reports. The AI Engine will instantly analyze the contents and update the patient's triage plan.
          </p>

          {!uploading && !complete ? (
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-muted/50 hover:bg-muted'}`}
            >
              <UploadCloud className={`w-12 h-12 mb-4 ${dragActive ? 'text-blue-400 animate-bounce' : 'text-muted-foreground'}`} />
              <p className="text-foreground font-medium mb-1">Drag and drop file here</p>
              <p className="text-xs text-muted-foreground mb-4">Supported formats: PDF, DICOM, JPG, PNG (Max 50MB)</p>
              <button onClick={simulateUpload} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-foreground text-sm font-medium rounded-lg transition-colors">
                Browse Files
              </button>
            </div>
          ) : (
            <div className="border border-border bg-muted/50 rounded-xl p-4 md:p-8 flex flex-col items-center justify-center text-center">
              {complete ? (
                <>
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-[scale-in_0.3s_ease-out]" />
                  <p className="text-foreground font-bold text-lg">Analysis Complete</p>
                  <p className="text-sm text-muted-foreground">Updating triage plan...</p>
                </>
              ) : (
                <>
                  <Activity className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
                  <p className="text-foreground font-bold mb-2">Analyzing Document...</p>
                  <div className="w-full bg-card rounded-full h-2 mb-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-right w-full">{progress}%</p>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
