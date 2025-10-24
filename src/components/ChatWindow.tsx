import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  sender_id: number;
  receiver_id?: number;
  group_id?: number;
  text: string;
  time: string;
  sender_nickname?: string;
}

interface Chat {
  id: number;
  name: string;
  lastMessage?: string;
  time?: string;
  unread?: number;
  online?: boolean;
  is_group: boolean;
  description?: string;
  member_count?: number;
}

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
}

interface ChatWindowProps {
  selectedChat: Chat | null;
  user: User;
  messages: Message[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
}

export const ChatWindow = ({
  selectedChat,
  user,
  messages,
  messageInput,
  setMessageInput,
  handleSendMessage,
}: ChatWindowProps) => {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-8xl mb-4">🔥</div>
          <p className="text-xl text-primary neon-text">Выбери чат для начала адского треpa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 bg-card border-b-2 border-primary px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-primary">
            <AvatarFallback className="hell-gradient text-white font-bold">
              {selectedChat.is_group ? '👥' : selectedChat.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-primary">{selectedChat.name}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedChat.is_group 
                ? `${selectedChat.member_count || 0} участников` 
                : selectedChat.online ? 'онлайн' : 'был(а) недавно'}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-background to-sidebar">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col max-w-md">
                {selectedChat.is_group && message.sender_id !== user.id && (
                  <span className="text-xs text-primary mb-1 ml-2">
                    {message.sender_nickname}
                  </span>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl transition-all duration-200 ${
                    message.sender_id === user.id
                      ? 'hell-gradient text-white neon-glow'
                      : 'bg-card border-2 border-primary'
                  }`}
                >
                  <p className="mb-1">{message.text}</p>
                  <span className={`text-xs ${message.sender_id === user.id ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {message.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 bg-card border-t-2 border-primary">
        <div className="flex gap-2">
          <Input
            placeholder="Сообщение из преисподней..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-input border-2 border-destructive focus:border-primary"
          />
          <Button
            onClick={handleSendMessage}
            className="hell-gradient hover:opacity-90 neon-glow"
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
