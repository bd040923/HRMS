/**
 * Arithwise HRM API Service
 * Copyright (C) 2024 Arithwise Inc.
 */

// Use relative URL when running on same port, otherwise use full URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // If response is not JSON, return as text
        const text = await response.text();
        return text as any;
      }
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Job Titles
  async getJobTitles() {
    return this.request<any[]>('/job-titles');
  }

  async createJobTitle(data: { title: string; description?: string }) {
    return this.request<any>('/job-titles', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateJobTitle(id: number, data: { title: string; description?: string; status?: string }) {
    return this.request<any>(`/job-titles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteJobTitle(id: number) {
    return this.request<any>(`/job-titles/${id}`, { method: 'DELETE' });
  }

  // Organization General Information
  async getOrganizationGeneralInfo() {
    return this.request<any>('/organization/general-information');
  }

  async updateOrganizationGeneralInfo(data: {
    name: string;
    registration_number?: string;
    tax_id?: string;
    phone?: string;
    fax?: string;
    email?: string;
    street1?: string;
    street2?: string;
    city?: string;
    province?: string;
    zip_code?: string;
    country?: string;
    note?: string;
    number_of_employees?: number;
  }) {
    return this.request<any>('/organization/general-information', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Locations
  async getLocations(filters?: { name?: string; city?: string; country?: string }) {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.country) params.append('country', filters.country);
    
    const queryString = params.toString();
    return this.request<any[]>(`/locations${queryString ? `?${queryString}` : ''}`);
  }

  async getLocation(id: number) {
    return this.request<any>(`/locations/${id}`);
  }

  async createLocation(data: {
    name: string;
    city?: string;
    country?: string;
    phone?: string;
    fax?: string;
    address?: string;
    zip_code?: string;
    province?: string;
    number_of_employees?: number;
  }) {
    return this.request<any>('/locations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLocation(id: number, data: {
    name: string;
    city?: string;
    country?: string;
    phone?: string;
    fax?: string;
    address?: string;
    zip_code?: string;
    province?: string;
    number_of_employees?: number;
    status?: string;
  }) {
    return this.request<any>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteLocation(id: number) {
    return this.request<any>(`/locations/${id}`, { method: 'DELETE' });
  }

  // Organization Structure
  async getOrganizationStructure() {
    return this.request<any>('/organization/structure');
  }

  async createOrganizationUnit(data: {
    name: string;
    unit_id?: string;
    description?: string;
    parent_id?: number;
    level?: number;
  }) {
    return this.request<any>('/organization/structure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganizationUnit(id: number, data: {
    name: string;
    unit_id?: string;
    description?: string;
    parent_id?: number;
    level?: number;
  }) {
    return this.request<any>(`/organization/structure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganizationUnit(id: number) {
    return this.request<any>(`/organization/structure/${id}`, { method: 'DELETE' });
  }

  // Vacancies
  async getVacancies(filters?: {
    jobTitle?: string;
    vacancy?: string;
    hiringManager?: string;
    status?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.jobTitle) params.append('jobTitle', filters.jobTitle);
    if (filters?.vacancy) params.append('vacancy', filters.vacancy);
    if (filters?.hiringManager) params.append('hiringManager', filters.hiringManager);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    return this.request<any[]>(`/vacancies${queryString ? `?${queryString}` : ''}`);
  }

  async getVacancy(id: number) {
    return this.request<any>(`/vacancies/${id}`);
  }

  async createVacancy(data: {
    name: string;
    jobTitleId: number;
    hiringManagerId?: number;
    description?: string;
    numberOfPositions?: number;
    status?: string;
    publishedDate?: string;
    closingDate?: string;
  }) {
    return this.request<any>('/vacancies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVacancy(id: number, data: {
    name: string;
    jobTitleId: number;
    hiringManagerId?: number;
    description?: string;
    numberOfPositions?: number;
    status?: string;
    publishedDate?: string;
    closingDate?: string;
  }) {
    return this.request<any>(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVacancy(id: number) {
    return this.request<any>(`/vacancies/${id}`, {
      method: 'DELETE',
    });
  }

  // Candidates
  async getCandidates(filters?: {
    jobTitle?: string;
    vacancy?: string;
    hiringManager?: string;
    status?: string;
    candidateName?: string;
    keywords?: string;
    dateFrom?: string;
    dateTo?: string;
    methodOfApplication?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.jobTitle) params.append('jobTitle', filters.jobTitle);
    if (filters?.vacancy) params.append('vacancy', filters.vacancy);
    if (filters?.hiringManager) params.append('hiringManager', filters.hiringManager);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.candidateName) params.append('candidateName', filters.candidateName);
    if (filters?.keywords) params.append('keywords', filters.keywords);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.methodOfApplication) params.append('methodOfApplication', filters.methodOfApplication);
    
    const queryString = params.toString();
    return this.request<any[]>(`/candidates${queryString ? `?${queryString}` : ''}`);
  }

  async getCandidate(id: number) {
    return this.request<any>(`/candidates/${id}`);
  }

  async createCandidate(data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    contactNumber?: string;
    keywords?: string;
    comment?: string;
    dateOfApplication?: string;
    status?: string;
    methodOfApplication?: string;
    vacancyIds?: number[];
  }) {
    return this.request<any>('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCandidate(id: number, data: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    contactNumber?: string;
    keywords?: string;
    comment?: string;
    dateOfApplication?: string;
    status?: string;
    methodOfApplication?: string;
  }) {
    return this.request<any>(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCandidate(id: number) {
    return this.request<any>(`/candidates/${id}`, {
      method: 'DELETE',
    });
  }

  // Employees (for hiring managers / compact view)
  async getEmployees(view: 'compact' | 'full' = 'compact') {
    const suffix = view === 'compact' ? '?view=compact' : '';
    return this.request<any[]>(`/employees${suffix}`);
  }

  // Employee directory with filters
  async getEmployeeDirectory(filters?: {
    employeeId?: string;
    employeeName?: string;
    jobTitle?: string;
    employmentStatus?: string;
    subUnit?: string;
    supervisor?: string;
    include?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.employeeName) params.append('employeeName', filters.employeeName);
    if (filters?.jobTitle) params.append('jobTitle', filters.jobTitle);
    if (filters?.employmentStatus) params.append('employmentStatus', filters.employmentStatus);
    if (filters?.subUnit) params.append('subUnit', filters.subUnit);
    if (filters?.supervisor) params.append('supervisor', filters.supervisor);
    if (filters?.include) params.append('include', filters.include);

    const queryString = params.toString();
    return this.request<any[]>(`/employees${queryString ? `?${queryString}` : ''}`);
  }

  async createEmployee(data: {
    employeeId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    employmentStatus?: string;
    subUnit?: string;
    supervisorName?: string;
    status?: string;
    hireDate?: string;
  }) {
    return this.request<any>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: number, data: {
    employeeId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    employmentStatus?: string;
    subUnit?: string;
    supervisorName?: string;
    status?: string;
    hireDate?: string;
  }) {
    return this.request<any>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: number) {
    return this.request<any>(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // LEAVE MANAGEMENT
  // ============================================================================
  async getLeaveTypes() {
    return this.request<any[]>('/leave-types');
  }

  async createLeaveType(data: { name: string; description?: string; entitlement_days?: number }) {
    return this.request<any>('/leave-types', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLeaveType(id: number, data: { name: string; description?: string; entitlement_days?: number; status?: string }) {
    return this.request<any>(`/leave-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteLeaveType(id: number) {
    return this.request<any>(`/leave-types/${id}`, { method: 'DELETE' });
  }

  async getLeaveRequests(filters?: { employee_id?: number; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', filters.employee_id.toString());
    if (filters?.status) params.append('status', filters.status);
    return this.request<any[]>(`/leave-requests${params.toString() ? `?${params}` : ''}`);
  }

  async createLeaveRequest(data: { employee_id: number; leave_type_id: number; from_date: string; to_date: string; number_of_days: number; comments?: string }) {
    return this.request<any>('/leave-requests', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLeaveRequest(id: number, data: { status: string; approved_by?: number }) {
    return this.request<any>(`/leave-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async getHolidays() {
    return this.request<any[]>('/holidays');
  }

  async createHoliday(data: { name: string; date: string; full_day?: boolean; repeats_annually?: boolean }) {
    return this.request<any>('/holidays', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateHoliday(id: number, data: { name: string; date: string; full_day?: boolean; repeats_annually?: boolean }) {
    return this.request<any>(`/holidays/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteHoliday(id: number) {
    return this.request<any>(`/holidays/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // TIME & ATTENDANCE
  // ============================================================================
  async getAttendanceRecords(filters?: { employee_id?: number; date?: string }) {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', filters.employee_id.toString());
    if (filters?.date) params.append('date', filters.date);
    return this.request<any[]>(`/attendance-records${params.toString() ? `?${params}` : ''}`);
  }

  async punchIn(data: { employee_id: number; punch_in_date: string; punch_in_time: string; punch_in_note?: string }) {
    return this.request<any>('/attendance-records/punch-in', { method: 'POST', body: JSON.stringify(data) });
  }

  async punchOut(id: number, data: { punch_out_date: string; punch_out_time: string; punch_out_note?: string }) {
    return this.request<any>(`/attendance-records/${id}/punch-out`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async getCustomers() {
    return this.request<any[]>('/customers');
  }

  async createCustomer(data: { name: string; description?: string }) {
    return this.request<any>('/customers', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCustomer(id: number, data: { name: string; description?: string; status?: string }) {
    return this.request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteCustomer(id: number) {
    return this.request<any>(`/customers/${id}`, { method: 'DELETE' });
  }

  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async createProject(data: { customer_id: number; name: string; description?: string; project_admin_id?: number }) {
    return this.request<any>('/projects', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProject(id: number, data: { name: string; description?: string; project_admin_id?: number; status?: string }) {
    return this.request<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteProject(id: number) {
    return this.request<any>(`/projects/${id}`, { method: 'DELETE' });
  }

  async getTimesheets(filters?: { employee_id?: number; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', filters.employee_id.toString());
    if (filters?.status) params.append('status', filters.status);
    return this.request<any[]>(`/timesheets${params.toString() ? `?${params}` : ''}`);
  }

  async createTimesheet(data: { employee_id: number; project_id?: number; activity_id?: number; start_date: string; end_date: string }) {
    return this.request<any>('/timesheets', { method: 'POST', body: JSON.stringify(data) });
  }

  // ============================================================================
  // PERFORMANCE MANAGEMENT
  // ============================================================================
  async getKPIs(filters?: { job_title_id?: number }) {
    const params = new URLSearchParams();
    if (filters?.job_title_id) params.append('job_title_id', filters.job_title_id.toString());
    return this.request<any[]>(`/kpis${params.toString() ? `?${params}` : ''}`);
  }

  async createKPI(data: { indicator: string; job_title_id?: number; min_rate?: number; max_rate?: number; is_default?: boolean }) {
    return this.request<any>('/kpis', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateKPI(id: number, data: { indicator: string; job_title_id?: number; min_rate?: number; max_rate?: number; is_default?: boolean }) {
    return this.request<any>(`/kpis/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteKPI(id: number) {
    return this.request<any>(`/kpis/${id}`, { method: 'DELETE' });
  }

  async getPerformanceTrackers(filters?: { employee_id?: number }) {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', filters.employee_id.toString());
    return this.request<any[]>(`/performance-trackers${params.toString() ? `?${params}` : ''}`);
  }

  async createPerformanceTracker(data: { employee_id: number; tracker_name: string }) {
    return this.request<any>('/performance-trackers', { method: 'POST', body: JSON.stringify(data) });
  }

  async getPerformanceReviews(filters?: { employee_id?: number; reviewer_id?: number; review_status?: string }) {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', filters.employee_id.toString());
    if (filters?.reviewer_id) params.append('reviewer_id', filters.reviewer_id.toString());
    if (filters?.review_status) params.append('review_status', filters.review_status);
    return this.request<any[]>(`/performance-reviews${params.toString() ? `?${params}` : ''}`);
  }

  async createPerformanceReview(data: { employee_id: number; job_title_id?: number; sub_unit?: string; review_period_start: string; review_period_end: string; due_date: string; reviewer_id?: number }) {
    return this.request<any>('/performance-reviews', { method: 'POST', body: JSON.stringify(data) });
  }

  // ============================================================================
  // MY INFO / EMPLOYEE PERSONAL DATA
  // ============================================================================
  async getPersonalDetails(employeeId: number) {
    return this.request<any>(`/employees/${employeeId}/personal-details`);
  }

  async savePersonalDetails(employeeId: number, data: any) {
    return this.request<any>(`/employees/${employeeId}/personal-details`, { method: 'POST', body: JSON.stringify(data) });
  }

  async getContactDetails(employeeId: number) {
    return this.request<any>(`/employees/${employeeId}/contact-details`);
  }

  async saveContactDetails(employeeId: number, data: any) {
    return this.request<any>(`/employees/${employeeId}/contact-details`, { method: 'POST', body: JSON.stringify(data) });
  }

  async getEmergencyContacts(employeeId: number) {
    return this.request<any[]>(`/employees/${employeeId}/emergency-contacts`);
  }

  async createEmergencyContact(employeeId: number, data: any) {
    return this.request<any>(`/employees/${employeeId}/emergency-contacts`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteEmergencyContact(id: number) {
    return this.request<any>(`/emergency-contacts/${id}`, { method: 'DELETE' });
  }

  async getDependents(employeeId: number) {
    return this.request<any[]>(`/employees/${employeeId}/dependents`);
  }

  async createDependent(employeeId: number, data: any) {
    return this.request<any>(`/employees/${employeeId}/dependents`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteDependent(id: number) {
    return this.request<any>(`/dependents/${id}`, { method: 'DELETE' });
  }

  async getImmigrationRecords(employeeId: number) {
    return this.request<any[]>(`/employees/${employeeId}/immigration`);
  }

  async createImmigrationRecord(employeeId: number, data: any) {
    return this.request<any>(`/employees/${employeeId}/immigration`, { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteImmigrationRecord(id: number) {
    return this.request<any>(`/immigration/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // ADMIN CONFIGURATION
  // ============================================================================
  async getLocations() {
    return this.request<any[]>('/locations');
  }

  async createLocation(data: any) {
    return this.request<any>('/locations', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLocation(id: number, data: any) {
    return this.request<any>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteLocation(id: number) {
    return this.request<any>(`/locations/${id}`, { method: 'DELETE' });
  }

  async getPayGrades() {
    return this.request<any[]>('/pay-grades');
  }

  async createPayGrade(data: any) {
    return this.request<any>('/pay-grades', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePayGrade(id: number, data: any) {
    return this.request<any>(`/pay-grades/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deletePayGrade(id: number) {
    return this.request<any>(`/pay-grades/${id}`, { method: 'DELETE' });
  }

  async getEmploymentStatus() {
    return this.request<any[]>('/employment-status');
  }

  async createEmploymentStatus(data: { name: string }) {
    return this.request<any>('/employment-status', { method: 'POST', body: JSON.stringify(data) });
  }

  async getJobCategories() {
    return this.request<any[]>('/job-categories');
  }

  async createJobCategory(data: { name: string }) {
    return this.request<any>('/job-categories', { method: 'POST', body: JSON.stringify(data) });
  }

  async getWorkShifts() {
    return this.request<any[]>('/work-shifts');
  }

  async createWorkShift(data: any) {
    return this.request<any>('/work-shifts', { method: 'POST', body: JSON.stringify(data) });
  }

  async getNationalities() {
    return this.request<any[]>('/nationalities');
  }

  async createNationality(data: { name: string }) {
    return this.request<any>('/nationalities', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateNationality(id: number, data: { name: string }) {
    return this.request<any>(`/nationalities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteNationality(id: number) {
    return this.request<any>(`/nationalities/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async createUser(data: any) {
    return this.request<any>('/users', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateUser(id: number, data: any) {
    return this.request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteUser(id: number) {
    return this.request<any>(`/users/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // SKILLS API
  // ============================================================================
  async getSkills() {
    return this.request<any[]>('/skills');
  }

  async createSkill(data: { name: string; description?: string }) {
    return this.request<any>('/skills', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateSkill(id: number, data: { name: string; description?: string }) {
    return this.request<any>(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteSkill(id: number) {
    return this.request<any>(`/skills/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // EDUCATION LEVELS API
  // ============================================================================
  async getEducationLevels() {
    return this.request<any[]>('/education-levels');
  }

  async createEducationLevel(data: { name: string }) {
    return this.request<any>('/education-levels', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEducationLevel(id: number, data: { name: string }) {
    return this.request<any>(`/education-levels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteEducationLevel(id: number) {
    return this.request<any>(`/education-levels/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // LICENSES API
  // ============================================================================
  async getLicenses() {
    return this.request<any[]>('/licenses');
  }

  async createLicense(data: { name: string }) {
    return this.request<any>('/licenses', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLicense(id: number, data: { name: string }) {
    return this.request<any>(`/licenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteLicense(id: number) {
    return this.request<any>(`/licenses/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // LANGUAGES API
  // ============================================================================
  async getLanguages() {
    return this.request<any[]>('/languages');
  }

  async createLanguage(data: { name: string }) {
    return this.request<any>('/languages', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateLanguage(id: number, data: { name: string }) {
    return this.request<any>(`/languages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteLanguage(id: number) {
    return this.request<any>(`/languages/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // MEMBERSHIPS API
  // ============================================================================
  async getMemberships() {
    return this.request<any[]>('/memberships');
  }

  async createMembership(data: { name: string }) {
    return this.request<any>('/memberships', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateMembership(id: number, data: { name: string }) {
    return this.request<any>(`/memberships/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteMembership(id: number) {
    return this.request<any>(`/memberships/${id}`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService(API_BASE_URL);

