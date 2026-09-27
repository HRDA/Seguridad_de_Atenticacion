import { redirect } from "next/navigation";
import { AuthShell } from "@/app/components/auth-shell";
import { ResetPasswordForm } from "@/app/components/auth-forms";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?error=callback");

  return (
    <AuthShell
      eyebrow="04 / NUEVA CONTRASEÑA"
      title="Elige una clave nueva."
      description="Usa al menos 12 caracteres y confirma el cambio."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}