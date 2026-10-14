export type FileType = "pdf" | "text" | "code" | "image" | "unknown";

export interface Attachment {
  id: string;
  name: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  extractedText: string;
  pageCount?: number;
  lineCount?: number;
  previewUrl?: string | null;
  base64Data?: string | null;
}

export interface MessageStats {
  evalCount?: number;
  evalDuration?: number;
  totalDuration?: number;
  tokensPerSecond?: number;
  promptEvalCount?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  model?: string;
  error?: boolean;
  stats?: MessageStats;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
  systemPrompt?: string;
  temperature?: number;
  contextLength?: number;
}

export interface OllamaModelDetails {
  family: string;
  families: string[];
  parameterSize: string;
  quantizationLevel: string;
  contextLength?: number;
}

export interface OllamaModel {
  name: string;
  model: string;
  modifiedAt?: string;
  size: number;
  digest?: string;
  details: OllamaModelDetails;
  capabilities: string[];
  isVision: boolean;
}

export interface OllamaStatus {
  connected: boolean;
  host: string;
  version: string | null;
  models: OllamaModel[];
  error?: string;
}

export interface AppSettings {
  ollamaHost: string;
  defaultModel: string;
  temperature: number;
  systemPrompt: string;
  theme: "system" | "light" | "dark";
  windowFrameStyle: "windowed" | "full";
  soundEffects: boolean;
}
