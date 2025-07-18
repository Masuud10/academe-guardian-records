export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      academic_terms: {
        Row: {
          academic_year_id: string
          assessment_period_end: string | null
          assessment_period_start: string | null
          created_at: string | null
          description: string | null
          end_date: string
          holiday_end: string | null
          holiday_start: string | null
          id: string
          is_current: boolean | null
          school_id: string
          start_date: string
          status: string | null
          term_name: string
          updated_at: string | null
        }
        Insert: {
          academic_year_id: string
          assessment_period_end?: string | null
          assessment_period_start?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          holiday_end?: string | null
          holiday_start?: string | null
          id?: string
          is_current?: boolean | null
          school_id: string
          start_date: string
          status?: string | null
          term_name: string
          updated_at?: string | null
        }
        Update: {
          academic_year_id?: string
          assessment_period_end?: string | null
          assessment_period_start?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          holiday_end?: string | null
          holiday_start?: string | null
          id?: string
          is_current?: boolean | null
          school_id?: string
          start_date?: string
          status?: string | null
          term_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_terms_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_current: boolean | null
          school_id: string
          start_date: string
          status: string | null
          term_structure: string | null
          updated_at: string | null
          year_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_current?: boolean | null
          school_id: string
          start_date: string
          status?: string | null
          term_structure?: string | null
          updated_at?: string | null
          year_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_current?: boolean | null
          school_id?: string
          start_date?: string
          status?: string | null
          term_structure?: string | null
          updated_at?: string | null
          year_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "academic_years_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource: string | null
          resource_id: string | null
          success: boolean | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource?: string | null
          resource_id?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource?: string | null
          resource_id?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_communications: {
        Row: {
          created_at: string | null
          created_by: string
          dismissible: boolean | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          priority: string
          target_roles: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          dismissible?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          priority?: string
          target_roles?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          dismissible?: boolean | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          priority?: string
          target_roles?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          app_type: string
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          permissions: Json | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_type?: string
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          permissions?: Json | null
          role: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_type?: string
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_type: string
          id: string
          metadata: Json | null
          school_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category: string
          event_type: string
          id?: string
          metadata?: Json | null
          school_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          school_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "analytics_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "analytics_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "analytics_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "analytics_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string | null
          id: string
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          id?: string
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_recipients: {
        Row: {
          announcement_id: string
          created_at: string | null
          delivered_at: string | null
          delivery_channel: string | null
          delivery_status: string | null
          id: string
          read_at: string | null
          region: string | null
          school_id: string | null
          school_type: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel?: string | null
          delivery_status?: string | null
          id?: string
          read_at?: string | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_channel?: string | null
          delivery_status?: string | null
          id?: string
          read_at?: string | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_recipients_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          attachments: string[] | null
          auto_archive_date: string | null
          content: string
          created_at: string | null
          created_by: string | null
          delivery_channels: string[] | null
          expiry_date: string | null
          id: string
          is_archived: boolean | null
          is_global: boolean | null
          priority: string | null
          read_count: number | null
          region: string | null
          school_id: string | null
          school_type: string | null
          tags: string[] | null
          target_audience: string[]
          title: string
          total_recipients: number | null
        }
        Insert: {
          attachments?: string[] | null
          auto_archive_date?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          delivery_channels?: string[] | null
          expiry_date?: string | null
          id?: string
          is_archived?: boolean | null
          is_global?: boolean | null
          priority?: string | null
          read_count?: number | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          tags?: string[] | null
          target_audience: string[]
          title: string
          total_recipients?: number | null
        }
        Update: {
          attachments?: string[] | null
          auto_archive_date?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          delivery_channels?: string[] | null
          expiry_date?: string | null
          id?: string
          is_archived?: boolean | null
          is_global?: boolean | null
          priority?: string | null
          read_count?: number | null
          region?: string | null
          school_id?: string | null
          school_type?: string | null
          tags?: string[] | null
          target_audience?: string[]
          title?: string
          total_recipients?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "announcements_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          academic_year: string | null
          class_id: string | null
          date: string
          id: string
          remarks: string | null
          school_id: string
          session: string | null
          status: string | null
          student_id: string | null
          submitted_at: string | null
          submitted_by: string | null
          term: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          class_id?: string | null
          date: string
          id?: string
          remarks?: string | null
          school_id: string
          session?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          term?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          class_id?: string | null
          date?: string
          id?: string
          remarks?: string | null
          school_id?: string
          session?: string | null
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          term?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_attendance_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_attendance_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_attendance_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_attendance_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_summary: {
        Row: {
          absent_days: number | null
          academic_year: string
          attendance_percentage: number | null
          class_id: string
          id: string
          late_days: number | null
          present_days: number | null
          school_id: string
          student_id: string
          term: string
          total_days: number | null
          updated_at: string | null
        }
        Insert: {
          absent_days?: number | null
          academic_year: string
          attendance_percentage?: number | null
          class_id: string
          id?: string
          late_days?: number | null
          present_days?: number | null
          school_id: string
          student_id: string
          term: string
          total_days?: number | null
          updated_at?: string | null
        }
        Update: {
          absent_days?: number | null
          academic_year?: string
          attendance_percentage?: number | null
          class_id?: string
          id?: string
          late_days?: number | null
          present_days?: number | null
          school_id?: string
          student_id?: string
          term?: string
          total_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_summary_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "attendance_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_summary_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          performed_by_role: string
          performed_by_user_id: string | null
          school_id: string | null
          target_entity: string | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          performed_by_role: string
          performed_by_user_id?: string | null
          school_id?: string | null
          target_entity?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          performed_by_role?: string
          performed_by_user_id?: string | null
          school_id?: string | null
          target_entity?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      billing_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          processed_at: string | null
          school_id: string
          status: string
          stripe_payment_id: string | null
          subscription_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          school_id: string
          status?: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          school_id?: string
          status?: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "billing_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "billing_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "billing_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "billing_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_assessments: {
        Row: {
          assessment_date: string
          assessment_type: string
          class_id: string
          competency_id: string | null
          created_at: string
          evidence_description: string | null
          id: string
          is_final: boolean | null
          performance_level: string
          student_id: string
          subject_id: string | null
          submitted_at: string
          submitted_by: string
          teacher_observation: string | null
          term: string
          updated_at: string
        }
        Insert: {
          assessment_date?: string
          assessment_type: string
          class_id: string
          competency_id?: string | null
          created_at?: string
          evidence_description?: string | null
          id?: string
          is_final?: boolean | null
          performance_level: string
          student_id: string
          subject_id?: string | null
          submitted_at?: string
          submitted_by: string
          teacher_observation?: string | null
          term: string
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          assessment_type?: string
          class_id?: string
          competency_id?: string | null
          created_at?: string
          evidence_description?: string | null
          id?: string
          is_final?: boolean | null
          performance_level?: string
          student_id?: string
          subject_id?: string | null
          submitted_at?: string
          submitted_by?: string
          teacher_observation?: string | null
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbc_assessments_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbc_assessments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_competencies: {
        Row: {
          assessment_types: string[] | null
          class_id: string | null
          competency_code: string
          competency_name: string
          created_at: string | null
          description: string | null
          id: string
          school_id: string
          strands: Json | null
          sub_strands: Json | null
          subject_id: string | null
          updated_at: string | null
          weighting: number | null
        }
        Insert: {
          assessment_types?: string[] | null
          class_id?: string | null
          competency_code: string
          competency_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          school_id: string
          strands?: Json | null
          sub_strands?: Json | null
          subject_id?: string | null
          updated_at?: string | null
          weighting?: number | null
        }
        Update: {
          assessment_types?: string[] | null
          class_id?: string | null
          competency_code?: string
          competency_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          school_id?: string
          strands?: Json | null
          sub_strands?: Json | null
          subject_id?: string | null
          updated_at?: string | null
          weighting?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cbc_competencies_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbc_competencies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "cbc_competencies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "cbc_competencies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "cbc_competencies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "cbc_competencies_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbc_competencies_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_grade_batches: {
        Row: {
          academic_year: string
          batch_name: string
          class_id: string
          created_at: string | null
          grades_entered: number | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          status: string | null
          submitted_at: string | null
          teacher_id: string
          term: string
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          batch_name: string
          class_id: string
          created_at?: string | null
          grades_entered?: number | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          status?: string | null
          submitted_at?: string | null
          teacher_id: string
          term: string
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          batch_name?: string
          class_id?: string
          created_at?: string | null
          grades_entered?: number | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          status?: string | null
          submitted_at?: string | null
          teacher_id?: string
          term?: string
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cbc_grades: {
        Row: {
          academic_year: string
          approved_at: string | null
          approved_by: string | null
          assessment_date: string | null
          class_id: string
          created_at: string | null
          id: string
          learning_area_id: string | null
          performance_descriptor: string | null
          performance_level: string
          school_id: string
          status: string | null
          student_id: string
          submitted_at: string | null
          teacher_id: string
          teacher_remarks: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          approved_at?: string | null
          approved_by?: string | null
          assessment_date?: string | null
          class_id: string
          created_at?: string | null
          id?: string
          learning_area_id?: string | null
          performance_descriptor?: string | null
          performance_level: string
          school_id: string
          status?: string | null
          student_id: string
          submitted_at?: string | null
          teacher_id: string
          teacher_remarks?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          approved_at?: string | null
          approved_by?: string | null
          assessment_date?: string | null
          class_id?: string
          created_at?: string | null
          id?: string
          learning_area_id?: string | null
          performance_descriptor?: string | null
          performance_level?: string
          school_id?: string
          status?: string | null
          student_id?: string
          submitted_at?: string | null
          teacher_id?: string
          teacher_remarks?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbc_grades_learning_area_id_fkey"
            columns: ["learning_area_id"]
            isOneToOne: false
            referencedRelation: "cbc_learning_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_learning_areas: {
        Row: {
          created_at: string | null
          description: string | null
          grade_level: string
          id: string
          learning_area_code: string
          learning_area_name: string
          school_id: string
          subject_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          grade_level: string
          id?: string
          learning_area_code: string
          learning_area_name: string
          school_id: string
          subject_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          grade_level?: string
          id?: string
          learning_area_code?: string
          learning_area_name?: string
          school_id?: string
          subject_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbc_learning_areas_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_performance_descriptors: {
        Row: {
          created_at: string | null
          descriptor_text: string
          id: string
          is_default: boolean | null
          learning_area_id: string | null
          performance_level: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descriptor_text: string
          id?: string
          is_default?: boolean | null
          learning_area_id?: string | null
          performance_level: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descriptor_text?: string
          id?: string
          is_default?: boolean | null
          learning_area_id?: string | null
          performance_level?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbc_performance_descriptors_learning_area_id_fkey"
            columns: ["learning_area_id"]
            isOneToOne: false
            referencedRelation: "cbc_learning_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      cbc_performance_summary: {
        Row: {
          academic_year: string
          areas_for_improvement: string[] | null
          areas_of_strength: string[] | null
          class_id: string
          competency_levels: Json | null
          created_at: string | null
          id: string
          overall_performance_level: string | null
          school_id: string
          student_id: string
          subject_id: string
          teacher_general_remarks: string | null
          teacher_id: string
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          areas_for_improvement?: string[] | null
          areas_of_strength?: string[] | null
          class_id: string
          competency_levels?: Json | null
          created_at?: string | null
          id?: string
          overall_performance_level?: string | null
          school_id: string
          student_id: string
          subject_id: string
          teacher_general_remarks?: string | null
          teacher_id: string
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          areas_for_improvement?: string[] | null
          areas_of_strength?: string[] | null
          class_id?: string
          competency_levels?: Json | null
          created_at?: string | null
          id?: string
          overall_performance_level?: string | null
          school_id?: string
          student_id?: string
          subject_id?: string
          teacher_general_remarks?: string | null
          teacher_id?: string
          term?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cbc_strand_assessments: {
        Row: {
          academic_year: string
          assessment_date: string | null
          assessment_type: string
          class_id: string
          competency_id: string | null
          created_at: string | null
          id: string
          performance_level: string
          school_id: string
          strand_name: string
          student_id: string
          sub_strand_name: string | null
          subject_id: string
          submitted_at: string | null
          teacher_id: string
          teacher_remarks: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          assessment_date?: string | null
          assessment_type: string
          class_id: string
          competency_id?: string | null
          created_at?: string | null
          id?: string
          performance_level: string
          school_id: string
          strand_name: string
          student_id: string
          sub_strand_name?: string | null
          subject_id: string
          submitted_at?: string | null
          teacher_id: string
          teacher_remarks?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          assessment_date?: string | null
          assessment_type?: string
          class_id?: string
          competency_id?: string | null
          created_at?: string | null
          id?: string
          performance_level?: string
          school_id?: string
          strand_name?: string
          student_id?: string
          sub_strand_name?: string | null
          subject_id?: string
          submitted_at?: string | null
          teacher_id?: string
          teacher_remarks?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbc_strand_assessments_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "cbc_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          body_text: string
          created_at: string
          id: number
          layout_config: Json
          school_id: string
          signature_1_name: string
          signature_2_name: string
          template_name: string
          template_type: string
          title_text: string
        }
        Insert: {
          body_text?: string
          created_at?: string
          id?: never
          layout_config?: Json
          school_id: string
          signature_1_name?: string
          signature_2_name?: string
          template_name: string
          template_type: string
          title_text?: string
        }
        Update: {
          body_text?: string
          created_at?: string
          id?: never
          layout_config?: Json
          school_id?: string
          signature_1_name?: string
          signature_2_name?: string
          template_name?: string
          template_type?: string
          title_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificate_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificate_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificate_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificate_templates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          academic_year: string
          class_id: string
          created_at: string | null
          generated_at: string | null
          generated_by: string
          id: string
          performance: Json
          school_id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          class_id: string
          created_at?: string | null
          generated_at?: string | null
          generated_by: string
          id?: string
          performance?: Json
          school_id: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          class_id?: string
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          performance?: Json
          school_id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "certificates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      class_analytics: {
        Row: {
          attendance_rate: number | null
          avg_grade: number | null
          best_subjects: Json | null
          class_id: string
          fee_collection: number | null
          id: string
          improvement: number | null
          low_attendance_count: number | null
          outstanding_fees: number | null
          performance_trend: string | null
          prev_avg_grade: number | null
          reporting_period: string
          school_id: string
          term: string | null
          top_students: Json | null
          updated_at: string | null
          weakest_subjects: Json | null
          year: string | null
        }
        Insert: {
          attendance_rate?: number | null
          avg_grade?: number | null
          best_subjects?: Json | null
          class_id: string
          fee_collection?: number | null
          id?: string
          improvement?: number | null
          low_attendance_count?: number | null
          outstanding_fees?: number | null
          performance_trend?: string | null
          prev_avg_grade?: number | null
          reporting_period: string
          school_id: string
          term?: string | null
          top_students?: Json | null
          updated_at?: string | null
          weakest_subjects?: Json | null
          year?: string | null
        }
        Update: {
          attendance_rate?: number | null
          avg_grade?: number | null
          best_subjects?: Json | null
          class_id?: string
          fee_collection?: number | null
          id?: string
          improvement?: number | null
          low_attendance_count?: number | null
          outstanding_fees?: number | null
          performance_trend?: string | null
          prev_avg_grade?: number | null
          reporting_period?: string
          school_id?: string
          term?: string | null
          top_students?: Json | null
          updated_at?: string | null
          weakest_subjects?: Json | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_analytics_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "class_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "class_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "class_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "class_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_level: string | null
          capacity: number | null
          class_type: string | null
          created_at: string | null
          curriculum_type: string
          id: string
          level: string | null
          name: string
          room_number: string | null
          school_id: string | null
          stream: string | null
          teacher_id: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          academic_level?: string | null
          capacity?: number | null
          class_type?: string | null
          created_at?: string | null
          curriculum_type?: string
          id?: string
          level?: string | null
          name: string
          room_number?: string | null
          school_id?: string | null
          stream?: string | null
          teacher_id?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          academic_level?: string | null
          capacity?: number | null
          class_type?: string | null
          created_at?: string | null
          curriculum_type?: string
          id?: string
          level?: string | null
          name?: string
          room_number?: string | null
          school_id?: string | null
          stream?: string | null
          teacher_id?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_classes_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_announcements: {
        Row: {
          announcement_type: string | null
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          target_roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_details: {
        Row: {
          company_logo_url: string | null
          company_motto: string | null
          company_name: string
          company_slogan: string | null
          company_type: string | null
          contact_phone: string | null
          created_at: string | null
          headquarters_address: string | null
          id: string
          incorporation_details: string | null
          management_team: Json | null
          registration_number: string | null
          subscription_plans: Json | null
          support_email: string | null
          updated_at: string | null
          website_url: string | null
          year_established: number | null
        }
        Insert: {
          company_logo_url?: string | null
          company_motto?: string | null
          company_name?: string
          company_slogan?: string | null
          company_type?: string | null
          contact_phone?: string | null
          created_at?: string | null
          headquarters_address?: string | null
          id?: string
          incorporation_details?: string | null
          management_team?: Json | null
          registration_number?: string | null
          subscription_plans?: Json | null
          support_email?: string | null
          updated_at?: string | null
          website_url?: string | null
          year_established?: number | null
        }
        Update: {
          company_logo_url?: string | null
          company_motto?: string | null
          company_name?: string
          company_slogan?: string | null
          company_type?: string | null
          contact_phone?: string | null
          created_at?: string | null
          headquarters_address?: string | null
          id?: string
          incorporation_details?: string | null
          management_team?: Json | null
          registration_number?: string | null
          subscription_plans?: Json | null
          support_email?: string | null
          updated_at?: string | null
          website_url?: string | null
          year_established?: number | null
        }
        Relationships: []
      }
      company_metrics: {
        Row: {
          active_schools: number | null
          active_users: number | null
          api_calls_count: number | null
          created_at: string | null
          id: string
          metric_date: string
          monthly_revenue: number | null
          system_uptime_percentage: number | null
          total_revenue: number | null
          total_schools: number | null
          total_users: number | null
          updated_at: string | null
        }
        Insert: {
          active_schools?: number | null
          active_users?: number | null
          api_calls_count?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string
          monthly_revenue?: number | null
          system_uptime_percentage?: number | null
          total_revenue?: number | null
          total_schools?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Update: {
          active_schools?: number | null
          active_users?: number | null
          api_calls_count?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string
          monthly_revenue?: number | null
          system_uptime_percentage?: number | null
          total_revenue?: number | null
          total_schools?: number | null
          total_users?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      competencies: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      competency_progress: {
        Row: {
          competency_id: string | null
          current_level: string
          id: string
          last_assessed_date: string | null
          milestones_achieved: Json | null
          progress_percentage: number | null
          recommended_activities: string[] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          competency_id?: string | null
          current_level: string
          id?: string
          last_assessed_date?: string | null
          milestones_achieved?: Json | null
          progress_percentage?: number | null
          recommended_activities?: string[] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          competency_id?: string | null
          current_level?: string
          id?: string
          last_assessed_date?: string | null
          milestones_achieved?: Json | null
          progress_percentage?: number | null
          recommended_activities?: string[] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_progress_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: number
          participant_ids: string[]
        }
        Insert: {
          created_at?: string
          id?: never
          participant_ids: string[]
        }
        Update: {
          created_at?: string
          id?: never
          participant_ids?: string[]
        }
        Relationships: []
      }
      exam_analytics: {
        Row: {
          analytics_type: string
          class_id: string | null
          data: Json
          exam_session_id: string
          generated_at: string | null
          id: string
          school_id: string
          subject_id: string | null
        }
        Insert: {
          analytics_type: string
          class_id?: string | null
          data?: Json
          exam_session_id: string
          generated_at?: string | null
          id?: string
          school_id: string
          subject_id?: string | null
        }
        Update: {
          analytics_type?: string
          class_id?: string | null
          data?: Json
          exam_session_id?: string
          generated_at?: string | null
          id?: string
          school_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_analytics_exam_session_fkey"
            columns: ["exam_session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_sessions: {
        Row: {
          academic_year: string
          created_at: string | null
          created_by: string
          curriculum_type: string
          end_date: string
          exam_type: string
          id: string
          is_active: boolean | null
          is_published: boolean | null
          school_id: string
          session_name: string
          start_date: string
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          created_by: string
          curriculum_type?: string
          end_date: string
          exam_type: string
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          school_id: string
          session_name: string
          start_date: string
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          created_by?: string
          curriculum_type?: string
          end_date?: string
          exam_type?: string
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          school_id?: string
          session_name?: string
          start_date?: string
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_timetables: {
        Row: {
          class_id: string
          created_at: string | null
          created_by: string
          duration_minutes: number
          end_time: string
          exam_date: string
          exam_session_id: string
          id: string
          instructions: string | null
          invigilator_id: string | null
          is_published: boolean | null
          school_id: string
          start_time: string
          subject_id: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          created_by: string
          duration_minutes?: number
          end_time: string
          exam_date: string
          exam_session_id: string
          id?: string
          instructions?: string | null
          invigilator_id?: string | null
          is_published?: boolean | null
          school_id: string
          start_time: string
          subject_id: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          created_by?: string
          duration_minutes?: number
          end_time?: string
          exam_date?: string
          exam_session_id?: string
          id?: string
          instructions?: string | null
          invigilator_id?: string | null
          is_published?: boolean | null
          school_id?: string
          start_time?: string
          subject_id?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_timetables_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_timetables_exam_session_fkey"
            columns: ["exam_session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_timetables_invigilator_fkey"
            columns: ["invigilator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "exam_timetables_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_timetables_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      examinations: {
        Row: {
          academic_year: string
          classes: string[]
          coordinator_id: string | null
          created_at: string
          created_by: string
          end_date: string
          id: string
          name: string
          remarks: string | null
          school_id: string
          start_date: string
          term: string
          type: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          classes: string[]
          coordinator_id?: string | null
          created_at?: string
          created_by: string
          end_date: string
          id?: string
          name: string
          remarks?: string | null
          school_id: string
          start_date: string
          term: string
          type: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          classes?: string[]
          coordinator_id?: string | null
          created_at?: string
          created_by?: string
          end_date?: string
          id?: string
          name?: string
          remarks?: string | null
          school_id?: string
          start_date?: string
          term?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examinations_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examinations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "examinations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "examinations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "examinations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "examinations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approval_date: string | null
          approved_by: string | null
          category: string
          created_at: string
          date: string
          description: string | null
          expense_date: string | null
          id: string
          receipt_url: string | null
          rejection_reason: string | null
          school_id: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approval_date?: string | null
          approved_by?: string | null
          category: string
          created_at?: string
          date: string
          description?: string | null
          expense_date?: string | null
          id?: string
          receipt_url?: string | null
          rejection_reason?: string | null
          school_id: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approval_date?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          expense_date?: string | null
          id?: string
          receipt_url?: string | null
          rejection_reason?: string | null
          school_id?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "expenses_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure_items: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          fee_structure_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          fee_structure_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          fee_structure_id?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_items_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          school_id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          school_id: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          school_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fee_structures_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          academic_year: string | null
          amount: number
          category: string | null
          class_id: string | null
          created_at: string | null
          discount_amount: number | null
          due_date: string
          id: string
          installment_number: number | null
          late_fee_amount: number | null
          mpesa_code: string | null
          paid_amount: number | null
          paid_date: string | null
          payment_method: string | null
          school_id: string | null
          status: string | null
          student_id: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          category?: string | null
          class_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          installment_number?: number | null
          late_fee_amount?: number | null
          mpesa_code?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          school_id?: string | null
          status?: string | null
          student_id?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          category?: string | null
          class_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          installment_number?: number | null
          late_fee_amount?: number | null
          mpesa_code?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          school_id?: string | null
          status?: string | null
          student_id?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fees_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fees_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_fees_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_fees_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_fees_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_fees_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fees_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_settings: {
        Row: {
          created_at: string | null
          id: string
          late_fee_grace_days: number | null
          late_fee_percentage: number | null
          mpesa_consumer_key: string | null
          mpesa_consumer_secret: string | null
          mpesa_passkey: string | null
          mpesa_paybill_number: string | null
          school_id: string
          settings_data: Json | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          late_fee_grace_days?: number | null
          late_fee_percentage?: number | null
          mpesa_consumer_key?: string | null
          mpesa_consumer_secret?: string | null
          mpesa_passkey?: string | null
          mpesa_paybill_number?: string | null
          school_id: string
          settings_data?: Json | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          late_fee_grace_days?: number | null
          late_fee_percentage?: number | null
          mpesa_consumer_key?: string | null
          mpesa_consumer_secret?: string | null
          mpesa_passkey?: string | null
          mpesa_paybill_number?: string | null
          school_id?: string
          settings_data?: Json | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "finance_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "finance_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "finance_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "finance_settings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          school_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          school_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          school_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          academic_year: string | null
          amount: number
          bank_reference: string | null
          created_at: string | null
          description: string | null
          fee_id: string | null
          id: string
          mpesa_code: string | null
          payment_method: string | null
          processed_at: string | null
          processed_by: string | null
          reference_number: string | null
          school_id: string
          student_id: string | null
          term: string | null
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          bank_reference?: string | null
          created_at?: string | null
          description?: string | null
          fee_id?: string | null
          id?: string
          mpesa_code?: string | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          school_id: string
          student_id?: string | null
          term?: string | null
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          bank_reference?: string | null
          created_at?: string | null
          description?: string | null
          fee_id?: string | null
          id?: string
          mpesa_code?: string | null
          payment_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          school_id?: string
          student_id?: string | null
          term?: string | null
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "financial_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "financial_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "financial_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "financial_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_approvals: {
        Row: {
          action: string
          approver_id: string
          approver_role: string
          batch_id: string | null
          created_at: string | null
          grade_id: string | null
          id: string
          new_value: Json | null
          notes: string | null
          previous_value: Json | null
          school_id: string
        }
        Insert: {
          action: string
          approver_id: string
          approver_role: string
          batch_id?: string | null
          created_at?: string | null
          grade_id?: string | null
          id?: string
          new_value?: Json | null
          notes?: string | null
          previous_value?: Json | null
          school_id: string
        }
        Update: {
          action?: string
          approver_id?: string
          approver_role?: string
          batch_id?: string | null
          created_at?: string | null
          grade_id?: string | null
          id?: string
          new_value?: Json | null
          notes?: string | null
          previous_value?: Json | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_approvals_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "grade_submission_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_approvals_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_approvals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_approvals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_approvals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_approvals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_approvals_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_audit_logs: {
        Row: {
          action: string
          batch_id: string | null
          created_at: string | null
          grade_id: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          school_id: string
          user_agent: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          action: string
          batch_id?: string | null
          created_at?: string | null
          grade_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          school_id: string
          user_agent?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          action?: string
          batch_id?: string | null
          created_at?: string | null
          grade_id?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          school_id?: string
          user_agent?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_audit_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "grade_submission_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_audit_logs_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_submission_batches: {
        Row: {
          academic_year: string
          batch_name: string
          class_id: string
          created_at: string | null
          curriculum_type: string
          exam_type: string
          grades_entered: number | null
          id: string
          principal_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          status: string | null
          subject_id: string | null
          submitted_at: string | null
          submitted_by: string
          term: string
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          batch_name: string
          class_id: string
          created_at?: string | null
          curriculum_type: string
          exam_type: string
          grades_entered?: number | null
          id?: string
          principal_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          status?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          submitted_by: string
          term: string
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          batch_name?: string
          class_id?: string
          created_at?: string | null
          curriculum_type?: string
          exam_type?: string
          grades_entered?: number | null
          id?: string
          principal_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          status?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          submitted_by?: string
          term?: string
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_submission_batches_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_submission_batches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_submission_batches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_submission_batches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_submission_batches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_submission_batches_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_submission_batches_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_summary: {
        Row: {
          academic_year: string
          average_score: number | null
          class_id: string
          class_position: number | null
          grade_letter: string | null
          id: string
          possible_marks: number | null
          school_id: string
          student_id: string
          term: string
          total_marks: number | null
          total_subjects: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          average_score?: number | null
          class_id: string
          class_position?: number | null
          grade_letter?: string | null
          id?: string
          possible_marks?: number | null
          school_id: string
          student_id: string
          term: string
          total_marks?: number | null
          total_subjects?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          average_score?: number | null
          class_id?: string
          class_position?: number | null
          grade_letter?: string | null
          id?: string
          possible_marks?: number | null
          school_id?: string
          student_id?: string
          term?: string
          total_marks?: number | null
          total_subjects?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_summary_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grade_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_summary_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          academic_year: string
          approval_workflow_stage: string | null
          approved_at: string | null
          approved_by: string | null
          approved_by_principal: boolean | null
          cbc_performance_level: string | null
          class_id: string | null
          comments: string | null
          competency_id: string | null
          competency_level: string | null
          coursework_score: number | null
          created_at: string | null
          curriculum_type: string | null
          exam_score: number | null
          exam_type: string | null
          grade_boundary_applied: boolean | null
          id: string
          is_immutable: boolean | null
          is_released: boolean | null
          letter_grade: string | null
          marks: number | null
          max_score: number | null
          overridden_grade: number | null
          percentage: number | null
          position: number | null
          principal_notes: string | null
          raw_score: number | null
          released_at: string | null
          released_by: string | null
          released_to_parents: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          score: number | null
          status: string | null
          strand_scores: Json | null
          student_id: string | null
          subject_id: string | null
          submission_batch_id: string | null
          submitted_at: string | null
          submitted_by: string | null
          teacher_id: string | null
          teacher_remarks: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          approval_workflow_stage?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_by_principal?: boolean | null
          cbc_performance_level?: string | null
          class_id?: string | null
          comments?: string | null
          competency_id?: string | null
          competency_level?: string | null
          coursework_score?: number | null
          created_at?: string | null
          curriculum_type?: string | null
          exam_score?: number | null
          exam_type?: string | null
          grade_boundary_applied?: boolean | null
          id?: string
          is_immutable?: boolean | null
          is_released?: boolean | null
          letter_grade?: string | null
          marks?: number | null
          max_score?: number | null
          overridden_grade?: number | null
          percentage?: number | null
          position?: number | null
          principal_notes?: string | null
          raw_score?: number | null
          released_at?: string | null
          released_by?: string | null
          released_to_parents?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          score?: number | null
          status?: string | null
          strand_scores?: Json | null
          student_id?: string | null
          subject_id?: string | null
          submission_batch_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          teacher_id?: string | null
          teacher_remarks?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          approval_workflow_stage?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_by_principal?: boolean | null
          cbc_performance_level?: string | null
          class_id?: string | null
          comments?: string | null
          competency_id?: string | null
          competency_level?: string | null
          coursework_score?: number | null
          created_at?: string | null
          curriculum_type?: string | null
          exam_score?: number | null
          exam_type?: string | null
          grade_boundary_applied?: boolean | null
          id?: string
          is_immutable?: boolean | null
          is_released?: boolean | null
          letter_grade?: string | null
          marks?: number | null
          max_score?: number | null
          overridden_grade?: number | null
          percentage?: number | null
          position?: number | null
          principal_notes?: string | null
          raw_score?: number | null
          released_at?: string | null
          released_by?: string | null
          released_to_parents?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          score?: number | null
          status?: string | null
          strand_scores?: Json | null
          student_id?: string | null
          subject_id?: string | null
          submission_batch_id?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          teacher_id?: string | null
          teacher_remarks?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_grades_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_reviewed_by"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_grades_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_grades_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_grades_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_grades_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_student_id"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_subject_id"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_grades_submitted_by"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "cbc_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_configurations: {
        Row: {
          class_id: string | null
          competency_areas: Json | null
          coursework_percentage: number | null
          created_at: string | null
          created_by: string | null
          curriculum_type: string
          exam_percentage: number | null
          grade_boundaries: Json | null
          grading_scale: Json | null
          id: string
          max_score: number | null
          pass_mark: number | null
          school_id: string
          strand_weightings: Json | null
          subject_id: string | null
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          competency_areas?: Json | null
          coursework_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          curriculum_type: string
          exam_percentage?: number | null
          grade_boundaries?: Json | null
          grading_scale?: Json | null
          id?: string
          max_score?: number | null
          pass_mark?: number | null
          school_id: string
          strand_weightings?: Json | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          competency_areas?: Json | null
          coursework_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          curriculum_type?: string
          exam_percentage?: number | null
          grade_boundaries?: Json | null
          grading_scale?: Json | null
          id?: string
          max_score?: number | null
          pass_mark?: number | null
          school_id?: string
          strand_weightings?: Json | null
          subject_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grading_configurations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grading_configurations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grading_configurations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grading_configurations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grading_configurations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "grading_configurations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grading_configurations_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      igcse_grade_batches: {
        Row: {
          academic_year: string
          batch_name: string
          class_id: string
          created_at: string | null
          grades_entered: number | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          status: string | null
          subject_id: string | null
          submitted_at: string | null
          teacher_id: string
          term: string
          total_students: number | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          batch_name: string
          class_id: string
          created_at?: string | null
          grades_entered?: number | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          status?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          teacher_id: string
          term: string
          total_students?: number | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          batch_name?: string
          class_id?: string
          created_at?: string | null
          grades_entered?: number | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          status?: string | null
          subject_id?: string | null
          submitted_at?: string | null
          teacher_id?: string
          term?: string
          total_students?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "igcse_grade_batches_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "igcse_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      igcse_grades: {
        Row: {
          academic_year: string
          approved_at: string | null
          approved_by: string | null
          assessment_date: string | null
          class_id: string
          component: string | null
          created_at: string | null
          id: string
          letter_grade: string
          marks: number | null
          school_id: string
          status: string | null
          student_id: string
          subject_id: string | null
          submitted_at: string | null
          teacher_id: string
          teacher_remarks: string | null
          term: string
          updated_at: string | null
        }
        Insert: {
          academic_year?: string
          approved_at?: string | null
          approved_by?: string | null
          assessment_date?: string | null
          class_id: string
          component?: string | null
          created_at?: string | null
          id?: string
          letter_grade: string
          marks?: number | null
          school_id: string
          status?: string | null
          student_id: string
          subject_id?: string | null
          submitted_at?: string | null
          teacher_id: string
          teacher_remarks?: string | null
          term: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          approved_at?: string | null
          approved_by?: string | null
          assessment_date?: string | null
          class_id?: string
          component?: string | null
          created_at?: string | null
          id?: string
          letter_grade?: string
          marks?: number | null
          school_id?: string
          status?: string | null
          student_id?: string
          subject_id?: string | null
          submitted_at?: string | null
          teacher_id?: string
          teacher_remarks?: string | null
          term?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "igcse_grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "igcse_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      igcse_subjects: {
        Row: {
          components: Json
          created_at: string | null
          grade_boundaries: Json | null
          id: string
          school_id: string
          subject_code: string
          subject_name: string
          subject_type: string
          updated_at: string | null
        }
        Insert: {
          components?: Json
          created_at?: string | null
          grade_boundaries?: Json | null
          id?: string
          school_id: string
          subject_code: string
          subject_name: string
          subject_type: string
          updated_at?: string | null
        }
        Update: {
          components?: Json
          created_at?: string | null
          grade_boundaries?: Json | null
          id?: string
          school_id?: string
          subject_code?: string
          subject_name?: string
          subject_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiry_replies: {
        Row: {
          id: string
          inquiry_id: string
          reply_message: string
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          id?: string
          inquiry_id: string
          reply_message: string
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          id?: string
          inquiry_id?: string
          reply_message?: string
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_replies_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiry_replies_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category_id: number | null
          created_at: string
          current_quantity: number
          description: string | null
          id: number
          name: string
          reorder_level: number
          school_id: string
          sku: string | null
          supplier_id: number | null
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          current_quantity?: number
          description?: string | null
          id?: never
          name: string
          reorder_level?: number
          school_id: string
          sku?: string | null
          supplier_id?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          current_quantity?: number
          description?: string | null
          id?: never
          name?: string
          reorder_level?: number
          school_id?: string
          sku?: string | null
          supplier_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_items_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "inventory_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: number
          name: string
          phone_number: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: never
          name: string
          phone_number?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: never
          name?: string
          phone_number?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_suppliers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_suppliers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_suppliers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_suppliers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "inventory_suppliers_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_portfolios: {
        Row: {
          competency_id: string | null
          created_at: string
          created_by: string
          description: string | null
          file_urls: string[] | null
          id: string
          reflection_notes: string | null
          student_id: string
          subject_id: string | null
          teacher_feedback: string | null
          title: string
        }
        Insert: {
          competency_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          file_urls?: string[] | null
          id?: string
          reflection_notes?: string | null
          student_id: string
          subject_id?: string | null
          teacher_feedback?: string | null
          title: string
        }
        Update: {
          competency_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          file_urls?: string[] | null
          id?: string
          reflection_notes?: string | null
          student_id?: string
          subject_id?: string | null
          teacher_feedback?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_portfolios_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learner_portfolios_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: number
          created_at: string
          id: number
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: number
          created_at?: string
          id?: never
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: number
          created_at?: string
          id?: never
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_secrets: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          secret_key: string
          updated_at: string | null
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret_key: string
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret_key?: string
          updated_at?: string | null
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      mpesa_api_config: {
        Row: {
          callback_url: string
          created_at: string | null
          daraja_consumer_key: string
          daraja_consumer_secret: string
          id: string
          updated_at: string | null
        }
        Insert: {
          callback_url: string
          created_at?: string | null
          daraja_consumer_key: string
          daraja_consumer_secret: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          callback_url?: string
          created_at?: string | null
          daraja_consumer_key?: string
          daraja_consumer_secret?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mpesa_api_credentials: {
        Row: {
          consumer_key: string
          consumer_secret: string
          created_at: string | null
          id: string
          passkey: string
          paybill_number: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          consumer_key: string
          consumer_secret: string
          created_at?: string | null
          id?: string
          passkey: string
          paybill_number: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          consumer_key?: string
          consumer_secret?: string
          created_at?: string | null
          id?: string
          passkey?: string
          paybill_number?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mpesa_transactions: {
        Row: {
          amount_paid: number
          class_id: string | null
          created_at: string | null
          fee_id: string | null
          id: string
          mpesa_receipt_number: string | null
          paybill_number: string | null
          payment_type: string | null
          phone_number: string
          school_id: string
          student_id: string | null
          transaction_date: string | null
          transaction_id: string | null
          transaction_status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_paid: number
          class_id?: string | null
          created_at?: string | null
          fee_id?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          paybill_number?: string | null
          payment_type?: string | null
          phone_number: string
          school_id: string
          student_id?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          class_id?: string | null
          created_at?: string | null
          fee_id?: string | null
          id?: string
          mpesa_receipt_number?: string | null
          paybill_number?: string | null
          payment_type?: string | null
          phone_number?: string
          school_id?: string
          student_id?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_transactions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          announcement_id: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "admin_communications"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_engagements: {
        Row: {
          competencies_addressed: string[] | null
          created_at: string
          date_recorded: string
          description: string
          engagement_type: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          competencies_addressed?: string[] | null
          created_at?: string
          date_recorded?: string
          description: string
          engagement_type: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          competencies_addressed?: string[] | null
          created_at?: string
          date_recorded?: string
          description?: string
          engagement_type?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          created_at: string | null
          id: string
          is_primary_contact: boolean | null
          parent_id: string
          relationship_type: string | null
          school_id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary_contact?: boolean | null
          parent_id: string
          relationship_type?: string | null
          school_id: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary_contact?: boolean | null
          parent_id?: string
          relationship_type?: string | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_parent_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_parent_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_parent_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_parent_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          created_at: string | null
          id: string
          payment_amount: number
          payment_date: string
          payment_method: string
          processed_by: string | null
          receipt_data: Json | null
          receipt_number: string
          school_id: string
          student_fee_id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_amount: number
          payment_date: string
          payment_method: string
          processed_by?: string | null
          receipt_data?: Json | null
          receipt_number: string
          school_id: string
          student_fee_id: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_amount?: number
          payment_date?: string
          payment_method?: string
          processed_by?: string | null
          receipt_data?: Json | null
          receipt_number?: string
          school_id?: string
          student_fee_id?: string
          student_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          dashboard_preferences: Json | null
          date_of_birth: string | null
          email: string
          failed_login_attempts: number | null
          gender: string | null
          id: string
          language: string | null
          last_login_at: string | null
          last_login_ip: unknown | null
          locked_until: string | null
          mfa_enabled: boolean | null
          name: string
          national_id: string | null
          notifications_enabled: boolean | null
          password_changed_at: string | null
          phone: string | null
          profile_photo_url: string | null
          role: string
          school_id: string | null
          status: string | null
          theme: string | null
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          dashboard_preferences?: Json | null
          date_of_birth?: string | null
          email: string
          failed_login_attempts?: number | null
          gender?: string | null
          id: string
          language?: string | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          locked_until?: string | null
          mfa_enabled?: boolean | null
          name: string
          national_id?: string | null
          notifications_enabled?: boolean | null
          password_changed_at?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: string
          school_id?: string | null
          status?: string | null
          theme?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          dashboard_preferences?: Json | null
          date_of_birth?: string | null
          email?: string
          failed_login_attempts?: number | null
          gender?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          locked_until?: string | null
          mfa_enabled?: boolean | null
          name?: string
          national_id?: string | null
          notifications_enabled?: boolean | null
          password_changed_at?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: string
          school_id?: string | null
          status?: string | null
          theme?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_profiles_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_profiles_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_profiles_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_profiles_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          milestone_name: string
          project_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          milestone_name: string
          project_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          milestone_name?: string
          project_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          attachments: Json | null
          budget: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          notes: string | null
          priority: string | null
          progress: number | null
          project_name: string
          project_type: string
          responsible_person: string
          responsible_person_email: string | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          attachments?: Json | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          notes?: string | null
          priority?: string | null
          progress?: number | null
          project_name: string
          project_type: string
          responsible_person: string
          responsible_person_email?: string | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          attachments?: Json | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          priority?: string | null
          progress?: number | null
          project_name?: string
          project_type?: string
          responsible_person?: string
          responsible_person_email?: string | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          id: string
          identifier: string
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier: string
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      recruitment_applications: {
        Row: {
          applicant_name: string
          application_date: string
          cover_letter_url: string | null
          created_at: string
          cv_url: string | null
          department: string | null
          email: string
          experience_years: number | null
          hired_as_staff_id: string | null
          id: string
          interview_date: string | null
          interview_notes: string | null
          interviewer_id: string | null
          notes: string | null
          phone: string | null
          position_title: string
          qualifications: Json | null
          salary_offered: number | null
          school_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_name: string
          application_date?: string
          cover_letter_url?: string | null
          created_at?: string
          cv_url?: string | null
          department?: string | null
          email: string
          experience_years?: number | null
          hired_as_staff_id?: string | null
          id?: string
          interview_date?: string | null
          interview_notes?: string | null
          interviewer_id?: string | null
          notes?: string | null
          phone?: string | null
          position_title: string
          qualifications?: Json | null
          salary_offered?: number | null
          school_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          application_date?: string
          cover_letter_url?: string | null
          created_at?: string
          cv_url?: string | null
          department?: string | null
          email?: string
          experience_years?: number | null
          hired_as_staff_id?: string | null
          id?: string
          interview_date?: string | null
          interview_notes?: string | null
          interviewer_id?: string | null
          notes?: string | null
          phone?: string | null
          position_title?: string
          qualifications?: Json | null
          salary_offered?: number | null
          school_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_recruitment_applications_hired_as_staff_id"
            columns: ["hired_as_staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recruitment_applications_interviewer_id"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recruitment_applications_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_recruitment_applications_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_recruitment_applications_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_recruitment_applications_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_recruitment_applications_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          filters: Json | null
          generated_at: string | null
          generated_by: string
          id: string
          report_data: Json
          report_type: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          generated_at?: string | null
          generated_by: string
          id?: string
          report_data: Json
          report_type: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          generated_at?: string | null
          generated_by?: string
          id?: string
          report_data?: Json
          report_type?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "reports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_analytics: {
        Row: {
          attendance_rate: number | null
          avg_grade: number | null
          best_class_id: string | null
          best_subject_id: string | null
          collection_rate: number | null
          fee_collected: number | null
          fee_pending: number | null
          id: string
          improvement: number | null
          outstanding_fees: Json | null
          performance_trend: string | null
          reporting_period: string
          school_id: string
          term: string | null
          top_students: Json | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          attendance_rate?: number | null
          avg_grade?: number | null
          best_class_id?: string | null
          best_subject_id?: string | null
          collection_rate?: number | null
          fee_collected?: number | null
          fee_pending?: number | null
          id?: string
          improvement?: number | null
          outstanding_fees?: Json | null
          performance_trend?: string | null
          reporting_period: string
          school_id: string
          term?: string | null
          top_students?: Json | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          attendance_rate?: number | null
          avg_grade?: number | null
          best_class_id?: string | null
          best_subject_id?: string | null
          collection_rate?: number | null
          fee_collected?: number | null
          fee_pending?: number | null
          id?: string
          improvement?: number | null
          outstanding_fees?: Json | null
          performance_trend?: string | null
          reporting_period?: string
          school_id?: string
          term?: string | null
          top_students?: Json | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_analytics_summary: {
        Row: {
          attendance_updates: number | null
          created_at: string
          finance_transactions: number | null
          grade_submissions: number | null
          id: string
          last_updated: string
          school_id: string
          user_activities: number | null
        }
        Insert: {
          attendance_updates?: number | null
          created_at?: string
          finance_transactions?: number | null
          grade_submissions?: number | null
          id?: string
          last_updated?: string
          school_id: string
          user_activities?: number | null
        }
        Update: {
          attendance_updates?: number | null
          created_at?: string
          finance_transactions?: number | null
          grade_submissions?: number | null
          id?: string
          last_updated?: string
          school_id?: string
          user_activities?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "school_analytics_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_analytics_summary_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_billing_records: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          billing_type: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          paid_date: string | null
          payment_method: string | null
          school_id: string
          status: string
          student_count: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          billing_type: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          paid_date?: string | null
          payment_method?: string | null
          school_id: string
          status?: string
          student_count?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          billing_type?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          paid_date?: string | null
          payment_method?: string | null
          school_id?: string
          status?: string
          student_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_billing_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_billing_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_billing_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_billing_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_billing_records_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_mpesa_config: {
        Row: {
          business_shortcode: string | null
          created_at: string | null
          id: string
          mpesa_name: string | null
          paybill_number: string
          school_id: string
          updated_at: string | null
        }
        Insert: {
          business_shortcode?: string | null
          created_at?: string | null
          id?: string
          mpesa_name?: string | null
          paybill_number: string
          school_id: string
          updated_at?: string | null
        }
        Update: {
          business_shortcode?: string | null
          created_at?: string | null
          id?: string
          mpesa_name?: string | null
          paybill_number?: string
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_mpesa_config_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_mpesa_config_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_mpesa_config_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_mpesa_config_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "school_mpesa_config_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_preferences: {
        Row: {
          created_at: string | null
          id: string
          max_periods_per_day: number
          min_break_minutes: number
          no_lessons_days: string[] | null
          preferred_break_times: Json | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_periods_per_day?: number
          min_break_minutes?: number
          no_lessons_days?: string[] | null
          preferred_break_times?: Json | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_periods_per_day?: number
          min_break_minutes?: number
          no_lessons_days?: string[] | null
          preferred_break_times?: Json | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          created_at: string | null
          director_id: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          motto: string | null
          name: string
          owner_id: string | null
          owner_information: string | null
          phone: string | null
          registration_number: string | null
          school_type: string | null
          slogan: string | null
          status: string | null
          term_structure: string | null
          updated_at: string | null
          website_url: string | null
          year_established: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          director_id?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          motto?: string | null
          name: string
          owner_id?: string | null
          owner_information?: string | null
          phone?: string | null
          registration_number?: string | null
          school_type?: string | null
          slogan?: string | null
          status?: string | null
          term_structure?: string | null
          updated_at?: string | null
          website_url?: string | null
          year_established?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          director_id?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          motto?: string | null
          name?: string
          owner_id?: string | null
          owner_information?: string | null
          phone?: string | null
          registration_number?: string | null
          school_type?: string | null
          slogan?: string | null
          status?: string | null
          term_structure?: string | null
          updated_at?: string | null
          website_url?: string | null
          year_established?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_director_id_fkey"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schools_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource: string
          resource_id: string | null
          school_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource: string
          resource_id?: string | null
          school_id?: string | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource?: string
          resource_id?: string | null
          school_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_security_audit_logs_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_security_audit_logs_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_security_audit_logs_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_security_audit_logs_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_security_audit_logs_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          address: string | null
          assigned_classes: Json | null
          assigned_roles: Json | null
          certifications: Json | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          department: string | null
          email_address: string | null
          emergency_contact: Json | null
          employee_id: string | null
          employment_status: string
          full_name: string
          gender: string | null
          id: string
          joining_date: string
          national_id: string | null
          passport_number: string | null
          phone_number: string | null
          position: string
          profile_id: string | null
          profile_picture_url: string | null
          qualifications: Json | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          assigned_classes?: Json | null
          assigned_roles?: Json | null
          certifications?: Json | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email_address?: string | null
          emergency_contact?: Json | null
          employee_id?: string | null
          employment_status?: string
          full_name: string
          gender?: string | null
          id?: string
          joining_date: string
          national_id?: string | null
          passport_number?: string | null
          phone_number?: string | null
          position: string
          profile_id?: string | null
          profile_picture_url?: string | null
          qualifications?: Json | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          assigned_classes?: Json | null
          assigned_roles?: Json | null
          certifications?: Json | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email_address?: string | null
          emergency_contact?: Json | null
          employee_id?: string | null
          employment_status?: string
          full_name?: string
          gender?: string | null
          id?: string
          joining_date?: string
          national_id?: string | null
          passport_number?: string | null
          phone_number?: string | null
          position?: string
          profile_id?: string | null
          profile_picture_url?: string | null
          qualifications?: Json | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_activity_logs: {
        Row: {
          action_description: string | null
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          module_accessed: string | null
          school_id: string
          staff_id: string
          user_agent: string | null
        }
        Insert: {
          action_description?: string | null
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          module_accessed?: string | null
          school_id: string
          staff_id: string
          user_agent?: string | null
        }
        Update: {
          action_description?: string | null
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          module_accessed?: string | null
          school_id?: string
          staff_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_activity_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_announcements: {
        Row: {
          announcement_type: string
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string
          read_by: Json | null
          scheduled_date: string | null
          school_id: string
          target_audience: string[]
          title: string
          updated_at: string
        }
        Insert: {
          announcement_type?: string
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string
          read_by?: Json | null
          scheduled_date?: string | null
          school_id: string
          target_audience?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          announcement_type?: string
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string
          read_by?: Json | null
          scheduled_date?: string | null
          school_id?: string
          target_audience?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_announcements_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_announcements_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_announcements_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_announcements_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_announcements_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_announcements_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          notes: string | null
          school_id: string
          staff_id: string
          updated_at: string
          uploaded_by: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          school_id: string
          staff_id: string
          updated_at?: string
          uploaded_by: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          notes?: string | null
          school_id?: string
          staff_id?: string
          updated_at?: string
          uploaded_by?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_documents_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_documents_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_documents_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_documents_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_documents_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_documents_staff_id"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_documents_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_documents_verified_by"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_leave_balances: {
        Row: {
          academic_year: string
          allocated_days: number
          created_at: string | null
          id: string
          leave_type: string
          remaining_days: number
          school_id: string
          staff_id: string
          updated_at: string | null
          used_days: number
        }
        Insert: {
          academic_year: string
          allocated_days?: number
          created_at?: string | null
          id?: string
          leave_type: string
          remaining_days?: number
          school_id: string
          staff_id: string
          updated_at?: string | null
          used_days?: number
        }
        Update: {
          academic_year?: string
          allocated_days?: number
          created_at?: string | null
          id?: string
          leave_type?: string
          remaining_days?: number
          school_id?: string
          staff_id?: string
          updated_at?: string | null
          used_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_leave_balances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_leaves: {
        Row: {
          applied_at: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_requested: number
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          rejection_reason: string | null
          school_id: string
          staff_id: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_requested: number
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          rejection_reason?: string | null
          school_id: string
          staff_id: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_requested?: number
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          rejection_reason?: string | null
          school_id?: string
          staff_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_leaves_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_performance_reviews: {
        Row: {
          achievements: string | null
          acknowledged_at: string | null
          acknowledged_by_staff: boolean | null
          areas_for_improvement: string | null
          comments: string | null
          contribution_rating: number
          created_at: string
          discipline_rating: number
          goals_objectives: string | null
          id: string
          overall_rating: number | null
          punctuality_rating: number
          review_date: string
          review_period: string
          reviewer_id: string
          school_id: string
          staff_id: string
          status: string
          teamwork_rating: number
          updated_at: string
          work_quality_rating: number
        }
        Insert: {
          achievements?: string | null
          acknowledged_at?: string | null
          acknowledged_by_staff?: boolean | null
          areas_for_improvement?: string | null
          comments?: string | null
          contribution_rating: number
          created_at?: string
          discipline_rating: number
          goals_objectives?: string | null
          id?: string
          overall_rating?: number | null
          punctuality_rating: number
          review_date?: string
          review_period: string
          reviewer_id: string
          school_id: string
          staff_id: string
          status?: string
          teamwork_rating: number
          updated_at?: string
          work_quality_rating: number
        }
        Update: {
          achievements?: string | null
          acknowledged_at?: string | null
          acknowledged_by_staff?: boolean | null
          areas_for_improvement?: string | null
          comments?: string | null
          contribution_rating?: number
          created_at?: string
          discipline_rating?: number
          goals_objectives?: string | null
          id?: string
          overall_rating?: number | null
          punctuality_rating?: number
          review_date?: string
          review_period?: string
          reviewer_id?: string
          school_id?: string
          staff_id?: string
          status?: string
          teamwork_rating?: number
          updated_at?: string
          work_quality_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_staff_performance_reviews_reviewer_id"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_performance_reviews_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_performance_reviews_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_performance_reviews_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_performance_reviews_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_staff_performance_reviews_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_performance_reviews_staff_id"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_salaries: {
        Row: {
          allowances: Json | null
          basic_salary: number
          created_at: string | null
          deductions: Json | null
          gross_salary: number
          id: string
          net_salary: number
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          processed_by: string | null
          salary_period: string
          school_id: string
          staff_id: string
          updated_at: string | null
        }
        Insert: {
          allowances?: Json | null
          basic_salary?: number
          created_at?: string | null
          deductions?: Json | null
          gross_salary?: number
          id?: string
          net_salary?: number
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          processed_by?: string | null
          salary_period: string
          school_id: string
          staff_id: string
          updated_at?: string | null
        }
        Update: {
          allowances?: Json | null
          basic_salary?: number
          created_at?: string | null
          deductions?: Json | null
          gross_salary?: number
          id?: string
          net_salary?: number
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          processed_by?: string | null
          salary_period?: string
          school_id?: string
          staff_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_salaries_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_salaries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transactions: {
        Row: {
          created_at: string
          id: number
          item_id: number
          notes: string | null
          quantity_change: number
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          item_id: number
          notes?: string | null
          quantity_change: number
          transaction_date?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          item_id?: number
          notes?: string | null
          quantity_change?: number
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      student_analytics: {
        Row: {
          absences: number | null
          attendance_rate: number | null
          avg_grade: number | null
          class_id: string | null
          id: string
          improvement: number | null
          low_attendance: boolean | null
          performance_trend: string | null
          present: number | null
          prev_avg_grade: number | null
          reporting_period: string
          school_id: string
          student_id: string
          term: string | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          absences?: number | null
          attendance_rate?: number | null
          avg_grade?: number | null
          class_id?: string | null
          id?: string
          improvement?: number | null
          low_attendance?: boolean | null
          performance_trend?: string | null
          present?: number | null
          prev_avg_grade?: number | null
          reporting_period: string
          school_id: string
          student_id: string
          term?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          absences?: number | null
          attendance_rate?: number | null
          avg_grade?: number | null
          class_id?: string | null
          id?: string
          improvement?: number | null
          low_attendance?: boolean | null
          performance_trend?: string | null
          present?: number | null
          prev_avg_grade?: number | null
          reporting_period?: string
          school_id?: string
          student_id?: string
          term?: string | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_analytics_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_analytics_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_analytics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_classes: {
        Row: {
          academic_year: string
          class_id: string
          created_at: string | null
          enrollment_date: string | null
          id: string
          is_active: boolean | null
          school_id: string
          student_id: string
        }
        Insert: {
          academic_year?: string
          class_id: string
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          is_active?: boolean | null
          school_id: string
          student_id: string
        }
        Update: {
          academic_year?: string
          class_id?: string
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_student_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_student_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_student_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_student_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          amount_paid: number | null
          created_at: string
          due_date: string
          fee_id: string
          id: string
          school_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          due_date: string
          fee_id: string
          id?: string
          school_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          due_date?: string
          fee_id?: string
          id?: string
          school_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "student_fees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_transport_assignments: {
        Row: {
          assignment_date: string
          created_at: string
          id: number
          is_active: boolean
          route_id: number
          student_id: string
          updated_at: string
        }
        Insert: {
          assignment_date?: string
          created_at?: string
          id?: never
          is_active?: boolean
          route_id: number
          student_id: string
          updated_at?: string
        }
        Update: {
          assignment_date?: string
          created_at?: string
          id?: never
          is_active?: boolean
          route_id?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_transport_assignments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_transport_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_number: string
          avatar_url: string | null
          class_id: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          enrollment_date: string | null
          gender: string | null
          guardian_contact: string | null
          guardian_name: string | null
          guardian_relationship: string | null
          id: string
          is_active: boolean | null
          medical_notes: string | null
          name: string
          nationality: string | null
          parent_contact: string | null
          parent_id: string | null
          previous_school: string | null
          religion: string | null
          roll_number: string | null
          school_id: string | null
          special_needs: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admission_number: string
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          enrollment_date?: string | null
          gender?: string | null
          guardian_contact?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          is_active?: boolean | null
          medical_notes?: string | null
          name: string
          nationality?: string | null
          parent_contact?: string | null
          parent_id?: string | null
          previous_school?: string | null
          religion?: string | null
          roll_number?: string | null
          school_id?: string | null
          special_needs?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admission_number?: string
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          enrollment_date?: string | null
          gender?: string | null
          guardian_contact?: string | null
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          is_active?: boolean | null
          medical_notes?: string | null
          name?: string
          nationality?: string | null
          parent_contact?: string | null
          parent_id?: string | null
          previous_school?: string | null
          religion?: string | null
          roll_number?: string | null
          school_id?: string | null
          special_needs?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_students_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_students_parent_id"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_students_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_students_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_competencies: {
        Row: {
          competency_id: string | null
          created_at: string
          id: string
          subject_id: string | null
          weight: number | null
        }
        Insert: {
          competency_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          weight?: number | null
        }
        Update: {
          competency_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_competencies_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_teacher_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          class_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          school_id: string
          subject_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          class_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          school_id: string
          subject_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          class_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string
          subject_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subject_teacher_assignments_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subject_teacher_assignments_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subject_teacher_assignments_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subject_teacher_assignments_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subject_teacher_assignments_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          assessment_weight: number | null
          category: string | null
          class_id: string | null
          code: string
          created_at: string | null
          credit_hours: number | null
          curriculum: string | null
          curriculum_type: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          prerequisites: string[] | null
          school_id: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_weight?: number | null
          category?: string | null
          class_id?: string | null
          code: string
          created_at?: string | null
          credit_hours?: number | null
          curriculum?: string | null
          curriculum_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prerequisites?: string[] | null
          school_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_weight?: number | null
          category?: string | null
          class_id?: string | null
          code?: string
          created_at?: string | null
          credit_hours?: number | null
          curriculum?: string | null
          curriculum_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prerequisites?: string[] | null
          school_id?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_subjects_class_id"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subjects_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subjects_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_subjects_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subjects_teacher_id"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects_priority: {
        Row: {
          created_at: string | null
          id: string
          is_core: boolean
          priority_weight: number
          school_id: string
          subject_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_core?: boolean
          priority_weight?: number
          school_id: string
          subject_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_core?: boolean
          priority_weight?: number
          school_id?: string
          subject_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          currency: string
          end_date: string
          id: string
          plan_type: string
          school_id: string
          start_date: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          end_date: string
          id?: string
          plan_type: string
          school_id: string
          start_date: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          end_date?: string
          id?: string
          plan_type?: string
          school_id?: string
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      support_staff: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          date_of_hire: string
          department: string | null
          email: string | null
          employee_id: string | null
          employment_type: string
          full_name: string
          id: string
          is_active: boolean | null
          notes: string | null
          phone: string | null
          profile_photo_url: string | null
          role_title: string
          salary_amount: number | null
          salary_currency: string | null
          school_id: string
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_hire?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employment_type?: string
          full_name: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role_title: string
          salary_amount?: number | null
          salary_currency?: string | null
          school_id: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_hire?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          employment_type?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role_title?: string
          salary_amount?: number | null
          salary_currency?: string | null
          school_id?: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_staff_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_staff_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: string[] | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          school_id: string | null
          status: string | null
          title: string
          type: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          school_id?: string | null
          status?: string | null
          title: string
          type?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          school_id?: string | null
          status?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "support_tickets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      system_analytics: {
        Row: {
          avg_attendance: number | null
          error_summary: Json | null
          id: string
          improving_schools: Json | null
          low_collection_schools: Json | null
          popular_subjects: Json | null
          reporting_period: string
          system_usage: Json | null
          term: string | null
          top_schools: Json | null
          updated_at: string | null
          year: string | null
        }
        Insert: {
          avg_attendance?: number | null
          error_summary?: Json | null
          id?: string
          improving_schools?: Json | null
          low_collection_schools?: Json | null
          popular_subjects?: Json | null
          reporting_period: string
          system_usage?: Json | null
          term?: string | null
          top_schools?: Json | null
          updated_at?: string | null
          year?: string | null
        }
        Update: {
          avg_attendance?: number | null
          error_summary?: Json | null
          id?: string
          improving_schools?: Json | null
          low_collection_schools?: Json | null
          popular_subjects?: Json | null
          reporting_period?: string
          system_usage?: Json | null
          term?: string | null
          top_schools?: Json | null
          updated_at?: string | null
          year?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      system_notifications: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          priority: string
          read_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_status: {
        Row: {
          current_status: string
          id: string
          supabase_connected: boolean
          updated_at: string
          uptime_percent: number
        }
        Insert: {
          current_status?: string
          id?: string
          supabase_connected?: boolean
          updated_at?: string
          uptime_percent?: number
        }
        Update: {
          current_status?: string
          id?: string
          supabase_connected?: boolean
          updated_at?: string
          uptime_percent?: number
        }
        Relationships: []
      }
      teacher_classes: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          school_id: string
          subject_id: string | null
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          school_id: string
          subject_id?: string | null
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          school_id?: string
          subject_id?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_teacher_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_teacher_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_teacher_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_teacher_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "fk_teacher_classes_school_id"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers_availability: {
        Row: {
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          is_available: boolean
          school_id: string
          start_time: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          is_available?: boolean
          school_id: string
          start_time: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          is_available?: boolean
          school_id?: string
          start_time?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      timetables: {
        Row: {
          class_id: string
          created_at: string | null
          created_by_principal_id: string
          day_of_week: string
          end_time: string
          id: string
          is_published: boolean
          room: string | null
          school_id: string
          start_time: string
          subject_id: string
          teacher_id: string
          term: string | null
          updated_at: string | null
        }
        Insert: {
          class_id: string
          created_at?: string | null
          created_by_principal_id: string
          day_of_week: string
          end_time: string
          id?: string
          is_published?: boolean
          room?: string | null
          school_id: string
          start_time: string
          subject_id: string
          teacher_id: string
          term?: string | null
          updated_at?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string | null
          created_by_principal_id?: string
          day_of_week?: string
          end_time?: string
          id?: string
          is_published?: boolean
          room?: string | null
          school_id?: string
          start_time?: string
          subject_id?: string
          teacher_id?: string
          term?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_timetables_created_by_principal"
            columns: ["created_by_principal_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetables_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          created_at: string
          id: number
          monthly_fee: number
          route_description: string | null
          route_name: string
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          monthly_fee: number
          route_description?: string | null
          route_name: string
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          monthly_fee?: number
          route_description?: string | null
          route_name?: string
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_routes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_routes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_routes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_routes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_routes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_vehicles: {
        Row: {
          assigned_route_id: number | null
          capacity: number
          created_at: string
          id: number
          registration_number: string
          school_id: string
          updated_at: string
          vehicle_name: string
        }
        Insert: {
          assigned_route_id?: number | null
          capacity: number
          created_at?: string
          id?: never
          registration_number: string
          school_id: string
          updated_at?: string
          vehicle_name: string
        }
        Update: {
          assigned_route_id?: number | null
          capacity?: number
          created_at?: string
          id?: never
          registration_number?: string
          school_id?: string
          updated_at?: string
          vehicle_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_vehicles_assigned_route_id_fkey"
            columns: ["assigned_route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_vehicles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_vehicles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_vehicles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_vehicles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "transport_vehicles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dismissed_communications: {
        Row: {
          communication_id: string
          dismissed_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          communication_id: string
          dismissed_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          communication_id?: string
          dismissed_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dismissed_communications_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "admin_communications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_login_details: {
        Row: {
          access_level: number | null
          created_at: string
          department: string | null
          employee_id: string | null
          force_password_change: boolean | null
          id: string
          is_locked: boolean | null
          last_login: string | null
          locked_until: string | null
          login_attempts: number | null
          password_changed_at: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: number | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          force_password_change?: boolean | null
          id?: string
          is_locked?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: number | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          force_password_change?: boolean | null
          id?: string
          is_locked?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      comprehensive_report_data: {
        Row: {
          attendance_rate: number | null
          average_grade: number | null
          location: string | null
          outstanding_amount: number | null
          school_created_at: string | null
          school_id: string | null
          school_name: string | null
          total_attendance_records: number | null
          total_collected: number | null
          total_fees: number | null
          total_grades: number | null
          total_students: number | null
          total_teachers: number | null
        }
        Relationships: []
      }
      mpesa_transactions_with_details: {
        Row: {
          admission_number: string | null
          amount_paid: number | null
          class_id: string | null
          class_level: string | null
          class_name: string | null
          created_at: string | null
          fee_amount: number | null
          fee_category: string | null
          fee_id: string | null
          id: string | null
          mpesa_receipt_number: string | null
          paybill_number: string | null
          payment_type: string | null
          phone_number: string | null
          roll_number: string | null
          school_id: string | null
          school_name: string | null
          student_id: string | null
          student_name: string | null
          transaction_date: string | null
          transaction_id: string | null
          transaction_status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_transactions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "comprehensive_report_data"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_attendance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_finance_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "school_grades_summary"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "mpesa_transactions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      school_attendance_summary: {
        Row: {
          attendance_count: number | null
          attendance_rate: number | null
          school_id: string | null
          school_name: string | null
        }
        Relationships: []
      }
      school_finance_summary: {
        Row: {
          outstanding_fees: number | null
          school_id: string | null
          school_name: string | null
          total_collected: number | null
          transactions_count: number | null
        }
        Relationships: []
      }
      school_grades_summary: {
        Row: {
          average_grade: number | null
          average_percentage: number | null
          grades_count: number | null
          school_id: string | null
          school_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_user_status: {
        Args: { target_user_id: string; new_status: string }
        Returns: Json
      }
      armor: {
        Args: { "": string }
        Returns: string
      }
      assign_fee_to_class: {
        Args: { p_class_id: string; p_fee_data: Json }
        Returns: Json
      }
      assign_fee_to_class_students: {
        Args: { p_fee_id: string }
        Returns: number
      }
      assign_school_to_user: {
        Args: { target_user_id: string; target_school_id: string }
        Returns: Json
      }
      auto_archive_announcements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_cbc_competency_level: {
        Args: { strand_scores: Json; competency_weightings: Json }
        Returns: string
      }
      calculate_class_grade_stats: {
        Args: { p_class_id: string; p_term: string; p_exam_type: string }
        Returns: Json
      }
      calculate_class_positions: {
        Args: { p_class_id: string; p_term: string; p_exam_type: string }
        Returns: undefined
      }
      calculate_igcse_grade: {
        Args: {
          coursework_score: number
          exam_score: number
          coursework_weight: number
          exam_weight: number
          grade_boundaries: Json
        }
        Returns: string
      }
      calculate_school_subscription_fee: {
        Args: { p_school_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_action: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_communications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_user: {
        Args: {
          user_email: string
          user_password: string
          user_name: string
          user_role: string
          user_school_id?: string
        }
        Returns: Json
      }
      create_comprehensive_school: {
        Args:
          | { school_data: Json }
          | {
              school_name: string
              school_email: string
              school_phone: string
              school_address: string
              logo_url?: string
              website_url?: string
              motto?: string
              slogan?: string
              school_type?: string
              registration_number?: string
              year_established?: number
              term_structure?: string
              owner_information?: string
              owner_email?: string
              owner_name?: string
              owner_phone?: string
              principal_name?: string
              principal_contact?: string
              principal_email?: string
              mpesa_paybill_number?: string
              mpesa_consumer_key?: string
              mpesa_consumer_secret?: string
              mpesa_passkey?: string
            }
          | {
              school_name: string
              school_email: string
              school_phone: string
              school_address: string
              school_type?: string
              term_structure?: string
              registration_number?: string
              year_established?: number
              logo_url?: string
              website_url?: string
              motto?: string
              slogan?: string
              owner_name?: string
              owner_email?: string
              owner_phone?: string
              owner_information?: string
              mpesa_paybill_number?: string
              mpesa_consumer_key?: string
              mpesa_consumer_secret?: string
              mpesa_passkey?: string
            }
          | {
              school_name: string
              school_email: string
              school_phone: string
              school_address: string
              school_type?: string
              term_structure?: string
              registration_number?: string
              year_established?: number
              logo_url?: string
              website_url?: string
              motto?: string
              slogan?: string
              owner_name?: string
              owner_email?: string
              owner_phone?: string
              owner_information?: string
              principal_name?: string
              principal_email?: string
              principal_contact?: string
              mpesa_paybill_number?: string
              mpesa_consumer_key?: string
              mpesa_consumer_secret?: string
              mpesa_passkey?: string
            }
          | {
              school_name: string
              school_email: string
              school_phone: string
              school_address: string
              school_type?: string
              term_structure?: string
              registration_number?: string
              year_established?: number
              logo_url?: string
              website_url?: string
              motto?: string
              slogan?: string
              owner_name?: string
              owner_email?: string
              owner_phone?: string
              principal_name?: string
              principal_email?: string
              principal_phone?: string
              mpesa_passkey?: string
            }
          | {
              school_name: string
              school_email: string
              school_phone: string
              school_address: string
              school_type?: string
              term_structure?: string
              registration_number?: string
              year_established?: number
              logo_url?: string
              website_url?: string
              motto?: string
              slogan?: string
              owner_name?: string
              owner_email?: string
              owner_phone?: string
              principal_name?: string
              principal_email?: string
              principal_phone?: string
              mpesa_paybill_number?: string
              mpesa_consumer_key?: string
              mpesa_consumer_secret?: string
              mpesa_passkey?: string
            }
        Returns: Json
      }
      create_enhanced_school: {
        Args: {
          school_name: string
          school_email: string
          school_phone: string
          school_address: string
          logo_url?: string
          website_url?: string
          motto?: string
          slogan?: string
          school_type?: string
          registration_number?: string
          year_established?: number
          term_structure?: string
          owner_information?: string
          owner_email?: string
          owner_name?: string
          owner_phone?: string
        }
        Returns: Json
      }
      create_monthly_subscription_fees: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_school: {
        Args: {
          school_name: string
          school_email: string
          school_phone: string
          school_address: string
          owner_email?: string
          owner_name?: string
        }
        Returns: Json
      }
      create_setup_fee_record: {
        Args: { p_school_id: string }
        Returns: string
      }
      dearmor: {
        Args: { "": string }
        Returns: string
      }
      gen_random_bytes: {
        Args: { "": number }
        Returns: string
      }
      gen_random_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      gen_salt: {
        Args: { "": string }
        Returns: string
      }
      generate_finance_report: {
        Args: {
          p_report_type: string
          p_school_id: string
          p_class_id?: string
          p_student_id?: string
          p_academic_year?: string
          p_term?: string
        }
        Returns: Json
      }
      generate_hr_user_reset_instructions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_support_staff_employee_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_timetable: {
        Args: { p_school_id: string; p_class_id: string; p_created_by: string }
        Returns: Json
      }
      get_accurate_activity_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_logins: number
          active_sessions: number
          system_uptime: number
          api_success_rate: number
        }[]
      }
      get_accurate_billing_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_revenue: number
          monthly_revenue: number
          revenue_growth_rate: number
          transaction_count: number
        }[]
      }
      get_accurate_school_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_schools: number
          active_schools: number
          new_schools_this_month: number
          school_growth_rate: number
          schools_by_type: Json
        }[]
      }
      get_accurate_user_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          active_users: number
          new_users_this_month: number
          user_growth_rate: number
          user_role_distribution: Json
        }[]
      }
      get_admin_schools_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          location: string
          created_at: string
          updated_at: string
          owner_id: string
          logo_url: string
          website_url: string
          motto: string
          slogan: string
          registration_number: string
          year_established: number
          owner_information: string
          school_type: string
          status: string
          term_structure: string
        }[]
      }
      get_admin_users_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          role: string
          created_at: string
          updated_at: string
          status: string
          school_id: string
          school_name: string
        }[]
      }
      get_class_report_data: {
        Args: { p_class_id: string; p_academic_year: string; p_term?: string }
        Returns: Json
      }
      get_current_admin_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_current_admin_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_owned_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_school_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_maintenance_message: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_outstanding_fees: {
        Args: { p_school_id: string }
        Returns: number
      }
      get_student_certificate_data: {
        Args: {
          p_student_id: string
          p_academic_year: string
          p_class_id: string
        }
        Returns: Json
      }
      get_student_report_data: {
        Args: { p_student_id: string; p_academic_year: string; p_term?: string }
        Returns: Json
      }
      get_system_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_system_analytics_accurate: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_system_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      handle_inventory_transaction: {
        Args: {
          p_item_id: number
          p_quantity_change: number
          p_transaction_type: string
          p_user_id: string
          p_supplier_id?: number
          p_notes?: string
        }
        Returns: Json
      }
      handle_login_attempt: {
        Args: { user_email: string; success?: boolean }
        Returns: Json
      }
      has_admin_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
      hash_password_simple: {
        Args: { password: string }
        Returns: string
      }
      initiate_mpesa_payment: {
        Args: {
          p_phone_number: string
          p_amount: number
          p_student_fee_id: string
        }
        Returns: Json
      }
      is_edufam_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_finance_officer_authorized_for_school: {
        Args: { p_school_id: string }
        Returns: boolean
      }
      is_grade_in_user_school: {
        Args: { grade_student_id: string }
        Returns: boolean
      }
      is_parent_authorized_for_student: {
        Args: { p_student_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_system_in_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_teacher_authorized_for_class: {
        Args: { p_class_id: string }
        Returns: boolean
      }
      is_teacher_authorized_for_subject: {
        Args: { p_subject_id: string; p_class_id: string }
        Returns: boolean
      }
      log_audit_action: {
        Args: {
          p_action: string
          p_target_entity?: string
          p_old_value?: Json
          p_new_value?: Json
          p_metadata?: Json
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_action: string
          p_resource: string
          p_resource_id?: string
          p_success?: boolean
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: string
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      pgp_key_id: {
        Args: { "": string }
        Returns: string
      }
      record_fee_payment: {
        Args: {
          p_student_fee_id: string
          p_amount: number
          p_payment_method: string
          p_reference_number?: string
          p_mpesa_code?: string
          p_bank_reference?: string
        }
        Returns: Json
      }
      requires_mfa: {
        Args: { user_role: string }
        Returns: boolean
      }
      test_hr_authentication: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_sharon_hr_authentication: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_company_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_fee_payment: {
        Args: { p_fee_id: string; p_payment_amount: number }
        Returns: undefined
      }
      update_grade_status: {
        Args: { grade_ids: string[]; new_status: string; user_id: string }
        Returns: Json
      }
      update_mpesa_transaction: {
        Args: {
          p_transaction_id: string
          p_mpesa_receipt_number: string
          p_status: string
        }
        Returns: Json
      }
      update_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
      update_user_status: {
        Args: { target_user_id: string; new_status: string }
        Returns: Json
      }
      validate_finance_officer_transaction: {
        Args: { p_transaction_data: Json }
        Returns: Json
      }
      validate_grade_edit_permission: {
        Args: { grade_id: string; user_id: string }
        Returns: boolean
      }
      validate_grade_submission: {
        Args: {
          p_student_id: string
          p_subject_id: string
          p_class_id: string
          p_term: string
          p_exam_type: string
          p_score: number
          p_max_score: number
        }
        Returns: string
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      validate_teacher_grade_submission: {
        Args: { p_grade_data: Json }
        Returns: Json
      }
      verify_hr_access: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "engineer"
        | "support_hr"
        | "marketing_sales"
        | "finance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: [
        "super_admin",
        "engineer",
        "support_hr",
        "marketing_sales",
        "finance",
      ],
    },
  },
} as const
