import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {


  signUpForm!: FormGroup;
  users: any[] = [];

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  // private userService = inject(UserService);

  ngOnInit(): void {
    console.log('Hi, ngOnInit is running!');

    this.signUpForm = this.formBuilder.group({
      familyName: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      pwd2: ['', [Validators.required]],
      gender: ['', Validators.required],
      browsing: [false],
      contributing: [false],
      country: ['', Validators.required]
    },

      { validators: this.passwordMatchValidator }

    );
  }

  passwordMatchValidator(control: AbstractControl) {
    // Get both values.
    const pwd = control.get('pwd')?.value;
    const pwd2 = control.get('pwd2')?.value;

    // Check if identical.
    if (pwd !== pwd2) {
      // 'passwordMismatch' doesn't have to be declared.
      // It could be anything as long as it matches the argument in hasError().
      return { passwordMismatch: true };
    }
    return null;

  }


  signUp() {

    const formValue = this.signUpForm.value;

    // To add checkboxes.
    let interests = [];
    if (formValue.clothes) interests.push('clothes');
    if (formValue.accessories) interests.push('accessories');

    // Create final object.
    const userFinal = {
      familyName: formValue.familyName,
      firstName: formValue.firstName,
      email: formValue.email,
      pwd: formValue.pwd,
      gender: formValue.gender,
      country: formValue.country,
      interests,
      admin: false
    }

    // // this.userService.addUser(userFinal).subscribe({
    // //   next: (res: any) => {
    // //     alert('Inscription effectuée avec succès')
    // //     this.router.navigate(['/log-in']);
    // //   },
    // //   error: (err) => {
    // //     console.log((err));
    // //     alert('Erreur dans la procédure d\'inscription');
    // //   }
    // })


  }

}
