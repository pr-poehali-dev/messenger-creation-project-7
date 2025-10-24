import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
}

interface ProfileDialogProps {
  showProfile: boolean;
  setShowProfile: (value: boolean) => void;
  user: User;
  editNickname: string;
  setEditNickname: (value: string) => void;
  editBio: string;
  setEditBio: (value: string) => void;
  editAvatar: string;
  setEditAvatar: (value: string) => void;
  handleUpdateProfile: () => void;
  handleLogout: () => void;
}

export const ProfileDialog = ({
  showProfile,
  setShowProfile,
  user,
  editNickname,
  setEditNickname,
  editBio,
  setEditBio,
  editAvatar,
  setEditAvatar,
  handleUpdateProfile,
  handleLogout,
}: ProfileDialogProps) => {
  return (
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
            onClick={handleLogout}
            variant="outline"
            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
          >
            Выйти из Ада
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
