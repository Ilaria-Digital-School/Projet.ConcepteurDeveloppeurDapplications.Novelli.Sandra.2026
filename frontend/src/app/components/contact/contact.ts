import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact-service';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  contactForm!: FormGroup;

  private formBuilder = inject(FormBuilder);
  private contactService = inject(ContactService); 


  ngOnInit(): void {

    this.contactForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      msg: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(600)]]
    });

  }


  sendMessage() {

    const formValue = this.contactForm.value;

    const messageFinal = {
      username: formValue.username,
      email: formValue.email,
      subject: formValue.subject,
      msg: formValue.msg
    }

    this.contactService.saveMessage(messageFinal).subscribe({
      next: (res: any) => {
        alert('Message sent successfully')
        this.contactForm.reset();
        console.log(messageFinal);
      },
      error: (err) => {
        console.log(err);
        alert('Error sending message. Please try again.')
      }
    })

  }
}
