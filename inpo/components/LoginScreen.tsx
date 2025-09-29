import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
  onLogin: () => void;
}

export function LoginScreen({ onSwitchToRegister, onLogin }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen p-6 flex flex-col justify-center bg-gradient-to-br from-[#A1CDF4]/10 to-background">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#A1CDF4] mb-4">
          <Shield className="w-8 h-8 text-[#25283D]" />
        </div>
        <h1 className="text-2xl font-semibold text-[#25283D] mb-2">Reportes Ciudadanos</h1>
        <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
      </div>

      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <h2 className="text-xl font-semibold text-center text-[#25283D]">Iniciar Sesión</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#25283D]">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-[#A1CDF4]/30 focus:border-[#A1CDF4] rounded-xl"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#25283D]">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-white border-[#A1CDF4]/30 focus:border-[#A1CDF4] rounded-xl"
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 bg-[#F5853F] hover:bg-[#F5853F]/90 text-white rounded-xl py-3 shadow-lg"
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <button 
                onClick={onSwitchToRegister}
                className="text-[#F5853F] font-medium hover:underline"
              >
                Regístrate
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}