import { AuthShell } from "@/app/components/auth-shell";
import { ForgotPasswordForm } from "@/app/components/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="03 / RECUPERACIÓN"
      title="Recupera el acceso."
      description="Te enviaremos un enlace seguro si la cuenta existe."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}