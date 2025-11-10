import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../core/models/post.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-home.component.html',
  styleUrls: ['./blog-home.component.scss']
})
export class BlogHomeComponent implements OnInit {
  posts$: Observable<Post[]>;

  constructor(private postService: PostService) {
    this.posts$ = this.postService.posts$;
  }

  ngOnInit(): void {
    // Posts are already loaded by the service
  }

  getExcerpt(post: Post): string {
    if (post.excerpt) {
      return post.excerpt;
    }
    // Generate excerpt from content
    const plainText = post.content.replace(/<[^>]*>/g, '');
    return plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

