import { TestBed } from '@angular/core/testing';
import { PostService } from './post.service';
import { Post } from '../core/models/post.interface';

describe('PostService', () => {
  let service: PostService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostService]
    });
    service = TestBed.inject(PostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPosts', () => {
    it('should return an observable of posts', (done) => {
      service.getPosts().subscribe(posts => {
        expect(posts).toBeDefined();
        expect(Array.isArray(posts)).toBe(true);
        expect(posts.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should return posts with correct structure', (done) => {
      service.getPosts().subscribe(posts => {
        const post = posts[0];
        expect(post.id).toBeDefined();
        expect(post.title).toBeDefined();
        expect(post.content).toBeDefined();
        expect(post.status).toBeDefined();
        done();
      });
    });
  });

  describe('getPostById', () => {
    it('should return a post when valid id is provided', () => {
      const post = service.getPostById('1');
      expect(post).toBeDefined();
      expect(post?.id).toBe('1');
      expect(post?.title).toBe('Welcome to Angular Press');
    });

    it('should return undefined when invalid id is provided', () => {
      const post = service.getPostById('999');
      expect(post).toBeUndefined();
    });

    it('should return the correct post for id 2', () => {
      const post = service.getPostById('2');
      expect(post).toBeDefined();
      expect(post?.id).toBe('2');
      expect(post?.title).toBe('Getting Started Guide');
    });
  });

  describe('createPost', () => {
    it('should create a new post', (done) => {
      const newPost: Post = {
        id: '0',
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        status: 'draft',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'test-post',
        categories: ['1'],
        tags: ['test'],
        featured_image: '',
        meta: {}
      };

      service.createPost(newPost).subscribe(createdPost => {
        expect(createdPost).toBeDefined();
        expect(Number(createdPost.id)).toBeGreaterThan(0);
        expect(createdPost.title).toBe('Test Post');
        done();
      });
    });

    it('should add the new post to the posts list', (done) => {
      const newPost: Post = {
        id: '0',
        title: 'Another Test Post',
        content: 'Another test content',
        excerpt: 'Another test excerpt',
        status: 'published',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'another-test-post',
        categories: ['1'],
        tags: [],
        featured_image: '',
        meta: {}
      };

      let initialCount = 0;
      service.getPosts().subscribe(posts => {
        initialCount = posts.length;
      });

      service.createPost(newPost).subscribe(() => {
        service.getPosts().subscribe(posts => {
          expect(posts.length).toBe(initialCount + 1);
          done();
        });
      });
    });

    it('should generate unique ids for new posts', (done) => {
      const post1: Post = {
        id: '0',
        title: 'Post 1',
        content: 'Content 1',
        excerpt: 'Excerpt 1',
        status: 'draft',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'post-1',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      const post2: Post = {
        id: '0',
        title: 'Post 2',
        content: 'Content 2',
        excerpt: 'Excerpt 2',
        status: 'draft',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'post-2',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      service.createPost(post1).subscribe(created1 => {
        service.createPost(post2).subscribe(created2 => {
          expect(created1.id).not.toBe(created2.id);
          expect(Number(created2.id)).toBeGreaterThan(Number(created1.id));
          done();
        });
      });
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', (done) => {
      const existingPost = service.getPostById('1');
      expect(existingPost).toBeDefined();

      const updatedPost: Post = {
        ...existingPost!,
        title: 'Updated Title',
        content: 'Updated content'
      };

      service.updatePost(updatedPost).subscribe(result => {
        expect(result.title).toBe('Updated Title');
        expect(result.content).toBe('Updated content');

        const retrievedPost = service.getPostById('1');
        expect(retrievedPost?.title).toBe('Updated Title');
        done();
      });
    });

    it('should emit updated posts list', (done) => {
      const existingPost = service.getPostById('1');
      const updatedPost: Post = {
        ...existingPost!,
        title: 'New Title'
      };

      service.updatePost(updatedPost).subscribe(() => {
        service.getPosts().subscribe(posts => {
          const post = posts.find(p => p.id === '1');
          expect(post?.title).toBe('New Title');
          done();
        });
      });
    });

    it('should handle updating non-existent post', (done) => {
      const nonExistentPost: Post = {
        id: '999',
        title: 'Non-existent',
        content: 'Content',
        excerpt: 'Excerpt',
        status: 'draft',
        type: 'post',
        author: 'Test Author',
        publishDate: new Date(),
        modified: new Date(),
        slug: 'non-existent',
        categories: [],
        tags: [],
        featured_image: '',
        meta: {}
      };

      service.updatePost(nonExistentPost).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe('999');
        done();
      });
    });
  });

  describe('deletePost', () => {
    it('should delete a post by id', (done) => {
      let initialCount = 0;
      service.getPosts().subscribe(posts => {
        initialCount = posts.length;
      });

      service.deletePost('1').subscribe(() => {
        service.getPosts().subscribe(posts => {
          expect(posts.length).toBe(initialCount - 1);
          const deletedPost = posts.find(p => p.id === '1');
          expect(deletedPost).toBeUndefined();
          done();
        });
      });
    });

    it('should emit updated posts list after deletion', (done) => {
      service.deletePost('2').subscribe(() => {
        service.getPosts().subscribe(posts => {
          const post = posts.find(p => p.id === '2');
          expect(post).toBeUndefined();
          done();
        });
      });
    });

    it('should handle deleting non-existent post', (done) => {
      let initialCount = 0;
      service.getPosts().subscribe(posts => {
        initialCount = posts.length;
      });

      service.deletePost('999').subscribe(() => {
        service.getPosts().subscribe(posts => {
          expect(posts.length).toBe(initialCount);
          done();
        });
      });
    });
  });

  describe('posts$ observable', () => {
    it('should be defined', () => {
      expect(service.posts$).toBeDefined();
    });

    it('should emit current posts', (done) => {
      service.posts$.subscribe(posts => {
        expect(posts).toBeDefined();
        expect(Array.isArray(posts)).toBe(true);
        done();
      });
    });
  });
});

