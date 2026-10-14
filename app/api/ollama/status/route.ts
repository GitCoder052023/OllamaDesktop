import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const host = searchParams.get("host") || process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  const cleanHost = host.replace(/\/$/, "");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const [tagsRes, versionRes] = await Promise.all([
      fetch(`${cleanHost}/api/tags`, {
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      }).catch((err) => ({ ok: false, statusText: err.message })),
      fetch(`${cleanHost}/api/version`, {
        signal: controller.signal,
      }).catch(() => null),
    ]);

    clearTimeout(timeoutId);

    if (!("ok" in tagsRes) || !tagsRes.ok) {
      return NextResponse.json({
        connected: false,
        host: cleanHost,
        version: null,
        models: [],
        error: "Unable to connect to Ollama. Make sure Ollama is installed and running (`ollama serve`).",
      });
    }

    const tagsData = await (tagsRes as Response).json();
    let version = "unknown";
    if (versionRes && "ok" in versionRes && versionRes.ok) {
      try {
        const vData = await versionRes.json();
        version = vData.version || "unknown";
      } catch {
        // ignore
      }
    }

    interface RawOllamaModel {
      name?: string;
      model?: string;
      modified_at?: string;
      size?: number;
      digest?: string;
      details?: {
        family?: string;
        families?: string[];
        parameter_size?: string;
        quantization_level?: string;
        context_length?: number;
      };
      capabilities?: string[];
    }

    const rawModels: RawOllamaModel[] = tagsData.models || [];
    const models = rawModels.map((m: RawOllamaModel) => {
      const caps: string[] = m.capabilities || [];
      const name = m.name || "";
      const nameLower = name.toLowerCase();
      const isVision =
        caps.includes("vision") ||
        nameLower.includes("vision") ||
        nameLower.includes("llava") ||
        nameLower.includes("minicpm-v") ||
        nameLower.includes("bakllava") ||
        nameLower.includes("moondream");

      return {
        name: m.name,
        model: m.model || m.name,
        modifiedAt: m.modified_at,
        size: m.size,
        digest: m.digest,
        details: {
          family: m.details?.family || "",
          families: m.details?.families || [],
          parameterSize: m.details?.parameter_size || "",
          quantizationLevel: m.details?.quantization_level || "",
          contextLength: m.details?.context_length,
        },
        capabilities: caps,
        isVision,
      };
    });

    return NextResponse.json({
      connected: true,
      host: cleanHost,
      version,
      models,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to reach Ollama";
    return NextResponse.json({
      connected: false,
      host: cleanHost,
      version: null,
      models: [],
      error: errorMsg,
    });
  }
}
