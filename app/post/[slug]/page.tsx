"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Post } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Container, Card, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

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
        <div className="spinner-liquid-glass mx-auto"></div>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="mt-5" style={{ maxWidth: "32rem" }}>
        <Alert variant="danger" className="liquid-glass-card">
          Post not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="min-vh-100 py-5 my-5">
      <Container className="py-5" style={{ maxWidth: "64rem" }}>
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">{post.title}</h1>
          <p
            className="text-muted"
            style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)" }}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            {new Date(post.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <Card className="liquid-glass-card gradient-post">
          <Card.Body className="p-5">
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
