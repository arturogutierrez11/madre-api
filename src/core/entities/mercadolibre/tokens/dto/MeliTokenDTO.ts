export type MeliTokenDTO = {
  app_key?: string;
  client_id?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: Date;
};
