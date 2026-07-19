'use client';

import ChatHeader from '@/components/copilot/ChatHeader';
import InputBar from '@/components/copilot/InputBar';
import MessageFeed from '@/components/copilot/MessageFeed';
import PresetBar from '@/components/copilot/PresetBar';
import XaiInspector from '@/components/copilot/XaiInspector';
import { useCopilotViewModel } from '@/hooks/useCopilotViewModel';

export default function Copilot() {
  const { state, actions } = useCopilotViewModel();
  const { messages, inputText, copilotState, messagesEndRef } = state;
  const { setInputText, handleSendMessage } = actions;

  const loading = copilotState.status === 'loading';
  const rawJson = copilotState.status === 'success' ? copilotState.data : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left 2 Cols: Chat Window */}
      <div className="lg:col-span-2 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden h-full">
        <ChatHeader />

        <PresetBar loading={loading} onSelectPreset={handleSendMessage} />

        <MessageFeed messages={messages} loading={loading} messagesEndRef={messagesEndRef} />

        <InputBar
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
          loading={loading}
        />
      </div>

      {/* Right Col: XAI Json Inspector */}
      <XaiInspector rawJson={rawJson} />
    </div>
  );
}
