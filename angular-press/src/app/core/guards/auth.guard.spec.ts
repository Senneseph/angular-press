import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user.interface';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['hasCapability'], {
      currentUser: null
    });
    const routSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {
      data: {}
    } as any;

    mockState = {
      url: '/test-url'
    } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    describe('when user is not logged in', () => {
      beforeEach(() => {
        Object.defineProperty(authServiceSpy, 'currentUser', {
          get: () => null,
          configurable: true
        });
      });

      it('should return false', () => {
        const result = guard.canActivate(mockRoute, mockState);
        expect(result).toBe(false);
      });

      it('should navigate to login page', () => {
        guard.canActivate(mockRoute, mockState);
        expect(routerSpy.navigate).toHaveBeenCalledWith(
          ['/login'],
          { queryParams: { returnUrl: '/test-url' } }
        );
      });

      it('should include return URL in query params', () => {
        mockState.url = '/admin/posts';
        guard.canActivate(mockRoute, mockState);
        expect(routerSpy.navigate).toHaveBeenCalledWith(
          ['/login'],
          { queryParams: { returnUrl: '/admin/posts' } }
        );
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
          capabilities: ['manage_options', 'edit_posts'],
          meta: {},
          registeredDate: new Date(),
          status: 'active'
        };

        Object.defineProperty(authServiceSpy, 'currentUser', {
          get: () => mockUser,
          configurable: true
        });
      });

      it('should return true when no capability is required', () => {
        const result = guard.canActivate(mockRoute, mockState);
        expect(result).toBe(true);
      });

      it('should not navigate when access is granted', () => {
        guard.canActivate(mockRoute, mockState);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });

      describe('with capability requirement', () => {
        it('should return true when user has required capability', () => {
          mockRoute.data = { capability: 'edit_posts' };
          authServiceSpy.hasCapability.and.returnValue(true);

          const result = guard.canActivate(mockRoute, mockState);
          expect(result).toBe(true);
        });

        it('should check for the correct capability', () => {
          mockRoute.data = { capability: 'manage_options' };
          authServiceSpy.hasCapability.and.returnValue(true);

          guard.canActivate(mockRoute, mockState);
          expect(authServiceSpy.hasCapability).toHaveBeenCalledWith('manage_options');
        });

        it('should return false when user lacks required capability', () => {
          mockRoute.data = { capability: 'delete_users' };
          authServiceSpy.hasCapability.and.returnValue(false);

          const result = guard.canActivate(mockRoute, mockState);
          expect(result).toBe(false);
        });

        it('should navigate to dashboard when user lacks capability', () => {
          mockRoute.data = { capability: 'delete_users' };
          authServiceSpy.hasCapability.and.returnValue(false);

          guard.canActivate(mockRoute, mockState);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
        });

        it('should handle multiple capability checks', () => {
          mockRoute.data = { capability: 'edit_posts' };
          authServiceSpy.hasCapability.and.returnValue(true);
          expect(guard.canActivate(mockRoute, mockState)).toBe(true);

          mockRoute.data = { capability: 'delete_posts' };
          authServiceSpy.hasCapability.and.returnValue(false);
          expect(guard.canActivate(mockRoute, mockState)).toBe(false);
        });
      });
    });
  });
});

