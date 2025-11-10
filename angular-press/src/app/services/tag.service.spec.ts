import { TestBed } from '@angular/core/testing';
import { TagService } from './tag.service';
import { Tag } from '../models/tag.model';

describe('TagService', () => {
  let service: TagService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TagService]
    });
    service = TestBed.inject(TagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTags', () => {
    it('should return an observable of tags', (done) => {
      service.getTags().subscribe(tags => {
        expect(tags).toBeDefined();
        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should return tags with correct structure', (done) => {
      service.getTags().subscribe(tags => {
        const tag = tags[0];
        expect(tag.id).toBeDefined();
        expect(tag.name).toBeDefined();
        expect(tag.slug).toBeDefined();
        done();
      });
    });
  });

  describe('getTagById', () => {
    it('should return a tag when valid id is provided', () => {
      const tag = service.getTagById(1);
      expect(tag).toBeDefined();
      expect(tag?.id).toBe(1);
      expect(tag?.name).toBe('angular');
    });

    it('should return undefined when invalid id is provided', () => {
      const tag = service.getTagById(999);
      expect(tag).toBeUndefined();
    });

    it('should return the correct tag for id 2', () => {
      const tag = service.getTagById(2);
      expect(tag).toBeDefined();
      expect(tag?.id).toBe(2);
      expect(tag?.name).toBe('cms');
    });
  });

  describe('createTag', () => {
    it('should create a new tag', (done) => {
      const newTag: Tag = {
        id: 0,
        name: 'test',
        slug: 'test',
        description: 'Test tag',
        count: 0
      };

      service.createTag(newTag).subscribe(createdTag => {
        expect(createdTag).toBeDefined();
        expect(createdTag.id).toBeGreaterThan(0);
        expect(createdTag.name).toBe('test');
        done();
      });
    });

    it('should add the new tag to the tags list', (done) => {
      const newTag: Tag = {
        id: 0,
        name: 'another',
        slug: 'another',
        description: 'Another tag',
        count: 0
      };

      let initialCount = 0;
      service.getTags().subscribe(tags => {
        initialCount = tags.length;
      });

      service.createTag(newTag).subscribe(() => {
        service.getTags().subscribe(tags => {
          expect(tags.length).toBe(initialCount + 1);
          done();
        });
      });
    });

    it('should generate unique ids for new tags', (done) => {
      const tag1: Tag = {
        id: 0,
        name: 'tag1',
        slug: 'tag-1',
        description: 'Tag 1',
        count: 0
      };

      const tag2: Tag = {
        id: 0,
        name: 'tag2',
        slug: 'tag-2',
        description: 'Tag 2',
        count: 0
      };

      service.createTag(tag1).subscribe(created1 => {
        service.createTag(tag2).subscribe(created2 => {
          expect(created1.id).not.toBe(created2.id);
          expect(Number(created2.id)).toBeGreaterThan(Number(created1.id));
          done();
        });
      });
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', (done) => {
      const existingTag = service.getTagById(1);
      expect(existingTag).toBeDefined();

      const updatedTag: Tag = {
        ...existingTag!,
        name: 'updated-angular',
        description: 'Updated description'
      };

      service.updateTag(updatedTag).subscribe(result => {
        expect(result.name).toBe('updated-angular');
        expect(result.description).toBe('Updated description');
        
        const retrievedTag = service.getTagById(1);
        expect(retrievedTag?.name).toBe('updated-angular');
        done();
      });
    });

    it('should emit updated tags list', (done) => {
      const existingTag = service.getTagById(1);
      const updatedTag: Tag = {
        ...existingTag!,
        slug: 'new-slug'
      };

      service.updateTag(updatedTag).subscribe(() => {
        service.getTags().subscribe(tags => {
          const tag = tags.find(t => t.id === 1);
          expect(tag?.slug).toBe('new-slug');
          done();
        });
      });
    });

    it('should handle updating non-existent tag', (done) => {
      const nonExistentTag: Tag = {
        id: 999,
        name: 'nonexistent',
        slug: 'non-existent',
        description: 'Description',
        count: 0
      };

      service.updateTag(nonExistentTag).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe(999);
        done();
      });
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag by id', (done) => {
      let initialCount = 0;
      service.getTags().subscribe(tags => {
        initialCount = tags.length;
      });

      service.deleteTag(1).subscribe(() => {
        service.getTags().subscribe(tags => {
          expect(tags.length).toBe(initialCount - 1);
          const deletedTag = tags.find(t => t.id === 1);
          expect(deletedTag).toBeUndefined();
          done();
        });
      });
    });

    it('should emit updated tags list after deletion', (done) => {
      service.deleteTag(2).subscribe(() => {
        service.getTags().subscribe(tags => {
          const tag = tags.find(t => t.id === 2);
          expect(tag).toBeUndefined();
          done();
        });
      });
    });

    it('should handle deleting non-existent tag', (done) => {
      let initialCount = 0;
      service.getTags().subscribe(tags => {
        initialCount = tags.length;
      });

      service.deleteTag(999).subscribe(() => {
        service.getTags().subscribe(tags => {
          expect(tags.length).toBe(initialCount);
          done();
        });
      });
    });
  });

  describe('tags$ observable', () => {
    it('should be defined', () => {
      expect(service.tags$).toBeDefined();
    });

    it('should emit current tags', (done) => {
      service.tags$.subscribe(tags => {
        expect(tags).toBeDefined();
        expect(Array.isArray(tags)).toBe(true);
        done();
      });
    });
  });
});

