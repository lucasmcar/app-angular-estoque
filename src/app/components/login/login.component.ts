import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  formLogin: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,private auth: AuthService, private router: Router){

    this.formLogin = this.fb.group({
      email :['', Validators.required],
      password : ['', Validators.required]
    })
  }


  ngOnInit(): void {

  }

  login(){
    if(this.formLogin.valid){
      const { email, password } = this.formLogin.value;
      this.auth.login(email, password).
      then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch(error => {})
      }
    }



  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.preventDefault()
    event.stopPropagation();
  }



}
