import { Card, CardContent } from '@/components/ui/card';

export default function SocialProofSection({ testimonials, heading }) {
  if (!testimonials?.length) {
    return null;
  }

  return (
    <section className="bg-[#fdf5e6] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] mb-12">{heading ?? 'Social proof'}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((item) => (
            <Card key={item.quote} className="border-2 border-[#ffe4b5] shadow-md hover:shadow-xl transition-all bg-white">
              <CardContent className="space-y-4 pt-6">
                <p className="text-lg text-[#4a3728] leading-relaxed italic">"{item.quote}"</p>
                <p className="text-sm font-semibold text-[#fa8072]">— {item.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
