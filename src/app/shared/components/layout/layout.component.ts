import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f0f2f5]">
      <app-navbar></app-navbar>
      <main class="flex-1 w-full px-2 sm:px-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent {}
