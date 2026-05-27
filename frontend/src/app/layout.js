import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  title: "HAQMS - Elegant Wellness & Health",
  description: "Modern Health Clinic Queue and Scheduling application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-[#FDF8F0] text-[#3D4532]`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
