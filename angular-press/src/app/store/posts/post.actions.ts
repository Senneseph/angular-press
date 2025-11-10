import { createAction, props } from '@ngrx/store';
import { Post } from '../../core/models/post.interface';

// Load Posts
export const loadPosts = createAction('[Posts] Load Posts');
export const loadPostsSuccess = createAction(
  '[Posts] Load Posts Success',
  props<{ posts: Post[] }>()
);
export const loadPostsFailure = createAction(
  '[Posts] Load Posts Failure',
  props<{ error: string }>()
);

// Create Post
export const createPost = createAction(
  '[Posts] Create Post',
  props<{ post: Post }>()
);
export const createPostSuccess = createAction(
  '[Posts] Create Post Success',
  props<{ post: Post }>()
);
export const createPostFailure = createAction(
  '[Posts] Create Post Failure',
  props<{ error: string }>()
);

// Update Post
export const updatePost = createAction(
  '[Posts] Update Post',
  props<{ post: Post }>()
);
export const updatePostSuccess = createAction(
  '[Posts] Update Post Success',
  props<{ post: Post }>()
);
export const updatePostFailure = createAction(
  '[Posts] Update Post Failure',
  props<{ error: string }>()
);

// Delete Post
export const deletePost = createAction(
  '[Posts] Delete Post',
  props<{ id: string }>()
);
export const deletePostSuccess = createAction(
  '[Posts] Delete Post Success',
  props<{ id: string }>()
);
export const deletePostFailure = createAction(
  '[Posts] Delete Post Failure',
  props<{ error: string }>()
);