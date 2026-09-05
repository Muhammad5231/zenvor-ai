import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZENVOR AI",
  description: "Local Autonomous Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('zenvor-theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#ffffff] dark:bg-[#18181a] text-[#18181b] dark:text-[#d1d2d6] antialiased">
        {children}
      </body>
    </html>
  );
}