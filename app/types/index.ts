/**
 * Tipos e interfaces para o sistema de Ordens de Serviço (O.S.) em Paradas
 */

/**
 * Ordem de Serviço (O.S.)
 * Representa um serviço individual a ser executado
 */
export interface WorkOrder {
  id: string;
  tag: string;
  currentMachineName: string;
  oldMachineName: string;
  description: string;
  currentPercentage: number;
  previousPercentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  lastModifiedAt: Date;
  lastModifiedBy: string;
  team: string;
  area: string;
  priority?: 'low' | 'medium' | 'high';
  expectedDate?: Date;
  notes?: string;
}

/**
 * Log de modificação de uma O.S.
 */
export interface WorkOrderLog {
  id: string;
  workOrderId: string;
  previousPercentage: number;
  newPercentage: number;
  modifiedAt: Date;
  modifiedBy: string;
  notes?: string;
}

/**
 * Subpacote
 */
export interface SubPackage {
  id: string;
  name: string;
  packageId: string;
  type: 'team' | 'area' | 'division';
  workOrders: string[];
  totalWorkOrders: number;
  completedWorkOrders: number;
  averageProgress: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

/**
 * Pacote
 */
export interface Package {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  subPackages: string[];
  totalWorkOrders: number;
  completedWorkOrders: number;
  totalProgress: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

/**
 * Dados de importação do Excel
 */
export interface ImportedData {
  tag: string;
  currentMachineName: string;
  oldMachineName?: string;
  description: string;
  team: string;
  area?: string;
  priority?: 'low' | 'medium' | 'high';
  expectedDate?: string;
  [key: string]: any;
}

/**
 * Resultado da validação de importação
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  data?: ImportedData[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ValidationWarning {
  row: number;
  field: string;
  message: string;
}

/**
 * Configuração de coluna para mapeamento do Excel
 */
export interface ColumnMapping {
  excelColumn: string;
  dataField: keyof ImportedData;
  required: boolean;
  type: 'string' | 'number' | 'date';
}

/**
 * Filtros para busca de O.S.
 */
export interface WorkOrderFilters {
  team?: string[];
  area?: string[];
  tag?: string;
  machineName?: string;
  priority?: ('low' | 'medium' | 'high')[];
  status?: ('pending' | 'in_progress' | 'completed' | 'delayed')[];
}

/**
 * Estado global do usuário
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  createdAt: Date;
  lastLogin?: Date;
}
