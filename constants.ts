import { InspectionStatus } from './types';

// --- Fluid inspection fields ---
export interface FluidFieldDef {
  id: keyof import('./types').InspectionData['fluids'];
  label: string;
}

export const FLUID_FIELDS: readonly FluidFieldDef[] = [
  { id: 'engineOil', label: 'Óleo do Motor' },
  { id: 'brakeFluid', label: 'Fluido de Freio' },
  { id: 'coolant', label: 'Líquido de Arrefecimento' },
  { id: 'wiperFluid', label: 'Limpador de Para-brisa' },
  { id: 'transmissionFluid', label: 'Fluido de Transmissão' },
] as const;

export const FLUID_STATUSES: readonly InspectionStatus[] = [
  InspectionStatus.OK,
  InspectionStatus.LOW,
  InspectionStatus.CHANGE_REQUIRED,
] as const;

// --- Electrical inspection fields ---
export interface ElectricalFieldDef {
  id: keyof Pick<import('./types').InspectionData['electrical'], 'alternator' | 'belts'>;
  label: string;
  icon: string;
}

export const ELECTRICAL_FIELDS: readonly ElectricalFieldDef[] = [
  { id: 'alternator', label: 'Carga do Alternador', icon: 'fa-charging-station' },
  { id: 'belts', label: 'Estado das Correias', icon: 'fa-life-ring' },
] as const;

export const ELECTRICAL_STATUSES: readonly InspectionStatus[] = [
  InspectionStatus.OK,
  InspectionStatus.MINOR_DEFECT,
  InspectionStatus.MAJOR_DEFECT,
] as const;

// --- Checkout fields ---
export interface CheckoutFieldDef {
  id: keyof import('./types').InspectionData['checkout'];
  label: string;
  icon: string;
}

export const CHECKOUT_FIELDS: readonly CheckoutFieldDef[] = [
  { id: 'testDrive', label: 'Test Drive Realizado', icon: 'fa-gauge-high' },
  { id: 'wheelTorque', label: 'Torque de Rodas OK', icon: 'fa-wrench' },
  { id: 'cleaning', label: 'Limpeza Externa/Interna', icon: 'fa-sparkles' },
  { id: 'personalObjects', label: 'Sem Objetos Esquecidos', icon: 'fa-suitcase' },
] as const;

// --- Battery rating labels ---
export const BATTERY_LABELS: readonly string[] = [
  'Crítica', '2', '3', '4', '100% OK',
] as const;
