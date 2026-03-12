/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  content: any;
  theme: any;
}

export function ModernTemplate({ content, theme }: Props) {
  const { heroSection, aboutSection, contactSection } = content;
  
  return (
    <div 
      className="min-h-screen flex flex-col w-full"
      style={{
        '--primary': theme?.primaryColor || '#2563EB',
        '--secondary': theme?.secondaryColor || '#1E40AF',
        fontFamily: theme?.fontFamily || 'Inter, sans-serif',
      } as React.CSSProperties}
    >
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {heroSection?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroSection.logo} alt="Logo" className="h-12 w-auto" />
            ) : (
              <div className="h-10 w-10 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">{heroSection?.schoolName || "Our School"}</h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#" className="font-semibold text-gray-600 hover:text-[var(--primary)] transition">Home</Link>
            <Link href="#about" className="font-semibold text-gray-600 hover:text-[var(--primary)] transition">About Us</Link>
            <Link href="#contact" className="font-semibold text-gray-600 hover:text-[var(--primary)] transition">Contact</Link>
          </nav>
          <Link href="/admission" className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition shadow-md">
            Apply Now
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-[var(--primary)] text-white py-24 md:py-32 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-4xl mx-auto relative z-10 space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {heroSection?.title || "Empowering the Future Generation"}
            </h1>
            <p className="text-lg md:text-xl text-blue-50/90 max-w-2xl mx-auto font-medium">
              {heroSection?.subtitle || "A community of lifelong learners, responsible global citizens, and champions of our own success."}
            </p>
            <div className="pt-8">
              <Link href="/admission" className="inline-flex items-center justify-center bg-white text-[var(--primary)] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition shadow-xl">
                Start Admission Process <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-[var(--primary)] pl-5">
                {aboutSection?.title || "About Us"}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {aboutSection?.description || "We are dedicated to providing the best learning environment. Our school focuses on holistic development, academic excellence, and extracurricular activities to prepare students for the modern world."}
              </p>
            </div>
            <div className="bg-gray-100 rounded-3xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300">
               <span className="text-gray-400 font-medium">School Campus Image</span>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 border-t">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Contact Information</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-5 hover:shadow-md transition">
                <div className="mx-auto w-14 h-14 bg-blue-50/50 rounded-full flex items-center justify-center text-[var(--primary)]">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Phone</h3>
                <p className="text-gray-600">{contactSection?.phone || "Not provided"}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-5 hover:shadow-md transition">
                <div className="mx-auto w-14 h-14 bg-blue-50/50 rounded-full flex items-center justify-center text-[var(--primary)]">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Email</h3>
                <p className="text-gray-600">{contactSection?.email || "Not provided"}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-5 hover:shadow-md transition">
                <div className="mx-auto w-14 h-14 bg-blue-50/50 rounded-full flex items-center justify-center text-[var(--primary)]">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Address</h3>
                <p className="text-gray-600">{contactSection?.address || "Not provided"}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 text-gray-400 py-12 text-center border-t border-gray-900">
        <p>&copy; {new Date().getFullYear()} {heroSection?.schoolName || "Our School"}. All rights reserved.</p>
        <p className="text-sm mt-3 opacity-50 flex items-center justify-center gap-1">
          Powered by <span className="font-bold text-white tracking-wider">UNIFYNT</span>
        </p>
      </footer>
    </div>
  );
}