export default function Footer() {
    return (
      <footer className="bg-[#111111] text-gray-400 px-16 py-20">
  
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-12">
  
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500 rounded-md mb-6"></div>
          </div>
  
          {/* Company */}
          <div>
            <h4 className="text-white font-medium mb-6">Company</h4>
            <ul className="space-y-4">
              <li>Careers</li>
              <li>Press & media</li>
              <li>Enterprise</li>
              <li>Security</li>
              <li>Trust center</li>
              <li>Partnerships</li>
            </ul>
          </div>
  
          {/* Product */}
          <div>
            <h4 className="text-white font-medium mb-6">Product</h4>
            <ul className="space-y-4">
              <li>Pricing</li>
              <li>Student discount</li>
              <li>Founders</li>
              <li>Product Managers</li>
              <li>Designers</li>
              <li>Marketers</li>
              <li>Sales</li>
              <li>Ops</li>
              <li>People</li>
              <li>Prototyping</li>
              <li>Internal Tools</li>
              <li>Connections</li>
              <li>Changelog</li>
              <li>Status</li>
            </ul>
          </div>
  
          {/* Resources */}
          <div>
            <h4 className="text-white font-medium mb-6">Resources</h4>
            <ul className="space-y-4">
              <li>Learn</li>
              <li>Templates</li>
              <li>Guides</li>
              <li>Videos</li>
              <li>Blog</li>
              <li>Support</li>
            </ul>
          </div>
  
          {/* Legal */}
          <div>
            <h4 className="text-white font-medium mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>Privacy policy</li>
              <li>Cookie settings</li>
              <li>Terms of Service</li>
              <li>Platform rules</li>
              <li>Report abuse</li>
              <li>Report security concerns</li>
              <li>DPA</li>
            </ul>
          </div>
  
          {/* Community */}
          <div>
            <h4 className="text-white font-medium mb-6">Community</h4>
            <ul className="space-y-4">
              <li>Apply to our expert program</li>
              <li>Hire a Voyager expert</li>
              <li>Affiliates</li>
              <li>Code of conduct</li>
              <li>Discord</li>
              <li>Reddit</li>
              <li>X / Twitter</li>
              <li>YouTube</li>
              <li>LinkedIn</li>
            </ul>
          </div>
  
        </div>
  
        {/* Bottom Language Selector */}
        <div className="max-w-7xl mx-auto mt-16 text-sm text-gray-500">
          EN
        </div>
  
      </footer>
    );
  }