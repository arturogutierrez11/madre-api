export interface TaxesCategoryRow {
  id: number;
  id_mla: string;
  categoria_arancelaria: string | null;
  die: number | null;
  te: number | null;
  iva: number | null;
  derechos: number | null;
  composicion_conf_automeli_iva: number | null;
  composicion_conf_automeli_imp2: number | null;
  composicion_conf_automeli_imp3: number | null;
  compuesto: number | null;
  codigo_categoria_automeli: string | null;
}

export interface ISQLTaxesCategoriesRepository {
  findByMla(idMla: string): Promise<TaxesCategoryRow | null>;
  findManyByMla(idMlas: string[]): Promise<TaxesCategoryRow[]>;
}
