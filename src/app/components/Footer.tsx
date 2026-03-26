import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { BrandLogo } from './BrandLogo';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="inline-flex mb-4">
              <BrandLogo padded imageClassName="h-8 sm:h-9" />
            </Link>
            <p className="text-sm mb-4">Your trusted partner for oil & gas equipment rental solutions.</p>
            <div className="flex gap-3">
              <Link to="/contact?intent=sales" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition">f</Link>
              <Link to="/contact?intent=sales" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition">in</Link>
              <Link to="/contact?intent=sales" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition">x</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-orange-400 transition">Home</Link></li>
              <li><Link to="/products" className="hover:text-orange-400 transition">Equipment Catalog</Link></li>
              <li><Link to="/services" className="hover:text-orange-400 transition">Services</Link></li>
              <li><Link to="/become-a-supplier" className="hover:text-orange-400 transition">Become a Supplier</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help-center" className="hover:text-orange-400 transition">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-orange-400 transition">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-orange-400 transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-400 transition">Privacy Policy</Link></li>
              <li><Link to="/contact?intent=support" className="hover:text-orange-400 transition">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>off SHELL UMUEBULU FLOWSTATION, UMUEBULU 4, Port-Harcourt 500101, Rivers</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+(234)7068841116</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>rentals@oilmartpro.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2026 Oil Mart Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
