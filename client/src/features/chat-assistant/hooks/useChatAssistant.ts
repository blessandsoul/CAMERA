'use client';

import * as React from 'react';
import type { ChatMessage, ChatState, ChatCategory, CharacterState } from '../types';
import {
  MOCK_RESPONSES,
  DEFAULT_RESPONSE,
  TYPING_DELAY,
  WELCOME_MESSAGE,
} from '../data/mock-responses';

const SLEEP_TIMEOUT = 25000;

export function useChatAssistant() {
  const [state, setState] = React.useState<ChatState>({
    isOpen: false,
    messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }],
    isTyping: false,
    characterState: 'idle',
  });

  const sleepTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSleepTimer = React.useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    sleepTimerRef.current = setTimeout(() => {
      setState((prev) => {
        if (!prev.isOpen && prev.characterState === 'idle') {
          return { ...prev, characterState: 'sleeping' };
        }
        return prev;
      });
    }, SLEEP_TIMEOUT);
  }, []);

  const wakeUp = React.useCallback(() => {
    setState((prev) => {
      if (prev.characterState === 'sleeping') {
        return { ...prev, characterState: 'idle' };
      }
      return prev;
    });
    resetSleepTimer();
  }, [resetSleepTimer]);

  React.useEffect(() => {
    resetSleepTimer();
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [resetSleepTimer]);

  const toggleChat = React.useCallback(() => {
    wakeUp();
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      characterState: !prev.isOpen ? 'happy' : 'idle',
    }));
  }, [wakeUp]);

  const closeChat = React.useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, characterState: 'idle' }));
    resetSleepTimer();
  }, [resetSleepTimer]);

  const setCharacterState = React.useCallback(
    (characterState: CharacterState) => {
      setState((prev) => ({ ...prev, characterState }));
      if (characterState === 'idle') resetSleepTimer();
    },
    [resetSleepTimer]
  );

  const findResponse = React.useCallback(
    (message: string): { content: string; followUpActions?: string[] } => {
      const lower = message.toLowerCase();
      for (const category of Object.keys(MOCK_RESPONSES) as ChatCategory[]) {
        for (const mock of MOCK_RESPONSES[category]) {
          if (mock.patterns.some((p) => lower.includes(p.toLowerCase()))) {
            const idx = Math.floor(Math.random() * mock.responses.length);
            return { content: mock.responses[idx], followUpActions: mock.followUpActions };
          }
        }
      }
      const idx = Math.floor(Math.random() * DEFAULT_RESPONSE.responses.length);
      return {
        content: DEFAULT_RESPONSE.responses[idx],
        followUpActions: DEFAULT_RESPONSE.followUpActions,
      };
    },
    []
  );

  const sendMessage = React.useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      wakeUp();

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isTyping: true,
        characterState: 'thinking',
      }));

      const delay =
        Math.random() * (TYPING_DELAY.max - TYPING_DELAY.min) + TYPING_DELAY.min;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const { content: responseContent, followUpActions } = findResponse(content);

      // Flash animation briefly when replying
      setState((prev) => ({ ...prev, characterState: 'flash' }));
      await new Promise((resolve) => setTimeout(resolve, 300));

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        showQuickActions: !!followUpActions?.length,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isTyping: false,
        characterState: 'talking',
      }));

      setTimeout(() => setCharacterState('idle'), 2500);
    },
    [findResponse, setCharacterState, wakeUp]
  );

  const handleQuickAction = React.useCallback(
    (_actionId: string, label: string) => {
      sendMessage(label);
    },
    [sendMessage]
  );

  const clearChat = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }],
    }));
  }, []);

  return {
    ...state,
    toggleChat,
    closeChat,
    sendMessage,
    handleQuickAction,
    clearChat,
    setCharacterState,
    wakeUp,
  };
}
