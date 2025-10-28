import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MessageSquare, Users } from 'lucide-react';

export default function HeroSection({ locale, hero }) {
  if (!hero) {
    return null;
  }

  return (
    <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-24 sm:pt-32 lg:pt-40 text-center overflow-hidden bg-[#fdf5e6]" id="hero">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#ffa07a]/8 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#ffcba4]/8 rounded-full blur-3xl -z-10" />
      
      <Badge variant="secondary" className="mx-auto mb-6 w-fit border border-[#ffe4b5] bg-gradient-to-r from-[#ffefd5] to-[#ffe5b4] text-[#fa8072] font-semibold px-5 py-2 shadow-md">
        🇩🇰 ↔️ 🇸🇪 Øresund bridge for talent
      </Badge>
      
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[#4a3728] max-w-4xl mx-auto drop-shadow-sm">
        {hero.headline}
      </h1>
      
      <p className="mt-6 text-lg sm:text-xl text-[#6b5444] max-w-2xl mx-auto leading-relaxed font-medium">
        {hero.subheadline}
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto min-w-[200px] border-none">
          <Link href={`/${locale}/auth/signup/company`}>
            <Building2 className="h-5 w-5" />
            {hero.primaryCta}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2 border-2 border-[#ffa07a] text-[#fa8072] hover:bg-[#ffefd5] hover:text-[#fa8072] w-full sm:w-auto min-w-[200px] font-semibold">
          <Link href="#contact">
            <MessageSquare className="h-5 w-5" />
            {hero.secondaryCta}
          </Link>
        </Button>
        <Button asChild size="lg" variant="ghost" className="gap-2 text-[#6b5444] hover:text-[#fa8072] hover:bg-[#ffefd5]/50 w-full sm:w-auto">
          <Link href={`/${locale}/auth/signup/student`}>
            <Users className="h-5 w-5" />
            {locale === 'da' ? 'Jeg er studerende' : "I'm a student"}
          </Link>
        </Button>
      </div>
      
      <Card className="mx-auto mt-16 max-w-3xl text-left shadow-xl border-2 border-[#ffe4b5] hover:shadow-2xl transition-all hover:scale-[1.02] bg-white/80 backdrop-blur">
        <CardHeader className="border-b-2 border-[#ffefd5] bg-gradient-to-r from-[#ffefd5]/50 to-[#ffe5b4]/50">
          <CardTitle className="text-sm uppercase tracking-wide text-[#fa8072] font-bold flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffa07a]" />
            {locale === 'da' ? 'Kort historie' : 'Our story'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-base text-[#4a3728] leading-relaxed pt-6">
          {hero.microStory}
        </CardContent>
      </Card>
    </section>
  );
}
