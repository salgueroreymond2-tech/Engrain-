import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Wrench, Shield } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { UserRole } from '../types/auth';
import { cn } from '../lib/cn';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener entre 8 y 128 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres'),
  role: z.enum(['OWNER', 'WORKSHOP_ADMIN']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'OWNER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as UserRole,
      });
      success('Cuenta creada', 'Bienvenido a ENGRAIN — Driving Trust');
      if (data.role === 'WORKSHOP_ADMIN') {
        navigate('/workshop');
      } else {
        navigate('/owner');
      }
    } catch (err: any) {
      toastError('Error al crear cuenta', err.message || 'No fue posible registrar el usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
          Crea tu cuenta
        </h1>
        <p className="text-xs sm:text-sm text-graphite-400">
          Únete al ecosistema digital de confianza vehicular.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection Cards */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-graphite-400">
            Tipo de Cuenta
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('role', 'OWNER')}
              className={cn(
                'flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all select-none',
                selectedRole === 'OWNER'
                  ? 'bg-brand/10 border-brand text-brand ring-1 ring-brand/30'
                  : 'bg-graphite-800 border-graphite-600/60 text-graphite-400 hover:text-platinum hover:border-graphite-500'
              )}
            >
              <Shield className="w-5 h-5 mb-1 text-inherit" />
              <span className="text-xs font-bold">Propietario</span>
              <span className="text-[10px] text-graphite-400 mt-0.5">Control de mi auto</span>
            </button>

            <button
              type="button"
              onClick={() => setValue('role', 'WORKSHOP_ADMIN')}
              className={cn(
                'flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all select-none',
                selectedRole === 'WORKSHOP_ADMIN'
                  ? 'bg-brand/10 border-brand text-brand ring-1 ring-brand/30'
                  : 'bg-graphite-800 border-graphite-600/60 text-graphite-400 hover:text-platinum hover:border-graphite-500'
              )}
            >
              <Wrench className="w-5 h-5 mb-1 text-inherit" />
              <span className="text-xs font-bold">Taller Mecánico</span>
              <span className="text-[10px] text-graphite-400 mt-0.5">Gestión y órdenes</span>
            </button>
          </div>
        </div>

        <Input
          label="Nombre Completo"
          placeholder="Ej. Roberto Sánchez"
          leftIcon={<UserIcon className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="nombre@taller.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          leftIcon={<Lock className="w-4 h-4" />}
          helperText="Debe contener entre 8 y 128 caracteres."
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-3"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Crear Cuenta
        </Button>
      </form>

      <div className="pt-4 border-t border-graphite-800 text-center text-xs text-graphite-400">
        ¿Ya tienes cuenta en la plataforma?{' '}
        <Link to="/login" className="text-brand hover:underline font-semibold">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
};
