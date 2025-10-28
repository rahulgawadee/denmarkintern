# Professional Homepage Styling Guide

## ✅ Completed Updates

### 1. Global Styles (`app/globals.css`)
- ✅ Hidden scrollbar (Chrome, Safari, Firefox, Edge)
- ✅ Professional color palette (blue shades instead of zinc)
- ✅ Clean shadows and spacing
- ✅ Typography scale with proper font sizing
- ✅ Smooth transitions

### 2. Header (`components/home/HomeHeader.jsx`)
- ✅ Clean navigation with hover states
- ✅ Professional logo with gradient
- ✅ Responsive design (mobile-friendly)

### 3. Hero Section (`components/home/HeroSection.jsx`)
- ✅ Larger, bolder headings
- ✅ Gradient background
- ✅ Better button spacing
- ✅ Responsive layout

### 4. Page Wrapper (`app/[locale]/page.jsx`)
- ✅ Clean background
- ✅ Proper antialiasing

## 🔧 Remaining Manual Updates

### Update ValuePropsSection.jsx

Replace the entire content with:

\`\`\`jsx
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function ValuePropsSection({ locale, valueProps }) {
  if (!valueProps?.length) {
    return null;
  }

  const heading = locale === 'da' ? 'Værdien for jer' : 'How we help';
  const intro =
    locale === 'da'
      ? 'Det handler om effektive match, tydelig forventningsafstemning og et flow, der sparer jer tid.'
      : 'It's all about focused matches, crisp expectations, and a flow that saves your team time.';

  return (
    <section id="how-we-help" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-slate-50/50">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{heading}</h2>
        <p className="text-lg text-slate-600 leading-relaxed">{intro}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {valueProps.map((item) => (
          <Card key={item.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-slate-900 mb-2">{item.title}</CardTitle>
                  <CardDescription className="text-slate-600 leading-relaxed">{item.description}</CardDescription>
                </div>
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
\`\`\`

### Update StorySection.jsx

Replace content with:

\`\`\`jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StorySection({ locale, story }) {
  if (!story) {
    return null;
  }

  const heading = locale === 'da' ? 'Historien' : 'The story';
  const sections = [story.challenge, story.bridge, story.outcome].filter(Boolean);

  return (
    <section id="story" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-12">{heading}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {sections.map((item, idx) => (
            <Card key={item.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                    {idx + 1}
                  </span>
                  <CardTitle className="text-xl font-semibold text-slate-900">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-slate-600 leading-relaxed pt-6">{item.copy}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
\`\`\`

### Update ProcessSection.jsx

Replace content with:

\`\`\`jsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarCheck } from 'lucide-react';

export default function ProcessSection({ locale, process }) {
  if (!process) {
    return null;
  }

  const heading = locale === 'da' ? 'Sådan fungerer det' : 'How it works';
  const intro =
    locale === 'da'
      ? 'Kort, fokuseret proces fra behov til shortlist. Vi står ved jeres side hele vejen.'
      : 'A short, focused process from brief to shortlist. We stay close throughout.';

  return (
    <section id="process" className="bg-gradient-to-b from-blue-950 to-blue-900 py-20 sm:py-24 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{heading}</h2>
          <p className="text-lg text-blue-100 leading-relaxed">{intro}</p>
          <Button asChild className="mt-6 bg-white text-blue-900 hover:bg-blue-50 shadow-lg">
            <Link href={`/${locale}/auth/signup/company`}>
              <CalendarCheck className="mr-2 h-5 w-5" />
              {process.cta}
            </Link>
          </Button>
        </div>
        <div className="space-y-8 max-w-3xl mx-auto">
          {process.steps?.map((step, index) => (
            <div key={step.title} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-blue-400 bg-blue-900/40 text-lg font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-blue-100 leading-relaxed">{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
\`\`\`

### Update HomeFooter.jsx

Replace content with:

\`\`\`jsx
export default function HomeFooter({ footer }) {
  if (!footer) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-base font-semibold text-slate-900 mb-2">{footer.legal}</p>
            <p className="text-sm text-slate-600 mb-1">{footer.address}</p>
            <a href={\`mailto:\${footer.email}\`} className="text-sm text-blue-600 hover:text-blue-700">
              {footer.email}
            </a>
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {footer.links?.map((link) => (
                <a key={link} href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 text-center">{footer.copy}</p>
        </div>
      </div>
    </footer>
  );
}
\`\`\`

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All sections use:
- `px-4 sm:px-6 lg:px-8` for consistent horizontal padding
- `py-20 sm:py-24` for vertical spacing
- `max-w-6xl` for content width

## 🎨 Color Palette

- Primary: Blue (600-700)
- Text: Slate (900, 700, 600)
- Background: White / Slate-50
- Borders: Slate-200
- Hover: Slate-100

## 🔤 Typography

- Headings: Font-bold, tracking-tight
- Body: Font-normal, leading-relaxed
- Small: Font-medium for emphasis

## ✨ Key Features

1. **Hidden Scrollbar**: Applied globally via CSS
2. **Smooth Transitions**: All interactive elements
3. **Professional Shadows**: Subtle, layered
4. **Responsive Grid**: Mobile-first approach
5. **Clean Spacing**: Consistent padding/margins
