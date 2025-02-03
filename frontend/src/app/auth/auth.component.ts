import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

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
  token: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router){}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params['token']) {
        this.token = params['token'];
        this.formType = 'reset';
      }
      else if(params['form']) this.formType = params['form'];
      else this.formType = 'login'; // Default
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
  }

  register() {
    console.log(`Sending a request to the backend to register the new user with the following username:  ${this.username}, password: ${this.password}, email: ${this.email}`);
  }

  forgot() {
    console.log("Sending a request to the backend to send a reset password email to this email ", this.email);
  }

  resetPassword() {
    console.log("Sending a request to the backend to reset your password to this: ", this.password);
  }
}
