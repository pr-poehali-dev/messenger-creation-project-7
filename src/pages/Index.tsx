import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AuthForm } from '@/components/AuthForm';
import { Sidebar } from '@/components/Sidebar';
import { ChatList } from '@/components/ChatList';
import { ChatWindow } from '@/components/ChatWindow';
import { ProfileDialog } from '@/components/ProfileDialog';

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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
      <AuthForm
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        handleAuth={handleAuth}
      />
    );
  }

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar
        user={user}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        showNewGroup={showNewGroup}
        setShowNewGroup={setShowNewGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupDesc={newGroupDesc}
        setNewGroupDesc={setNewGroupDesc}
        handleCreateGroup={handleCreateGroup}
      />

      <ChatList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredChats={filteredChats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />

      <ChatWindow
        selectedChat={selectedChat}
        user={user}
        messages={messages}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
      />

      <ProfileDialog
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        user={user}
        editNickname={editNickname}
        setEditNickname={setEditNickname}
        editBio={editBio}
        setEditBio={setEditBio}
        editAvatar={editAvatar}
        setEditAvatar={setEditAvatar}
        handleUpdateProfile={handleUpdateProfile}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default Index;
