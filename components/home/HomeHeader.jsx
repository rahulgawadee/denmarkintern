import Link from 'next/link';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function HomeHeader({ locale, brand, navItems, primaryCta }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#d4d4d4] bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="flex items-center gap-3 font-semibold group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b2b2b] text-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="hidden sm:block text-xl font-bold text-[#2b2b2b]">{brand}</span>
          </Link>
         
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-[#2b2b2b] hover:text-[#525252] hover:bg-[#f5f5f5]">
            <Link href={`/${locale}/auth/login`}>Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#2b2b2b] hover:bg-[#525252] text-white shadow-md hover:shadow-lg transition-all">
            <Link href={`/${locale}/auth/signup`}>{primaryCta}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
