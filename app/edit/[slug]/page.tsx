"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { OutputData } from "@editorjs/editorjs";
import slugify from "@/utils/slug";
import RequireAuth from "@/components/RequireAuth";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function EditPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<OutputData | null>(null);
  const [docId, setDocId] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      const q = query(collection(db, "posts"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setDocId(doc.id);
        setTitle(data.title);
        setContent(data.content);
      } else {
        alert("Post not found.");
        router.push("/");
      }
    };
    fetchPost();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return alert("Content is required.");

    const newSlug = slugify(title);
    const q = query(collection(db, "posts"), where("slug", "==", newSlug));
    const querySnapshot = await getDocs(q);
    const slugExists = querySnapshot.docs.some((doc) => doc.id !== docId);
    if (slugExists) {
      alert("A post with this title already exists.");
      return;
    }

    await updateDoc(doc(db, "posts", docId), {
      title,
      slug: newSlug,
      content,
      updatedAt: Date.now(),
    });

    router.push("/");
  };

  return (
    <RequireAuth>
      <main className="min-h-screen bg-gradient-to-bl from-gray-900 via-indigo-900 to-blue-900 text-white p-8">
        <div className="max-w-3xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-emerald-300">
            ✏️ Edit Your Post
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              className="w-full p-3 rounded bg-white/10 border border-white/20 placeholder-gray-300 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
            <div className="border border-white/20 rounded p-3">
              <EditorComponent onChange={setContent} initialData={content} />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition"
            >
              💾 Save Changes
            </button>
          </form>
        </div>
      </main>
    </RequireAuth>
  );
}
