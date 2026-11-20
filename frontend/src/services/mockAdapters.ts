import { Vehicle } from '../types/vehicle';
import { WorkOrder, Workshop } from '../types/workshop';
import { Maintenance } from '../types/maintenance';
import { Diagnostic } from '../types/diagnostic';
import { Passport } from '../types/passport';

/**
 * Mock adapters for contract routes currently in 'Reservado' state (501 Feature Not Implemented).
 * Used strictly for UI rendering & visual preview during Stage B1.
 * Clearly labeled to avoid presenting simulated data as real production data.
 */

export const MOCK_WORKSHOPS: Workshop[] = [
  {
    id: 'mock-ws-001',
    ownerId: 'usr-admin-1',
    name: 'Precision Motors & Diagnostics',
    taxId: 'RFC-PMD880120-K9',
    phone: '+52 55 5812 4490',
    address: 'Av. Insurgentes Sur 1425, CDMX',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo-7821',
    vehicleId: 'veh-001',
    workshopId: 'mock-ws-001',
    createdById: 'usr-tech-1',
    status: 'IN_PROGRESS',
    title: 'Mantenimiento Mayor 80,000 km y Escaneo OBD2',
    description: 'Cambio de bujías de iridio, fluidos sintéticos, filtro de aire y revisión de sensor MAF.',
    openedAt: '2026-11-18T09:30:00.000Z',
    createdAt: '2026-11-18T09:30:00.000Z',
    updatedAt: '2026-11-19T11:15:00.000Z',
  },
  {
    id: 'wo-7819',
    vehicleId: 'veh-002',
    workshopId: 'mock-ws-001',
    createdById: 'usr-tech-2',
    status: 'COMPLETED',
    title: 'Reemplazo de Balatas Cerámicas y Rectificado',
    description: 'Sustitución de pastillas delanteras, purgado de frenos DOT4 y prueba dinámica de frenado.',
    openedAt: '2026-11-15T14:00:00.000Z',
    closedAt: '2026-11-16T17:45:00.000Z',
    createdAt: '2026-11-15T14:00:00.000Z',
    updatedAt: '2026-11-16T17:45:00.000Z',
  },
  {
    id: 'wo-7804',
    vehicleId: 'veh-003',
    workshopId: 'mock-ws-001',
    createdById: 'usr-tech-1',
    status: 'SCHEDULED',
    title: 'Diagnóstico por Check Engine Intermitente',
    description: 'Lectura de códigos DTC por pérdida de potencia en pendiente.',
    openedAt: '2026-11-21T08:00:00.000Z',
    createdAt: '2026-11-19T16:00:00.000Z',
    updatedAt: '2026-11-19T16:00:00.000Z',
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    ownerId: 'usr-owner-1',
    vin: '3N1AB7AP6HY218940',
    plate: 'NXY-4821',
    make: 'Mazda',
    model: 'CX-5 Signature AWD',
    year: 2022,
    mileageKm: 46200,
    status: 'ACTIVE',
    dataSource: 'OBD2',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-11-19T14:30:00.000Z',
  },
  {
    id: 'veh-002',
    ownerId: 'usr-owner-1',
    vin: '1HGCR2F83HA019482',
    plate: 'PAZ-1102',
    make: 'Honda',
    model: 'Accord Touring 2.0T',
    year: 2020,
    mileageKm: 78500,
    status: 'ACTIVE',
    dataSource: 'WORKSHOP',
    createdAt: '2026-03-22T08:15:00.000Z',
    updatedAt: '2026-11-16T17:45:00.000Z',
  },
  {
    id: 'veh-003',
    ownerId: 'usr-owner-2',
    vin: 'WAUZZZF27NA049182',
    plate: 'CDX-9988',
    make: 'Audi',
    model: 'A4 S-Line Quattro',
    year: 2021,
    mileageKm: 52100,
    status: 'ACTIVE',
    dataSource: 'MANUAL',
    createdAt: '2026-05-10T11:20:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
  },
];

