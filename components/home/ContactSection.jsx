import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployerFullForm from '@/components/forms/EmployerFullForm';
import EmployerQuickForm from '@/components/forms/EmployerQuickForm';
import { FileText, Mail, ClipboardList } from 'lucide-react';

export default function ContactSection({ locale, contact, briefTemplateHref }) {
  if (!contact) {
    return null;
  }

  const description =
    locale === 'da'
      ? 'Vælg den løsning, der passer jer – hurtig e-mail eller den fulde match-formular.'
      : 'Choose the path that fits: quick email handoff or the full matching brief.';

  return (
    <section id="contact" className="bg-white border-t-2 border-[#d4d4d4] py-20 sm:py-24 relative overflow-hidden">
      {/* Decorative accents matching footer/navbar (subtle, neutral) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-900/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-700/5 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">{contact.hero}</h2>
          <p className="text-lg text-zinc-500 mb-6">{description}</p>
          <Button asChild className="bg-zinc-900 hover:bg-zinc-700 text-white shadow-sm hover:shadow-md transition-all hover:scale-105 font-bold">
            <Link href={briefTemplateHref} download>
              <FileText className="mr-2 h-5 w-5" />
              {contact.downloadLabel}
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 mb-8 bg-white border-2 border-[#d4d4d4] p-2 h-auto">
            <TabsTrigger 
              value="quick" 
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-900 font-semibold py-2.5 px-2 sm:px-4 rounded-md transition-all data-[state=active]:shadow-md flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 text-center">
                <span className="text-[10px] sm:text-xs font-normal">{locale === 'da' ? 'A:' : 'A:'}</span>
                <span className="text-xs sm:text-sm font-semibold leading-tight">{locale === 'da' ? 'Hurtig' : 'Quick'}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="full" 
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-900 font-semibold py-2.5 px-2 sm:px-4 rounded-md transition-all data-[state=active]:shadow-md flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 text-center">
                <span className="text-[10px] sm:text-xs font-normal">{locale === 'da' ? 'B:' : 'B:'}</span>
                <span className="text-xs sm:text-sm font-semibold leading-tight">{locale === 'da' ? 'Fuld' : 'Full'}</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {contact.quick && (
            <TabsContent value="quick" className="mt-0">
              <Card className="border-2 border-[#d4d4d4] bg-white shadow-lg">
                <CardHeader className="border-b-2 border-[#e5e5e5] bg-[#f5f5f5]/40">
                  <CardTitle className="text-xl font-bold text-[#2b2b2b] flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#525252]" />
                    {contact.quick.title}
                  </CardTitle>
                  <CardDescription className="text-[#737373]">{contact.quick.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <EmployerQuickForm copy={contact.quick} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {contact.full && (
            <TabsContent value="full" className="mt-0">
              <Card className="border-2 border-[#d4d4d4] bg-white shadow-lg">
                <CardHeader className="border-b-2 border-[#e5e5e5] bg-[#f5f5f5]/40">
                  <CardTitle className="text-xl font-bold text-[#2b2b2b] flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-[#525252]" />
                    {contact.full.title}
                  </CardTitle>
                  <CardDescription className="text-[#737373]">{contact.full.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <EmployerFullForm copy={contact.full} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </section>
  );
}
