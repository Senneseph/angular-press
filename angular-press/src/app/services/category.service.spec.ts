import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);

    // Flush the initial loadCategories() call from constructor
    const initialReq = httpMock.expectOne(req => req.url.includes('/categories'));
    initialReq.flush({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories', () => {
    it('should return an observable of categories', (done) => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Tech', slug: 'tech', description: 'Technology', count: 5 }
      ];

      service.getCategories().subscribe(categories => {
        expect(categories).toBeDefined();
        expect(Array.isArray(categories)).toBe(true);
        done();
      });
    });

    it('should return categories with correct structure', (done) => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Tech', slug: 'tech', description: 'Technology', count: 5 }
      ];

      // Trigger a reload
      service['loadCategories']();

      const req = httpMock.expectOne(request => request.url.includes('/categories'));
      req.flush({ data: mockCategories, total: 1, page: 1, limit: 100, totalPages: 1 });

      service.getCategories().subscribe(categories => {
        if (categories.length > 0) {
          const category = categories[0];
          expect(category.id).toBeDefined();
          expect(category.name).toBeDefined();
          expect(category.slug).toBeDefined();
        }
        done();
      });
    });
  });

  describe('getCategoryById', () => {
    it('should make GET request to fetch category by id', (done) => {
      const mockCategory: Category = { id: 1, name: 'Tech', slug: 'tech', description: 'Technology', count: 5 };

      service.getCategoryById(1).subscribe(category => {
        expect(category).toBeDefined();
        expect(category.id).toBe(1);
        expect(category.name).toBe('Tech');
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/categories/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });

    it('should handle error when category not found', (done) => {
      service.getCategoryById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne(request => request.url.includes('/categories/999'));
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createCategory', () => {
    it('should create a new category', (done) => {
      const newCategory: Category = {
        id: 0,
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description',
        count: 0
      };

      service.createCategory(newCategory).subscribe(createdCategory => {
        expect(createdCategory).toBeDefined();
        expect(createdCategory.id).toBeGreaterThan(0);
        expect(createdCategory.name).toBe('Test Category');
        done();
      });
    });

    it('should add the new category to the categories list', (done) => {
      const newCategory: Category = {
        id: 0,
        name: 'Another Category',
        slug: 'another-category',
        description: 'Another description',
        count: 0
      };

      let initialCount = 0;
      service.getCategories().subscribe(categories => {
        initialCount = categories.length;
      });

      service.createCategory(newCategory).subscribe(() => {
        service.getCategories().subscribe(categories => {
          expect(categories.length).toBe(initialCount + 1);
          done();
        });
      });
    });

    it('should generate unique ids for new categories', (done) => {
      const category1: Category = {
        id: 0,
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description 1',
        count: 0
      };

      const category2: Category = {
        id: 0,
        name: 'Category 2',
        slug: 'category-2',
        description: 'Description 2',
        count: 0
      };

      service.createCategory(category1).subscribe(created1 => {
        service.createCategory(category2).subscribe(created2 => {
          expect(created1.id).not.toBe(created2.id);
          expect(Number(created2.id)).toBeGreaterThan(Number(created1.id));
          done();
        });
      });
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', (done) => {
      const existingCategory = service.getCategoryById(1);
      expect(existingCategory).toBeDefined();

      const updatedCategory: Category = {
        ...existingCategory!,
        name: 'Updated Technology',
        description: 'Updated description'
      };

      service.updateCategory(updatedCategory).subscribe(result => {
        expect(result.name).toBe('Updated Technology');
        expect(result.description).toBe('Updated description');
        
        const retrievedCategory = service.getCategoryById(1);
        expect(retrievedCategory?.name).toBe('Updated Technology');
        done();
      });
    });

    it('should emit updated categories list', (done) => {
      const existingCategory = service.getCategoryById(1);
      const updatedCategory: Category = {
        ...existingCategory!,
        slug: 'new-slug'
      };

      service.updateCategory(updatedCategory).subscribe(() => {
        service.getCategories().subscribe(categories => {
          const category = categories.find(c => c.id === 1);
          expect(category?.slug).toBe('new-slug');
          done();
        });
      });
    });

    it('should handle updating non-existent category', (done) => {
      const nonExistentCategory: Category = {
        id: 999,
        name: 'Non-existent',
        slug: 'non-existent',
        description: 'Description',
        count: 0
      };

      service.updateCategory(nonExistentCategory).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe(999);
        done();
      });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category by id', (done) => {
      let initialCount = 0;
      service.getCategories().subscribe(categories => {
        initialCount = categories.length;
      });

      service.deleteCategory(1).subscribe(() => {
        service.getCategories().subscribe(categories => {
          expect(categories.length).toBe(initialCount - 1);
          const deletedCategory = categories.find(c => c.id === 1);
          expect(deletedCategory).toBeUndefined();
          done();
        });
      });
    });

    it('should emit updated categories list after deletion', (done) => {
      service.deleteCategory(2).subscribe(() => {
        service.getCategories().subscribe(categories => {
          const category = categories.find(c => c.id === 2);
          expect(category).toBeUndefined();
          done();
        });
      });
    });

    it('should handle deleting non-existent category', (done) => {
      let initialCount = 0;
      service.getCategories().subscribe(categories => {
        initialCount = categories.length;
      });

      service.deleteCategory(999).subscribe(() => {
        service.getCategories().subscribe(categories => {
          expect(categories.length).toBe(initialCount);
          done();
        });
      });
    });
  });

  describe('categories$ observable', () => {
    it('should be defined', () => {
      expect(service.categories$).toBeDefined();
    });

    it('should emit current categories', (done) => {
      service.categories$.subscribe(categories => {
        expect(categories).toBeDefined();
        expect(Array.isArray(categories)).toBe(true);
        done();
      });
    });
  });
});

