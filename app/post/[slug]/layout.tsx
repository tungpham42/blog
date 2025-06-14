import { ReactNode } from "react";
import { Metadata } from "next";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Constants
const SITE_CONFIG = {
  name: "Tung Blog",
  baseUrl: "https://blog.soft.io.vn",
  defaultImage: {
    url: "/1200x630.jpg",
    width: 1200,
    height: 630,
    alt: "Tung Blog",
  },
  defaultDescription: "Blog của Tùng",
  locale: "en",
};

// Interfaces
interface Post {
  id: string;
  title: string;
  slug: string;
}

interface Params {
  slug: string;
}

// Error handling
class PostFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostFetchError";
  }
}

// Data fetching
async function fetchPostBySlug(slug: string): Promise<Post> {
  try {
    const postsQuery = query(
      collection(db, "posts"),
      where("slug", "==", slug)
    );

    const snapshot = await getDocs(postsQuery);

    if (snapshot.empty) {
      return {
        id: "",
        title: "Post Not Found",
        slug,
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title ?? "Untitled Post",
      slug: data.slug ?? slug,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new PostFetchError("Failed to fetch post");
  }
}

// Metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await fetchPostBySlug(slug);
    const displayTitle = `${SITE_CONFIG.name} - ${post.title}`;

    return {
      title: displayTitle,
      description: SITE_CONFIG.defaultDescription,
      openGraph: {
        title: displayTitle,
        description: `Read about ${post.title}`,
        url: `${SITE_CONFIG.baseUrl}/post/${slug}`,
        siteName: SITE_CONFIG.name,
        images: [SITE_CONFIG.defaultImage],
        locale: SITE_CONFIG.locale,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: `${SITE_CONFIG.name} - Error`,
      description: SITE_CONFIG.defaultDescription,
    };
  }
}

// The layout wrapper
export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
