"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Post } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const snapshot = await getDocs(collection(db, "posts"));
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      const matchedPost = posts.find((p) => p.slug === slug) || null;
      setPost(matchedPost);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="mt-20 text-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"
          role="status"
        />
        <div className="mt-2 text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mt-20 mx-auto max-w-xl px-4">
        <div className="rounded-md bg-red-100 p-4 text-red-800 border border-red-400">
          Post not found.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-800 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-teal-300 mb-2">
            {post.title}
          </h1>
          <p className="text-sm text-gray-400">
            📅 {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 backdrop-blur p-6 rounded-xl">
          <EditorComponent
            readOnly
            initialData={
              typeof post.content === "string"
                ? JSON.parse(post.content)
                : post.content
            }
          />
        </div>
      </div>
    </main>
  );
}
