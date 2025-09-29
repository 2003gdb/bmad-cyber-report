import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { User, Mail, FileText, Edit3, LogOut } from 'lucide-react';

interface ProfileScreenProps {
  onLogout: () => void;
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#A1CDF4]/10 to-background">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#25283D]">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu información personal</p>
      </div>

      {/* Profile Info Card */}
      <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="w-20 h-20 mb-4 bg-[#A1CDF4]">
              <AvatarFallback className="text-[#25283D] text-xl font-semibold">
                JD
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-[#25283D] mb-1">Juan Pérez</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              juan.perez@email.com
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#A1CDF4]/10">
              <User className="w-5 h-5 text-[#25283D]" />
              <div>
                <p className="text-sm font-medium text-[#25283D]">Nombre</p>
                <p className="text-sm text-muted-foreground">Juan Pérez</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#A1CDF4]/10">
              <Mail className="w-5 h-5 text-[#25283D]" />
              <div>
                <p className="text-sm font-medium text-[#25283D]">Correo electrónico</p>
                <p className="text-sm text-muted-foreground">juan.perez@email.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Summary Card */}
      <Card className="mb-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#25283D]">
            <FileText className="w-5 h-5" />
            Mis Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[#25283D]">12</p>
              <p className="text-sm text-muted-foreground">Reportes enviados</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                8 Aceptados
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                3 En proceso
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                1 Rechazado
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full py-3 rounded-xl border-[#A1CDF4] text-[#25283D] hover:bg-[#A1CDF4]/10"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>

        <Button 
          onClick={onLogout}
          variant="outline" 
          className="w-full py-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}