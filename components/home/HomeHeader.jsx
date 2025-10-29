import Link from 'next/link';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function HomeHeader({ locale, brand, navItems, primaryCta }) {
  return (
    <header className="sticky top-0 z-50 border-b border-peach-200/60 bg-gradient-to-r from-[#fdf5e6]/95 via-[#ffefd5]/95 to-[#fdf5e6]/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-8">
          <Link href={`/${locale}`} className="flex items-center gap-3 font-semibold group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffa07a] to-[#fa8072] text-white shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-bold text-[#4a3728] bg-gradient-to-r from-[#4a3728] to-[#6b5444] bg-clip-text">{brand}</span>
              <span className="text-xs text-[#8b7355] font-medium">Øresund talent bridge</span>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navItems?.map((item) => (
              <a 
                key={item.href} 
                href={item.href} 
                className="px-4 py-2 text-sm font-medium text-[#6b5444] hover:text-[#fa8072] hover:bg-[#ffefd5]/50 rounded-lg transition-all"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-[#6b5444] hover:text-[#fa8072] hover:bg-[#ffefd5]/50">
            <Link href={`/${locale}/auth/login`}>Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white shadow-md hover:shadow-lg transition-all">
            <Link href={`/${locale}/auth/signup`}>{primaryCta}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
