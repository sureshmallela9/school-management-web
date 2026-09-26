import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('accepts a legacy token-based login payload', () => {
    const result = service.login('admin@central.com', 'password123');
    let loginResult: { token: string } | undefined;
    result.subscribe((value) => (loginResult = value));

    const req = httpMock.expectOne('http://localhost:2020/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'admin@central.com',
      password: 'password123',
    });

    req.flush({
      success: true,
      message: 'OK',
      error: null,
      code: 200,
      data: {
        token: 'legacy-token',
        user: {
          id: 'u-1',
          name: 'Admin User',
          email: 'admin@central.com',
          roles: ['ADMIN'],
          tenantId: 'tenant-1',
        },
      },
    });

    expect(loginResult?.token).toBe('legacy-token');
    expect(localStorage.getItem('school-management.token')).toBe('legacy-token');
  });
});
