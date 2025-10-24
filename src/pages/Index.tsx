import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_AUTH = 'https://functions.poehali.dev/51609d55-b494-4cb9-a305-ed3ff2ae9075';
const API_MESSAGES = 'https://functions.poehali.dev/fa7f98dc-53c9-465d-b4be-9ab077c3b0fb';
const API_GROUPS = 'https://functions.poehali.dev/1c2234e3-b8dd-400b-98e8-f73bf210268c';

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

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [groups, setGroups] = useState<Chat[]>([]);
  
  const [editNickname, setEditNickname] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  
  const [showProfile, setShowProfile] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  
  const { toast } = useToast();

  const handleAuth = async () => {
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          username,
          password,
          nickname: isLogin ? undefined : username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        toast({ title: isLogin ? 'Добро пожаловать в Ад!' : 'Регистрация успешна!' });
        loadChats(data.id);
        loadGroups(data.id);
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Что-то пошло не так', variant: 'destructive' });
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

  const loadGroups = async (userId: number) => {
    try {
      const response = await fetch(API_GROUPS, {
        headers: { 'X-User-Id': userId.toString() },
      });
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadMessages = async (chat: Chat) => {
    if (!user) return;
    
    try {
      const url = chat.is_group 
        ? `${API_MESSAGES}?group_id=${chat.id}`
        : `${API_MESSAGES}?user_id=${chat.id}`;
      
      const response = await fetch(url, {
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
      const body = selectedChat.is_group
        ? { group_id: selectedChat.id, message_text: messageInput }
        : { receiver_id: selectedChat.id, message_text: messageInput };

      const response = await fetch(API_MESSAGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setMessages([...messages, data]);
      setMessageInput('');
      loadChats(user.id);
    } catch (error) {
      toast({ title: 'Ошибка отправки', variant: 'destructive' });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(API_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          user_id: user.id,
          nickname: editNickname,
          bio: editBio,
          avatar_url: editAvatar,
        }),
      });

      const data = await response.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      toast({ title: 'Профиль обновлён!' });
      setShowProfile(false);
    } catch (error) {
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    
    try {
      const response = await fetch(API_GROUPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'create',
          name: newGroupName,
          description: newGroupDesc,
        }),
      });

      const data = await response.json();
      setGroups([...groups, data]);
      toast({ title: 'Группа создана!' });
      setShowNewGroup(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (error) {
      toast({ title: 'Ошибка создания группы', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      loadChats(userData.id);
      loadGroups(userData.id);
    }
  }, []);

  useEffect(() => {
    if (selectedChat && user) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (user) {
      setEditNickname(user.nickname);
      setEditBio(user.bio || '');
      setEditAvatar(user.avatar_url || '');
    }
  }, [user, showProfile]);

  const allChats = [...chats, ...groups];
  const filteredChats = allChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-2 border-primary bg-card fire-glow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-6xl">🔥</div>
            <CardTitle className="text-4xl neon-text text-primary font-bold">
              {isLogin ? 'ВХОД В АД' : 'РЕГИСТРАЦИЯ'}
            </CardTitle>
            <p className="text-muted-foreground mt-2">Место для троллей и злых духов интернета</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-input border-2 border-destructive focus:border-primary transition-all"
            />
            <Input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              className="bg-input border-2 border-destructive focus:border-primary transition-all"
            />
            <Button
              onClick={handleAuth}
              className="w-full hell-gradient neon-glow text-white font-bold"
            >
              {isLogin ? '🔥 ВОЙТИ 🔥' : '⚡ ЗАРЕГИСТРИРОВАТЬСЯ ⚡'}
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              {isLogin ? 'Новый дух?' : 'Уже есть аккаунт?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-bold"
              >
                {isLogin ? 'Создай аккаунт' : 'Войди'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <div className="w-20 bg-sidebar flex flex-col items-center py-6 border-r-2 border-primary fire-glow">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-full hell-gradient flex items-center justify-center neon-glow">
            <span className="text-2xl">🔥</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <button
            onClick={() => setShowProfile(true)}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-primary hover:bg-sidebar-accent fire-glow"
          >
            <Icon name="User" size={22} />
          </button>
          
          <Dialog open={showNewGroup} onOpenChange={setShowNewGroup}>
            <DialogTrigger asChild>
              <button className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-primary hover:bg-sidebar-accent fire-glow">
                <Icon name="Plus" size={22} />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-primary fire-glow">
              <DialogHeader>
                <DialogTitle className="text-primary neon-text">Создать Адскую Группу</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Название группы"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="border-destructive"
                />
                <Textarea
                  placeholder="Описание (необязательно)"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="border-destructive"
                />
                <Button onClick={handleCreateGroup} className="w-full hell-gradient">
                  Создать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Avatar 
          onClick={() => setShowProfile(true)}
          className="w-12 h-12 border-2 border-primary cursor-pointer fire-glow"
        >
          <AvatarFallback className="hell-gradient text-white font-bold">
            {user.nickname.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

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

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-8xl mb-4">🔥</div>
              <p className="text-xl text-primary neon-text">Выбери чат для начала адского треpa</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-card border-2 border-primary fire-glow">
          <DialogHeader>
            <DialogTitle className="text-primary neon-text text-center">Адский Профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-primary fire-glow">
                <AvatarFallback className="hell-gradient text-4xl text-white">
                  {user.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">Логин: @{user.username}</p>
            </div>
            <Input
              placeholder="Ник"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              className="border-2 border-destructive"
            />
            <Textarea
              placeholder="Биография"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="border-2 border-destructive"
            />
            <Input
              placeholder="URL фото"
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              className="border-2 border-destructive"
            />
            <Button onClick={handleUpdateProfile} className="w-full hell-gradient">
              Сохранить
            </Button>
            <Button
              onClick={() => {
                setUser(null);
                localStorage.removeItem('user');
              }}
              variant="outline"
              className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              Выйти из Ада
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
