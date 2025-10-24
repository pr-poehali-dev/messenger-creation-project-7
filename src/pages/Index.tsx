import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_AUTH = 'https://functions.poehali.dev/51609d55-b494-4cb9-a305-ed3ff2ae9075';
const API_MESSAGES = 'https://functions.poehali.dev/fa7f98dc-53c9-465d-b4be-9ab077c3b0fb';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string;
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

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [activeSection, setActiveSection] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  
  const { toast } = useToast();

  const handleAuth = async () => {
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          username,
          email: isLogin ? undefined : email,
          password,
          full_name: isLogin ? undefined : fullName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        toast({ title: isLogin ? 'Вход выполнен!' : 'Регистрация успешна!' });
        loadChats(data.id);
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    }
  };

  const loadChats = async (userId: number) => {
    try {
      const response = await fetch(API_MESSAGES, {
        headers: { 'X-User-Id': userId.toString() },
      });
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (otherUserId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_MESSAGES}?user_id=${otherUserId}`, {
        headers: { 'X-User-Id': user.id.toString() },
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user || !selectedChat) return;

    try {
      const response = await fetch(API_MESSAGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          receiver_id: selectedChat,
          message_text: messageInput,
        }),
      });

      const data = await response.json();
      setMessages([...messages, data]);
      setMessageInput('');
      loadChats(user.id);
    } catch (error) {
      toast({ title: 'Ошибка отправки', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadChats(userData.id);
    }
  }, []);

  useEffect(() => {
    if (selectedChat && user) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const menuItems = [
    { id: 'chats', icon: 'MessageSquare', label: 'Чаты' },
    { id: 'contacts', icon: 'Users', label: 'Контакты' },
    { id: 'channels', icon: 'Radio', label: 'Каналы' },
    { id: 'calls', icon: 'Phone', label: 'Звонки' },
    { id: 'profile', icon: 'User', label: 'Профиль' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader>
            <CardTitle className="text-center text-3xl neon-text text-primary">
              {isLogin ? 'Вход' : 'Регистрация'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-input border-border"
            />
            {!isLogin && (
              <>
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border"
                />
                <Input
                  placeholder="Полное имя"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-input border-border"
                />
              </>
            )}
            <Input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="bg-input border-border"
            />
            <Button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-primary to-secondary neon-glow"
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {user.username.charAt(0).toUpperCase()}
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

          {activeSection === 'profile' && (
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-primary neon-glow">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{user.full_name || user.username}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              <Button
                onClick={() => {
                  setUser(null);
                  localStorage.removeItem('user');
                }}
                variant="outline"
                className="w-full"
              >
                Выйти
              </Button>
            </div>
          )}

          {activeSection !== 'chats' && activeSection !== 'profile' && (
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
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl transition-all duration-200 ${
                        message.sender_id === user.id
                          ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground neon-glow'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p className="mb-1">{message.text}</p>
                      <span className={`text-xs ${message.sender_id === user.id ? 'opacity-80' : 'text-muted-foreground'}`}>
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
