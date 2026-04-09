export interface MeliApiItemDescription {
  plainText: string;
}

export interface IMeliApiDescriptionRepository {
  getItemDescription(itemId: string): Promise<MeliApiItemDescription>;
}
