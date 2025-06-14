"use client";

import { db } from "@/lib/firebase";
import { addDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { OutputData } from "@editorjs/editorjs";
import slugify from "@/utils/slug";
import RequireAuth from "@/components/RequireAuth";
import { Container, Form, Button, Card } from "react-bootstrap";

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
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center gradient-create"
      >
        <Card className="w-100" card-transparent style={{ maxWidth: "48rem" }}>
          <Card.Body className="p-5">
            <Card.Title as="h2" className="text-center mb-4 text-info">
              📝 Create Something Awesome
            </Card.Title>
            <Form
              onSubmit={handleSubmit}
              className="d-flex-column flex gap-gap-3"
            >
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  setSlug(slugify(newTitle));
                }}
                placeholder="Post Title"
                required
                className="form-input-transparent"
              />
              <Form.Control
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Slug"
                required
                className="form-input-transparent"
              />
              <div className="editor-border p-3">
                <EditorComponent onChange={setContent} />
              </div>
              <Button type="submit" variant="primary" className="w-100">
                🚀 Publish Post
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </RequireAuth>
  );
}
