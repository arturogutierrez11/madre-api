export type ProductSyncStatus =
  | 'ACTIVE' // Vendible
  | 'PAUSED' // Pausado (editable)
  | 'PENDING' // En revisión Megatone (editable)
  | 'DELETED' // Eliminado (NO editable)
  | 'ERROR'; // Estado inválido
