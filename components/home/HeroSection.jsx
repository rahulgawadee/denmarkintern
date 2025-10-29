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
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black -mt-[73px]" id="hero">
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

      {/* Content Container - Centered with proper spacing */}
      <div className="relative z-30 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 pt-32 sm:pt-40 lg:pt-48 pb-8 sm:pb-12">
          
          {/* Text Card - Fully Transparent Background */}
          <div className="w-full max-w-3xl px-2 sm:px-4">
            <div className="bg-transparent border-2 border-white/30 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
                Hire Swedish interns, simply — for Danish companies.
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed drop-shadow-md">
                Fast, low-friction matching across the Øresund. Minimal fee. Real impact.
              </p>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-4xl mt-4 sm:mt-6">
            <Button asChild size="lg" className="gap-2 bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white shadow-2xl hover:shadow-[#ffa07a]/50 transition-all hover:scale-105 w-full sm:w-auto sm:min-w-[200px] lg:min-w-[220px] border-none h-12 sm:h-14 text-sm sm:text-base font-bold">
              <Link href={`/${locale}/auth/signup`}>
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                {hero.primaryCta}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 border-2 border-white/80 bg-transparent text-white hover:bg-white/20 hover:border-white w-full sm:w-auto sm:min-w-[200px] lg:min-w-[220px] font-semibold h-12 sm:h-14 text-sm sm:text-base shadow-xl">
              <Link href="#contact">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                {hero.secondaryCta}
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="gap-2 text-white/90 hover:text-white hover:bg-white/10 w-full sm:w-auto h-12 sm:h-14 text-sm sm:text-base">
              <Link href={`/${locale}/auth/signup`}>
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                {locale === 'da' ? 'Jeg er studerende' : "I'm a student"}
              </Link>
            </Button>
          </div>

        </div>
      </div>
    
    </section>
  );
}
