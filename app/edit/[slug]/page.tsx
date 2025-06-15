"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { OutputData } from "@editorjs/editorjs";
import slugify from "@/utils/slug";
import { Container, Form, Button, Card, Modal, Alert } from "react-bootstrap";
import RequireAuthAdmin from "@/components/RequireAuthAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
  loading: () => <div className="spinner-liquid-glass mx-auto"></div>,
});

export default function EditPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [content, setContent] = useState<OutputData | null>(null);
  const [docId, setDocId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(collection(db, "posts"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          setDocId(doc.id);
          setTitle(data.title);
          setSlugInput(data.slug);
          setContent(data.content);
        } else {
          setError("Post not found.");
          router.push("/");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, router]);

  // Auto-generate slug when title changes
  useEffect(() => {
    setSlugInput(slugify(title));
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      setError("Content is required.");
      return;
    }

    const formattedSlug = slugify(slugInput || title);
    if (!formattedSlug) {
      setError("Please provide a valid title or slug.");
      return;
    }

    const q = query(
      collection(db, "posts"),
      where("slug", "==", formattedSlug)
    );
    const querySnapshot = await getDocs(q);
    const slugExists = querySnapshot.docs.some((doc) => doc.id !== docId);
    if (slugExists) {
      setError("A post with this slug already exists.");
      return;
    }

    try {
      await updateDoc(doc(db, "posts", docId), {
        title,
        slug: formattedSlug,
        content,
        updatedAt: Date.now(),
      });
      setError(null);
      router.push(`/post/${slugInput}`);
    } catch (err) {
      console.error("Error updating post:", err);
      setError("Failed to update post.");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, "posts", docId));
      setShowDeleteModal(false);
      setError(null);
      router.push("/");
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center my-5"
      >
        <div className="spinner-liquid-glass mx-auto"></div>
      </Container>
    );
  }

  return (
    <RequireAuthAdmin>
      <Container
        fluid
        className="min-vh-100 d-flex align-items-center justify-content-center my-5"
      >
        <Card
          className="w-100 liquid-glass-card gradient-edit"
          style={{ maxWidth: "48rem" }}
        >
          <Card.Body className="p-4">
            <Card.Title as="h2" className="text-center mb-4">
              <FontAwesomeIcon icon={faPencilAlt} className="me-2" />
              Edit Your Post
            </Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlugInput(slugify(e.target.value));
                }}
                placeholder="Title"
                required
                className="mt-0 form-input-transparent"
              />
              <Form.Control
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                placeholder="Slug"
                required
                className="mt-0 form-input-transparent"
              />
              <div
                className="editor-border mt-0 p-4"
                style={{ minHeight: "300px" }}
              >
                <EditorComponent onChange={setContent} initialData={content} />
              </div>
              <div className="d-flex gap-2 mt-0">
                <Button type="submit" variant="primary" className="w-50">
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  className="w-50"
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Delete
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showDeleteModal} onHide={handleCloseModal} centered>
        <Modal.Header>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </RequireAuthAdmin>
  );
}
