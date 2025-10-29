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
    <section id="contact" className="bg-[#ffefd5] border-y-2 border-[#ffe4b5] py-20 sm:py-24 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffa07a]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#fa8072]/5 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] mb-3">{contact.hero}</h2>
          <p className="text-lg text-[#6b5444] mb-6">{description}</p>
          <Button asChild className="bg-linear-to-r from-[#ffa07a] to-[#fa8072] hover:from-[#fa8072] hover:to-[#e9967a] text-white shadow-md hover:shadow-lg transition-all hover:scale-105 font-bold">
            <Link href={briefTemplateHref} download>
              <FileText className="mr-2 h-5 w-5" />
              {contact.downloadLabel}
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 mb-8 bg-white border-2 border-[#ffe4b5] p-2 h-auto">
            <TabsTrigger 
              value="quick" 
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-semibold py-2.5 px-2 sm:px-4 rounded-md transition-all data-[state=active]:shadow-md flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Mail className="h-4 w-4 shrink-0" />
              <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 text-center">
                <span className="text-[10px] sm:text-xs font-normal">{locale === 'da' ? 'A:' : 'A:'}</span>
                <span className="text-xs sm:text-sm font-semibold leading-tight">{locale === 'da' ? 'Hurtig' : 'Quick'}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="full" 
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-semibold py-2.5 px-2 sm:px-4 rounded-md transition-all data-[state=active]:shadow-md flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
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
              <Card className="border-2 border-[#ffe4b5] bg-white shadow-lg">
                <CardHeader className="border-b-2 border-[#ffefd5] bg-linear-to-r from-[#ffefd5]/40 to-[#fdf5e6]/40">
                  <CardTitle className="text-xl font-bold text-[#4a3728] flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#fa8072]" />
                    {contact.quick.title}
                  </CardTitle>
                  <CardDescription className="text-[#6b5444]">{contact.quick.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <EmployerQuickForm copy={contact.quick} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {contact.full && (
            <TabsContent value="full" className="mt-0">
              <Card className="border-2 border-[#ffe4b5] bg-white shadow-lg">
                <CardHeader className="border-b-2 border-[#ffefd5] bg-linear-to-r from-[#ffefd5]/40 to-[#fdf5e6]/40">
                  <CardTitle className="text-xl font-bold text-[#4a3728] flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-[#fa8072]" />
                    {contact.full.title}
                  </CardTitle>
                  <CardDescription className="text-[#6b5444]">{contact.full.description}</CardDescription>
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
