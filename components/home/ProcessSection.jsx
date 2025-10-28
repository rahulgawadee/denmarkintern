import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';

export default function ProcessSection({ locale, process }) {
  if (!process) {
    return null;
  }

  const heading = locale === 'da' ? 'Sådan fungerer det' : 'How it works';
  const intro =
    locale === 'da'
      ? 'Kort, fokuseret proces fra behov til shortlist. Vi står ved jeres side hele vejen.'
      : 'A short, focused process from brief to shortlist. We stay close throughout.';

  return (
    <section id="process" className="bg-gradient-to-br from-[#fa8072] via-[#ffa07a] to-[#e9967a] py-20 sm:py-24 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffcc99]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ffe5b4]/20 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 drop-shadow-lg">{heading}</h2>
          <p className="text-lg text-white/90 leading-relaxed drop-shadow">{intro}</p>
          <Button asChild className="mt-8 bg-white text-[#fa8072] hover:bg-[#ffefd5] hover:text-[#fa8072] shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-bold border-2 border-white/20">
            <Link href={`/${locale}/auth/signup/company`}>
              <CalendarCheck className="mr-2 h-5 w-5" />
              {process.cta}
            </Link>
          </Button>
        </div>
        <div className="space-y-8 max-w-3xl mx-auto">
          {process.steps?.map((step, index) => (
            <div key={step.title} className="flex gap-6 items-start bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 transition-all group">
              <div className="shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full border-3 border-white bg-white/20 backdrop-blur text-xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 drop-shadow">{step.title}</h3>
                <p className="text-white/90 leading-relaxed">{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
