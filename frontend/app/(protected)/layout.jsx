// app/(protected)/layout.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function ProtectedLayout({ children }) {
  const token = cookies().get("auth_token")?.value;
  if (!token) redirect("/login");
  return <>{children}</>;
}
