import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StorySection({ locale, story }) {
  if (!story) {
    return null;
  }

  const heading = locale === 'da' ? 'Historien' : 'The story';
  const sections = [story.challenge, story.bridge, story.outcome].filter(Boolean);

  return (
    <section id="story" className="py-20 sm:py-24 bg-[#fdf5e6]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] text-center mb-12">{heading}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {sections.map((item) => (
            <Card key={item.title} className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-all hover:scale-105 bg-white group">
              <CardHeader className="border-b-2 border-[#ffefd5] bg-[#ffefd5]/40">
                <CardTitle className="text-xl font-bold text-[#4a3728] group-hover:text-[#fa8072] transition-colors">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-[#6b5444] leading-relaxed pt-6">{item.copy}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
