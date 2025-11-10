import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService } from '../../services/post.service';
import { Post } from '../../core/models/post.interface';
import { Observable, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit {
  post$: Observable<Post | undefined>;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {
    this.post$ = of(undefined);
  }

  ngOnInit(): void {
    this.post$ = this.route.params.pipe(
      switchMap(params => {
        const slug = params['slug'];
        return this.postService.posts$.pipe(
          map(posts => posts.find(p => p.slug === slug && p.status === 'published'))
        );
      })
    );
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

