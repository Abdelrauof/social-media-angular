import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<'signin' | 'signup'>('signin');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  signinForm: FormGroup = this.fb.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    username: [''],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', [Validators.required]],
    dateOfBirth: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rePassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: FormGroup): null | { mismatch: true } {
    const password = form.get('password')?.value;
    const rePassword = form.get('rePassword')?.value;
    return password === rePassword ? null : { mismatch: true };
  }

  setTab(tab: 'signin' | 'signup'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  onSigninSubmit(): void {
    if (this.signinForm.invalid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.signinForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || err.error?.errors || 'Invalid credentials. Please try again.');
      }
    });
  }

  onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const val = { ...this.signupForm.value };
    if (!val.username) delete val.username;

    this.authService.signup(val).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || err.error?.errors || 'Signup failed. Please try again.');
      }
    });
  }
}

