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
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/20 to-black/30" />
      </div>


      {/* Main Content Container */}
      <div className="relative z-20 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Text Content */}
        <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 ">
              Hire Swedish interns, simply — for Danish companies.
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto shadow-lg">
              Fast, low-friction matching across the Øresund. Minimal fee. Real impact.
            </p>
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full max-w-3xl">
          <Button asChild size="lg" className="gap-2 bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white shadow-2xl hover:shadow-[#ffa07a]/50 transition-all hover:scale-105 w-full sm:w-auto min-w-[220px] border-none h-14 text-base font-bold">
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
    </section>
  );
}
