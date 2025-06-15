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
import { Container, Form, Button, Card, Modal } from "react-bootstrap";
import RequireAuthAdmin from "@/components/RequireAuthAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const EditorComponent = dynamic(() => import("@/components/EditorComponent"), {
  ssr: false,
});

export default function EditPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<OutputData | null>(null);
  const [docId, setDocId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteDoc(doc(db, "posts", docId));
    setShowDeleteModal(false);
    router.push("/");
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

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
              <FontAwesomeIcon icon={faPencilAlt} className="me-2" /> Edit Your
              Post
            </Card.Title>
            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
                className="mt-3 form-input-transparent"
              />
              <div className="editor-border mt-3 p-4">
                <EditorComponent onChange={setContent} initialData={content} />
              </div>
              <div className="d-flex gap-2 mt-3">
                <Button type="submit" variant="primary" className="w-50">
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  Save Changes
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  className="w-50"
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Delete Post
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
