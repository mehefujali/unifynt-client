interface SchoolData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export const getEnterpriseTemplate = (data: SchoolData) => {
  const { name, address, phone, email, logo } = data;

  // Fallback data if missing
  const schoolName = name || "International Academy";
  const schoolAddress = address || "Kolkata, West Bengal, India";
  const schoolPhone = phone || "+91 98765 43210";
  const schoolEmail = email || "admissions@school.edu";
  const schoolLogo =
    logo || "https://placehold.co/100x100/d4af37/0f172a?text=LOGO";

  return `
  <!DOCTYPE html>
  <html lang="en" class="scroll-smooth">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
      
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
      
      <script src="https://unpkg.com/lucide@latest"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
          tailwind.config = {
              theme: {
                  extend: {
                      colors: {
                          brand: {
                              900: '#0f172a', // Deep Navy
                              800: '#1e293b',
                              700: '#334155',
                              gold: '#d4af37', // Metallic Gold
                              accent: '#f59e0b',
                          }
                      },
                      fontFamily: {
                          sans: ['Inter', 'sans-serif'],
                          serif: ['Playfair Display', 'serif'],
                      }
                  }
              }
          }
      </script>

      <style>
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #f1f1f1; }
          ::-webkit-scrollbar-thumb { background: #0f172a; border-radius: 4px; }
          .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
          .img-zoom-container { overflow: hidden; }
          .img-zoom { transition: transform 0.5s ease; }
          .img-zoom-container:hover .img-zoom { transform: scale(1.05); }
      </style>
  </head>
  <body class="font-sans text-slate-600 antialiased selection:bg-brand-gold selection:text-white">

      <div class="bg-brand-900 text-white text-xs py-2 hidden md:block">
          <div class="container mx-auto px-6 flex justify-between items-center">
              <div class="flex items-center space-x-6">
                  <span class="flex items-center gap-2"><i data-lucide="map-pin" class="w-3 h-3 text-brand-gold"></i> ${schoolAddress}</span>
                  <span class="flex items-center gap-2"><i data-lucide="phone" class="w-3 h-3 text-brand-gold"></i> ${schoolPhone}</span>
              </div>
              <div class="flex items-center space-x-4">
                  <a href="#" class="hover:text-brand-gold transition">Alumni</a>
                  <a href="#" class="hover:text-brand-gold transition">Careers</a>
                  <a href="/login" class="hover:text-brand-gold transition">Portal Login</a>
              </div>
          </div>
      </div>

      <nav id="navbar" class="fixed w-full z-50 transition-all duration-300 py-4 glass border-b border-gray-100">
          <div class="container mx-auto px-6 flex justify-between items-center">
              <a href="#" class="flex items-center gap-3 group">
                   ${
                     logo
                       ? `<img src="${schoolLogo}" class="h-10 w-10 object-contain rounded"/>`
                       : `<div class="w-10 h-10 bg-brand-900 text-brand-gold flex items-center justify-center rounded font-serif text-xl font-bold shadow-lg group-hover:bg-brand-gold group-hover:text-brand-900 transition-colors">${schoolName.charAt(0)}</div>`
                   }
                  
                  <div class="flex flex-col">
                      <span class="font-serif text-xl font-bold text-brand-900 leading-none tracking-tight">${schoolName}</span>
                      <span class="text-[10px] tracking-[0.2em] text-slate-500 uppercase">Excellence in Education</span>
                  </div>
              </a>

              <div class="hidden md:flex items-center space-x-8 text-sm font-medium text-brand-900">
                  <a href="#about" class="hover:text-brand-gold transition relative group">About</a>
                  <a href="#academics" class="hover:text-brand-gold transition relative group">Academics</a>
                  <a href="#campus" class="hover:text-brand-gold transition relative group">Campus Life</a>
                  <a href="#admissions" class="hover:text-brand-gold transition relative group">Admissions</a>
              </div>

              <div class="hidden md:block">
                  <a href="#apply" class="px-6 py-2.5 bg-brand-900 text-white text-sm font-medium rounded hover:bg-brand-gold hover:text-brand-900 transition-all shadow-lg">Apply Now</a>
              </div>
          </div>
      </nav>

      <section class="relative h-screen flex items-center justify-center overflow-hidden">
          <div class="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Campus" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/70 to-transparent"></div>
          </div>

          <div class="container mx-auto px-6 relative z-10 pt-20">
              <div class="max-w-3xl" data-aos="fade-up" data-aos-duration="1000">
                  <div class="flex items-center gap-3 mb-6">
                      <div class="h-0.5 w-12 bg-brand-gold"></div>
                      <span class="text-brand-gold font-medium tracking-wider uppercase text-sm">Est. 1985 • Excellence in Education</span>
                  </div>
                  <h1 class="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                      Empowering the <br>
                      <span class="italic text-brand-gold">Leaders of Tomorrow</span>
                  </h1>
                  <p class="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl">
                      ${schoolName} fosters intellectual curiosity and personal growth through a rigorous curriculum and a supportive community.
                  </p>
                  <div class="flex flex-col sm:flex-row gap-4">
                      <button class="px-8 py-4 bg-brand-gold text-brand-900 font-bold rounded hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2">
                          Explore Academics <i data-lucide="arrow-right" class="w-4 h-4"></i>
                      </button>
                  </div>
              </div>
          </div>
      </section>

      <div class="relative z-20 -mt-16 container mx-auto px-6">
          <div class="bg-white rounded-lg shadow-2xl shadow-brand-900/10 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
              <div class="text-center group" data-aos="fade-up" data-aos-delay="0">
                  <h3 class="font-serif text-4xl font-bold text-brand-900 mb-1">100%</h3>
                  <p class="text-xs uppercase tracking-widest text-slate-500">Board Results</p>
              </div>
              <div class="text-center group" data-aos="fade-up" data-aos-delay="100">
                  <h3 class="font-serif text-4xl font-bold text-brand-900 mb-1">45+</h3>
                  <p class="text-xs uppercase tracking-widest text-slate-500">Years of Legacy</p>
              </div>
              <div class="text-center group" data-aos="fade-up" data-aos-delay="200">
                  <h3 class="font-serif text-4xl font-bold text-brand-900 mb-1">12:1</h3>
                  <p class="text-xs uppercase tracking-widest text-slate-500">Student-Teacher Ratio</p>
              </div>
              <div class="text-center group" data-aos="fade-up" data-aos-delay="300">
                  <h3 class="font-serif text-4xl font-bold text-brand-900 mb-1">25+</h3>
                  <p class="text-xs uppercase tracking-widest text-slate-500">Sports Facilities</p>
              </div>
          </div>
      </div>

      <section id="about" class="py-24 bg-slate-50">
          <div class="container mx-auto px-6">
              <div class="flex flex-col lg:flex-row items-center gap-16">
                  <div class="w-full lg:w-1/2 relative">
                      <div class="grid grid-cols-2 gap-4">
                          <div class="space-y-4 mt-8">
                              <img src="https://images.unsplash.com/photo-1577896334614-2c5e5339d220?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" class="rounded-lg shadow-lg w-full h-64 object-cover img-zoom-container" alt="Library">
                              <div class="bg-brand-900 p-6 rounded-lg text-white text-center">
                                  <span class="block text-4xl font-serif font-bold text-brand-gold mb-2">A+</span>
                                  <span class="text-sm opacity-80">Accredited</span>
                              </div>
                          </div>
                          <div class="space-y-4">
                              <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center h-40">
                                  <i data-lucide="award" class="w-10 h-10 text-brand-gold mb-2"></i>
                                  <span class="font-serif font-bold text-brand-900">Top Ranked</span>
                              </div>
                              <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" class="rounded-lg shadow-lg w-full h-72 object-cover" alt="Classroom">
                          </div>
                      </div>
                  </div>

                  <div class="w-full lg:w-1/2" data-aos="fade-left">
                      <h4 class="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2">Welcome to ${schoolName}</h4>
                      <h2 class="font-serif text-4xl md:text-5xl font-bold text-brand-900 mb-6">A Tradition of <br>Academic Innovation</h2>
                      <p class="text-slate-600 mb-6 leading-relaxed">
                          At ${schoolName}, we believe education is not just about filling a bucket, but lighting a fire. Since our inception, we have blended rich cultural heritage with modern pedagogical methods.
                      </p>
                      
                      <div class="flex items-center gap-4">
                           <div class="w-16 h-16 rounded-full bg-slate-200 border-2 border-brand-gold flex items-center justify-center text-2xl">🎓</div>
                          <div>
                              <p class="font-serif text-lg font-bold text-brand-900">Principal's Desk</p>
                              <p class="text-sm text-slate-500">Leading with Vision</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section id="academics" class="py-24 bg-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -z-0"></div>
          <div class="container mx-auto px-6 relative z-10">
              <div class="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                  <h4 class="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2">Our Curriculum</h4>
                  <h2 class="font-serif text-4xl font-bold text-brand-900">Pathways to Success</h2>
                  <div class="w-20 h-1 bg-brand-gold mx-auto mt-6"></div>
              </div>
              <div class="grid md:grid-cols-3 gap-8">
                  <div class="bg-white border border-gray-100 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all" data-aos="fade-up">
                      <div class="w-14 h-14 bg-brand-900 rounded-full flex items-center justify-center text-white mb-6">
                          <i data-lucide="book-open" class="w-6 h-6"></i>
                      </div>
                      <h3 class="font-serif text-2xl font-bold text-brand-900 mb-3">Primary Years</h3>
                      <p class="text-slate-600 mb-6 text-sm">Foundational literacy and curiosity-driven learning.</p>
                  </div>
                   <div class="bg-brand-900 p-8 rounded-xl shadow-xl transform scale-105" data-aos="fade-up" data-aos-delay="100">
                      <div class="w-14 h-14 bg-brand-gold rounded-full flex items-center justify-center text-brand-900 mb-6">
                          <i data-lucide="microscope" class="w-6 h-6"></i>
                      </div>
                      <h3 class="font-serif text-2xl font-bold text-white mb-3">Secondary School</h3>
                      <p class="text-slate-300 mb-6 text-sm">Rigorous curriculum with emphasis on STEM and critical thinking.</p>
                  </div>
                   <div class="bg-white border border-gray-100 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all" data-aos="fade-up" data-aos-delay="200">
                      <div class="w-14 h-14 bg-brand-900 rounded-full flex items-center justify-center text-white mb-6">
                          <i data-lucide="graduation-cap" class="w-6 h-6"></i>
                      </div>
                      <h3 class="font-serif text-2xl font-bold text-brand-900 mb-3">Higher Secondary</h3>
                      <p class="text-slate-600 mb-6 text-sm">Specialized streams preparing for competitive excellence.</p>
                  </div>
              </div>
          </div>
      </section>

      <footer class="bg-brand-900 text-white pt-20 pb-10">
          <div class="container mx-auto px-6">
              <div class="grid md:grid-cols-4 gap-12 mb-16">
                  <div>
                      <div class="flex items-center gap-3 mb-6">
                          <span class="font-serif text-xl font-bold">${schoolName}</span>
                      </div>
                      <p class="text-slate-400 text-sm leading-relaxed mb-6">
                          Nurturing young minds to think, create, and lead with integrity and purpose.
                      </p>
                  </div>
                  
                  <div>
                      <h4 class="font-serif text-lg font-bold mb-6 text-brand-gold">Contact Us</h4>
                      <ul class="space-y-4 text-slate-400 text-sm">
                          <li class="flex items-start gap-3">
                              <i data-lucide="map-pin" class="w-5 h-5 text-brand-gold mt-1 shrink-0"></i>
                              <span>${schoolAddress}</span>
                          </li>
                          <li class="flex items-center gap-3">
                              <i data-lucide="phone" class="w-5 h-5 text-brand-gold shrink-0"></i>
                              <span>${schoolPhone}</span>
                          </li>
                          <li class="flex items-center gap-3">
                              <i data-lucide="mail" class="w-5 h-5 text-brand-gold shrink-0"></i>
                              <span>${schoolEmail}</span>
                          </li>
                      </ul>
                  </div>
              </div>
              <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                  <p>&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.</p>
              </div>
          </div>
      </footer>

      <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
      <script>
          lucide.createIcons();
          AOS.init({ once: true, offset: 100, duration: 800 });
      </script>
  </body>
  </html>
  `;
};
