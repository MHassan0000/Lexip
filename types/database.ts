// Database types for Supabase tables

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    plan: 'free' | 'pro' | 'enterprise'
                    status: 'active' | 'canceled' | 'past_due' | 'trialing'
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    current_period_start: string | null
                    current_period_end: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    plan?: 'free' | 'pro' | 'enterprise'
                    status?: 'active' | 'canceled' | 'past_due' | 'trialing'
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    current_period_start?: string | null
                    current_period_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    plan?: 'free' | 'pro' | 'enterprise'
                    status?: 'active' | 'canceled' | 'past_due' | 'trialing'
                    stripe_customer_id?: string | null
                    stripe_subscription_id?: string | null
                    current_period_start?: string | null
                    current_period_end?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            thumbnail_generations: {
                Row: {
                    id: string
                    user_id: string
                    prompt: string
                    style: string | null
                    image_urls: string[]
                    selected_image_url: string | null
                    metadata: Json
                    status: 'pending' | 'processing' | 'completed' | 'failed'
                    error_message: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    prompt: string
                    style?: string | null
                    image_urls?: string[]
                    selected_image_url?: string | null
                    metadata?: Json
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    prompt?: string
                    style?: string | null
                    image_urls?: string[]
                    selected_image_url?: string | null
                    metadata?: Json
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    error_message?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            usage_limits: {
                Row: {
                    id: string
                    user_id: string
                    period_start: string
                    period_type: 'daily' | 'monthly'
                    generations_count: number
                    max_generations: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    period_start?: string
                    period_type?: 'daily' | 'monthly'
                    generations_count?: number
                    max_generations?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    period_start?: string
                    period_type?: 'daily' | 'monthly'
                    generations_count?: number
                    max_generations?: number
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Functions: {
            get_or_create_daily_usage: {
                Args: { p_user_id: string }
                Returns: Database['public']['Tables']['usage_limits']['Row']
            }
            increment_usage: {
                Args: { p_user_id: string }
                Returns: boolean
            }
        }
    }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type ThumbnailGeneration = Database['public']['Tables']['thumbnail_generations']['Row']
export type UsageLimit = Database['public']['Tables']['usage_limits']['Row']

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'
