import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Post } from '../../../core/models/post.interface';
import { PostState } from '../../../store/posts/posts.state';
import { PostActions } from '../../../store/posts/posts.state';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  @Select(PostState.getPosts) posts$!: Observable<Post[]>;
  @Select(PostState.getLoading) loading$!: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(new PostActions.LoadPosts());
  }

  onDeletePost(id: string) {
    this.store.dispatch(new PostActions.DeletePost(id));
  }
}