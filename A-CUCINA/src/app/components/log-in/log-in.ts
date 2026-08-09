import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
// import { UserService } from '../../services/user-service';


@Component({
  selector: 'app-log-in',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {

  logInForm!: FormGroup;
  errorMsg: String = '';

  // Be careful not to get variable and module names mixed up.
  private formBuilder = inject(FormBuilder);
  // Inject this module for redirection.
  private router = inject(Router);
  // private userService = inject(UserService);


  ngOnInit() {
    this.logInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required]],
    });
  }

  logIn() {
    // Get form data.
    let formValue = this.logInForm.value;

    // // LOCAL STORAGE VERSION.
    // // Parse users table/object?
    // const users = JSON.parse(localStorage.getItem('users') || '[]');

    // // Returns a boolean value.
    // let user = users.find((u: any) => 
    //   u.email === formValue.email && u.password === formValue.password
    // )

    // if (user) {
    //   localStorage.setItem('connectedUser', JSON.stringify(user));
    //   // Redirect user to homepage.
    //   // Need both parentheses and square brackets.
    //   this.router.navigate(['']);
    //   this.errorMsg = '';
    // }
    // else {
    //   this.errorMsg = 'Invalid username or password';
    // }


    // DB JSON VERSION.
    // this.userService.logIn(formValue).subscribe({
    //   next: (res: any) => {
    //     console.log(res);
    //     if (res.length > 0) {
    //       const user = res[0];
    //       localStorage.setItem('connectedUser', JSON.stringify(res[0]));
    //       this.errorMsg = '';
    //       console.log(user);
    //       if (user.admin) {
    //         this.router.navigate(['/admin']);
    //       }
    //       else {
    //         this.router.navigate(['']);
    //         }
    //       }
    //     else {
    //       this.errorMsg = 'Email ou mot de passe incorrect';
    //     }
    //   }
    // });

  }
}