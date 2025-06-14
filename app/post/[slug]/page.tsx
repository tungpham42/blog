"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Post } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Container, Card, Spinner, Alert } from "react-bootstrap";

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
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2 text-muted">Loading...</div>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="mt-5" style={{ maxWidth: "32rem" }}>
        <Alert variant="danger">Post not found.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="min-vh-100 py-5 gradient-post">
      <Container className="py-5" style={{ maxWidth: "64rem" }}>
        <div className="text-center mb-4">
          <h1 className="display-4 fw-bold text-info mb-2">{post.title}</h1>
          <p className="text-muted">
            📅 {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Card className="card-transparent">
          <Card.Body className="p-4">
            <EditorComponent
              readOnly
              initialData={
                typeof post.content === "string"
                  ? JSON.parse(post.content)
                  : post.content
              }
            />
          </Card.Body>
        </Card>
      </Container>
    </Container>
  );
}
