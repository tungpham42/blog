"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

type RequireAuthProps = {
  children: ReactNode;
};

export default function RequireAuthAdmin({ children }: RequireAuthProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== "tung.42@gmail.com") {
        router.push("/");
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  if (loading || isChecking)
    return <div className="spinner-liquid-glass mx-auto"></div>;
  if (!user || user.email !== "tung.42@gmail.com") return null;

  return <>{children}</>;
}
