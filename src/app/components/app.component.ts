import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component of the application.
 * Serves as the entry point and hosts the router outlet for navigation.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  /** Title of the application. */
  title = 'mini-marketplace';
}
