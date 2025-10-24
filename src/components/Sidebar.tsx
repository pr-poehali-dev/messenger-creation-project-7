import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
}

interface SidebarProps {
  user: User;
  showProfile: boolean;
  setShowProfile: (value: boolean) => void;
  showNewGroup: boolean;
  setShowNewGroup: (value: boolean) => void;
  newGroupName: string;
  setNewGroupName: (value: string) => void;
  newGroupDesc: string;
  setNewGroupDesc: (value: string) => void;
  handleCreateGroup: () => void;
}

export const Sidebar = ({
  user,
  showProfile,
  setShowProfile,
  showNewGroup,
  setShowNewGroup,
  newGroupName,
  setNewGroupName,
  newGroupDesc,
  setNewGroupDesc,
  handleCreateGroup,
}: SidebarProps) => {
  return (
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
          {user.nickname ? user.nickname.charAt(0).toUpperCase() : '😈'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};