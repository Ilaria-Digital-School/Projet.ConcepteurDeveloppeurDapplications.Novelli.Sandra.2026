import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {

  logInForm!: FormGroup;
  errorMsg: String = '';

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);


  ngOnInit() {
    this.logInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required]],
    });
  }

  logIn() {
    this.userService.logIn(this.logInForm.value).subscribe({
      next: (user: any) => {
        localStorage.setItem('connectedUser', JSON.stringify(user));
        this.authService.logIn(user);
        this.errorMsg = '';
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        }
        else {
          this.router.navigate(['']);
        }
      },
      error: (err) => {
        console.log(err);
        this.errorMsg = 'Invalid username or password';
      }
    });
  }
}

  // logIn() {
  //   // Get form data.
  //   let formValue = this.logInForm.value;

  //   // DB JSON VERSION.
  //   this.userService.logIn(formValue).subscribe({
  //     next: (res: any) => {
  //       console.log(res);
  //       if (res.length > 0) {
  //         const user = res[0];
  //         localStorage.setItem('connectedUser', JSON.stringify(res[0]));
  //         this.errorMsg = '';
  //         console.log(user);
  //         if (user.admin) {
  //           this.router.navigate(['/admin']);
  //         }
  //         else {
  //           this.router.navigate(['']);
  //           }
  //         }
  //       else {
  //         this.errorMsg = 'Invalid username or password';
  //       }
  //     },
  //     error: (err) => {
  //       console.log(err)
  //       alert('Login failed');
  //     }
  //   });

  // }
