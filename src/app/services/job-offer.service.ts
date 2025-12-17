import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer } from '../interfaces/job-offer.interface';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class JobOfferService {
  private apiUrl = API_CONFIG.BASE_URL + '/api/job-offers';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') ?? '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getAll(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.apiUrl, this.getHeaders());
  }

  getById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  getByBusiness(businessId: number): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${API_CONFIG.BASE_URL}/api/negocios/${businessId}/job-offers`, this.getHeaders());
  }

  create(offer: Partial<JobOffer>): Observable<any> {
    return this.http.post(this.apiUrl, offer, this.getHeaders());
  }

  update(id: number, offer: Partial<JobOffer>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, offer, this.getHeaders());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
