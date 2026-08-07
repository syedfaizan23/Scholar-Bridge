export interface User {
  id: number; username: string; email: string;
  first_name: string; last_name: string;
  role: 'student' | 'admin'; is_active: boolean;
  created_at: string; student_profile?: StudentProfile | null;
}
export interface StudentProfile {
  id?: number; nationality: string; phone: string; date_of_birth: string;
  cgpa: number | null; percentage: number | null; ielts_score: number | null;
  desired_degree: string; bio: string; address: string; city: string;
  province: string; postal_code: string; father_name: string;
  father_contact: string; father_occupation: string; mother_name: string;
  mother_contact: string; mother_occupation: string;
  emergency_contact_name: string; emergency_contact_phone: string;
  emergency_contact_relation: string; last_institution: string;
  last_degree: string; graduation_year: number | null;
  field_of_study: string; extracurriculars: string; achievements: string;
  scholarship_percentage?: number;
}
export interface Scholarship {
  id: number; title: string; university_name: string; country: string;
  degree_level: 'bachelor' | 'master' | 'phd' | 'any';
  required_cgpa: number | null; required_percentage: number | null;
  ielts_required: number | null; scholarship_amount: string;
  application_deadline: string; seats_available: number;
  description: string; eligibility_criteria: string; application_link: string;
  is_active: boolean; is_saved: boolean; is_applied: boolean;
  days_until_deadline: number; created_at: string; updated_at: string;
}
export interface Application {
  id: number; scholarship?: Scholarship;
  scholarship_title?: string; scholarship_university?: string; scholarship_country?: string;
  status: 'pending'|'challan_paid'|'approved'|'rejected'|'cancelled'|'expired';
  status_display: string; applied_cgpa: number|null; applied_percentage: number|null;
  applied_ielts: number|null; scholarship_tier: number;
  personal_statement: string; admin_notes: string;
  student_name: string; student_email: string;
  challan_number: string; challan_amount: number;
  challan_due_date: string; challan_paid_at: string|null;
  challan_image_url: string|null; is_challan_overdue: boolean;
  challan_days_remaining: number; applied_at: string; updated_at: string;
}
export interface EligibilityResult {
  is_eligible: boolean; scholarship_tier: number; message: string;
  your_percentage: number; required_percentage: number;
}
export interface DashboardStats {
  total_scholarships: number; saved_scholarships: number;
  total_applications: number; approved_applications: number;
  rejected_applications: number; pending_applications: number;
}
export interface AdminStats {
  total_students: number; total_scholarships: number; total_applications: number;
  approved_applications: number; rejected_applications: number; pending_applications: number;
}
export interface PaginatedResponse<T> {
  count: number; next: string|null; previous: string|null; results: T[];
}
export interface ContactInquiry {
  id: number; name: string; email: string; phone: string; country: string;
  subject: string; message: string; status: 'new'|'in_progress'|'resolved'|'closed';
  created_at: string; updated_at: string;
}
export interface Review {
  id: number; rating: number; title: string; body: string;
  is_approved?: boolean; created_at: string; updated_at?: string;
  student_name?: string; student_country?: string; student_email?: string;
}
