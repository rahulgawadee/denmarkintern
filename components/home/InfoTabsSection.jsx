'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Upload, 
  Search, 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  CheckCircle2,
  FileText,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function InfoTabsSection({ locale = 'en' }) {
  const [selectedTab, setSelectedTab] = useState(null);

  const content = {
    en: {
      title: 'Discover Your Path',
      subtitle: 'Choose your journey with us',
      tabs: {
        students: {
          title: 'For Students',
          buttonText: 'Click here for Students',
          icon: GraduationCap,
          color: 'from-[#2b2b2b] to-[#525252]',
          hoverColor: 'hover:from-[#525252] hover:to-[#737373]',
          bgColor: 'bg-[#f5f5f5]',
          borderColor: 'border-[#d4d4d4]',
          iconBg: 'bg-[#e5e5e5]',
          iconColor: 'text-[#2b2b2b]',
        },
        companies: {
          title: 'For Companies',
          buttonText: 'Click here for Companies',
          icon: Building2,
          color: 'from-[#2b2b2b] to-[#525252]',
          hoverColor: 'hover:from-[#525252] hover:to-[#737373]',
          bgColor: 'bg-[#f5f5f5]',
          borderColor: 'border-[#d4d4d4]',
          iconBg: 'bg-[#e5e5e5]',
          iconColor: 'text-[#2b2b2b]',
        },
        professionals: {
          title: 'For Professionals',
          buttonText: 'Click here for Professionals',
          icon: Briefcase,
          color: 'from-[#2b2b2b] to-[#525252]',
          hoverColor: 'hover:from-[#525252] hover:to-[#737373]',
          bgColor: 'bg-[#f5f5f5]',
          borderColor: 'border-[#d4d4d4]',
          iconBg: 'bg-[#e5e5e5]',
          iconColor: 'text-[#2b2b2b]',
        },
      },
      modals: {
        students: {
          title: 'Students - Your Gateway to Career Success',
          subtitle: 'Launch your professional journey with top Danish companies',
          features: [
            {
              icon: Upload,
              title: 'Upload Your CV/Resume',
              description: 'Create your profile and upload your CV in minutes. Our AI-powered system highlights your best skills.',
            },
            {
              icon: FileText,
              title: 'Build Your Profile',
              description: 'Showcase your education, skills, projects, and experience. Add portfolio links and certifications.',
            },
            {
              icon: Search,
              title: 'Browse Internships',
              description: 'Explore hundreds of internship opportunities from leading Danish companies across all industries.',
            },
            {
              icon: Target,
              title: 'Smart Matching',
              description: 'Our AI algorithm matches you with opportunities that fit your skills, interests, and career goals.',
            },
            {
              icon: MessageSquare,
              title: 'Direct Communication',
              description: 'Chat directly with companies, ask questions, and receive instant responses from hiring managers.',
            },
            {
              icon: Calendar,
              title: 'Schedule Interviews',
              description: 'Book interviews seamlessly through our integrated calendar system. Receive reminders and preparation tips.',
            },
            {
              icon: UserCheck,
              title: 'Application Tracking',
              description: 'Track all your applications in one place. Get real-time updates on your application status.',
            },
            {
              icon: CheckCircle2,
              title: 'Get Hired',
              description: 'Accept offers, sign contracts digitally, and start your internship journey with confidence.',
            },
          ],
          uniqueFeatures: {
            title: 'Our Unique Features',
            items: [
              'AI-powered CV optimization suggestions',
              'Real-time application status tracking',
              'Integrated video interview platform',
              'Career mentorship program',
              'Skills assessment and certification',
              'Peer networking community',
            ],
          },
        },
        companies: {
          title: 'Companies - Find Your Next Talent',
          subtitle: 'Connect with motivated Swedish students ready to contribute',
          features: [
            {
              icon: FileText,
              title: 'Post Internship Opportunities',
              description: 'Create detailed internship listings with role descriptions, requirements, and company culture insights.',
            },
            {
              icon: Users,
              title: 'Access Talent Pool',
              description: 'Browse through thousands of verified student profiles from top Swedish universities.',
            },
            {
              icon: Target,
              title: 'Smart Candidate Matching',
              description: 'Our AI automatically recommends candidates that match your requirements and company culture.',
            },
            {
              icon: Search,
              title: 'Advanced Search Filters',
              description: 'Filter candidates by skills, education, availability, language proficiency, and more.',
            },
            {
              icon: MessageSquare,
              title: 'Direct Messaging',
              description: 'Communicate directly with candidates. Schedule interviews and send updates instantly.',
            },
            {
              icon: Calendar,
              title: 'Interview Management',
              description: 'Manage all interviews in one place. Use our integrated video platform or schedule in-person meetings.',
            },
            {
              icon: UserCheck,
              title: 'Application Management',
              description: 'Track applicants through your hiring pipeline. Collaborate with team members on decisions.',
            },
            {
              icon: CheckCircle2,
              title: 'Seamless Onboarding',
              description: 'Send offers, manage contracts, and onboard interns with our digital tools and templates.',
            },
          ],
          uniqueFeatures: {
            title: 'Why Choose Our Platform',
            items: [
              'Minimal matching fee - pay only on success',
              'Pre-screened and verified candidates',
              'Cross-border hiring made simple',
              'Compliance and legal guidance',
              'Dedicated support throughout the process',
              'Analytics and reporting dashboard',
            ],
          },
        },
        professionals: {
          title: 'For Professionals',
          subtitle: 'Coming Soon',
          description: 'We\'re building something amazing for professionals. Stay tuned!',
          comingSoon: true,
        },
      },
    },
    da: {
      title: 'Opdag Din Vej',
      subtitle: 'Vælg din rejse med os',
      tabs: {
        students: {
          title: 'For Studerende',
          buttonText: 'Klik her for Studerende',
          icon: GraduationCap,
          color: 'from-[#2b2b2b] to-[#525252]',
          hoverColor: 'hover:from-[#525252] hover:to-[#737373]',
          bgColor: 'bg-[#f5f5f5]',
          borderColor: 'border-[#d4d4d4]',
          iconBg: 'bg-[#e5e5e5]',
          iconColor: 'text-[#2b2b2b]',
        },
        companies: {
          title: 'For Virksomheder',
          buttonText: 'Klik her for Virksomheder',
          icon: Building2,
          color: 'from-[#2b2b2b] to-[#525252]',
          hoverColor: 'hover:from-[#525252] hover:to-[#737373]',
          bgColor: 'bg-[#f5f5f5]',
          borderColor: 'border-[#d4d4d4]',
          iconBg: 'bg-[#e5e5e5]',
          iconColor: 'text-[#2b2b2b]',
        },
        professionals: {
          title: 'For Professionelle',
          buttonText: 'Klik her for Professionelle',
          icon: Briefcase,
          color: 'from-[#2b2b2b] to-[#525252]',
          hoverColor: 'hover:from-[#525252] hover:to-[#737373]',
          bgColor: 'bg-[#f5f5f5]',
          borderColor: 'border-[#d4d4d4]',
          iconBg: 'bg-[#e5e5e5]',
          iconColor: 'text-[#2b2b2b]',
        },
      },
      modals: {
        students: {
          title: 'Studerende - Din Vej til Karrieresucces',
          subtitle: 'Start din professionelle rejse med top danske virksomheder',
          features: [
            {
              icon: Upload,
              title: 'Upload Dit CV',
              description: 'Opret din profil og upload dit CV på få minutter. Vores AI-system fremhæver dine bedste kompetencer.',
            },
            {
              icon: FileText,
              title: 'Byg Din Profil',
              description: 'Vis din uddannelse, kompetencer, projekter og erfaring. Tilføj portfolio-links og certificeringer.',
            },
            {
              icon: Search,
              title: 'Gennemse Praktikpladser',
              description: 'Udforsk hundredvis af praktikpladser fra førende danske virksomheder på tværs af alle brancher.',
            },
            {
              icon: Target,
              title: 'Smart Matching',
              description: 'Vores AI-algoritme matcher dig med muligheder, der passer til dine kompetencer og karrieremål.',
            },
            {
              icon: MessageSquare,
              title: 'Direkte Kommunikation',
              description: 'Chat direkte med virksomheder, stil spørgsmål og modtag øjeblikkelige svar fra ansættelseschefer.',
            },
            {
              icon: Calendar,
              title: 'Planlæg Samtaler',
              description: 'Book interviews problemfrit gennem vores integrerede kalendersystem. Modtag påmindelser og tips.',
            },
            {
              icon: UserCheck,
              title: 'Ansøgningssporing',
              description: 'Spor alle dine ansøgninger ét sted. Få realtidsopdateringer om din ansøgningsstatus.',
            },
            {
              icon: CheckCircle2,
              title: 'Bliv Ansat',
              description: 'Acceptér tilbud, underskriv kontrakter digitalt og start din praktik med selvtillid.',
            },
          ],
          uniqueFeatures: {
            title: 'Vores Unikke Funktioner',
            items: [
              'AI-drevet CV-optimering',
              'Realtidssporing af ansøgninger',
              'Integreret videosamtaleplatform',
              'Karrierementorprogram',
              'Kompetencevurdering og certificering',
              'Netværksfællesskab for studerende',
            ],
          },
        },
        companies: {
          title: 'Virksomheder - Find Dit Næste Talent',
          subtitle: 'Få kontakt med motiverede svenske studerende klar til at bidrage',
          features: [
            {
              icon: FileText,
              title: 'Opslå Praktikpladser',
              description: 'Opret detaljerede praktikopslag med rollebeskrivelser, krav og virksomhedskultur.',
            },
            {
              icon: Users,
              title: 'Adgang til Talentpulje',
              description: 'Gennemse tusindvis af verificerede studentprofiler fra topsvenske universiteter.',
            },
            {
              icon: Target,
              title: 'Smart Kandidatmatching',
              description: 'Vores AI anbefaler automatisk kandidater, der matcher dine krav og virksomhedskultur.',
            },
            {
              icon: Search,
              title: 'Avancerede Søgefiltre',
              description: 'Filtrér kandidater efter kompetencer, uddannelse, tilgængelighed, sprogkundskaber og mere.',
            },
            {
              icon: MessageSquare,
              title: 'Direkte Beskeder',
              description: 'Kommunikér direkte med kandidater. Planlæg interviews og send opdateringer øjeblikkeligt.',
            },
            {
              icon: Calendar,
              title: 'Interviewstyring',
              description: 'Administrer alle interviews ét sted. Brug vores integrerede videoplatform eller planlæg møder.',
            },
            {
              icon: UserCheck,
              title: 'Ansøgningshåndtering',
              description: 'Spor ansøgere gennem din ansættelsespipeline. Samarbejd med teammedlemmer om beslutninger.',
            },
            {
              icon: CheckCircle2,
              title: 'Problemfri Onboarding',
              description: 'Send tilbud, administrer kontrakter og onboard praktikanter med vores digitale værktøjer.',
            },
          ],
          uniqueFeatures: {
            title: 'Hvorfor Vælge Vores Platform',
            items: [
              'Minimalt gebyr - betal kun ved succes',
              'Præ-screenede og verificerede kandidater',
              'Grænseoverskridende ansættelse gjort enkelt',
              'Compliance og juridisk vejledning',
              'Dedikeret support gennem processen',
              'Analyse- og rapporteringsdashboard',
            ],
          },
        },
        professionals: {
          title: 'For Professionelle',
          subtitle: 'Kommer Snart',
          description: 'Vi bygger noget fantastisk for professionelle. Hold øje!',
          comingSoon: true,
        },
      },
    },
  };

  const text = content[locale] || content.da;

  const handleOpenModal = (tab) => {
    setSelectedTab(tab);
  };

  const handleCloseModal = () => {
    setSelectedTab(null);
  };

  const renderModalContent = () => {
    if (!selectedTab) return null;

    const modalData = text.modals[selectedTab];

    if (modalData.comingSoon) {
      return (
        <div className="py-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-[#4a3728] mb-3">{modalData.subtitle}</h3>
          <p className="text-gray-600 text-lg">{modalData.description}</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center pb-6 border-b border-[#d4d4d4]">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#2b2b2b] mb-2">{modalData.title}</h3>
          <p className="text-[#737373] text-base sm:text-lg">{modalData.subtitle}</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {modalData.features.map((feature, index) => {
            const Icon = feature.icon;
            const tabConfig = text.tabs[selectedTab];
            return (
              <div
                key={index}
                className={`${tabConfig.bgColor} border ${tabConfig.borderColor} rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 group`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`${tabConfig.iconBg} rounded-lg p-2.5 sm:p-3 shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${tabConfig.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#2b2b2b] mb-1.5 sm:mb-2 text-sm sm:text-base">
                      {feature.title}
                    </h4>
                    <p className="text-[#737373] text-xs sm:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unique Features */}
        {modalData.uniqueFeatures && (
          <div className="bg-[#f5f5f5] border-2 border-[#d4d4d4] rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#e5e5e5] rounded-lg p-2.5">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#2b2b2b]" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-[#2b2b2b]">
                {modalData.uniqueFeatures.title}
              </h4>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modalData.uniqueFeatures.items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2b2b2b] shrink-0 mt-0.5" />
                  <span className="text-[#525252] text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <Button
            asChild
            size="lg"
            className={`bg-gradient-to-r ${text.tabs[selectedTab].color} ${text.tabs[selectedTab].hoverColor} text-white font-semibold shadow-lg hover:shadow-xl transition-all px-8 group`}
          >
            <Link href={`/${locale}/auth/signup`}>
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2b2b2b] mb-4">
              {text.title}
            </h2>
            <p className="text-lg sm:text-xl text-[#737373] max-w-2xl mx-auto">
              {text.subtitle}
            </p>
          </div>

          {/* Tabs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {Object.entries(text.tabs).map(([key, tab]) => {
              const Icon = tab.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleOpenModal(key)}
                  className={`group relative ${tab.bgColor} border-2 ${tab.borderColor} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1`}
                >
                  {/* Background Decoration */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${tab.color} opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-16 h-16 mx-auto mb-5 ${tab.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className={`w-8 h-8 ${tab.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-[#2b2b2b] mb-3">
                      {tab.title}
                    </h3>
                    <div className={`inline-flex items-center gap-2 text-sm font-semibold bg-linear-to-r ${tab.color} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                      {tab.buttonText}
                      <ArrowRight className={`w-4 h-4 ${tab.iconColor} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal */}
      <Dialog open={!!selectedTab} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">
              {selectedTab && text.modals[selectedTab]?.title}
            </DialogTitle>
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}
