"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login"); // Changed to /login for clarity
      }
      setIsChecking(false);
    }
  }, [user, loading, router]);

  if (loading || isChecking)
    return <div className="spinner-liquid-glass mx-auto"></div>;
  if (!user) return null;

  return <>{children}</>;
}
