import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, messages, host, options } = body;

    if (!model) {
      return new Response(JSON.stringify({ error: "Model is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cleanHost = (host || process.env.OLLAMA_HOST || "http://127.0.0.1:11434").replace(/\/$/, "");

    // Prepare payload for Ollama /api/chat
    const ollamaPayload = {
      model,
      messages: messages.map((m: any) => {
        const item: any = {
          role: m.role,
          content: m.content || "",
        };
        if (m.images && Array.isArray(m.images) && m.images.length > 0) {
          // Clean data: URL prefixes if any
          item.images = m.images.map((img: string) =>
            img.replace(/^data:image\/[a-zA-Z]+;base64,/, "")
          );
        }
        return item;
      }),
      stream: true,
      options: options || {},
    };

    const response = await fetch(`${cleanHost}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ollamaPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Ollama error (${response.status}): ${response.statusText}`;
      try {
        const errJson = JSON.parse(errorText);
        if (errJson.error) errorMsg = errJson.error;
      } catch {
        if (errorText) errorMsg = errorText;
      }
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "No response body from Ollama" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pass through the stream
    return new Response(response.body, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to communicate with Ollama",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
