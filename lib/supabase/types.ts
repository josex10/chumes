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

export type CustomerType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  name: string;
  identification: string | null;
  customer_type_id: number;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerWithRelations = Customer & {
  customer_types: CustomerType;
};

export type ProductCategory = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductTrackingType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProductType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProductPriceType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  product_number: string;
  category_id: number;
  tracking_type_id: number;
  product_type_id: number;
  name: string;
  description: string | null;
  rental_available: boolean;
  sale_available: boolean;
  minimum_stock: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ProductWithRelations = Product & {
  product_categories: ProductCategory;
  product_types: ProductType;
  product_tracking_types: ProductTrackingType;
};

export type ProductPrice = {
  id: string;
  product_id: string;
  price_type_id: number;
  amount: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  created_by: string | null;
};

export type ProductPriceWithRelations = ProductPrice & {
  product_price_types: ProductPriceType;
};

export type ProductCost = {
  id: string;
  product_id: string;
  cost: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  created_by: string | null;
};

export type ProductBundleItem = {
  id: string;
  bundle_product_id: string;
  component_product_id: string;
  quantity: number;
  created_at: string;
  created_by: string | null;
};

export type ProductBundleItemWithRelations = ProductBundleItem & {
  products?: Product;
};

export type InventoryMovementType = {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type InventoryMovement = {
  id: string;
  product_id: string;
  movement_type_id: number;
  quantity: number;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

export type InventoryMovementWithRelations = InventoryMovement & {
  inventory_movement_types: InventoryMovementType;
};

export type ProductStockBalance = {
  product_id: string;
  balance: number;
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
      customer_types: {
        Row: CustomerType;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["customer_types"]["Insert"]
        >;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: {
          name: string;
          identification?: string | null;
          customer_type_id: number;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "customers_customer_type_id_fkey";
            columns: ["customer_type_id"];
            referencedRelation: "customer_types";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: ProductCategory;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_categories"]["Insert"]
        >;
        Relationships: [];
      };
      product_tracking_types: {
        Row: ProductTrackingType;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_tracking_types"]["Insert"]
        >;
        Relationships: [];
      };
      product_types: {
        Row: ProductType;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["product_types"]["Insert"]>;
        Relationships: [];
      };
      product_price_types: {
        Row: ProductPriceType;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_price_types"]["Insert"]
        >;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          product_number: string;
          category_id: number;
          tracking_type_id: number;
          product_type_id: number;
          name: string;
          description?: string | null;
          rental_available?: boolean;
          sale_available?: boolean;
          minimum_stock?: number | null;
          is_active?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_tracking_type_id_fkey";
            columns: ["tracking_type_id"];
            referencedRelation: "product_tracking_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_product_type_id_fkey";
            columns: ["product_type_id"];
            referencedRelation: "product_types";
            referencedColumns: ["id"];
          },
        ];
      };
      product_prices: {
        Row: ProductPrice;
        Insert: {
          product_id: string;
          price_type_id: number;
          amount: number;
          effective_from?: string;
          effective_to?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_prices"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_prices_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_prices_price_type_id_fkey";
            columns: ["price_type_id"];
            referencedRelation: "product_price_types";
            referencedColumns: ["id"];
          },
        ];
      };
      product_costs: {
        Row: ProductCost;
        Insert: {
          product_id: string;
          cost: number;
          effective_from?: string;
          effective_to?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["product_costs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_bundle_items: {
        Row: ProductBundleItem;
        Insert: {
          bundle_product_id: string;
          component_product_id: string;
          quantity: number;
          created_by?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_bundle_items"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "product_bundle_items_bundle_product_id_fkey";
            columns: ["bundle_product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_bundle_items_component_product_id_fkey";
            columns: ["component_product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_movement_types: {
        Row: InventoryMovementType;
        Insert: {
          code: string;
          name: string;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["inventory_movement_types"]["Insert"]
        >;
        Relationships: [];
      };
      inventory_movements: {
        Row: InventoryMovement;
        Insert: {
          product_id: string;
          movement_type_id: number;
          quantity: number;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["inventory_movements"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_movements_movement_type_id_fkey";
            columns: ["movement_type_id"];
            referencedRelation: "inventory_movement_types";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      product_stock_balances: {
        Row: ProductStockBalance;
        Relationships: [];
      };
    };
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
