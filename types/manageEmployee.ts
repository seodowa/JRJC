export interface ManageEmployee {
  ID: number;
  Username: string;
  Email: string;
  profile_image: string | null;
  account_type: string;
  account_type_id?: number;
}