import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { getApiUrl } from '../../core/utils/api-url.util';

interface Page {
  id: number;
  title: string;
  slug: string;
  status: string;
  author?: { displayName: string };
  date: string;
}

interface PagesResponse {
  data: Page[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = getApiUrl();

  pages = signal<Page[]>([]);
  loading = signal(true);
  totalPages = signal(0);
  currentPage = signal(1);

  ngOnInit(): void {
    this.loadPages();
  }

  loadPages(): void {
    this.loading.set(true);
    this.http.get<PagesResponse>(`${this.apiUrl}/pages?page=${this.currentPage()}&limit=20`).subscribe({
      next: (response) => {
        this.pages.set(response.data);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load pages:', err);
        this.loading.set(false);
      }
    });
  }

  createPage(): void {
    this.router.navigate(['/ap-admin/pages/new']);
  }

  editPage(id: number): void {
    this.router.navigate(['/ap-admin/pages', id, 'edit']);
  }

  deletePage(id: number): void {
    if (confirm('Are you sure you want to delete this page?')) {
      this.http.delete(`${this.apiUrl}/pages/${id}`).subscribe({
        next: () => this.loadPages(),
        error: (err) => console.error('Failed to delete page:', err)
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'publish': return 'status-published';
      case 'draft': return 'status-draft';
      case 'private': return 'status-private';
      default: return '';
    }
  }
}

