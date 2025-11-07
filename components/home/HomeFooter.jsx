export default function HomeFooter({ footer }) {
  if (!footer) {
    return null;
  }

  return (
    <footer className="border-t-2 border-[#d4d4d4] bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-base font-bold text-[#2b2b2b] mb-2">{footer.legal}</p>
            <p className="text-sm text-[#737373] mb-1">{footer.address}</p>
            <a href={`mailto:${footer.email}`} className="text-sm text-[#2b2b2b] hover:text-[#525252] font-medium transition-colors">
              {footer.email}
            </a>
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {footer.links?.map((link) => (
                <a key={link} href="#" className="text-[#737373] hover:text-[#2b2b2b] transition-colors font-medium">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t-2 border-[#d4d4d4]">
          <p className="text-sm text-[#737373] text-center">{footer.copy}</p>
        </div>
      </div>
    </footer>
  );
}
