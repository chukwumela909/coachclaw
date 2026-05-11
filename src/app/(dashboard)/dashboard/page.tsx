import Link from "next/link";

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

export default async function DashboardHome() {
  const session = await auth();
  const subjects = session?.user?.id ? await getSubjects(session.user.id) : [];
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Your Mastery</h1>
          <p className="text-[16px] font-light text-[#898989] leading-[1.5]">
            Welcome back, {firstName}. Here&apos;s your learning progress across all subjects.
          </p>
        </div>
        <Link
          href="/dashboard/subjects/new"
          className="bg-[#242424] text-white px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] shrink-0 inline-flex justify-center"
        >
          Add Subject
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const subjectId = String(subject._id);

          return (
            <Link
              key={subjectId}
              href={`/dashboard/subjects/${subjectId}`}
              className="group bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] group-hover:text-[#0099ff] transition-colors">
                  {subject.name}
                </h3>

                <div className="w-[48px] h-[48px] rounded-full border-[3px] border-[#e5e5e5] flex items-center justify-center shrink-0 shadow-[var(--shadow-level-1)]">
                  <span className="text-[12px] font-bold text-[#242424]">0%</span>
                </div>
              </div>

              <p className="text-[14px] font-light text-[#898989] mb-6 line-clamp-2">
                {subject.description || "No description yet. Add topics to start building this subject."}
              </p>

              <div className="flex items-center gap-3 text-[14px] font-medium text-[#242424]">
                <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px]">
                  {subject.topicCount} {subject.topicCount === 1 ? "Topic" : "Topics"}
                </span>
                <span className="text-[#e5e5e5]">&#8226;</span>
                <span className="text-[#0099ff]">Continue</span>
              </div>
            </Link>
          );
        })}

        <Link
          href="/dashboard/subjects/new"
          className="bg-transparent border-[2px] border-dashed border-[#e5e5e5] rounded-[12px] p-6 flex flex-col items-center justify-center text-[#898989] hover:border-[#242424] hover:text-[#242424] transition-colors min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-[8px] bg-white shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] flex items-center justify-center mb-4">
            <span className="font-[var(--font-cal)] text-[24px]">+</span>
          </div>
          <span className="font-semibold text-[16px]">Create New Subject</span>
        </Link>
      </div>
    </div>
  );
}
