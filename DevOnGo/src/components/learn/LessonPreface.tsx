import { Card } from '@/src/components/ui/Card';
import { LessonDiagram } from '@/src/components/learn/LessonDiagrams';
import type { Lesson } from '@/src/utils/lessons';
import { BookMarked, Layers } from 'lucide-react';

type Props = {
  lesson: Lesson;
};

export function LessonPreface({ lesson }: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-6 py-8 sm:px-10 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            <Layers className="size-3.5 text-indigo-500" strokeWidth={2} />
            Before you start
          </span>
          {lesson.web3Task && (
            <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Includes hands-on task
            </span>
          )}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{lesson.title}</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">{lesson.description}</p>
      </div>

      <LessonDiagram kind={lesson.introDiagram} />

      <div className="grid gap-4 sm:grid-cols-3">
        {lesson.introCards.map((card, i) => (
          <Card key={i} className="border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-700">{i + 1}</div>
            <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{card.description}</p>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <BookMarked className="size-5 shrink-0 text-indigo-600" strokeWidth={2} />
          <h3 className="text-sm font-semibold tracking-wide text-slate-800">Read before the quiz</h3>
        </div>
        <div className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap">{lesson.theoryBeforeQuiz}</div>
      </Card>
    </div>
  );
}
