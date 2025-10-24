import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const Index = () => {
  const [activeSection, setActiveSection] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Привет! Как дела?', sender: 'other', time: '14:23' },
    { id: 2, text: 'Отлично! Работаю над новым проектом', sender: 'me', time: '14:25' },
    { id: 3, text: 'Звучит круто! Расскажешь подробнее?', sender: 'other', time: '14:26' },
  ]);

  const [chats] = useState<Chat[]>([
    { id: 1, name: 'Александр', lastMessage: 'Звучит круто! Расскажешь...', time: '14:26', unread: 0, online: true },
    { id: 2, name: 'Мария', lastMessage: 'Отправила тебе файлы', time: '13:45', unread: 3, online: true },
    { id: 3, name: 'Команда Разработки', lastMessage: 'Встреча в 15:00', time: '12:30', unread: 1, online: false },
    { id: 4, name: 'Дмитрий', lastMessage: 'Спасибо за помощь!', time: 'Вчера', unread: 0, online: false },
    { id: 5, name: 'Анна', lastMessage: 'Посмотри дизайн', time: 'Вчера', unread: 0, online: true },
  ]);

  const menuItems = [
    { id: 'chats', icon: 'MessageSquare', label: 'Чаты' },
    { id: 'contacts', icon: 'Users', label: 'Контакты' },
    { id: 'channels', icon: 'Radio', label: 'Каналы' },
    { id: 'calls', icon: 'Phone', label: 'Звонки' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ];

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: messageInput,
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <div className="w-20 bg-sidebar flex flex-col items-center py-6 border-r border-sidebar-border">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center neon-glow">
            <Icon name="Zap" size={24} className="text-primary-foreground" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                activeSection === item.id
                  ? 'bg-primary text-primary-foreground neon-glow scale-110'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon name={item.icon} size={22} />
            </button>
          ))}
        </div>

        <Avatar className="w-12 h-12 border-2 border-primary cursor-pointer">
          <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-foreground font-semibold">
            Я
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-2xl font-bold mb-4 neon-text text-primary">
            {menuItems.find(item => item.id === activeSection)?.label}
          </h2>
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border focus:border-primary transition-all"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {activeSection === 'chats' && filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-border cursor-pointer transition-all duration-200 ${
                selectedChat === chat.id
                  ? 'bg-sidebar-accent border-l-4 border-l-primary'
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold">
                      {chat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-card neon-glow"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center neon-glow">
                    <span className="text-xs font-bold">{chat.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {activeSection !== 'chats' && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Icon name="Construction" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Раздел в разработке</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold">
                    {chats.find(c => c.id === selectedChat)?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{chats.find(c => c.id === selectedChat)?.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {chats.find(c => c.id === selectedChat)?.online ? 'онлайн' : 'был(а) недавно'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-sidebar-accent">
                  <Icon name="Phone" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-sidebar-accent">
                  <Icon name="Video" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-sidebar-accent">
                  <Icon name="Search" size={20} />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl transition-all duration-200 ${
                        message.sender === 'me'
                          ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground neon-glow'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p className="mb-1">{message.text}</p>
                      <span className={`text-xs ${message.sender === 'me' ? 'opacity-80' : 'text-muted-foreground'}`}>
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 bg-card border-t border-border">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-sidebar-accent">
                  <Icon name="Paperclip" size={20} />
                </Button>
                <Input
                  placeholder="Введите сообщение..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-input border-border focus:border-primary"
                />
                <Button variant="ghost" size="icon" className="hover:bg-sidebar-accent">
                  <Icon name="Smile" size={20} />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 neon-glow"
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Icon name="MessageSquare" size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-xl">Выберите чат для начала общения</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
