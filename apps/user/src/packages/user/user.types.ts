export interface CreateUserAccount {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
}
