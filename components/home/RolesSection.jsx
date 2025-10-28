import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function RolesSection({ locale, roles }) {
  if (!roles?.length) {
    return null;
  }

  const heading = locale === 'da' ? 'Roller vi ofte besætter' : 'Roles we commonly place';
  const subheading =
    locale === 'da'
      ? 'Ser du ikke jeres rolle? Skriv – sandsynligvis kan vi hjælpe.'
      : 'Don’t see your role? Ask us—odds are we’ve got candidates.';
  const ctaLabel = locale === 'da' ? 'Lad os tage en snak' : 'Start a conversation';

  return (
    <section id="roles" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-white">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-12">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] mb-2">{heading}</h2>
          <p className="text-lg text-[#6b5444]">{subheading}</p>
        </div>
        <Button asChild variant="outline" className="border-2 border-[#ffa07a] text-[#fa8072] hover:bg-[#ffefd5] hover:text-[#fa8072] font-semibold shadow-md hover:shadow-lg transition-all">
          <Link href="#contact">
            <ArrowRight className="mr-2 h-5 w-5" />
            {ctaLabel}
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.title} className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-white to-[#ffefd5]/10 group">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#4a3728] group-hover:text-[#fa8072] transition-colors mb-2">{role.title}</CardTitle>
              <CardDescription className="text-[#6b5444] leading-relaxed">{role.copy}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
