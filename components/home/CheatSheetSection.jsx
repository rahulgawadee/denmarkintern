import { Sparkles } from 'lucide-react';

export default function CheatSheetSection({ cheatSheet }) {
  if (!cheatSheet) {
    return null;
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-linear-to-b from-white via-[#fdf5e6]/20 to-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] mb-8 text-center">{cheatSheet.title}</h2>
      <ul className="space-y-4">
        {cheatSheet.bullets?.map((bullet) => (
          <li key={bullet} className="flex gap-3 items-start p-4 rounded-lg bg-white border-2 border-[#ffe4b5] hover:shadow-md transition-all">
            <Sparkles className="mt-1 h-5 w-5 text-[#ffa07a] shrink-0" />
            <span className="text-[#6b5444] leading-relaxed">{bullet}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
