import React, { useState } from 'react';
import { Save, Shield, Users, Building, Activity } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';

export const WorkshopSettingsPage: React.FC = () => {
  const { success } = useToast();
  const [name, setName] = useState('Precision Motors & Diagnostics');
  const [taxId, setTaxId] = useState('RFC-PMD880120-K9');
  const [phone, setPhone] = useState('+52 55 5812 4490');
  const [address, setAddress] = useState('Av. Insurgentes Sur 1425, CDMX');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Configuración guardada', 'Los datos del taller fueron actualizados.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración del Taller"
        description="Parámetros operativos, datos fiscales y acreditación de miembros técnicos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-brand" />
              <CardTitle className="text-base">Información de la Entidad</CardTitle>
            </div>
            <Badge variant="success" size="sm" dot>VERIFICADO</Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Nombre Comercial del Taller"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="RFC / Identificador Fiscal"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
                <Input
                  label="Teléfono de Contacto"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Input
                label="Dirección de las Instalaciones"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="pt-3">
                <Button type="submit" size="sm" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Members & API Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <CardTitle className="text-base">Equipo Técnico</CardTitle>
              </div>
              <Badge variant="outline" size="sm">2 TÉCNICOS</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-carbon border border-graphite-700/50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-platinum">Ing. Roberto Sánchez</p>
                  <p className="text-graphite-400">Administrador de Taller</p>
                </div>
                <Badge variant="warning" size="sm">ADMIN</Badge>
              </div>
              <div className="p-2.5 rounded-lg bg-carbon border border-graphite-700/50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-platinum">Carlos Méndez</p>
                  <p className="text-graphite-400">Especialista OBD2</p>
                </div>
                <Badge variant="default" size="sm">TÉCNICO</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-trust" />
                <CardTitle className="text-base">Seguridad y Firma</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-graphite-400">
              <p>Toda orden cerrada sella criptográficamente el kilometraje en la línea de tiempo del vehículo.</p>
              <div className="pt-2 font-mono text-[11px] text-trust flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Nodo Operativo Certificado
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
