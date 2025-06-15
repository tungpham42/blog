"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";
import { Post } from "@/lib/types";
import Link from "next/link";
import { Container, Card, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faSadTear,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

// Memoized PostList component to prevent unnecessary re-renders
const PostList = memo(
  ({
    posts,
    lastPostElementRef,
  }: {
    posts: Post[];
    lastPostElementRef: (node: HTMLDivElement | null) => void;
  }) => (
    <div className="d-flex flex-column gap-3">
      {posts.map((post, index) => (
        <Link key={post.id} href={`/post/${post.slug}`} passHref>
          <Card
            className="liquid-glass-card"
            ref={index === posts.length - 1 ? lastPostElementRef : null}
          >
            <Card.Body>
              <Card.Title as="h2">{post.title}</Card.Title>
            </Card.Body>
          </Card>
        </Link>
      ))}
    </div>
  )
);
PostList.displayName = "PostList";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastPostRef = useRef<unknown>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const POSTS_PER_PAGE = 5;

  const fetchPosts = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      let q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(POSTS_PER_PAGE)
      );

      if (!isInitial && lastPostRef.current) {
        q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          startAfter(lastPostRef.current),
          limit(POSTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      // Capture scroll position before updating state
      const scrollY = window.scrollY;
      if (isInitial) {
        setPosts(fetchedPosts);
      } else {
        // Append new posts without clearing existing ones
        setPosts((prev) => [...prev, ...fetchedPosts]);
        // Restore scroll position immediately
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }

      if (snapshot.docs.length > 0) {
        lastPostRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Oops! Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchPosts();
          }
        },
        { rootMargin: "200px" }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchPosts]
  );

  return (
    <Container fluid className="min-vh-100 py-5">
      <Container className="py-5" style={{ maxWidth: "48rem" }}>
        <h1 className="text-center mb-5 display-4 fw-bold">
          <FontAwesomeIcon icon={faRocket} className="me-2" /> TechyTalks
        </h1>

        {loading && posts.length === 0 && (
          <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center mt-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {error}
          </Alert>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-muted mt-4">
            <FontAwesomeIcon icon={faSadTear} className="me-2" /> No posts
            found.
          </p>
        )}

        {posts.length > 0 && (
          <PostList posts={posts} lastPostElementRef={lastPostElementRef} />
        )}

        {hasMore && loading && posts.length > 0 && (
          <div className="text-center mt-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </Container>
    </Container>
  );
}
