import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '../../core/utils/api-url.util';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

interface DashboardStats {
  posts: { total: number; published: number; draft: number };
  pages: { total: number; published: number; draft: number };
  comments: { total: number; pending: number; approved: number };
  users: { total: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats: DashboardStats = {
    posts: { total: 0, published: 0, draft: 0 },
    pages: { total: 0, published: 0, draft: 0 },
    comments: { total: 0, pending: 0, approved: 0 },
    users: { total: 0 }
  };
  sidebarCollapsed = false;
  private apiUrl: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.apiUrl = getApiUrl();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadStats();
  }

  loadStats(): void {
    // Load posts stats
    this.http.get<any>(`${this.apiUrl}/posts?page=1&limit=1000`).subscribe({
      next: (response) => {
        const posts = response.data || [];
        this.stats.posts.total = posts.length;
        this.stats.posts.published = posts.filter((p: any) => p.status === 'publish').length;
        this.stats.posts.draft = posts.filter((p: any) => p.status === 'draft').length;
      },
      error: (err) => console.error('Error loading posts stats:', err)
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}