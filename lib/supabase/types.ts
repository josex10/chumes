export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProfileStatus = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  role_id: number | null;
  status_id: number;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileWithRelations = Profile & {
  roles: Role | null;
  profile_statuses: ProfileStatus;
};

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: Role;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      profile_statuses: {
        Row: ProfileStatus;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["profile_statuses"]["Insert"]
        >;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: {
          clerk_user_id: string;
          email: string;
          full_name?: string | null;
          role_id?: number | null;
          status_id: number;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_status_id_fkey";
            columns: ["status_id"];
            referencedRelation: "profile_statuses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      requesting_user_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
