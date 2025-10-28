import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ValuePropsSection({ locale, valueProps }) {
  if (!valueProps?.length) {
    return null;
  }

  const heading = locale === 'da' ? 'Værdien for jer' : 'How we help';
  const intro =
    locale === 'da'
      ? 'Det handler om effektive match, tydelig forventningsafstemning og et flow, der sparer jer tid.'
      : 'It’s all about focused matches, crisp expectations, and a flow that saves your team time.';

  return (
    <section id="how-we-help" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-linear-to-b from-white via-[#fdf5e6]/30 to-white">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] mb-4">{heading}</h2>
        <p className="text-lg text-[#6b5444] leading-relaxed">{intro}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {valueProps.map((item) => (
          <Card key={item.title} className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-all hover:scale-105 bg-white group">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-[#4a3728] mb-2 group-hover:text-[#fa8072] transition-colors">{item.title}</CardTitle>
                  <CardDescription className="text-[#6b5444] leading-relaxed">{item.description}</CardDescription>
                </div>
                <CheckCircle2 className="h-7 w-7 text-[#ffa07a] shrink-0 group-hover:text-[#fa8072] transition-colors" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
