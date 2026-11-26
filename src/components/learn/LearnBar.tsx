import Link from "next/link";
import { hasDatabase } from "@/lib/db";
import { getUser } from "@/lib/session";
import { signOut } from "@/app/account-actions";

/** The thin bar under the main menu on every courses-platform page: account links. */
export async function LearnBar() {
  const user = hasDatabase ? await getUser().catch(() => null) : null;
  return (
    <div className="border-b border-line bg-mist">
      <div className="container-site flex min-h-12 flex-wrap items-center gap-x-5 gap-y-1 py-2 text-sm">
        <Link href="/courses/" className="font-semibold text-navy no-underline">STRONGS Courses</Link>
        <span className="flex-1" />
        {user ? (
          <>
            <Link href="/dashboard/" className="font-semibold no-underline">My learning</Link>
            {user.role === "admin" && <Link href="/admin/" className="font-semibold no-underline">Admin</Link>}
            <span className="hidden text-muted sm:inline">{user.name}</span>
            <form action={signOut}>
              <button type="submit" className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] font-semibold text-royal hover:underline">Sign out</button>
            </form>
          </>
        ) : hasDatabase ? (
          <>
            <Link href="/sign-in/" className="font-semibold no-underline">Sign in</Link>
            <Link href="/sign-up/" className="btn btn-navy min-h-9 px-4 text-sm">Create a free account</Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
