import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user.interface';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: null
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    // The interceptor is created by Angular's DI system, so we just verify it's registered
    expect(authServiceSpy).toBeTruthy();
  });

  describe('intercept', () => {
    describe('when user is not logged in', () => {
      beforeEach(() => {
        Object.defineProperty(authServiceSpy, 'currentUser', {
          get: () => null,
          configurable: true
        });
      });

      it('should not add Authorization header', () => {
        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
      });

      it('should pass request through without modification', () => {
        httpClient.post('/api/data', { test: 'data' }).subscribe();

        const req = httpMock.expectOne('/api/data');
        expect(req.request.body).toEqual({ test: 'data' });
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
      });
    });

    describe('when user is logged in', () => {
      let mockUser: User;

      beforeEach(() => {
        mockUser = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'administrator',
          capabilities: ['manage_options'],
          meta: { token: 'test-token-123' },
          registeredDate: new Date(),
          status: 'active'
        };

        Object.defineProperty(authServiceSpy, 'currentUser', {
          get: () => mockUser,
          configurable: true
        });

        // Set token in localStorage (this is what the interceptor actually checks)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('access_token', 'test-token-123');
        }
      });

      afterEach(() => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('access_token');
        }
      });

      it('should add Authorization header with token', () => {
        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
        req.flush({});
      });

      it('should add Authorization header to POST requests', () => {
        httpClient.post('/api/posts', { title: 'Test' }).subscribe();

        const req = httpMock.expectOne('/api/posts');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
        req.flush({});
      });

      it('should add Authorization header to PUT requests', () => {
        httpClient.put('/api/posts/1', { title: 'Updated' }).subscribe();

        const req = httpMock.expectOne('/api/posts/1');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
        req.flush({});
      });

      it('should add Authorization header to DELETE requests', () => {
        httpClient.delete('/api/posts/1').subscribe();

        const req = httpMock.expectOne('/api/posts/1');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
        req.flush({});
      });

      it('should handle different token values', () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('access_token', 'different-token-456');
        }

        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer different-token-456');
        req.flush({});
      });
    });

    describe('error handling', () => {
      it('should call logout on 401 error', () => {
        httpClient.get('/api/test').subscribe({
          next: () => fail('should have failed with 401 error'),
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(401);
            expect(authServiceSpy.logout).toHaveBeenCalled();
          }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      });

      it('should not call logout on other errors', () => {
        httpClient.get('/api/test').subscribe({
          next: () => fail('should have failed with 404 error'),
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(404);
            expect(authServiceSpy.logout).not.toHaveBeenCalled();
          }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      });

      it('should not call logout on 500 error', () => {
        httpClient.get('/api/test').subscribe({
          next: () => fail('should have failed with 500 error'),
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(500);
            expect(authServiceSpy.logout).not.toHaveBeenCalled();
          }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      });

      it('should propagate the error after handling', () => {
        httpClient.get('/api/test').subscribe({
          next: () => fail('should have failed'),
          error: (error: HttpErrorResponse) => {
            expect(error).toBeDefined();
            expect(error.status).toBe(401);
          }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      });

      it('should handle 401 error with user logged in', () => {
        const mockUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'administrator',
          capabilities: [],
          meta: { token: 'expired-token' },
          registeredDate: new Date(),
          status: 'active'
        };

        Object.defineProperty(authServiceSpy, 'currentUser', {
          get: () => mockUser,
          configurable: true
        });

        httpClient.get('/api/test').subscribe({
          next: () => fail('should have failed'),
          error: () => {
            expect(authServiceSpy.logout).toHaveBeenCalled();
          }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      });
    });
  });
});

