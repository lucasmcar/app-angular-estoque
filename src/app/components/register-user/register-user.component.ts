import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {

  formRegister: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService){
    this.formRegister = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', Validators.required]
    });
  }


  registerUser(){
    const { email, password } =  this.formRegister.value;
    if(this.formRegister.valid){
      this.auth.signUp(email, password)
      .then(() =>{
        this.formRegister.reset();
      })
      .catch(error => {});
    }
  }


  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.preventDefault()
    event.stopPropagation();
  }



}
