import React, { useState, useEffect } from 'react';
import {
  Save,
  Shield,
  Users,
  Building,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { workshopService } from '../../services/workshopService';
import { Workshop, WorkshopMember, WorkshopMemberRole } from '../../types/workshop';
import { useToast } from '../../hooks/useToast';
import { PageLoading } from '../../components/ui/Loading';

export const WorkshopSettingsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [members, setMembers] = useState<WorkshopMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [weekdaysHours, setWeekdaysHours] = useState('08:00 - 19:00');
  const [saturdayHours, setSaturdayHours] = useState('09:00 - 15:00');

  // Add Member modal state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<WorkshopMemberRole>('TECHNICIAN');
  const [newMemberSpecialty, setNewMemberSpecialty] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const workshops = await workshopService.getWorkshops();
        const currentWs = workshops[0];
        if (currentWs) {
          setWorkshop(currentWs);
          setName(currentWs.name);
          setTaxId(currentWs.taxId || '');
          setPhone(currentWs.phone || '');
          setAddress(currentWs.address || '');
          setWebsite(currentWs.website || '');
          if (currentWs.hours) {
            setWeekdaysHours(currentWs.hours.weekdays);
            setSaturdayHours(currentWs.hours.saturday);
          }
          const mems = await workshopService.getMembers(currentWs.id);
          setMembers(mems);
        }
      } catch (err) {
        console.error('Error fetching workshop settings', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop) return;
    try {
      const updated = await workshopService.updateWorkshop(workshop.id, {
        name,
        taxId,
        phone,
        address,
        website,
        hours: {
          weekdays: weekdaysHours,
          saturday: saturdayHours,
          sunday: 'Cerrado',
        },
      });
      setWorkshop(updated);
      success('Configuración guardada', 'Los datos del taller fueron actualizados correctamente.');
    } catch (err: any) {
      toastError('Error al guardar', err.message);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop || !newMemberName || !newMemberEmail) return;
    try {
      const newMember = await workshopService.addMember(workshop.id, {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        specialty: newMemberSpecialty,
      });
      setMembers([...members, newMember]);
      success('Miembro acreditado', `${newMember.name} fue registrado en el equipo del taller.`);
      setIsAddMemberModalOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberSpecialty('');
    } catch (err: any) {
      toastError('Error al añadir miembro', err.message);
    }
  };

  if (isLoading) {
    return <PageLoading message="Cargando perfil del taller..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración y Acreditación del Taller"
        description="Parámetros operativos, datos fiscales, horarios y equipo técnico acreditado para la firma de mantenimientos."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workshop Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-brand" />
              <CardTitle className="text-base text-white">Perfil Operativo de las Instalaciones</CardTitle>
            </div>
            <Badge variant="success" size="sm" dot>TALLER CERTIFICADO</Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre Comercial"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="RFC / Identificación Fiscal"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Teléfono de Contacto"
                  placeholder="+52 55 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Sitio Web / Portal"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <Input
                label="Dirección Física de Bahías"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="pt-2 border-t border-graphite-700/60 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-graphite-400 block">
                  Horarios de Atención
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Lunes a Viernes"
                    value={weekdaysHours}
                    onChange={(e) => setWeekdaysHours(e.target.value)}
                  />
                  <Input
                    label="Sábados"
                    value={saturdayHours}
                    onChange={(e) => setSaturdayHours(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" size="sm" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                  Guardar Perfil del Taller
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Technical Team & Certifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" />
                <CardTitle className="text-base text-white">Equipo Técnico Acreditado</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs py-1 px-2.5"
                leftIcon={<Plus className="w-3 h-3" />}
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                Añadir
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {members.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-carbon border border-graphite-700/60 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-platinum">{mem.name}</p>
                    <p className="text-[11px] text-graphite-400">{mem.email}</p>
                    {mem.specialty && (
                      <p className="text-[10px] text-brand font-mono pt-0.5">{mem.specialty}</p>
                    )}
                  </div>
                  <Badge variant={mem.role === 'ADMIN' ? 'warning' : 'default'} size="sm">
                    {mem.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-trust" />
                <CardTitle className="text-base text-white">Seguridad de la Firma</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-graphite-300 leading-relaxed">
              <p>
                Cada orden completada por un técnico acreditado emite un sello inmutable con firma SHA-256 en el pasaporte del automóvil.
              </p>
              <div className="p-2.5 rounded-lg bg-carbon border border-graphite-700/50 font-mono text-[11px] text-trust flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Llave de Taller: ACTIVA_v1
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: Añadir Miembro Técnico */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Acreditar Técnico o Asesor"
        description="Registra al personal autorizado para ejecutar diagnósticos y sellar órdenes."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej. Ing. Mateo Valenzuela"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="mateo@precisionmotors.mx"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
          />
          <Select
            label="Rol Operativo"
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value as any)}
            options={[
              { value: 'TECHNICIAN', label: 'Técnico Especialista' },
              { value: 'ADVISOR', label: 'Asesor de Servicio' },
              { value: 'ADMIN', label: 'Administrador de Taller' },
            ]}
          />
          <Input
            label="Especialidad Técnica"
            placeholder="Ej. Inyección Electrónica, Frenos ABS, Aire Acondicionado..."
            value={newMemberSpecialty}
            onChange={(e) => setNewMemberSpecialty(e.target.value)}
          />

          <div className="pt-3 border-t border-graphite-700/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Acreditar Miembro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
