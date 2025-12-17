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
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Job Titles
  async getJobTitles() {
    return this.request<any[]>('/job-titles');
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
}

export const apiService = new ApiService(API_BASE_URL);

