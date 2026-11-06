import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  let request = req;
  if (token && req.url.startsWith(environment.apiUrl)) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        token: token
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/users/signin') && !req.url.includes('/users/signup')) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
