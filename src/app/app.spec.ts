import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './core/services/auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the QSchool shell', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(AuthService).setToken('test-token', {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      tenantId: 'test-tenant',
      roles: ['ROLE_PARENT'],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent || '').toContain('QSchool');
  });
});
