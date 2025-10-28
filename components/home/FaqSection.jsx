export default function FaqSection({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <section id="faq" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-linear-to-b from-white via-[#ffefd5]/20 to-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3728] mb-12 text-center">FAQ</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <details key={item.question} className="rounded-xl border-2 border-[#ffe4b5] bg-white p-6 shadow-md hover:shadow-lg transition-shadow group">
            <summary className="cursor-pointer font-bold text-[#4a3728] group-hover:text-[#fa8072] transition-colors">
              {item.question}
            </summary>
            <p className="mt-4 text-[#6b5444] leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
