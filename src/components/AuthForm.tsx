import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormProps {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleAuth: () => void;
}

export const AuthForm = ({
  isLogin,
  setIsLogin,
  username,
  setUsername,
  password,
  setPassword,
  handleAuth,
}: AuthFormProps) => {
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
};
