'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { LogoutButton } from '@/components/ui/logout-button';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Plus, 
  Users, 
  Settings, 
  HelpCircle, 
  User,
  Globe,
  ChevronDown,
  Briefcase,
  Calendar,
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

export function TopNavigation({ activeTab = 'dashboard' }) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'da';
  const user = useSelector((state) => state.auth.user);
  
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const changeLanguage = (newLocale) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}/`, `/${newLocale}/`);
    router.push(newPath);
  };

  const copy = locale === 'da' ? {
    dashboard: 'Dashboard',
    addRole: 'Tilføj ny rolle',
    matches: 'Matchede kandidater',
    interviews: 'Interviews',
    onboarding: 'Onboarding',
    activeInterns: 'Aktive Praktikanter',
    settings: 'Indstillinger',
    support: 'Support',
    profile: 'Profil',
    logout: 'Log ud',
    language: 'Sprog',
    danish: 'Dansk',
    english: 'English',
    swedish: 'Svenska',
  } : {
    dashboard: 'Dashboard',
    addRole: 'Add New Role',
    matches: 'Matched Candidates',
    interviews: 'Interviews',
    onboarding: 'Onboarding',
    activeInterns: 'Active Interns',
    settings: 'Settings',
    support: 'Support',
    profile: 'Profile',
    logout: 'Logout',
    language: 'Language',
    danish: 'Dansk',
    english: 'English',
    swedish: 'Svenska',
  };

  const navItems = [
    { id: 'dashboard', label: copy.dashboard, href: `/${locale}/dashboard/company`, icon: LayoutDashboard },
    { id: 'add-role', label: copy.addRole, href: `/${locale}/dashboard/company/add-role`, icon: Plus },
    { id: 'matches', label: copy.matches, href: `/${locale}/dashboard/company/matches`, icon: Users },
    { id: 'interviews', label: copy.interviews, href: `/${locale}/dashboard/company/interviews`, icon: Calendar },
    { id: 'onboarding', label: copy.onboarding, href: `/${locale}/dashboard/company/onboarding`, icon: FileCheck },
    { id: 'active-interns', label: copy.activeInterns, href: `/${locale}/dashboard/company/active-interns`, icon: Users },
    { id: 'settings', label: copy.settings, href: `/${locale}/dashboard/company/settings`, icon: Settings },
    { id: 'support', label: copy.support, href: `/${locale}/dashboard/company/support`, icon: HelpCircle },
  ];

  const languageOptions = [
    { code: 'da', label: copy.danish, flag: '🇩🇰' },
    { code: 'en', label: copy.english, flag: '🇬🇧' },
    { code: 'sv', label: copy.swedish, flag: '🇸🇪' },
  ];

  const currentLanguage = languageOptions.find(lang => lang.code === locale) || languageOptions[0];

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-zinc-900">Denmark Intern</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right Side: Language Toggle & Profile */}
          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <DropdownMenu open={languageMenuOpen} onOpenChange={setLanguageMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLanguage.flag}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{copy.language}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={locale === lang.code ? 'bg-zinc-100' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.firstName || user?.email}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-zinc-500 font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard/company/settings`)}>
                  <Settings className="h-4 w-4 mr-2" />
                  {copy.settings}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${locale}/dashboard/company/support`)}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {copy.support}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <LogoutButton variant="ghost" size="sm" className="w-full justify-start p-0 h-auto font-normal text-red-600 hover:text-red-600 hover:bg-transparent" />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
