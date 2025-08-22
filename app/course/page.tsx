// app/course/page.tsx
// Theme tokens (from landing page)
// bg: bg-gradient-to-b from-white to-slate-50
// surface: bg-white
// border: border-slate-200
// text: text-slate-900
// muted: text-slate-600
// accent: text-amber-400
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getCourseData } from '@/app/lib/course-data';
import { getSession } from '@/app/lib/cookies';
import { userHasPurchase } from '@/app/lib/access';
import { COURSE_ID } from '@/app/lib/course-ids';
import CourseClient from './ui';

export default async function CoursePage() {
  const session = getSession();
  if (!session) {
    return <div className="p-8 text-center">Please log in</div>;
  }

  const hasPurchase = await userHasPurchase(session.userId, COURSE_ID);
  if (!hasPurchase) {
    return (
      <div className="p-8 text-center space-y-2">
        <p>You do not have access to this course.</p>
        <p>If you purchased the course, check your email for access.</p>
      </div>
    );
  }

  const data = await getCourseData();

  // Fallback: if admin hasn’t created anything yet
  const totalLectures = data.reduce((a, s) => a + s.lectures.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="border-b border-slate-200/60 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="font-semibold">Face Max Academy</div>
          <div className="text-slate-400">|</div>
          <div className="text-sm text-slate-600">Dental Implant Mastery</div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-24">
        <CourseClient data={data} totalLectures={totalLectures} />
      </div>
    </div>
  );
}

