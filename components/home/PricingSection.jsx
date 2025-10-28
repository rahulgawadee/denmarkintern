import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Handshake } from 'lucide-react';

export default function PricingSection({ pricing, compliance }) {
  if (!pricing && !compliance) {
    return null;
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-linear-to-b from-white via-[#ffefd5]/30 to-white">
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        {pricing ? (
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] mb-4">{pricing.title}</h2>
            <Separator className="my-6 bg-[#ffe4b5]" />
            <ul className="space-y-4 text-[#6b5444]">
              {pricing.copy?.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 text-[#ffa07a] shrink-0" />
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {compliance ? (
          <Card className="border-2 border-[#ffe4b5] shadow-md bg-white hover:shadow-xl transition-shadow">
            <CardHeader className="border-b-2 border-[#ffefd5] bg-linear-to-r from-[#ffefd5]/40 to-[#fdf5e6]/40">
              <CardTitle className="text-xl font-bold text-[#4a3728]">{compliance.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 text-[#6b5444]">
                {compliance.items?.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Handshake className="mt-1 h-5 w-5 text-[#ffa07a] shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
