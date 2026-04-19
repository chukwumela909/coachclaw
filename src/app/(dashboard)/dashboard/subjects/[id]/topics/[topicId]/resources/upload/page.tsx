'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, UploadCloud, FileText, Link2, X, CheckCircle2 } from 'lucide-react';

export default function UploadResources() {
  const [files, setFiles] = useState<{ name: string; size: string; status: string }[]>([]);

  return (
    <div className="max-w-[800px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard/subjects/1/topics/1"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Limits and Continuity
      </Link>

      <div className="mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <h1 className="heading-lg text-[#242424] tracking-tight">Upload Resources</h1>
        <p className="mt-4 text-[16px] font-light text-[#898989] leading-[1.5]">
          Add study materials to this topic. We support PDFs, images, audio, and links.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-[12px] border-[2px] border-dashed border-[#e5e5e5] hover:border-[#898989] transition-colors p-12 text-center mb-8 cursor-pointer group">
        <div className="w-16 h-16 rounded-[12px] bg-[#f5f5f5] shadow-[var(--shadow-level-1)] flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform">
          <UploadCloud size={28} className="text-[#898989]" />
        </div>
        <p className="text-[16px] font-semibold text-[#242424] mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-[14px] font-light text-[#898989]">
          PDF, TXT, PNG, JPG, MP3, or WAV &mdash; up to 25MB each
        </p>
      </div>

      {/* Link Input */}
      <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link2 size={18} className="text-[#898989]" />
          <h3 className="text-[16px] font-semibold text-[#242424]">Add a Link</h3>
        </div>
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://example.com/article"
            className="flex-1 bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989]"
          />
          <button className="bg-[#242424] text-white px-5 py-3 text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] shrink-0">
            Add
          </button>
        </div>
      </div>

      {/* Queued Files */}
      <div className="space-y-3 mb-12">
        <div className="flex items-center justify-between p-4 bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)]">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#242424]">Chapter_3_Continuity.pdf</p>
              <p className="text-[12px] text-[#898989]">3.2 MB</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#10b981]" />
            <button className="p-1 text-[#898989] hover:text-[#242424] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-8 border-t-[1px] border-[#222a3514]">
        <Link
          href="/dashboard/subjects/1/topics/1"
          className="bg-transparent text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
        >
          Cancel
        </Link>
        <button className="bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          Upload &amp; Process
        </button>
      </div>
    </div>
  );
}
