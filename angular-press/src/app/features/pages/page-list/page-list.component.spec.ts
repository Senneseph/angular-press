import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { PageListComponent } from './page-list.component';
import { LoadPages, DeletePage } from '../../../store/pages/page.actions';

describe('PageListComponent', () => {
  let component: PageListComponent;
  let fixture: ComponentFixture<PageListComponent>;
  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const storeSpyObj = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ PageListComponent ],
      providers: [
        { provide: Store, useValue: storeSpyObj },
        { provide: Router, useValue: routerSpyObj }
      ]
    })
    .compileComponents();

    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture = TestBed.createComponent(PageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch LoadPages action', () => {
      component.ngOnInit();
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(LoadPages));
    });
  });

  describe('onCreatePage', () => {
    it('should navigate to new page route', () => {
      component.onCreatePage();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/pages/new']);
    });
  });

  describe('onEditPage', () => {
    it('should navigate to edit page route with id', () => {
      const pageId = '123';
      component.onEditPage(pageId);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/pages/edit', pageId]);
    });

    it('should navigate with different page ids', () => {
      component.onEditPage('1');
      component.onEditPage('2');
      
      expect(routerSpy.navigate).toHaveBeenCalledTimes(2);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/pages/edit', '1']);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/pages/edit', '2']);
    });
  });

  describe('onDeletePage', () => {
    beforeEach(() => {
      spyOn(window, 'confirm');
    });

    it('should show confirmation dialog', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.onDeletePage('123');
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this page?');
    });

    it('should dispatch DeletePage action when confirmed', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      const pageId = '123';
      
      component.onDeletePage(pageId);
      
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(DeletePage));
    });

    it('should not dispatch DeletePage action when cancelled', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.onDeletePage('123');
      
      // Only ngOnInit dispatch should have been called
      expect(storeSpy.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('displayedColumns', () => {
    it('should have correct columns defined', () => {
      expect(component.displayedColumns).toEqual([
        'title',
        'status',
        'author',
        'modifiedDate',
        'actions'
      ]);
    });

    it('should have 5 columns', () => {
      expect(component.displayedColumns.length).toBe(5);
    });
  });

  describe('observables', () => {
    it('should have pages$ observable defined', () => {
      expect(component.pages$).toBeDefined();
    });

    it('should have loading$ observable defined', () => {
      expect(component.loading$).toBeDefined();
    });
  });

  it('should have correct selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-page-list')).toBeDefined();
  });
});

