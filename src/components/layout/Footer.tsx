export default function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-[860px] px-6">
        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-[#ddd] to-transparent" />
        <div className="flex items-center justify-between">
          <p className="text-[0.7rem] tracking-[0.1em] text-[#bbb]">
            &copy; {new Date().getFullYear()} 庞梦桐
          </p>
          <p className="text-[0.65rem] tracking-[0.08em] text-[#ccc]">
            Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
