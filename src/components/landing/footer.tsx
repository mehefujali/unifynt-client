/* eslint-disable @next/next/no-img-element */
export const LandingFooter = () => {
    return (
        <footer className="bg-zinc-950 text-white pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 pb-24 border-b border-zinc-800">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <img src="/unifynt-logo.png" alt="Unifynt" className="h-10 w-auto brightness-0 invert" />
                            <span className="text-2xl font-bold tracking-tight">Unifynt</span>
                        </div>
                        <p className="text-zinc-500 font-light max-w-sm">
                            The ultimate operating system for modern educational institutions. Bridging the gap between technology and learning.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-100 mb-6">Product</h4>
                        <div className="flex flex-col gap-4 text-zinc-500 font-medium">
                            <a href="#" className="hover:text-white transition-colors">Features</a>
                            <a href="#" className="hover:text-white transition-colors">Integrations</a>
                            <a href="#" className="hover:text-white transition-colors">Pricing</a>
                            <a href="#" className="hover:text-white transition-colors">Changelog</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-100 mb-6">Resources</h4>
                        <div className="flex flex-col gap-4 text-zinc-500 font-medium">
                            <a href="#" className="hover:text-white transition-colors">Help Center</a>
                            <a href="#" className="hover:text-white transition-colors">API Documentation</a>
                            <a href="#" className="hover:text-white transition-colors">Community</a>
                            <a href="#" className="hover:text-white transition-colors">System Status</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-zinc-100 mb-6">Company</h4>
                        <div className="flex flex-col gap-4 text-zinc-500 font-medium">
                            <a href="#" className="hover:text-white transition-colors">About Us</a>
                            <a href="#" className="hover:text-white transition-colors">Careers</a>
                            <a href="#" className="hover:text-white transition-colors">Blog</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-sm font-medium">
                    <p>© {new Date().getFullYear()} Unifynt Inc. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
