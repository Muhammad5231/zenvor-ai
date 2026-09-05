import { Workspace } from "@/components/Workspace";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  return <Workspace initialChatId={params.id} />;
}