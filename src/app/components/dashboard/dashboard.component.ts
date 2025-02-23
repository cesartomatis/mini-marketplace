import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ServiceService } from '../../services/service/service.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Service } from '../../models/service.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  services$: Observable<Service[]>;
  currentService: Service = {
    name: '',
    description: '',
    price: 0,
    category: '',
  };
  loading = false;
  error = '';

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private router: Router
  ) {
    this.services$ = this.serviceService.getServices();
  }

  ngOnInit() {}

  async addOrUpdateService() {
    this.loading = true;
    this.error = '';
    try {
      if (this.currentService.id) {
        await this.serviceService.updateService(
          this.currentService.id,
          this.currentService
        );
      } else {
        await this.serviceService.addService(this.currentService);
      }
      this.resetForm();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  editService(service: Service) {
    this.currentService = { ...service };
  }

  async deleteService(id: string) {
    this.loading = true;
    this.error = '';
    try {
      await this.serviceService.deleteService(id);
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  resetForm() {
    this.currentService = { name: '', description: '', price: 0, category: '' };
  }
}
