import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { getApiUrl } from '../../core/utils/api-url.util';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

interface Post {
  ID: number;
  post_title: string;
  post_name: string;
  post_status: string;
  post_date: string;
  post_author: number;
  post_content: string;
  post_excerpt: string;
  author?: {
    display_name: string;
  };
}

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  loading = false;
  selectedFilter = 'all';
  searchQuery = '';
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.apiUrl = getApiUrl();
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/posts?page=1&limit=1000`).subscribe({
      next: (response) => {
        this.posts = response.data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.posts];

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(p => p.post_status === this.selectedFilter);
    }

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.post_title.toLowerCase().includes(query) ||
        p.post_content.toLowerCase().includes(query)
      );
    }

    this.filteredPosts = filtered;
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  getStatusCount(status: string): number {
    if (status === 'all') return this.posts.length;
    return this.posts.filter(p => p.post_status === status).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  editPost(postId: number): void {
    this.router.navigate(['/ap-admin/posts', postId, 'edit']);
  }

  deletePost(post: Post): void {
    if (confirm(`Are you sure you want to delete "${post.post_title}"?`)) {
      this.http.delete(`${this.apiUrl}/posts/${post.ID}`).subscribe({
        next: () => {
          this.loadPosts();
        },
        error: (err) => {
          console.error('Error deleting post:', err);
          alert('Failed to delete post');
        }
      });
    }
  }

  trashPost(post: Post): void {
    this.http.patch(`${this.apiUrl}/posts/${post.ID}`, { status: 'trash' }).subscribe({
      next: () => {
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error trashing post:', err);
      }
    });
  }

  viewPost(post: Post): void {
    window.open(`/post/${post.post_name}`, '_blank');
  }
}