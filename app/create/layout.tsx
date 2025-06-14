import type { Metadata } from "next";
import { ReactNode } from "react";
import { DefaultSeo } from "next-seo";

<DefaultSeo
  title="Tung Blog - Create Post"
  description="Blog của Tùng"
  openGraph={{
    type: "website",
    locale: "en_US",
    url: "https://blog.soft.io.vn/create",
    site_name: "Tung Blog",
  }}
/>;

export const metadata: Metadata = {
  title: "Tung Blog - Create Post",
  description: "Blog của Tùng",
  openGraph: {
    title: "Tung Blog- Create Post",
    description: "Blog của Tùng",
    url: "https://blog.soft.io.vn/create",
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

export default function CreatePostLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
