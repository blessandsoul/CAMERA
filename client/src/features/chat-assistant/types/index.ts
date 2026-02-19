export type MessageRole = 'user' | 'assistant';

export type ChatCategory =
  | 'cameras'
  | 'lenses'
  | 'accessories'
  | 'support'
  | 'general';

export type CharacterState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'talking'
  | 'happy'
  | 'sleeping'
  | 'flash';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  category?: ChatCategory;
  showQuickActions?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: ChatCategory;
}

export interface MockResponse {
  patterns: string[];
  responses: string[];
  followUpActions?: string[];
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  characterState: CharacterState;
}
