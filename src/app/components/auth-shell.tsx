import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="auth-main">
      <div className="auth-shell">
        <aside className="auth-aside">
          <div className="aside-label">
            <span className="status-dot" />
            KEYLINE <span>/</span> IDENTITY
          </div>
          <div className="aside-copy">
            <p className="aside-index">ACCESS CONTROL&nbsp;&nbsp; / &nbsp;&nbsp;01</p>
            <h2>Tu cuenta, bajo tu control.</h2>
            <p>Un acceso personal. Una sesión protegida.</p>
          </div>
          <div className="access-mark" aria-hidden="true">
            <div className="access-mark-inner">
              <span>KL</span>
            </div>
            <span className="access-mark-rule" />
          </div>
          <div className="aside-footer">
            <span>AUTHENTICATION SERVICE</span>
            <span>01 / 04</span>
          </div>
        </aside>

        <section className="auth-content" aria-labelledby="auth-title">
          <div className="auth-heading">
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            <p className="auth-description">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}