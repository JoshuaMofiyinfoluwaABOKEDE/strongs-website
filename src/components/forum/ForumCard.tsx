import Link from "next/link";
import { Chat } from "@/components/icons";

/** A small invitation to the course's discussion forum, shown on the course home page. */
export function ForumCard({ slug }: { slug: string }) {
  return (
    <Link
      href={`/forum/${slug}/`}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 text-ink no-underline hover:border-navy sm:p-5"
    >
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-mist text-royal"><Chat size={22} /></span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold text-navy group-hover:text-royal">Course forum</span>
        <span className="text-sm text-muted">Ask questions, discuss the lessons and connect with classmates.</span>
      </span>
      <span aria-hidden="true" className="text-royal">→</span>
    </Link>
  );
}
