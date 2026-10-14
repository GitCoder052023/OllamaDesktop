import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

// Recognized code extensions
const CODE_EXTENSIONS = new Set([
  "js", "jsx", "ts", "tsx", "mjs", "cjs",
  "py", "pyw",
  "html", "htm", "css", "scss", "sass", "less",
  "json", "jsonc", "csv", "tsv", "xml", "yaml", "yml", "toml", "ini",
  "sh", "bash", "zsh", "fish", "bat", "ps1",
  "sql", "graphql", "gql",
  "rs", "go", "c", "cpp", "cc", "cxx", "h", "hpp", "cs",
  "java", "kt", "kts", "swift", "m", "mm",
  "php", "rb", "lua", "r", "dart",
  "dockerfile", "makefile", "cmake",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name || "unnamed";
    const mimeType = file.type || "application/octet-stream";
    const size = file.size;

    // Check size limit (20MB)
    if (size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum supported file size is 20MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = filename.split(".").pop()?.toLowerCase() || "";

    const id = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. PDF processing
    if (mimeType === "application/pdf" || ext === "pdf") {
      try {
        const { totalPages, text } = await extractText(new Uint8Array(buffer));
        
        let formattedText = "";
        if (Array.isArray(text)) {
          formattedText = text
            .map((pageText, idx) => `[Page ${idx + 1}]\n${pageText.trim()}`)
            .filter((p) => p.length > 0)
            .join("\n\n");
        } else if (typeof text === "string") {
          formattedText = text;
        }

        if (!formattedText.trim()) {
          formattedText = "[PDF contains no selectable text or consists entirely of scanned images]";
        }

        return NextResponse.json({
          id,
          name: filename,
          fileType: "pdf",
          mimeType: "application/pdf",
          size,
          extractedText: formattedText,
          pageCount: totalPages || 1,
          lineCount: formattedText.split("\n").length,
          previewUrl: null,
          base64Data: null,
        });
      } catch (pdfErr: any) {
        return NextResponse.json(
          { error: `Failed to extract PDF text: ${pdfErr.message || "Invalid or encrypted PDF"}` },
          { status: 422 }
        );
      }
    }

    // 2. Image processing
    if (
      mimeType.startsWith("image/") ||
      ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"].includes(ext)
    ) {
      const base64Data = buffer.toString("base64");
      const resolvedMime = mimeType.startsWith("image/")
        ? mimeType
        : ext === "svg"
        ? "image/svg+xml"
        : `image/${ext === "jpg" ? "jpeg" : ext}`;
      const previewUrl = `data:${resolvedMime};base64,${base64Data}`;

      return NextResponse.json({
        id,
        name: filename,
        fileType: "image",
        mimeType: resolvedMime,
        size,
        extractedText: `[Image attached: ${filename} (${(size / 1024).toFixed(1)} KB)]`,
        pageCount: 1,
        lineCount: 1,
        previewUrl,
        base64Data, // clean base64 for Ollama vision API
      });
    }

    // 3. Text, Markdown, CSV, Code files
    const isCode = CODE_EXTENSIONS.has(ext) || ext.endsWith("rc") || filename.startsWith(".");
    const isText =
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/javascript" ||
      ["txt", "md", "markdown", "log", "rtf", "doc"].includes(ext) ||
      isCode;

    if (isText || isCode) {
      let rawText = buffer.toString("utf-8");
      // Clean non-printable control characters except standard whitespace
      rawText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

      const lines = rawText.split("\n");
      const lineCount = lines.length;

      return NextResponse.json({
        id,
        name: filename,
        fileType: isCode ? "code" : "text",
        mimeType: mimeType.startsWith("text/") ? mimeType : "text/plain",
        size,
        extractedText: rawText,
        pageCount: 1,
        lineCount,
        previewUrl: null,
        base64Data: null,
      });
    }

    // Fallback: try parsing as text if utf-8 valid, otherwise unsupported
    try {
      const rawText = buffer.toString("utf-8");
      // Check if majority of characters are printable
      let nonPrintableCount = 0;
      for (let i = 0; i < Math.min(rawText.length, 1000); i++) {
        const code = rawText.charCodeAt(i);
        if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
          nonPrintableCount++;
        }
      }

      if (nonPrintableCount > 30) {
        return NextResponse.json(
          {
            error: `Unsupported binary format for "${filename}". Please upload PDFs, images, text, or code files.`,
          },
          { status: 415 }
        );
      }

      const lines = rawText.split("\n");
      return NextResponse.json({
        id,
        name: filename,
        fileType: "text",
        mimeType: "text/plain",
        size,
        extractedText: rawText,
        pageCount: 1,
        lineCount: lines.length,
        previewUrl: null,
        base64Data: null,
      });
    } catch {
      return NextResponse.json(
        {
          error: `Unsupported file format for "${filename}". Supported: PDF, Images, Text, Markdown, and Code files.`,
        },
        { status: 415 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal error processing file" },
      { status: 500 }
    );
  }
}
