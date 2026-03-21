"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { token, role, isHydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role === "Admin") router.replace("/admin/dashboard");
    else if (role === "Driver") router.replace("/driver/dashboard");
    else router.replace("/dashboard/dispatcher");
  }, [isHydrated, token, role, router]);

  return null;
}
