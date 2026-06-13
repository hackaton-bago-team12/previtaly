import {
  generateMockAnalysis,
  type MockAnalysisInput,
  type MockAnalysisResult,
} from "@/lib/mock-analysis";

/**
 * Cliente del microservicio de IA (FastAPI + Azure OpenAI) que vive aparte.
 *
 * Llama al endpoint /analyze/checkin con la clave interna. Si el servicio no
 * esta configurado, no responde, o falla, cae automaticamente al analisis mock
 * para que la app NUNCA se rompa (clave para la demo).
 */

const AI_URL = process.env.AI_SERVICE_URL;
const AI_KEY = process.env.AI_SERVICE_KEY;

export async function analyzeCheckin(
  input: MockAnalysisInput,
): Promise<MockAnalysisResult> {
  // Sin configuracion -> usamos el mock directamente.
  if (!AI_URL || !AI_KEY) {
    return generateMockAnalysis(input);
  }

  try {
    const res = await fetch(`${AI_URL}/analyze/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": AI_KEY,
      },
      body: JSON.stringify(input),
      cache: "no-store",
      // Si Azure tarda demasiado, no bloqueamos el check-in.
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      throw new Error(`AI service respondio ${res.status}`);
    }

    return (await res.json()) as MockAnalysisResult;
  } catch (err) {
    // Fallback resiliente: la app sigue funcionando con el mock.
    console.error("[ai-service] fallback a analisis mock:", err);
    return generateMockAnalysis(input);
  }
}
