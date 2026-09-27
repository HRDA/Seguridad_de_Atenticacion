"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AuthActionState } from "@/lib/auth/types";
import {
  isValidEmail,
  isValidPassword,
  readFormString,
} from "@/lib/auth/validation";
import { getSupabaseConfig } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const invalidCredentials: AuthActionState = {
  status: "error",
  message: "No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.",
};

function configurationError(): AuthActionState {
  return {
    status: "error",
    message: "El servicio de autenticación todavía no está configurado.",
  };
}

async function callbackUrl(next?: string) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const url = new URL("/auth/callback", origin);
  if (next) url.searchParams.set("next", next);
  return url.toString();
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email").trim().toLowerCase();
  const password = readFormString(formData, "password");

  if (!isValidEmail(email) || !password || password.length > 128) {
    return invalidCredentials;
  }
  if (!getSupabaseConfig()) return configurationError();

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return invalidCredentials;
  } catch {
    return invalidCredentials;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email").trim().toLowerCase();
  const password = readFormString(formData, "password");
  const confirmation = readFormString(formData, "confirmPassword");

  if (!isValidEmail(email)) {
    return { status: "error", message: "Escribe un correo válido." };
  }
  if (!isValidPassword(password)) {
    return {
      status: "error",
      message: "La contraseña debe tener entre 12 y 128 caracteres.",
    };
  }
  if (password !== confirmation) {
    return { status: "error", message: "Las contraseñas no coinciden." };
  }
  if (!getSupabaseConfig()) return configurationError();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: await callbackUrl() },
    });
    if (error) {
      return {
        status: "error",
        message:
          "No se pudo completar el registro. Intenta iniciar sesión o vuelve a intentarlo.",
      };
    }
    if (!data.session) {
      return {
        status: "success",
        message: "Si el registro es válido, recibirás un correo para confirmar tu cuenta.",
      };
    }
  } catch {
    return {
      status: "error",
      message: "No se pudo completar el registro. Inténtalo de nuevo más tarde.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readFormString(formData, "email").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return { status: "error", message: "Escribe un correo válido." };
  }
  if (!getSupabaseConfig()) return configurationError();

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: await callbackUrl("/reset-password"),
    });
    if (error) {
      return {
        status: "error",
        message: "No se pudo procesar la solicitud. Revisa la configuración e inténtalo de nuevo.",
      };
    }
  } catch {
    return {
      status: "error",
      message: "No se pudo procesar la solicitud. Inténtalo de nuevo más tarde.",
    };
  }

  return {
    status: "success",
    message: "Si la cuenta existe, recibirás un correo con los siguientes pasos.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readFormString(formData, "password");
  const confirmation = readFormString(formData, "confirmPassword");

  if (!isValidPassword(password)) {
    return {
      status: "error",
      message: "La contraseña debe tener entre 12 y 128 caracteres.",
    };
  }
  if (password !== confirmation) {
    return { status: "error", message: "Las contraseñas no coinciden." };
  }
  if (!getSupabaseConfig()) return configurationError();

  try {
    const supabase = await createClient();
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      return {
        status: "error",
        message: "El enlace ha caducado. Solicita uno nuevo para continuar.",
      };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return {
        status: "error",
        message: "No se pudo actualizar la contraseña. Solicita un enlace nuevo.",
      };
    }

    await supabase.auth.signOut();
  } catch {
    return {
      status: "error",
      message: "No se pudo actualizar la contraseña. Solicita un enlace nuevo.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/login?reset=success");
}

export async function signOutAction() {
  let logoutFailed = false;

  if (getSupabaseConfig()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();
      logoutFailed = Boolean(error);
    } catch {
      logoutFailed = true;
    }
  }

  if (logoutFailed) redirect("/dashboard?error=logout");
  revalidatePath("/", "layout");
  redirect("/login");
}