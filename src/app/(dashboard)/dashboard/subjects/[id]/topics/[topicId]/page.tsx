import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, BookOpen, ChevronLeft, ClipboardCheck, Clock, FileText, PlayCircle, UploadCloud } from "lucide-react";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { Resource } from "@/models/Resource";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

type PageProps = {
  params: Promise<{ id: string; topicId: string }>;
};

type ResourceRow = {
  _id: unknown;
  title: string;
  extractedContent: string;
  status: "ready";
  type: "text";
  createdAt: Date;
};

function previewText(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > 140 ? `${normalized.slice(0, 140)}...` : normalized;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function TopicDetail({ params }: PageProps) {
  const { id, topicId } = await params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(topicId)) {
    notFound();
  }

  const userId = await requireUserId();
  await connectDB();

  const [subject, topic, resources] = await Promise.all([
    Subject.findOne({ _id: id, userId }).lean(),
    Topic.findOne({ _id: topicId, subjectId: id, userId }).lean(),
    Resource.find({ topicId, userId }).sort({ createdAt: -1 }).lean<ResourceRow[]>(),
  ]);

  if (!subject || !topic) {
    notFound();
  }

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      <Link
        href={`/dashboard/subjects/${id}`}
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {subject.name}
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-[48px] border-b-[1px] border-[#222a3514] mb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">{topic.name}</h1>
          <p className="text-[18px] font-light text-[#898989] flex items-center gap-4">
            Topic Mastery: <span className="font-semibold text-[#242424]">0%</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href={`/dashboard/subjects/${id}/topics/${topicId}/resources/upload`}
            className="bg-white text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
          >
            <UploadCloud size={18} />
            Add Resource
          </Link>
          <Link
            href={`/dashboard/subjects/${id}/topics/${topicId}/chat`}
            className="bg-[#242424] text-white px-5 py-[12px] text-[14px] font-semibold rounded-[8px] shadow-[var(--shadow-level-2)] hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <PlayCircle size={18} />
            Coach Me
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <section className="grid sm:grid-cols-3 gap-6">
            <Link
              href={`/dashboard/subjects/${id}/topics/${topicId}/study-guide`}
              className="bg-white p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-shadow group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <BookOpen size={80} />
              </div>
              <BookOpen size={24} className="text-[#242424] mb-6" />
              <h3 className="heading-sm text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">Study Guide</h3>
              <p className="text-[14px] font-light text-[#898989] leading-[1.5]">Review AI-generated concepts synthesized from your resources.</p>
            </Link>

            <Link
              href={`/dashboard/subjects/${id}/topics/${topicId}/quiz/new`}
              className="bg-[#fafafa] p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] hover:bg-white transition-all group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Activity size={80} />
              </div>
              <Activity size={24} className="text-[#242424] mb-6" />
              <h3 className="heading-sm text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">Take Quiz</h3>
              <p className="text-[14px] font-light text-[#898989] leading-[1.5]">Test your knowledge with adaptive active recall questions.</p>
            </Link>

            <Link
              href={`/dashboard/subjects/${id}/topics/${topicId}/diagnostic`}
              className="bg-white p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-shadow group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ClipboardCheck size={80} />
              </div>
              <ClipboardCheck size={24} className="text-[#242424] mb-6" />
              <h3 className="heading-sm text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">Diagnostic</h3>
              <p className="text-[14px] font-light text-[#898989] leading-[1.5]">Assess your baseline knowledge with a short adaptive test.</p>
            </Link>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="heading-sm text-[#242424]">Resources</h2>
              <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px] text-[12px] text-[#242424] font-medium">
                {resources.length} {resources.length === 1 ? "resource" : "resources"}
              </span>
            </div>

            {resources.length > 0 ? (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={String(resource._id)}
                    className="bg-white p-6 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)] shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-medium text-[16px] text-[#242424]">{resource.title}</h3>
                          <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px] text-[12px] uppercase tracking-wider text-[#242424] font-semibold">
                            {resource.status}
                          </span>
                          <span className="text-[12px] text-[#898989]">
                            {resource.type.toUpperCase()} &#8226; {formatDate(resource.createdAt)}
                          </span>
                        </div>
                        <p className="text-[14px] font-light text-[#898989] leading-[1.5]">
                          {previewText(resource.extractedContent)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)] shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-[16px] text-[#242424] mb-1">No resources yet</div>
                    <div className="text-[12px] font-medium uppercase tracking-wider text-[#898989]">Add typed notes to start building topic context</div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside>
          <div className="bg-[#fcfcfc] p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] sticky top-[96px]">
            <h3 className="heading-xs text-[#242424] mb-8 pb-4 border-b-[1px] border-[#222a3514]">Progress Stats</h3>
            <div className="space-y-6">
              <div>
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Quizzes Taken</div>
                <div className="flex items-end gap-2 text-[#242424]">
                  <span className="heading-md leading-none">0</span>
                  <span className="font-medium mb-1">sessions</span>
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Average Score</div>
                <div className="flex items-end gap-2 text-[#242424]">
                  <span className="heading-md leading-none">0</span>
                  <span className="font-medium mb-1">%</span>
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Time Studied</div>
                <div className="flex items-center gap-3 text-[#242424]">
                  <Clock size={24} className="text-[#898989]" />
                  <span className="font-semibold text-[24px]">0m</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
