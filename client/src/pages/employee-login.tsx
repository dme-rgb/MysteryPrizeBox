import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, LogIn, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

interface EmployeeData {
  id: string;
  username: string;
  name: string;
}

export default function EmployeeLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await fetch('/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }

      return await res.json() as EmployeeData;
    },
    onSuccess: (data) => {
      localStorage.setItem('employee', JSON.stringify(data));
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.name}!`,
      });
      setLocation('/employee/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Back Button */}
        <div className="flex items-center justify-start mb-4">
          <Link href="/">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-login-title">
            Employee Login
          </h1>
          <p className="text-muted-foreground">
            Sign in to verify customer rewards
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Enter your username"
                        className="pl-10"
                        data-testid="input-username"
                        aria-label="Username"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        data-testid="input-password"
                        aria-label="Password"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-6 text-lg font-medium gap-2"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              <LogIn className="w-5 h-5" />
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Default credentials: employee / employee123</p>
        </div>
      </Card>
    </div>
  );
}
