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
  slug: string;
  rental_available: boolean;
  sale_available: boolean;
  minimum_stock: number | null;
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductSetupOption = {
  id: string;
  slot: "table" | "chair" | "linen" | "overlay" | "cover";
  variant_key: string;
  label: string;
  preview_color: string;
  finish: "matte" | "satin";
  suggested_slug: string | null;
  product_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
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


export type QuoteStatus = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type QuoteLineType = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Tax = {
  id: number;
  code: string;
  name: string;
  rate: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type DiscountCode = {
  id: number;
  code: string;
  name: string;
  discount_type: "PERCENTAGE" | "FIXED";
  value: number;
  is_active: boolean;
  created_at: string;
};

export type DeliveryZone = {
  id: number;
  name: string;
  suggested_fee: number;
  is_active: boolean;
  created_at: string;
};

export type Quote = {
  id: string;
  quote_number: string;
  customer_id: string;
  event_id: string | null;
  status_id: number;
  estimated_location: string | null;
  delivery_zone_id: number | null;
  delivery_suggested_fee: number | null;
  delivery_fee: number | null;
  delivery_tax_id: number | null;
  delivery_tax_amount: number;
  discount_code_id: number | null;
  discount_amount: number;
  manual_discount_type: "PERCENTAGE" | "FIXED" | null;
  manual_discount_value: number | null;
  subtotal: number;
  tax_total: number;
  total: number;
  notes: string | null;
  valid_until: string | null;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  expired_at: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type QuoteItem = {
  id: string;
  quote_id: string;
  product_id: string;
  line_type_id: number;
  quantity: number;
  unit_price: number;
  tax_id: number | null;
  tax_rate: number;
  tax_amount: number;
  line_subtotal: number;
  line_total: number;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type QuoteItemWithRelations = QuoteItem & {
  products: Product;
  quote_line_types: QuoteLineType;
  taxes: Tax | null;
};

export type QuoteWithRelations = Quote & {
  customers: CustomerWithRelations;
  quote_statuses: QuoteStatus;
  delivery_zones?: DeliveryZone | null;
  delivery_taxes?: Tax | null;
  discount_codes?: DiscountCode | null;
  quote_items?: QuoteItemWithRelations[];
};

export type QuotableProduct = ProductWithRelations & {
  rental_price: number | null;
  sale_price: number | null;
};

export type PublicProduct = ProductWithRelations & {
  rental_price: number | null;
  sale_price: number | null;
  images: ProductImage[];
  primary_image_url: string | null;
};

export type EventStatus = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  phase: "COMMERCIAL" | "OPERATIONAL" | "TERMINAL";
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type CustomerContact = {
  id: string;
  customer_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role_title: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type EventSource = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PaymentMethod = {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type FinancialMovementType = "ADVANCE" | "REFUND";

export type EventFinancialMovement = {
  id: string;
  event_id: string;
  movement_type: FinancialMovementType;
  amount: number;
  payment_method_id: number;
  movement_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type EventFinancialMovementWithRelations = EventFinancialMovement & {
  payment_methods: PaymentMethod;
};

export type PaymentStatus = "PAID" | "PENDING";

export type PaymentSummary = {
  quoteTotal: number;
  totalAdvances: number;
  totalRefunds: number;
  netPaid: number;
  balanceDue: number;
  overpaidAmount: number;
  paymentStatus: PaymentStatus;
};

export type Event = {
  id: string;
  title: string;
  customer_id: string;
  contact_id: string | null;
  status_id: number;
  source_id: number;
  event_date: string | null;
  delivery_date: string | null;
  pickup_date: string | null;
  estimated_location: string | null;
  notes: string | null;
  first_contact_at: string | null;
  last_contact_at: string | null;
  follow_up_at: string | null;
  no_response_at: string | null;
  lost_reason: string | null;
  priority: "LOW" | "NORMAL" | "HIGH";
  has_inventory_conflicts: boolean;
  reserved_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type EventWithRelations = Event & {
  customers: CustomerWithRelations;
  customer_contacts: CustomerContact | null;
  event_statuses: EventStatus;
  event_sources: EventSource;
  quotes?: (Quote & { quote_statuses?: QuoteStatus; quote_items?: { id: string }[] })[];
  payment_summary?: PaymentSummary | null;
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
      product_images: {
        Row: ProductImage;
        Insert: {
          product_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_setup_options: {
        Row: ProductSetupOption;
        Insert: {
          slot: ProductSetupOption["slot"];
          variant_key: string;
          label: string;
          preview_color: string;
          finish?: ProductSetupOption["finish"];
          suggested_slug?: string | null;
          product_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["product_setup_options"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_setup_options_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: Product;
        Insert: {
          product_number: string;
          category_id: number;
          tracking_type_id: number;
          product_type_id: number;
          name: string;
          slug: string;
          description?: string | null;
          rental_available?: boolean;
          sale_available?: boolean;
          minimum_stock?: number | null;
          is_active?: boolean;
          is_public?: boolean;
          sort_order?: number;
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
      quote_statuses: {
        Row: QuoteStatus;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["quote_statuses"]["Insert"]>;
        Relationships: [];
      };
      quote_line_types: {
        Row: QuoteLineType;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["quote_line_types"]["Insert"]>;
        Relationships: [];
      };
      taxes: {
        Row: Tax;
        Insert: {
          code: string;
          name: string;
          rate?: number;
          description?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["taxes"]["Insert"]>;
        Relationships: [];
      };
      discount_codes: {
        Row: DiscountCode;
        Insert: {
          code: string;
          name: string;
          discount_type: "PERCENTAGE" | "FIXED";
          value: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["discount_codes"]["Insert"]>;
        Relationships: [];
      };
      delivery_zones: {
        Row: DeliveryZone;
        Insert: {
          name: string;
          suggested_fee?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["delivery_zones"]["Insert"]>;
        Relationships: [];
      };
      quotes: {
        Row: Quote;
        Insert: {
          quote_number: string;
          customer_id: string;
          event_id?: string | null;
          status_id: number;
          estimated_location?: string | null;
          delivery_zone_id?: number | null;
          delivery_suggested_fee?: number | null;
          delivery_fee?: number | null;
          delivery_tax_id?: number | null;
          delivery_tax_amount?: number;
          discount_code_id?: number | null;
          discount_amount?: number;
          manual_discount_type?: "PERCENTAGE" | "FIXED" | null;
          manual_discount_value?: number | null;
          subtotal?: number;
          tax_total?: number;
          total?: number;
          notes?: string | null;
          valid_until?: string | null;
          sent_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
          expired_at?: string | null;
          is_locked?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_status_id_fkey";
            columns: ["status_id"];
            referencedRelation: "quote_statuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_delivery_zone_id_fkey";
            columns: ["delivery_zone_id"];
            referencedRelation: "delivery_zones";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_delivery_tax_id_fkey";
            columns: ["delivery_tax_id"];
            referencedRelation: "taxes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_discount_code_id_fkey";
            columns: ["discount_code_id"];
            referencedRelation: "discount_codes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_items: {
        Row: QuoteItem;
        Insert: {
          quote_id: string;
          product_id: string;
          line_type_id: number;
          quantity: number;
          unit_price: number;
          tax_id?: number | null;
          tax_rate?: number;
          tax_amount?: number;
          line_subtotal?: number;
          line_total?: number;
          description?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["quote_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey";
            columns: ["quote_id"];
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_line_type_id_fkey";
            columns: ["line_type_id"];
            referencedRelation: "quote_line_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_items_tax_id_fkey";
            columns: ["tax_id"];
            referencedRelation: "taxes";
            referencedColumns: ["id"];
          },
        ];
      };
      event_statuses: {
        Row: EventStatus;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          phase: "COMMERCIAL" | "OPERATIONAL" | "TERMINAL";
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["event_statuses"]["Insert"]>;
        Relationships: [];
      };
      event_sources: {
        Row: EventSource;
        Insert: {
          code: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          is_favorite?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["event_sources"]["Insert"]>;
        Relationships: [];
      };
      payment_methods: {
        Row: PaymentMethod;
        Insert: {
          code: string;
          name: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["payment_methods"]["Insert"]>;
        Relationships: [];
      };
      event_financial_movements: {
        Row: EventFinancialMovement;
        Insert: {
          event_id: string;
          movement_type: FinancialMovementType;
          amount: number;
          payment_method_id: number;
          movement_date?: string;
          notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["event_financial_movements"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "event_financial_movements_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_financial_movements_payment_method_id_fkey";
            columns: ["payment_method_id"];
            referencedRelation: "payment_methods";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_contacts: {
        Row: CustomerContact;
        Insert: {
          customer_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          role_title?: string | null;
          is_primary?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["customer_contacts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: Event;
        Insert: {
          title: string;
          customer_id: string;
          contact_id?: string | null;
          status_id: number;
          source_id: number;
          event_date?: string | null;
          delivery_date?: string | null;
          pickup_date?: string | null;
          estimated_location?: string | null;
          notes?: string | null;
          first_contact_at?: string | null;
          last_contact_at?: string | null;
          follow_up_at?: string | null;
          no_response_at?: string | null;
          lost_reason?: string | null;
          priority?: "LOW" | "NORMAL" | "HIGH";
          has_inventory_conflicts?: boolean;
          reserved_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "events_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_contact_id_fkey";
            columns: ["contact_id"];
            referencedRelation: "customer_contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_status_id_fkey";
            columns: ["status_id"];
            referencedRelation: "event_statuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_source_id_fkey";
            columns: ["source_id"];
            referencedRelation: "event_sources";
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
