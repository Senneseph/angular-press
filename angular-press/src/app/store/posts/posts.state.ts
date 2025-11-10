import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Post } from '../../core/models/post.interface';
import { PostService } from '../../services/post.service';

// Post Actions
export namespace PostActions {
  export class LoadPosts {
    static readonly type = '[Posts] Load Posts';
  }

  export class LoadPostsSuccess {
    static readonly type = '[Posts] Load Posts Success';
    constructor(public posts: Post[]) {}
  }

  export class CreatePost {
    static readonly type = '[Posts] Create Post';
    constructor(public post: Post) {}
  }

  export class UpdatePost {
    static readonly type = '[Posts] Update Post';
    constructor(public post: Post) {}
  }

  export class DeletePost {
    static readonly type = '[Posts] Delete Post';
    constructor(public id: string) {}
  }
}

// Post State Model
export interface PostStateModel {
  posts: Post[];
  selectedPost: Post | null;
  loading: boolean;
  error: string | null;
}

// Initial State
const defaults: PostStateModel = {
  posts: [],
  selectedPost: null,
  loading: false,
  error: null
};

@State<PostStateModel>({
  name: 'posts',
  defaults
})
@Injectable()
export class PostState {
  constructor(private postService: PostService) {}

  @Selector()
  static getPosts(state: PostStateModel) {
    return state.posts;
  }

  @Selector()
  static getSelectedPost(state: PostStateModel) {
    return state.selectedPost;
  }

  @Selector()
  static getLoading(state: PostStateModel) {
    return state.loading;
  }

  @Action(PostActions.LoadPosts)
  loadPosts(ctx: StateContext<PostStateModel>) {
    ctx.patchState({ loading: true });
    return this.postService.getPosts().pipe(
      tap(
        (posts) => {
          ctx.patchState({
            posts,
            loading: false,
            error: null
          });
        },
        (error) => {
          ctx.patchState({
            loading: false,
            error: error.message
          });
        }
      )
    );
  }

  @Action(PostActions.CreatePost)
  createPost(ctx: StateContext<PostStateModel>, action: PostActions.CreatePost) {
    ctx.patchState({ loading: true });
    return this.postService.createPost(action.post).pipe(
      tap(
        (post) => {
          const state = ctx.getState();
          ctx.patchState({
            posts: [...state.posts, post],
            loading: false,
            error: null
          });
        },
        (error) => {
          ctx.patchState({
            loading: false,
            error: error.message
          });
        }
      )
    );
  }

  @Action(PostActions.UpdatePost)
  updatePost(ctx: StateContext<PostStateModel>, action: PostActions.UpdatePost) {
    ctx.patchState({ loading: true });
    return this.postService.updatePost(action.post).pipe(
      tap(
        (updatedPost) => {
          const state = ctx.getState();
          const posts = state.posts.map((p) =>
            p.id === updatedPost.id ? updatedPost : p
          );
          ctx.patchState({
            posts,
            loading: false,
            error: null
          });
        },
        (error) => {
          ctx.patchState({
            loading: false,
            error: error.message
          });
        }
      )
    );
  }

  @Action(PostActions.DeletePost)
  deletePost(ctx: StateContext<PostStateModel>, action: PostActions.DeletePost) {
    ctx.patchState({ loading: true });
    return this.postService.deletePost(action.id).pipe(
      tap(
        () => {
          const state = ctx.getState();
          ctx.patchState({
            posts: state.posts.filter((p) => p.id !== action.id),
            loading: false,
            error: null
          });
        },
        (error) => {
          ctx.patchState({
            loading: false,
            error: error.message
          });
        }
      )
    );
  }
}