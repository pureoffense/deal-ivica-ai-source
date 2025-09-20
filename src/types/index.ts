// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'creator' | 'viewer';
  created_at: string;
  updated_at: string;
  last_login?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Deck Types
export type DeckStatus = 'draft' | 'published' | 'expired';
export type GateType = 'info' | 'signature' | 'payment' | 'otp';

export interface Deck {
  id: string;
  creator_id: string;
  title: string;
  prompt_text: string;
  generated_content_url?: string;
  gate_settings: GateSettings;
  unique_slug: string;
  status: DeckStatus;
  view_count: number;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface GateSettings {
  enabled_gates: GateType[];
  info_gate?: {
    required_fields: string[];
    custom_message?: string;
  };
  signature_gate?: {
    document_url: string;
    required_signature: boolean;
  };
  payment_gate?: {
    amount: number;
    currency: string;
    description?: string;
  };
  otp_gate?: {
    method: 'email' | 'sms';
    message?: string;
  };
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm extends LoginForm {
  confirmPassword: string;
  role: 'creator' | 'viewer';
}

export interface DeckCreationForm {
  prompt: string;
  gates: GateType[];
  title?: string;
  expiration?: Date;
}

// Access Log Types
export interface AccessLog {
  id: string;
  deck_id: string;
  viewer_info: Record<string, unknown>;
  signatures?: Record<string, unknown>;
  access_timestamp: string;
  view_count: number;
}

// LOI and Booking Types
export interface LOI {
  id: string;
  deck_id: string;
  viewer_id: string;
  loi_content: Record<string, unknown>;
  signed_document_url?: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  deck_id: string;
  viewer_id: string;
  meeting_type: string;
  calendar_details: Record<string, unknown>;
  timestamp: string;
}

// UI Component Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}