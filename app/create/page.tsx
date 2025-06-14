"use client";

import { db } from "@/lib/firebase";
import { addDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { OutputData } from "@editorjs/editorjs";
import slugify from "@/utils/slug";
import RequireAuth from "@/components/RequireAuth";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState<OutputData | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return alert("Please write some content.");

    const postsRef = collection(db, "posts");
    const slugQuery = query(postsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(slugQuery);
    if (!querySnapshot.empty) {
      alert("❗ Slug already exists. Choose another title.");
      return;
    }

    await addDoc(postsRef, {
      title,
      slug,
      content,
      createdAt: Date.now(),
    });
    router.push("/");
  };

  return (
    <RequireAuth>
      <main className="min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-violet-600 text-white p-8">
        <div className="max-w-3xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-300">
            📝 Create Something Awesome
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              className="w-full p-3 rounded bg-white/10 border border-white/20 placeholder-gray-300 focus:outline-none"
              value={title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTitle(newTitle);
                setSlug(slugify(newTitle));
              }}
              placeholder="Post Title"
              required
            />
            <input
              className="w-full p-3 rounded bg-white/10 border border-white/20 placeholder-gray-300 focus:outline-none"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Slug"
              required
            />
            <div className="border border-white/20 rounded p-3">
              <EditorComponent onChange={setContent} />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded transition"
            >
              🚀 Publish Post
            </button>
          </form>
        </div>
      </main>
    </RequireAuth>
  );
}
