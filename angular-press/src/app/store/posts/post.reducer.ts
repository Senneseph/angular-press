import { createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { Post } from '../../core/models/post.interface';
import * as PostActions from './post.actions';

export interface PostState extends EntityState<Post> {
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

export const postAdapter = createEntityAdapter<Post>();

export const initialState: PostState = postAdapter.getInitialState({
  selectedId: null,
  loading: false,
  error: null
});

export const postsReducer = createReducer(
  initialState,
  
  // Load Posts
  on(PostActions.loadPosts, (state) => ({
    ...state,
    loading: true
  })),
  
  on(PostActions.loadPostsSuccess, (state, { posts }) =>
    postAdapter.setAll(posts, {
      ...state,
      loading: false
    })
  ),
  
  on(PostActions.loadPostsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Create Post
  on(PostActions.createPost, (state) => ({
    ...state,
    loading: true
  })),
  
  on(PostActions.createPostSuccess, (state, { post }) =>
    postAdapter.addOne(post, {
      ...state,
      loading: false
    })
  ),
  
  on(PostActions.createPostFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Update Post
  on(PostActions.updatePost, (state) => ({
    ...state,
    loading: true
  })),
  
  on(PostActions.updatePostSuccess, (state, { post }) =>
    postAdapter.updateOne(
      { id: post.id, changes: post },
      {
        ...state,
        loading: false
      }
    )
  ),
  
  on(PostActions.updatePostFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Delete Post
  on(PostActions.deletePost, (state) => ({
    ...state,
    loading: true
  })),
  
  on(PostActions.deletePostSuccess, (state, { id }) =>
    postAdapter.removeOne(id, {
      ...state,
      loading: false
    })
  ),
  
  on(PostActions.deletePostFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);