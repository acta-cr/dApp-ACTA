"use client";

import Link from "next/link";
import Image from "next/image";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto flex flex-col bg-transparent text-gray-800 dark:text-gray-300 py-12 px-8 md:px-12 lg:px-16 border-t"
      style={{ borderColor: "#F0E7CC" }}
    >
      <div className="container mx-auto flex flex-wrap justify-between items-start gap-8 max-w-7xl">
        {/* Logo Section */}
        <div className="flex items-center">
          <Image src="/logo.png" alt="ACTA" width={100} height={100} />
        </div>

        {/* Contact Information */}
        <div className="flex flex-col gap-1">
          <h4
            className="font-semibold text-base mb-2"
            style={{ color: "#F0E7CC" }}
          >
            Contact
          </h4>
          <p className="text-sm text-white">
            Email:{" "}
            <Link
              href="mailto:acta.xyz@gmail.com"
              className="hover:underline text-white"
            >
              acta.xyz@gmail.com
            </Link>
          </p>
          <p className="text-sm text-white">
            Website:{" "}
            <Link
              href="https://acta-web.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white"
            >
              acta-web.vercel.app
            </Link>
          </p>
          <p className="text-sm text-white">
            Documentation:{" "}
            <Link
              href="https://acta.gitbook.io/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white"
            >
              acta.gitbook.io/docs
            </Link>
          </p>
          <p className="text-sm text-white">
            GitHub:{" "}
            <Link
              href="https://github.com/ACTA-Team"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-white"
            >
              github.com/ACTA-Team
            </Link>
          </p>
        </div>

        {/* Team Members */}
        <div>
          <h4
            className="font-semibold text-base mb-1"
            style={{ color: "#F0E7CC" }}
          >
            Team Members
          </h4>
          <ul className="text-sm text-white">
            <li>
              <Link
                href="https://www.linkedin.com/in/josue-brenes/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                Josué Brenes
              </Link>
            </li>
            <li>
              <Link
                href="https://www.linkedin.com/in/menasebastian/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                Sebas Mena
              </Link>
            </li>
            <li>
              <Link
                href="https://www.linkedin.com/in/daniel-coto-jimenez/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-white"
              >
                Daniel Coto
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Networks */}
        <div>
          <h4
            className="font-semibold text-base mb-1 text-center"
            style={{ color: "#F0E7CC" }}
          >
            Social
          </h4>
          <div className="flex space-x-4">
            <Link
              href="https://www.linkedin.com/company/acta-org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Link>
            <Link
              href="https://x.com/ActaXyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link
              href="https://t.me/+ACTATeam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p
        className="mt-8 text-center pt-6 border-t text-sm text-white"
        style={{ borderColor: "#F0E7CC" }}
      >
        © {currentYear} ACTA Team. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
