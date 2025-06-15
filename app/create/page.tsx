"use client";

import { db } from "@/lib/firebase";
import { addDoc, query, collection, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { OutputData } from "@editorjs/editorjs";
import slugify from "@/utils/slug";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import RequireAuthAdmin from "@/components/RequireAuthAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faRocket } from "@fortawesome/free-solid-svg-icons";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState<OutputData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      setError("Please write some content.");
      return;
    }

    const postsRef = collection(db, "posts");
    const slugQuery = query(postsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(slugQuery);
    if (!querySnapshot.empty) {
      setError("Slug already exists. Choose another title.");
      return;
    }

    try {
      await addDoc(postsRef, {
        title,
        slug,
        content,
        createdAt: Date.now(),
      });
      setError(null);
      router.push(`/post/${slug}`);
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post.");
    }
  };

  return (
    <RequireAuthAdmin>
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center my-5"
      >
        <Card
          className="w-100 liquid-glass-card gradient-create"
          style={{ maxWidth: "48rem" }}
        >
          <Card.Body className="p-4">
            <Card.Title as="h2" className="text-center mb-4">
              <FontAwesomeIcon icon={faPencilAlt} className="me-2" /> Create
              Something Awesome
            </Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
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
                className="mt-0 form-input-transparent"
              />
              <div className="editor-border mt-0 p-4">
                <EditorComponent onChange={setContent} />
              </div>
              <Button type="submit" variant="primary" className="mt-0 w-100">
                <FontAwesomeIcon icon={faRocket} className="me-2" /> Publish
                Post
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </RequireAuthAdmin>
  );
}
