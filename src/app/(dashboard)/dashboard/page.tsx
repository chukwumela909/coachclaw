import { auth } from "@/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";
import { DashboardOverview, type DashboardSubjectSummary } from "./DashboardOverview";

async function getSubjects(userId: string) {
  await connectDB();

  return Subject.aggregate<DashboardSubjectSummary>([
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

  return <DashboardOverview firstName={firstName} subjects={subjects} />;
}
