import React from 'react';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/uiu_logo.png" 
                alt="UIU Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold">UIUSPRS</h3>
                <p className="text-gray-400">Student Problem Reporting System</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Empowering UIU students to report and track campus-related issues efficiently. 
              Our system ensures swift resolution and improved campus services.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">Report Issue</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">Track Status</a></li>
              <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <span className="text-gray-300">+880-2-8991011</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <span className="text-gray-300">info@uiu.ac.bd</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-500 mt-1" />
                <span className="text-gray-300">
                  United City, Madani Avenue<br />
                  Badda, Dhaka 1212, Bangladesh
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 United International University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;