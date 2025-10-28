import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <section id="contact" className="bg-gradient-to-br from-[#fa8072] via-[#ffa07a] to-[#e9967a] py-20 sm:py-24 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffcc99]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ffe5b4]/20 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold drop-shadow-lg">{contact.hero}</h2>
            <p className="mt-3 text-lg text-white/90 drop-shadow">{description}</p>
          </div>
          <Button asChild className="bg-white text-[#fa8072] hover:bg-[#ffefd5] hover:text-[#fa8072] shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-bold border-2 border-white/20 w-fit">
            <Link href={briefTemplateHref} download>
              <FileText className="mr-2 h-5 w-5" />
              {contact.downloadLabel}
            </Link>
          </Button>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {contact.quick ? (
            <Card className="border-2 border-white/20 bg-white shadow-xl backdrop-blur text-[#4a3728]">
              <CardHeader className="border-b-2 border-[#ffefd5] bg-[#ffefd5]/40">
                <CardTitle className="text-xl font-bold text-[#4a3728]">{contact.quick.title}</CardTitle>
                <CardDescription className="text-[#6b5444]">{contact.quick.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <EmployerQuickForm copy={contact.quick} />
              </CardContent>
            </Card>
          ) : null}
          {contact.full ? (
            <Card className="border-2 border-white/20 bg-white shadow-xl backdrop-blur text-[#4a3728]">
              <CardHeader className="border-b-2 border-[#ffefd5] bg-[#ffefd5]/40">
                <CardTitle className="text-xl font-bold text-[#4a3728]">{contact.full.title}</CardTitle>
                <CardDescription className="text-[#6b5444]">{contact.full.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <EmployerFullForm copy={contact.full} />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}
