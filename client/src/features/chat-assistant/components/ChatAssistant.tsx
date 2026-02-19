'use client';

import * as React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import { useChatAssistant } from '../hooks';

export function ChatAssistant() {
  const {
    isOpen,
    messages,
    isTyping,
    characterState,
    toggleChat,
    closeChat,
    sendMessage,
    handleQuickAction,
    clearChat,
    setCharacterState,
    wakeUp,
  } = useChatAssistant();

  const handleInputFocus = React.useCallback(
    () => setCharacterState('listening'),
    [setCharacterState]
  );

  const handleInputBlur = React.useCallback(() => {
    if (!isTyping) setCharacterState('idle');
  }, [isTyping, setCharacterState]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {isOpen && (
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            characterState={characterState}
            onSendMessage={sendMessage}
            onQuickAction={handleQuickAction}
            onClose={closeChat}
            onClear={clearChat}
            onInputFocus={handleInputFocus}
            onInputBlur={handleInputBlur}
          />
        )}
      </AnimatePresence>

      <ChatButton
        onClick={toggleChat}
        characterState={isOpen ? 'happy' : characterState}
        onWakeUp={wakeUp}
      />
    </div>
  );
}
