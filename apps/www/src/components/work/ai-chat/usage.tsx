import {
  AiChat,
  AiChatBody,
  AiChatContent,
  AiChatFooter,
  AiChatHeader,
  AiChatPanel,
  AiChatPanelClose,
  AiChatSidebar,
  AiChatSidebarTrigger,
  AiChatViewport,
  useAiChat,
} from "./ai-chat";

function OpenSources() {
  const { setPanel } = useAiChat();
  return (
    <button type="button" onClick={() => setPanel("sources")}>
      Sources
    </button>
  );
}

export function Example() {
  return (
    <div className="h-144 w-256">
      <AiChat>
        <AiChatSidebar>Chats</AiChatSidebar>
        <AiChatBody>
          <AiChatContent>
            <AiChatHeader>
              <AiChatSidebarTrigger>☰</AiChatSidebarTrigger>
            </AiChatHeader>
            <AiChatViewport>
              <OpenSources />
            </AiChatViewport>
            <AiChatFooter>Composer</AiChatFooter>
          </AiChatContent>
          <AiChatPanel>
            <AiChatPanelClose>×</AiChatPanelClose>
            Sources
          </AiChatPanel>
        </AiChatBody>
      </AiChat>
    </div>
  );
}
