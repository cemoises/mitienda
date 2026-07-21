"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutLink() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="underline hover:text-black"
    >
      Cerrar sesión
    </button>
  );
}
