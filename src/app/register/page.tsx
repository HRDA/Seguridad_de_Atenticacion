import { AuthShell } from "@/app/components/auth-shell";
import { RegisterForm } from "@/app/components/auth-forms";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="02 / NUEVA CUENTA"
      title="Empieza aquí."
      description="Crea tus credenciales para acceder a tu espacio."
    >
      <RegisterForm />
    </AuthShell>
  );
}