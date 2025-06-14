"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LoginPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("⚠️ Login failed. Please try again.");
    }
  };

  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white p-6">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-10 text-center max-w-sm w-full shadow-2xl animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome Back 👋
        </h2>
        <button
          onClick={handleLogin}
          className="bg-white/10 border border-white/30 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 shadow hover:shadow-xl"
        >
          Sign in with Google 🚀
        </button>
      </div>
    </main>
  );
}
