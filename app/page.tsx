"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Post } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("🚨 Oops! Something went wrong. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-fade-in">
          🚀 TechyTalks
        </h1>

        {loading && (
          <div className="flex justify-center mt-10">
            <div className="loader border-t-4 border-blue-500 w-10 h-10 rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white rounded p-4 text-center mt-4">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-gray-300 mt-6">😢 No posts found.</p>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`}>
                <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-xl transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                  <h2 className="text-xl font-semibold text-pink-300 hover:underline">
                    {post.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
