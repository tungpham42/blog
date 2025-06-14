"use client";

import {
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Add useState for error handling
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import "@/styles/login.css";

export default function LoginPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [error, setError] = useState<string | null>(null); // State for login errors

  // Handle redirect result when returning from Google OAuth
  useEffect(() => {
    async function handleRedirect() {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Successfully signed in
          router.push("/");
        }
      } catch (err) {
        console.error("Redirect login error:", err);
        setError("⚠️ Login failed. Please try again.");
      }
    }

    if (!loading && !user) {
      handleRedirect();
    }
  }, [loading, user, router]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // No need to push to "/" here; handled by redirect result
    } catch (err) {
      console.error("Login error:", err);
      setError("⚠️ Login failed. Please try again.");
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center login-bg"
    >
      <Card className="glass-card text-center p-4">
        <Card.Body>
          <Card.Title as="h2" className="mb-4 text-white fw-bold">
            Welcome Back 👋
          </Card.Title>
          {loading ? (
            <Spinner animation="border" variant="light" />
          ) : (
            <>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}
              <Button
                variant="outline-light"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleLogin}
              >
                <FontAwesomeIcon icon={faGoogle} />
                Sign in with Google
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
