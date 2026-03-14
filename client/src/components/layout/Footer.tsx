import Link from 'next/link';
import { Home, MapPin, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              Smart Properties Malawi
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Smart Real Estate Management for Malawi — connecting tenants and property owners securely and transparently.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary/70" /> Area 6, Lilongwe, Malawi</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary/70" /> +265 999 000 000</span>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary/70" /> info@smartproperties.mw</span>
            </div>
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Facebook, href: 'https://facebook.com' },
                { Icon: Twitter, href: 'https://twitter.com' },
                { Icon: Instagram, href: 'https://instagram.com' }
              ].map(({ Icon, href }, i) => (
                <a 
                  key={i} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-5">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/properties" className="hover:text-primary transition-colors">Browse Properties</Link></li>
              <li><Link href="/properties?city=Lilongwe" className="hover:text-primary transition-colors">Lilongwe</Link></li>
              <li><Link href="/properties?city=Blantyre" className="hover:text-primary transition-colors">Blantyre</Link></li>
              <li><Link href="/properties?city=Zomba" className="hover:text-primary transition-colors">Zomba</Link></li>
              <li><Link href="/properties?city=Mangochi" className="hover:text-primary transition-colors">Mangochi</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-5">Account</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Register</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Tenant Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-5">Help</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Smart Properties Malawi. All rights reserved.</p>
          <p>Built with ❤ for the Malawian real estate market</p>
        </div>
      </div>
    </footer>
  );
}
