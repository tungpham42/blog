"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "@/styles/login.css";

export default function LoginPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setError(null);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center my-5"
    >
      <Card className="glass-card text-center p-4">
        <Card.Body>
          <Card.Title as="h2" className="mb-4 fw-bold">
            Welcome Back <FontAwesomeIcon icon={faHeart} className="ms-2" />
          </Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="spinner-liquid-glass mx-auto"></div>
          ) : (
            <Button
              variant="outline-light"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleLogin}
            >
              <FontAwesomeIcon icon={faGoogle} />
              Sign in with Google
            </Button>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
