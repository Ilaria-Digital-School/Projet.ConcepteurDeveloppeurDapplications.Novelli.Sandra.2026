import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';


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
  private userService = inject(UserService);

  ngOnInit(): void {

    this.signUpForm = this.formBuilder.group({
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      pwd: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(255)]],
      pwd2: ['', [Validators.required]],
      gender: [''],
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
      return { passwordMismatch: true };
    }
    return null;

  }


  signUp() {

    const formValue = this.signUpForm.value;

    // To add checkboxes.
    let interests = [];
    if (formValue.baking) interests.push('baking');
    if (formValue.grilling) interests.push('grilling');
    if (formValue.veggie) interests.push('veggie');
    if (formValue.dessert) interests.push('dessert');

    // Create final object.
    const userFinal = {
      lastname: formValue.lastname,
      firstName: formValue.firstName,
      email: formValue.email,
      pwd: formValue.pwd,
      gender: formValue.gender,
      country: formValue.country,
      interests,
      admin: false
    }

    this.userService.addUser(userFinal).subscribe({
      next: (res: any) => {
        alert('Account added successfully.')
        this.router.navigate(['/log-in']);
      },
      error: (err) => {
        console.log((err));
        alert('Failed to subscribe. Please try again.');
      }
    })

  }

}
