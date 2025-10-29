import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployerFullForm from '@/components/forms/EmployerFullForm';
import EmployerQuickForm from '@/components/forms/EmployerQuickForm';
import { FileText } from 'lucide-react';

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
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-8 bg-white border-2 border-[#ffe4b5] p-1 h-auto gap-2">
            <TabsTrigger 
              value="quick" 
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-semibold py-3 sm:py-4 px-3 sm:px-4 rounded-md transition-all data-[state=active]:shadow-md text-xs sm:text-sm md:text-base leading-tight"
            >
              <span className="hidden sm:inline">
                {locale === 'da' ? 'Mulighed A — Efterlad din e-mail (hurtigst)' : 'Option A — Leave your email (fastest)'}
              </span>
              <span className="sm:hidden">
                {locale === 'da' ? 'Mulighed A — E-mail (hurtigst)' : 'Option A — Email (fastest)'}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="full" 
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-[#ffa07a] data-[state=active]:to-[#fa8072] data-[state=active]:text-white text-[#4a3728] font-semibold py-3 sm:py-4 px-3 sm:px-4 rounded-md transition-all data-[state=active]:shadow-md text-xs sm:text-sm md:text-base leading-tight"
            >
              <span className="hidden sm:inline">
                {locale === 'da' ? 'Mulighed B — Fortæl os om din virksomhed' : 'Option B — Tell us about your company'}
              </span>
              <span className="sm:hidden">
                {locale === 'da' ? 'Mulighed B — Fuld formular' : 'Option B — Full form'}
              </span>
            </TabsTrigger>
          </TabsList>

          {contact.quick && (
            <TabsContent value="quick" className="mt-0">
              <Card className="border-2 border-[#ffe4b5] bg-white shadow-lg">
                <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
                  <EmployerQuickForm copy={contact.quick} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {contact.full && (
            <TabsContent value="full" className="mt-0">
              <Card className="border-2 border-[#ffe4b5] bg-white shadow-lg">
                <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
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
