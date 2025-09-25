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
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <Image
                src="/assets/social-networks/linkedin.svg"
                alt="LinkedIn"
                width={40}
                height={40}
                style={{
                  filter: 'brightness(0) saturate(100%) invert(100%)',
                }}
                className="hover:scale-110 transition-transform duration-200"
              />
            </Link>
            <Link
              href="https://x.com/ActaXyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <Image
                src="/assets/social-networks/x.svg"
                alt="X"
                width={40}
                height={40}
                style={{
                  filter: 'brightness(0) saturate(100%) invert(100%)',
                }}
                className="hover:scale-110 transition-transform duration-200"
              />
            </Link>
            <Link
              href="https://t.me/+ACTATeam"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <Image
                src="/assets/social-networks/telegram.svg"
                alt="Telegram"
                width={37}
                height={37}
                style={{
                  filter: 'brightness(0) saturate(100%) invert(100%)',
                }}
                className="hover:scale-110 transition-transform duration-200"
              />
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