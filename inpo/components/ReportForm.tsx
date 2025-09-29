import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReportFormProps {
  onNavigateBack: () => void;
}

export function ReportForm({ onNavigateBack }: ReportFormProps) {
  const [formData, setFormData] = useState({
    isAnonymous: false,
    description: '',
    contactType: '',
    contactDetails: '',
    hasDamages: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Reporte enviado exitosamente');
    onNavigateBack();
  };

  const renderContactField = () => {
    if (!formData.contactType) return null;

    const fieldConfig = {
      'web': { placeholder: 'https://ejemplo.com', label: 'URL' },
      'email': { placeholder: 'ejemplo@correo.com', label: 'Detalles del correo' },
      'message': { placeholder: 'Describe el mensaje recibido', label: 'Detalles del mensaje' }
    };

    const config = fieldConfig[formData.contactType as keyof typeof fieldConfig];

    return (
      <div className="space-y-2">
        <Label htmlFor="contactDetails" className="text-[#25283D]">{config.label}</Label>
        <Input
          id="contactDetails"
          value={formData.contactDetails}
          onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
          className="bg-white border-[#A1CDF4]/30 focus:border-[#A1CDF4] rounded-xl"
          placeholder={config.placeholder}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#A1CDF4]/10 to-background">
      <div className="mb-6 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onNavigateBack}
          className="p-2 rounded-full hover:bg-[#A1CDF4]/20"
        >
          <ArrowLeft className="w-5 h-5 text-[#25283D]" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#25283D]">Nuevo Reporte</h1>
          <p className="text-sm text-muted-foreground">Reporta un incidente o situación</p>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#25283D]">Formulario de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#A1CDF4]/10">
              <div>
                <Label htmlFor="anonymous" className="text-[#25283D] font-medium">¿Reporte anónimo?</Label>
                <p className="text-sm text-muted-foreground">Tu identidad será protegida</p>
              </div>
              <Switch
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#25283D]">Descripción del incidente</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white border-[#A1CDF4]/30 focus:border-[#A1CDF4] rounded-xl min-h-[120px] resize-none"
                placeholder="Describe detalladamente lo que ocurrió..."
                required
              />
            </div>

            {/* Contact Type */}
            <div className="space-y-2">
              <Label className="text-[#25283D]">Tipo de primer contacto</Label>
              <Select 
                value={formData.contactType} 
                onValueChange={(value) => setFormData({ ...formData, contactType: value, contactDetails: '' })}
              >
                <SelectTrigger className="bg-white border-[#A1CDF4]/30 focus:border-[#A1CDF4] rounded-xl">
                  <SelectValue placeholder="Selecciona el tipo de contacto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Página web</SelectItem>
                  <SelectItem value="email">Correo electrónico</SelectItem>
                  <SelectItem value="message">Mensaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Contact Field */}
            {renderContactField()}

            {/* Damages Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#A1CDF4]/10">
              <div>
                <Label htmlFor="damages" className="text-[#25283D] font-medium">¿Han habido daños?</Label>
                <p className="text-sm text-muted-foreground">Físicos, económicos o de otro tipo</p>
              </div>
              <Switch
                id="damages"
                checked={formData.hasDamages}
                onCheckedChange={(checked) => setFormData({ ...formData, hasDamages: checked })}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6 bg-[#F5853F] hover:bg-[#F5853F]/90 text-white rounded-xl py-3 shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Reporte
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}