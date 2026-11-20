export type VehicleStatus = 'ACTIVE' | 'ARCHIVED' | 'TRANSFER_PENDING';
export type DataSource = 'MANUAL' | 'OBD2' | 'WORKSHOP' | 'AGENCY' | 'IMPORTED';

export interface Vehicle {
  id: string;
  ownerId: string;
  vin: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  status: VehicleStatus;
  dataSource: DataSource;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleInput {
  vin: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  dataSource?: DataSource;
}

export interface UpdateVehicleInput {
  plate?: string;
  make?: string;
  model?: string;
  year?: number;
  mileageKm?: number;
  dataSource?: DataSource;
}
