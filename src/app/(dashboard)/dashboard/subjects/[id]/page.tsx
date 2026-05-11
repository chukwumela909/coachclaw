import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { Resource } from "@/models/Resource";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

type PageProps = {
  params: Promise<{ id: string }>;
};

type TopicRow = {
  _id: unknown;
  name: string;
  description?: string;
};

type ResourceCountRow = {
  _id: mongoose.Types.ObjectId;
  count: number;
};

export default async function SubjectDetail({ params }: PageProps) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  const userId = await requireUserId();
  await connectDB();

  const subject = await Subject.findOne({ _id: id, userId }).lean();

  if (!subject) {
    notFound();
  }

  const [topics, resourceCounts] = await Promise.all([
    Topic.find({ subjectId: id, userId })
      .sort({ order: 1, createdAt: 1 })
      .lean<TopicRow[]>(),
    Resource.aggregate<ResourceCountRow>([
      { $match: { userId, subjectId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$topicId", count: { $sum: 1 } } },
    ]),
  ]);

  const resourceCountByTopic = new Map(
    resourceCounts.map((row) => [row._id.toString(), row.count])
  );

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-[48px] border-b-[1px] border-[#222a3514] pb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">{subject.name}</h1>
          <p className="text-[18px] font-light text-[#898989] leading-[1.5]">
            {subject.description || "Add topics to start shaping this subject into a learning plan."}
          </p>
        </div>
        <Link
          href={`/dashboard/subjects/${id}/topics/new`}
          className="bg-white text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5] transition-colors shrink-0 whitespace-nowrap"
        >
          + Add Topic
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="heading-sm text-[#242424] mb-6">Topics</h2>

        {topics.map((topic) => {
          const topicId = String(topic._id);
          const resourceCount = resourceCountByTopic.get(topicId) ?? 0;

          return (
            <Link
              key={topicId}
              href={`/dashboard/subjects/${id}/topics/${topicId}`}
              className="block bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow group"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                <div>
                  <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">
                    {topic.name}
                  </h3>
                  <div className="flex items-center gap-3 text-[14px] font-light text-[#898989]">
                    <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px] text-[#242424] font-medium">
                      {resourceCount} {resourceCount === 1 ? "Resource" : "Resources"}
                    </span>
                    <span className="text-[#e5e5e5]">&#8226;</span>
                    <span>{topic.description || "Ready for resources, diagnostics, and study guide generation"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-8 bg-[#fcfcfc] p-4 rounded-[8px] border-[1px] border-[#222a3514]">
                  <div className="text-left sm:text-right">
                    <div className="text-[12px] font-medium text-[#898989] mb-1 uppercase tracking-wider">MASTERY</div>
                    <div className="text-[18px] font-bold text-[#242424]">0%</div>
                  </div>
                  <div className="w-[1px] h-[32px] bg-[#222a3514]" />
                  <div className="text-left sm:text-right">
                    <div className="text-[12px] font-medium text-[#898989] mb-1 uppercase tracking-wider">QUESTIONS</div>
                    <div className="text-[18px] font-bold text-[#242424]">0/0</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {topics.length === 0 ? (
          <Link
            href={`/dashboard/subjects/${id}/topics/new`}
            className="block border-[2px] border-dashed border-[#e5e5e5] rounded-[12px] p-8 text-center hover:border-[#242424] transition-colors"
          >
            <span className="font-semibold text-[16px] text-[#898989]">Create your first topic</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
