import { supabase } from "@/lib/supabase";

/**
 * Incrementa señales de comportamiento del usuario.
 * Actualmente registra cada señal como un evento independiente.
 * En una siguiente versión podrá consolidarse en un perfil agregado.
 */
export async function incrementUserSignals(
  userId: string,
  payload: {
    action: string;
    context?: Record<string, unknown>;
    timestamp: number;
  }
): Promise<void> {
  const { error } = await supabase
    .from("learning_signals")
    .insert({
      user_id: userId,
      signal: payload.action,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("[incrementUserSignals]", error);
    throw error;
  }
}