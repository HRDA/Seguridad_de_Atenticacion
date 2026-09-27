import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

type DashboardPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;

  return (
    <main className="dashboard-main">
      <div className="dashboard-heading">
        <p className="eyebrow">ESPACIO PERSONAL / CUENTA</p>
        <h1>Tu cuenta.</h1>
        <p>Sesión verificada para {user.email ?? "usuario"}.</p>
        {params.error === "logout" ? (
          <p className="form-message form-message--error" role="alert">
            No se pudo cerrar la sesión con el servicio. Tu cuenta sigue abierta; inténtalo de nuevo.
          </p>
        ) : null}
      </div>

      <section className="account-table" aria-labelledby="account-heading">
        <div className="account-table-heading">
          <div>
            <p className="eyebrow">DETALLES</p>
            <h2 id="account-heading">Información de acceso</h2>
          </div>
          <span className="account-status"><span className="status-dot" /> Activa</span>
        </div>
        <dl>
          <div className="account-row">
            <dt>Correo electrónico</dt>
            <dd>{user.email ?? "No disponible"}</dd>
          </div>
          <div className="account-row">
            <dt>Identificador</dt>
            <dd className="account-id">{user.id}</dd>
          </div>
          <div className="account-row">
            <dt>Cuenta creada</dt>
            <dd>{new Date(user.created_at).toLocaleDateString("es", { dateStyle: "long" })}</dd>
          </div>
        </dl>
      </section>
      <p className="dashboard-footnote">La identidad se valida en el servidor en cada acceso protegido.</p>
    </main>
  );
}