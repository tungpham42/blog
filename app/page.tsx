"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Post } from "@/lib/types";
import Link from "next/link";
import { Container, Card, Spinner, Alert } from "react-bootstrap";

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
    <Container fluid className="min-vh-100 py-5 gradient-home">
      <Container className="py-5" style={{ maxWidth: "48rem" }}>
        <h1 className="text-center mb-5 display-4 fw-bold text-white">
          🚀 TechyTalks
        </h1>

        {loading && (
          <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center mt-4">
            {error}
          </Alert>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-muted mt-4">😢 No posts found.</p>
        )}

        {!loading && posts.length > 0 && (
          <div className="d-flex flex-column gap-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`} passHref>
                <Card className="text-white card-transparent">
                  <Card.Body>
                    <Card.Title as="h2" className="text-info">
                      {post.title}
                    </Card.Title>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Container>
  );
}
