/**
 * Footer component for the application
 */
export function Footer() {
  

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
           © 2026. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}