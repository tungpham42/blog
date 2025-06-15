"use client";

import { db, auth } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Form,
  Button,
  Card,
  ListGroup,
  Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faRocket } from "@fortawesome/free-solid-svg-icons";

type Message = {
  id: string;
  text: string;
  userId?: string;
  userEmail?: string;
  createdAt: number;
};

const ADMIN_EMAILS = ["tung.42@gmail.com"];

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user?.email) {
      setIsAdmin(ADMIN_EMAILS.includes(user.email.toLowerCase()));
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messageData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text ?? "",
            createdAt: data.createdAt ?? 0,
            userId: data.userId,
            userEmail: data.userEmail,
          } as Message;
        });
        setMessages(messageData);
      },
      (err) => {
        console.error("Error loading messages:", err);
        setError("Failed to load messages.");
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login"); // Redirect to login page if not authenticated
      return;
    }
    if (!message.trim()) {
      setError("Please write a message.");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: message,
        userId: user?.uid,
        userEmail: user?.email,
        createdAt: Date.now(),
      });
      setMessage("");
      setError(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!isAdmin) {
      setError("You are not authorized to delete messages.");
      return;
    }

    try {
      await deleteDoc(doc(db, "messages", messageId));
      setError(null);
    } catch (err) {
      console.error("Error deleting message:", err);
      setError("Failed to delete message.");
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center my-5"
    >
      <Card
        className="w-100 liquid-glass-card gradient-chat"
        style={{ maxWidth: "48rem" }}
      >
        <Card.Body className="p-3">
          <Card.Title as="h2" className="text-center mb-4">
            <FontAwesomeIcon icon={faComments} className="me-2" /> Chat Room
          </Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          <ListGroup
            className="mb-4"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {messages.map((msg) => (
              <ListGroup.Item
                key={msg.id}
                className="d-flex justify-content-between align-items-start liquid-glass-card"
              >
                <div>
                  <strong>{msg.userEmail}:</strong> {msg.text}
                  <small className="text-muted d-block">
                    {new Date(msg.createdAt).toLocaleString("vi-VN")}
                  </small>
                </div>
                {isAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(msg.id)}
                    className="ms-2"
                  >
                    Delete
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {user ? (
            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <Form.Control
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                required
                className="form-input-transparent"
              />
              <Button type="submit" variant="primary" className="w-100">
                <FontAwesomeIcon icon={faRocket} className="me-2" /> Send
                Message
              </Button>
            </Form>
          ) : (
            <Alert variant="info">
              Please <a href="/login">log in</a> to send a message.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
