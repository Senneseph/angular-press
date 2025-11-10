import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Post } from '../../../core/models/post.interface';
import { PostState } from '../../../store/posts/posts.state';
import { PostActions } from '../../../store/posts/posts.state';

@Component({
  selector: 'app-post-list',
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