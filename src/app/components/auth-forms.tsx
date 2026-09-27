"use client";

import { useActionState, type ChangeEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "@/app/actions/auth";
import type { AuthActionState } from "@/lib/auth/types";

const initialState: AuthActionState = { status: "idle", message: "" };

function SubmitButton({ children, pendingLabel }: { children: ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="primary-button" type="submit" disabled={pending}>
      {pending ? pendingLabel : children}
      <span aria-hidden="true">{pending ? "..." : "↗"}</span>
    </button>
  );
}

function FormMessage({ state }: { state: AuthActionState }) {
  if (!state.message) return null;
  return (
    <p className={`form-message form-message--${state.status}`} role={state.status === "error" ? "alert" : "status"}>
      {state.message}
    </p>
  );
}

function checkPasswordMatch(event: ChangeEvent<HTMLInputElement>) {
  const form = event.currentTarget.form;
  const passwordField = form?.elements.namedItem("password");
  const confirmationField = form?.elements.namedItem("confirmPassword");

  if (
    passwordField instanceof HTMLInputElement &&
    confirmationField instanceof HTMLInputElement
  ) {
    confirmationField.setCustomValidity(
      confirmationField.value && confirmationField.value !== passwordField.value
        ? "Las contraseñas no coinciden."
        : "",
    );
  }
}

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action] = useActionState(signInAction, initialState);

  return (
    <form className="auth-form" action={action}>
      {notice ? <p className="form-message form-message--success" role="status">{notice}</p> : null}
      <label className="field">
        <span>Correo electrónico</span>
        <input name="email" type="email" autoComplete="email" maxLength={254} required />
      </label>
      <label className="field">
        <span>Contraseña</span>
        <input name="password" type="password" autoComplete="current-password" maxLength={128} required />
      </label>
      <div className="form-tools">
        <span>Acceso personal</span>
        <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Verificando...">Entrar</SubmitButton>
      <p className="form-switch">
        ¿Aún no tienes cuenta? <Link href="/register">Regístrate</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(signUpAction, initialState);

  return (
    <form className="auth-form" action={action}>
      <label className="field">
        <span>Correo electrónico</span>
        <input name="email" type="email" autoComplete="email" maxLength={254} required />
      </label>
      <label className="field">
        <span>Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          onChange={checkPasswordMatch}
          required
        />
        <small>Mínimo 12 caracteres.</small>
      </label>
      <label className="field">
        <span>Confirmar contraseña</span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          onChange={checkPasswordMatch}
          required
        />
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Creando cuenta...">Crear cuenta</SubmitButton>
      <p className="form-switch">
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form className="auth-form" action={action}>
      <label className="field">
        <span>Correo electrónico</span>
        <input name="email" type="email" autoComplete="email" maxLength={254} required />
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Enviando...">Enviar enlace</SubmitButton>
      <p className="form-switch">
        <Link href="/login">Volver al inicio de sesión</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, initialState);

  return (
    <form className="auth-form" action={action}>
      <label className="field">
        <span>Nueva contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          onChange={checkPasswordMatch}
          required
        />
        <small>Mínimo 12 caracteres.</small>
      </label>
      <label className="field">
        <span>Confirmar contraseña</span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          onChange={checkPasswordMatch}
          required
        />
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Actualizando...">Guardar contraseña</SubmitButton>
    </form>
  );
}