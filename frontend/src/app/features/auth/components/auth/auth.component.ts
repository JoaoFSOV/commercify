import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    InputTextModule,
    CommonModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  username: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";

  formType: 'login' | 'register' | 'reset' | 'forgot' = 'login';
  token: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if(params['token']) {
        this.token = params['token'];
        this.formType = 'reset';
      }
    });

    this.route.queryParams.subscribe(params => {
      if(params['form']) this.formType = params['form'];
      else if(this.token === '') this.formType = 'login'; // Default
    })
  }

  switchForm(type: 'login' | 'register' | 'reset' | 'forgot') {
    this.formType = type;
    this.router.navigate([], {
      queryParams: { form: type },
      queryParamsHandling: 'merge'
    });
  }

  login() {
    console.log(`Sending request to backend to log in and receive a token in the cookie jwt_token, sending this login data email: ${this.email}, password: ${this.password}`);
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login Successfull: ', response);
        this.router.navigateByUrl('/home');
      },
      error: (error) => console.error('Login failed:', error),
    });
  }

  register() {
    console.log(`Sending a request to the backend to register the new user with the following username:  ${this.username}, password: ${this.password}, email: ${this.email}`);
    this.authService.register(this.username, this.email, this.password, this.confirmPassword).subscribe({
      next: (response) => {
        console.log('Registration successfull: ', response);
        this.router.navigateByUrl('/login');
      },
      error: (error) => console.error('Login failed:', error),
    });
  }

  forgot() {
    console.log("Sending a request to the backend to send a reset password email to this email ", this.email);
    this.authService.forgot(this.email).subscribe({
      next: (response) => {
        console.log('Reset password email sent: ', response);
        this.router.navigateByUrl('/login');
      },
      error: (error) => console.error('Error sending the reset password email: ', error)
    });
  }

  resetPassword() {
    console.log("Sending a request to the backend to reset your password to this: ", this.password);
    this.authService.reset(this.token, this.password, this.confirmPassword).subscribe({
      next: (response) => {
        console.log('Password updated! ', response);
        this.router.navigateByUrl('/login');
      },
      error: (error) => console.error('Reset password failed: ', error)
    });
  }
}
