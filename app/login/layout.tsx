import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tung Blog - Login",
  description: "Blog của Tùng",
  openGraph: {
    title: "Tung Blog - Login",
    description: "Blog của Tùng",
    url: "https://blog.soft.io.vn/login",
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

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
