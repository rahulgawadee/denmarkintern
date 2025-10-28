import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, MessageSquare, Users, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

export default function HeroSection({ locale, hero }) {
  const [isMuted, setIsMuted] = useState(true);

  if (!hero) {
    return null;
  }

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black -mt-[73px]" id="hero">
      {/* Full-Width Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/Work in Scand.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Subtle overlay for better text readability - very light */}
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/40" />
      </div>

   

      {/* Content Container - Buttons Only */}
      <div className="relative z-30 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 text-center w-full">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="gap-2 bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white shadow-2xl hover:shadow-[#ffa07a]/50 transition-all hover:scale-110 w-full sm:w-auto min-w-[220px] border-none h-14 text-base font-bold">
            <Link href={`/${locale}/auth/signup/company`}>
              <Building2 className="h-5 w-5" />
              {hero.primaryCta}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2 border-2 border-white/80 bg-black/20 backdrop-blur-md text-white hover:bg-white/20 hover:border-white w-full sm:w-auto min-w-[220px] font-semibold h-14 text-base shadow-xl">
            <Link href="#contact">
              <MessageSquare className="h-5 w-5" />
              {hero.secondaryCta}
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="gap-2 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto h-14">
            <Link href={`/${locale}/auth/signup/student`}>
              <Users className="h-5 w-5" />
              {locale === 'da' ? 'Jeg er studerende' : "I'm a student"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Text Card Below Buttons */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4">
        <Card className="bg-white/95 backdrop-blur-md border-2 border-[#ffe4b5] shadow-2xl">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4a3728] mb-3">
              Hire Swedish interns, simply — for Danish companies.
            </h2>
            <p className="text-base sm:text-lg text-[#6b5444] leading-relaxed">
              Fast, low-friction matching across the Øresund. Minimal fee. Real impact.
            </p>
          </CardContent>
        </Card>
      </div>

    
    </section>
  );
}
