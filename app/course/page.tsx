// app/course/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getCourseData } from '@/app/lib/course-data';
import CourseClient from './ui';

export default async function CoursePage() {
  const data = await getCourseData();

  // Fallback: if admin hasn’t created anything yet
  const totalLectures = data.reduce((a, s) => a + s.lectures.length, 0);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <div className="border-b border-neutral-200">
        <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">The Face Max</div>
          <div className="text-neutral-400">|</div>
          <div className="text-sm text-neutral-600">Dental Implant Mastery</div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-24">
        <CourseClient data={data} totalLectures={totalLectures} />
      </div>
    </div>
  );
}

