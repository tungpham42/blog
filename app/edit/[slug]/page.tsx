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
import { Container, Form, Button, Card } from "react-bootstrap";

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
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center gradient-edit"
      >
        <Card className="w-100 card-transparent" style={{ maxWidth: "48rem" }}>
          <Card.Body className="p-5">
            <Card.Title as="h2" className="text-center mb-4 text-success">
              ✏️ Edit Your Post
            </Card.Title>
            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
                className="form-input-transparent"
              />
              <div className="editor-border p-3">
                <EditorComponent onChange={setContent} initialData={content} />
              </div>
              <Button type="submit" variant="success" className="w-100">
                💾 Save Changes
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </RequireAuth>
  );
}
