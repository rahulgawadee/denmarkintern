export default function HomeFooter({ footer }) {
  if (!footer) {
    return null;
  }

  return (
    <footer className="border-t-2 border-[#ffe4b5] bg-linear-to-b from-white to-[#ffefd5]/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-base font-bold text-[#4a3728] mb-2">{footer.legal}</p>
            <p className="text-sm text-[#6b5444] mb-1">{footer.address}</p>
            <a href={`mailto:${footer.email}`} className="text-sm text-[#fa8072] hover:text-[#ffa07a] font-medium transition-colors">
              {footer.email}
            </a>
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {footer.links?.map((link) => (
                <a key={link} href="#" className="text-[#6b5444] hover:text-[#fa8072] transition-colors font-medium">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t-2 border-[#ffe4b5]">
          <p className="text-sm text-[#8b7355] text-center">{footer.copy}</p>
        </div>
      </div>
    </footer>
  );
}
