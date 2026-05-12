import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ChevronLeft } from "lucide-react";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { Subject } from "@/models/Subject";

async function createSubject(formData: FormData) {
  "use server";

  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();

  if (!name || !description || !goal) {
    redirect("/dashboard/subjects/new");
  }

  await connectDB();
  const subject = await Subject.create({
    userId,
    name,
    description,
    goal,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/subjects");
  redirect(`/dashboard/subjects/${subject._id.toString()}`);
}

export default function CreateSubject() {
  return (
    <div className="max-w-[800px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="mb-[48px]">
        <h1 className="heading-lg text-[#242424] mb-4 tracking-tight border-b-[1px] border-[#222a3514] pb-[48px]">
          Create a New Course
        </h1>
      </div>

      <div className="bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-8 md:p-12">
        <form action={createSubject} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="subject-name" className="text-[16px] font-medium text-[#242424] block">Course Name</label>
            <p className="text-[14px] font-light text-[#898989] mb-4 leading-[1.5]">
              Give this course a clear title, like Calculus 101 or European History.
            </p>
            <input
              id="subject-name"
              name="name"
              type="text"
              required
              placeholder="e.g., Organic Chemistry"
              className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject-description" className="text-[16px] font-medium text-[#242424] block">Course Description</label>
            <p className="text-[14px] font-light text-[#898989] mb-4 leading-[1.5]">
              Summarize what the course covers. CoachClaw uses this when suggesting topics.
            </p>
            <textarea
              id="subject-description"
              name="description"
              rows={4}
              required
              minLength={12}
              placeholder="Covers functional groups, reaction mechanisms, stereochemistry, and synthesis..."
              className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject-goal" className="text-[16px] font-medium text-[#242424] block">Learning Goal</label>
            <p className="text-[14px] font-light text-[#898989] mb-4 leading-[1.5]">
              Tell CoachClaw what success looks like so topic suggestions can match your intent.
            </p>
            <textarea
              id="subject-goal"
              name="goal"
              rows={3}
              required
              minLength={8}
              placeholder="I am studying for the MCAT and need to focus on stereochemistry..."
              className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow placeholder-[#898989] resize-none"
            />
          </div>

          <div className="pt-8 border-t-[1px] border-[#222a3514] flex justify-end gap-4">
            <Link
              href="/dashboard"
              className="bg-transparent text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:bg-[#f5f5f5] transition-colors shadow-[var(--shadow-level-5)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden inline-flex items-center gap-2"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
