import Link from "next/link";
import { Library } from "lucide-react";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

type SubjectSummary = {
  _id: unknown;
  name: string;
  description?: string;
  topicCount: number;
};

async function getSubjects(userId: string) {
  await connectDB();

  return Subject.aggregate<SubjectSummary>([
    { $match: { userId } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: Topic.collection.name,
        localField: "_id",
        foreignField: "subjectId",
        as: "topics",
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        topicCount: { $size: "$topics" },
      },
    },
  ]);
}

export default async function SubjectsListing() {
  const session = await auth();
  const subjects = session?.user?.id ? await getSubjects(session.user.id) : [];

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-[48px] border-b-[1px] border-[#222a3514] pb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Subjects</h1>
          <p className="text-[16px] font-light text-[#898989] leading-[1.5]">
            All your subjects in one place. Select one to view topics and progress.
          </p>
        </div>
        <Link
          href="/dashboard/subjects/new"
          className="bg-[#242424] text-white px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] shrink-0 inline-flex justify-center relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          + New Subject
        </Link>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => {
          const subjectId = String(subject._id);

          return (
            <Link
              key={subjectId}
              href={`/dashboard/subjects/${subjectId}`}
              className="block bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow group"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)] shrink-0">
                    <Library size={20} />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] group-hover:text-[#0099ff] transition-colors">
                      {subject.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[14px] font-light text-[#898989] mt-1">
                      <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-[6px] text-[#242424] font-medium text-[12px]">
                        {subject.topicCount} {subject.topicCount === 1 ? "Topic" : "Topics"}
                      </span>
                      <span className="text-[#e5e5e5]">&#8226;</span>
                      <span>{subject.description || "No description yet"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 bg-[#fcfcfc] p-4 rounded-[8px] border-[1px] border-[#222a3514] shrink-0">
                  <div className="text-right">
                    <div className="text-[12px] font-medium text-[#898989] uppercase tracking-wider mb-1">Mastery</div>
                    <div className="text-[18px] font-bold text-[#242424]">0%</div>
                  </div>
                  <div className="w-[1px] h-[32px] bg-[#222a3514]" />
                  <div className="text-right">
                    <div className="text-[12px] font-medium text-[#898989] uppercase tracking-wider mb-1">Status</div>
                    <div className="text-[14px] font-medium text-[#242424]">Ready</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        <Link
          href="/dashboard/subjects/new"
          className="block border-[2px] border-dashed border-[#e5e5e5] rounded-[12px] p-8 text-center hover:border-[#242424] hover:text-[#242424] transition-colors group"
        >
          <div className="w-12 h-12 rounded-[8px] bg-white shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] flex items-center justify-center mx-auto mb-4">
            <span className="font-[var(--font-cal)] text-[24px] text-[#898989] group-hover:text-[#242424] transition-colors">+</span>
          </div>
          <span className="font-semibold text-[16px] text-[#898989] group-hover:text-[#242424] transition-colors">Add Another Subject</span>
        </Link>
      </div>
    </div>
  );
}
