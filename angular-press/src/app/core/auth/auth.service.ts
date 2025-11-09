import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<User> {
    // TODO: Implement actual API call
    return new Observable(observer => {
      const mockUser: User = {
        id: '1',
        username,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'administrator',
        capabilities: ['manage_options', 'edit_posts', 'publish_posts'],
        meta: {},
        registeredDate: new Date(),
        status: 'active'
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      this.currentUserSubject.next(mockUser);
      observer.next(mockUser);
      observer.complete();
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasCapability(capability: string): boolean {
    return this.currentUser?.capabilities.includes(capability) || false;
  }
}