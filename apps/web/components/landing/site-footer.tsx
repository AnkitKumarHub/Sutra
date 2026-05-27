import Link from "next/link";
import { Sparkles, Github, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-sutra-teal/5 py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-sutra-mustard" />
              <span className="text-xl font-bold tracking-tight text-sutra-teal font-display">
                Sutra
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sutra-teal/60 font-body">
              Build, ship, and analyze beautiful forms in minutes. 
              The minimalist professional form builder designed for growing teams and indie makers.
            </p>
            <div className="mt-6 flex items-center gap-4 text-sutra-teal/40">
              <Link href="#" className="hover:text-sutra-teal transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-sutra-teal transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-sutra-teal font-display mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Features</Link></li>
              <li><Link href="/templates" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Templates</Link></li>
              <li><Link href="/explore" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Explore</Link></li>
              <li><Link href="#pricing" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-sutra-teal font-display mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/docs" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Documentation</Link></li>
              <li><Link href="/api" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">API Reference</Link></li>
              <li><Link href="#" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Help Center</Link></li>
              <li><Link href="#" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Community</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-sutra-teal font-display mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">About</Link></li>
              <li><Link href="#" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Blog</Link></li>
              <li><Link href="#" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-sutra-teal/60 hover:text-sutra-teal transition-colors font-body">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-sutra-teal/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sutra-teal/40 font-body">
            &copy; {new Date().getFullYear()} Sutra Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-sutra-teal/60 font-body">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
