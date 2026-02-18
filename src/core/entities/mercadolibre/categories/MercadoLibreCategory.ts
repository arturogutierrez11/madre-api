export type MercadoLibreCategory = {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  path: string;
  isLeaf: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FlatCategory = {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  path: string;
  isLeaf: boolean;
};