export const MOCK_MAINTENANCES: Maintenance[] = [
  {
    id: 'mnt-101',
    vehicleId: 'veh-001',
    createdById: 'usr-owner-1',
    status: 'SCHEDULED',
    title: 'Alineación, Balanceo y Rotación de Neumáticos',
    description: 'Inspección de banda de rodamiento y presión de inflado a 35 PSI.',
    dueDate: '2026-12-05T00:00:00.000Z',
    mileageKm: 50000,
    createdAt: '2026-11-10T12:00:00.000Z',
    updatedAt: '2026-11-10T12:00:00.000Z',
  },
  {
    id: 'mnt-102',
    vehicleId: 'veh-001',
    createdById: 'usr-tech-1',
    status: 'COMPLETED',
    title: 'Cambio de Aceite 0W-20 y Filtro de Motor',
    description: 'Sintético de alta protección, revisión de niveles de anticongelante y frenos.',
    dueDate: '2026-10-15T00:00:00.000Z',
    completedAt: '2026-10-14T16:30:00.000Z',
    mileageKm: 42000,
    createdAt: '2026-10-10T09:00:00.000Z',
    updatedAt: '2026-10-14T16:30:00.000Z',
  },
];

export const MOCK_DIAGNOSTICS: Diagnostic[] = [
  {
    id: 'diag-001',
    vehicleId: 'veh-001',
    createdById: 'usr-tech-1',
    source: 'OBD2',
    status: 'SUCCESS',
    mileageKm: 46200,
    performedAt: '2026-11-18T10:15:00.000Z',
    dtcs: [
      {
        code: 'P0420',
        status: 'PENDING',
        description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
        severity: 'MEDIUM',
      },
    ],
    payload: {
      voltage: 13.8,
      coolantTempC: 89,
      rpm: 720,
      fuelTrimShort: 2.1,
      protocol: 'ISO 15765-4 (CAN 29/500)',
    },
    createdAt: '2026-11-18T10:15:00.000Z',
    updatedAt: '2026-11-18T10:15:00.000Z',
  },
  {
    id: 'diag-002',
    vehicleId: 'veh-002',
    createdById: 'usr-tech-2',
    source: 'WORKSHOP',
    status: 'SUCCESS',
    mileageKm: 78500,
    performedAt: '2026-11-15T14:30:00.000Z',
    dtcs: [],
    payload: {
      voltage: 14.1,
      coolantTempC: 91,
      rpm: 680,
      protocol: 'CAN 11/500',
    },
    createdAt: '2026-11-15T14:30:00.000Z',
    updatedAt: '2026-11-15T14:30:00.000Z',
  },
];

export const MOCK_PASSPORT: Passport = {
  id: 'pass-sample-01',
  vehicleId: 'veh-001',
  publicToken: 'engrain-px78912',
  visibility: 'PUBLIC',
  status: 'ACTIVE',
  expiresAt: '2027-11-20T18:00:00.000Z',
  snapshot: {
    vehicle: {
      vin: '3N1AB7AP6HY218940',
      plate: 'NXY-4821',
      make: 'Mazda',
      model: 'CX-5 Signature AWD',
      year: 2022,
      mileageKm: 46200,
    },
    metrics: {
      trustScore: 94,
      totalInterventions: 8,
      activeAlertsCount: 0,
      verifiedMileage: true,
      lastInspectionDate: '2026-11-18T10:15:00.000Z',
    },
    records: [
      {
        date: '2026-11-18T10:15:00.000Z',
        type: 'DIAGNOSTIC',
        title: 'Escaneo OBD2 Completo en Taller Autorizado',
        source: 'Precision Motors & Diagnostics',
        mileageKm: 46200,
        verified: true,
        notes: 'Protocolo CAN validado, 1 advertencia menor en sensor secundario resuelta.',
      },
      {
        date: '2026-10-14T16:30:00.000Z',
        type: 'MAINTENANCE',
        title: 'Servicio Preventivo 40,000 km',
        source: 'Agencia Mazda Insurgentes',
        mileageKm: 42000,
        verified: true,
        notes: 'Sustitución de lubricante, filtros originales y revisión de 25 puntos de seguridad.',
      },
      {
        date: '2026-05-02T11:00:00.000Z',
        type: 'INSPECTION',
        title: 'Verificación Ambiental y Emisiones',
        source: 'Centro de Verificación CDMX',
        mileageKm: 34100,
        verified: true,
        notes: 'Holograma 00 aprobado.',
      },
      {
        date: '2025-11-20T09:40:00.000Z',
        type: 'MAINTENANCE',
        title: 'Mantenimiento Preventivo 30,000 km',
        source: 'Precision Motors & Diagnostics',
        mileageKm: 29800,
        verified: true,
        notes: 'Rotación y alineación.',
      },
    ],
    generatedAt: new Date().toISOString(),
  },
  createdAt: '2026-11-19T18:00:00.000Z',
  updatedAt: '2026-11-19T18:00:00.000Z',
};
