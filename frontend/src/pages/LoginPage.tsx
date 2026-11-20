import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data);
      success('Bienvenido a ENGRAIN', 'Sesión iniciada correctamente');
      
      // Redirect based on email domain or role
      if (data.email.includes('taller') || data.email.includes('workshop')) {
        navigate('/workshop');
      } else {
        navigate('/owner');
      }
    } catch (err: any) {
      toastError('Error al iniciar sesión', err.message || 'Credenciales no válidas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (role: 'owner' | 'workshop') => {
    if (role === 'owner') {
      setValue('email', 'propietario@engrain.io');
      setValue('password', 'password123');
    } else {
      setValue('email', 'taller@engrain.io');
      setValue('password', 'password123');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
          Acceso a la plataforma
        </h1>
        <p className="text-xs sm:text-sm text-graphite-400">
          Ingresa tus credenciales para consultar expedientes o administrar tu taller.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="nombre@ejemplo.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-graphite-400 select-none">
            <input
              type="checkbox"
              className="rounded bg-graphite-800 border-graphite-600 text-brand focus:ring-brand/30"
            />
            Recordar en este equipo
          </label>
          <a href="#forgot" className="text-brand hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Iniciar Sesión
        </Button>
      </form>

      {/* Demo Quick Access Buttons for Hackathon Evaluation */}
      <div className="p-4 rounded-xl bg-graphite-800/60 border border-graphite-700/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-brand" /> Acceso Rápido para Pruebas
          </span>
          <span className="text-[10px] bg-brand/20 text-brand font-semibold px-1.5 py-0.5 rounded">
            HACKATHON
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill('owner')}
            className="px-2.5 py-1.5 rounded-lg bg-carbon border border-graphite-600/60 text-xs text-graphite-300 hover:text-white hover:border-brand/40 text-center transition-colors"
          >
            Demo Propietario
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('workshop')}
            className="px-2.5 py-1.5 rounded-lg bg-carbon border border-graphite-600/60 text-xs text-graphite-300 hover:text-white hover:border-brand/40 text-center transition-colors"
          >
            Demo Taller
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-graphite-800 text-center text-xs text-graphite-400">
        ¿No tienes una cuenta aún?{' '}
        <Link to="/register" className="text-brand hover:underline font-semibold">
          Crear cuenta en ENGRAIN
        </Link>
      </div>
    </div>
  );
};
