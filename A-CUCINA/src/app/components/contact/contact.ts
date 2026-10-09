import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  contactForm!: FormGroup;

  private formBuilder = inject(FormBuilder);

  ngOnInit(): void {

    // CHeck if this function is working.
    console.log('Hello, ngOnInit is running');

    this.contactForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      msg: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(600)]]
    });

  }

  sendMessage() {
    alert('Message envoyé avec succès')
  }
}
