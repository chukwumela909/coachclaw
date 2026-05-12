import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; topicId: string; quizId: string }>;
};

export default async function QuizResultsPage({ params }: PageProps) {
  const { id, topicId, quizId } = await params;
  redirect(`/dashboard/subjects/${id}/topics/${topicId}/quiz/${quizId}`);
}
