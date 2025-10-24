import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

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

interface ChatListProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredChats: Chat[];
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat) => void;
}

export const ChatList = ({
  searchQuery,
  setSearchQuery,
  filteredChats,
  selectedChat,
  setSelectedChat,
}: ChatListProps) => {
  return (
    <div className="w-80 bg-card border-r-2 border-primary flex flex-col">
      <div className="p-4 border-b-2 border-primary">
        <h2 className="text-2xl font-bold mb-4 neon-text text-primary">
          🔥 ЧАТЫ 🔥
        </h2>
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-2 border-destructive focus:border-primary transition-all"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredChats.map((chat) => (
          <div
            key={`${chat.is_group ? 'g' : 'u'}-${chat.id}`}
            onClick={() => setSelectedChat(chat)}
            className={`p-4 border-b border-destructive cursor-pointer transition-all duration-200 hover:bg-sidebar-accent ${
              selectedChat?.id === chat.id && selectedChat?.is_group === chat.is_group
                ? 'bg-sidebar-accent border-l-4 border-l-primary'
                : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-primary">
                  <AvatarFallback className="hell-gradient text-white font-bold">
                    {chat.is_group ? '👥' : chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {!chat.is_group && chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-card neon-glow"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate text-primary">
                    {chat.is_group && '👥 '}{chat.name}
                  </h3>
                  {chat.time && <span className="text-xs text-muted-foreground">{chat.time}</span>}
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                )}
                {chat.description && (
                  <p className="text-xs text-muted-foreground truncate">{chat.description}</p>
                )}
              </div>
              {chat.unread && chat.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center neon-glow">
                  <span className="text-xs font-bold text-white">{chat.unread}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
