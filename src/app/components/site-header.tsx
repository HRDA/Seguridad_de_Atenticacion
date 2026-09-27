import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signOutAction } from "@/app/actions/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Keyline, inicio">
        <span className="wordmark-symbol">K</span>
        <span>KEYLINE</span>
      </Link>
      <nav className="site-nav" aria-label="Navegación principal">
        {user ? (
          <>
            <Link className="nav-link" href="/dashboard">
              Cuenta
            </Link>
            <form action={signOutAction}>
              <button className="nav-button" type="submit">
                Cerrar sesión
              </button>
            </form>
          </>
        ) : (
          <>
            <Link className="nav-link" href="/login">
              Iniciar sesión
            </Link>
            <Link className="nav-cta" href="/register">
              Crear cuenta <span aria-hidden="true">↗</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}