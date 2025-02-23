import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { ServiceService } from '../../services/service/service.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Service } from '../../models/service.model';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  services$: Observable<Service[]>;
  serviceForm: FormGroup;
  loading = false;
  error = '';
  editingServiceId: string | null = null;

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.services$ = this.serviceService.getServices();
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.serviceForm.invalid) {
      this.error = 'Please fill all fields correctly.';
      return;
    }

    this.loading = true;
    this.error = '';
    try {
      const service: Service = this.serviceForm.value;
      if (this.editingServiceId) {
        await this.serviceService.updateService(this.editingServiceId, service);
      } else {
        const res = await this.serviceService.addService(service);
        console.log('Service added with ID: ', res);
      }
      this.resetForm();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  editService(service: Service) {
    this.editingServiceId = service.id || null;
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
    });
  }

  async deleteService(id: string | undefined) {
    if (!id) {
      this.error = 'Service ID is missing.';
      return;
    }

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
    this.serviceForm.reset();
    this.editingServiceId = null;
  }
}
