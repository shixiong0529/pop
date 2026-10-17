import type { Metadata } from "next";
import { ChatRoom } from "@/components/chat/ChatRoom";

export const metadata: Metadata = {
  title: "泡泡互动",
  description: "POP ATLAS 的泡友公共聊天大厅：注册后即可实时聊天，分享抽盒与收藏心得。",
  robots: { index: false, follow: true },
};

export default function ChatPage() {
  return (
    <div className="bg-paper pt-[calc(var(--nav-h)+1rem)] sm:pt-[calc(var(--nav-h)+2.5rem)]">
      <div className="container-page">
        <div className="mb-5 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow flex items-center gap-3 text-ink-mute">
              <span className="inline-block h-px w-6 bg-current" />
              Bubble Lounge
            </p>
            <h1 className="mt-3 font-display text-title font-black sm:mt-4">泡泡互动</h1>
          </div>
          <p className="hidden max-w-sm text-sm leading-6 text-ink-mute md:block">
            属于泡友的公共聊天大厅：分享抽盒运气、交流收藏心得，消息实时送达，聊天记录随时回看。
          </p>
        </div>
        <ChatRoom />
      </div>
    </div>
  );
}
