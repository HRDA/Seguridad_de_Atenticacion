import { AuthShell } from "@/app/components/auth-shell";
import { LoginForm } from "@/app/components/auth-forms";

const notices: Record<string, string> = {
  verification: "El enlace no se pudo verificar. Solicita uno nuevo o vuelve a registrarte.",
  callback: "El enlace ha caducado o no es válido. Solicita uno nuevo.",
  logout: "La sesión se cerró localmente. Vuelve a iniciar sesión para continuar.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = params.reset === "success"
    ? "Tu contraseña se actualizó. Inicia sesión con la nueva clave."
    : params.error
      ? notices[params.error]
      : undefined;

  return (
    <AuthShell
      eyebrow="01 / INICIO DE SESIÓN"
      title="Qué bueno verte."
      description="Ingresa tus datos para continuar."
    >
      <LoginForm notice={notice} />
    </AuthShell>
  );
}