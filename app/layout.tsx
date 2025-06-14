import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { ReactNode } from "react";
import { DefaultSeo } from "next-seo";
import DockMenu from "@/components/DockMenu";

<DefaultSeo
  title="Tung Blog"
  description="Blog của Tùng"
  openGraph={{
    type: "website",
    locale: "en_US",
    url: "https://blog.soft.io.vn",
    site_name: "Tung Blog",
  }}
/>;

export const metadata: Metadata = {
  title: "Tung Blog",
  description: "Blog của Tùng",
  openGraph: {
    title: "Tung Blog",
    description: "Blog của Tùng",
    url: "https://blog.soft.io.vn",
    siteName: "Tung Blog",
    images: [
      {
        url: "https://blog.soft.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Tung Blog",
      },
    ],
    locale: "en",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DockMenu />
      </body>
    </html>
  );
}
