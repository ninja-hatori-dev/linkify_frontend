import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('linkify_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('linkify_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.Authorization;
    }
  }

  // Auth endpoints
  verifyAuth() {
    return this.api.get('/auth/verify');
  }

  logout() {
    return this.api.post('/auth/logout');
  }

  getProfile() {
    return this.api.get('/auth/profile');
  }

  // User endpoints
  getDashboard() {
    return this.api.get('/api/users/dashboard');
  }

  updatePreferences(preferences) {
    return this.api.put('/api/users/preferences', { preferences });
  }

  getActivity(params = {}) {
    return this.api.get('/api/users/activity', { params });
  }

  // Company endpoints
  getCompanies() {
    return this.api.get('/api/companies');
  }

  // Get user's account company (for analysis)
  getAccountCompany() {
    return this.api.get('/api/companies/account');
  }

  // Get prospect companies only
  getProspectCompanies() {
    return this.api.get('/api/companies/prospects');
  }

  getCompany(domain) {
    return this.api.get(`/api/companies/${domain}`);
  }

  saveCompanyFromLinkedIn(data) {
    return this.api.post('/api/companies/from-linkedin', data);
  }

  updateCompanyNotes(domain, notes) {
    return this.api.put(`/api/companies/${domain}/notes`, { notes });
  }

  deleteCompany(domain) {
    return this.api.delete(`/api/companies/${domain}`);
  }

  getCompanyProspects(domain, params = {}) {
    return this.api.get(`/api/companies/${domain}/prospects`, { params });
  }

  // Prospect endpoints
  getProspects(params = {}) {
    return this.api.get('/api/prospects', { params });
  }

  getProspectByUrl(linkedinUrl) {
    return this.api.get('/api/prospects/by-url', { 
      params: { linkedin_url: linkedinUrl } 
    });
  }

  saveProspectFromLinkedIn(data) {
    return this.api.post('/api/prospects/from-linkedin', data);
  }

  updateProspect(id, data) {
    return this.api.put(`/api/prospects/${id}`, data);
  }

  deleteProspect(id) {
    return this.api.delete(`/api/prospects/${id}`);
  }

  getProspectStats() {
    return this.api.get('/api/prospects/stats');
  }

  // Analysis endpoints
  analyzeCompanyInfo(domain) {
    return this.api.post('/api/analysis/company-info', { domain });
  }

  analyzeCompanyPersonas(domain, companyData = null) {
    return this.api.post('/api/analysis/company-personas', { 
      domain, 
      companyData 
    });
  }

  scoreProspect(linkedinUrl, profileData, companyDomain) {
    return this.api.post('/api/analysis/prospect-score', {
      linkedinUrl,
      profileData,
      companyDomain
    });
  }

  // New endpoints for the simplified app
  analyzeCompanyPersonasNew(linkedinUrl, accountDomain) {
    return this.api.post('/api/analysis/company-personas', {
      linkedin_url: linkedinUrl,
      accountDomain: accountDomain
    });
  }

  analyzeCompanyData(linkedinUrl, accountDomain,domData) {
    return this.api.post('/api/analysis/comp_analysis', {
      linkedin_url: linkedinUrl,
      accountDomain: accountDomain,
      domData: domData
    });
  }





  analyzePeopleData(linkedinUrl,accountDomain,peopledata) {
    return this.api.post('/api/analysis/people_analysis', {
      linkedinUrl: linkedinUrl,
      accountDomain: accountDomain,
      data: peopledata
    });
  }

  // Generic helper methods
  async handleApiCall(apiCall, errorMessage = 'API call failed') {
    try {
      const response = await apiCall();
      return { data: response.data, error: null };
    } catch (error) {
      console.error(errorMessage, error);
      return { 
        data: null, 
        error: error.response?.data?.error || error.message || errorMessage 
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;