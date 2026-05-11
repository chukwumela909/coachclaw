import mongoose from "mongoose";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, FileText, Type } from "lucide-react";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import {
  createTextResource,
  ResourceValidationError,
  TopicNotFoundError,
} from "@/lib/resources/create-text-resource";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

type PageProps = {
  params: Promise<{ id: string; topicId: string }>;
};

async function createResource(subjectId: string, topicId: string, formData: FormData) {
  "use server";

  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");

  try {
    await createTextResource({ userId, subjectId, topicId, title, content });
  } catch (error) {
    if (error instanceof TopicNotFoundError) {
      notFound();
    }

    if (error instanceof ResourceValidationError) {
      redirect(`/dashboard/subjects/${subjectId}/topics/${topicId}/resources/upload`);
    }

    throw error;
  }

  revalidatePath(`/dashboard/subjects/${subjectId}`);
  revalidatePath(`/dashboard/subjects/${subjectId}/topics/${topicId}`);
  redirect(`/dashboard/subjects/${subjectId}/topics/${topicId}`);
}

export default async function UploadResources({ params }: PageProps) {
  const { id, topicId } = await params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(topicId)) {
    notFound();
  }

  const userId = await requireUserId();
  await connectDB();

  const [subject, topic] = await Promise.all([
    Subject.findOne({ _id: id, userId }).lean(),
    Topic.findOne({ _id: topicId, subjectId: id, userId }).lean(),
  ]);

  if (!subject || !topic) {
    notFound();
  }

  return (
    <div className="max-w-[800px] mx-auto p-6 md:p-12">
      <Link
        href={`/dashboard/subjects/${id}/topics/${topicId}`}
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {topic.name}
      </Link>

      <div className="mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <h1 className="heading-lg text-[#242424] tracking-tight">Add Text Notes</h1>
        <p className="mt-4 text-[16px] font-light text-[#898989] leading-[1.5]">
          Paste typed notes for {subject.name}. CoachClaw will save them as ready-to-use topic context.
        </p>
      </div>

      <div className="bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-8 md:p-12">
        <form action={createResource.bind(null, id, topicId)} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="resource-title" className="text-[16px] font-medium text-[#242424] flex items-center gap-2">
              <FileText size={18} className="text-[#898989]" />
              Resource Title
            </label>
            <p className="text-[14px] font-light text-[#898989] mb-4 leading-[1.5]">
              Give these notes a recognizable name, like Week 3 Lecture Notes or Chapter 2 Summary.
            </p>
            <input
              id="resource-title"
              name="title"
              type="text"
              required
              placeholder="e.g., Limits lecture notes"
              className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="resource-content" className="text-[16px] font-medium text-[#242424] flex items-center gap-2">
              <Type size={18} className="text-[#898989]" />
              Notes Content
            </label>
            <p className="text-[14px] font-light text-[#898989] mb-4 leading-[1.5]">
              For this first slice, text is stored directly as extracted content. File uploads come next.
            </p>
            <textarea
              id="resource-content"
              name="content"
              rows={12}
              required
              placeholder="Paste your notes here..."
              className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989] resize-y min-h-[280px]"
            />
          </div>

          <div className="pt-8 border-t-[1px] border-[#222a3514] flex justify-end gap-4">
            <Link
              href={`/dashboard/subjects/${id}/topics/${topicId}`}
              className="bg-transparent text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:bg-[#f5f5f5] transition-colors shadow-[var(--shadow-level-5)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden inline-flex items-center gap-2"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
