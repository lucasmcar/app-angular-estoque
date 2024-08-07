import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-profile',
  templateUrl: './register-profile.component.html',
  styleUrl: './register-profile.component.css'
})
export class RegisterProfileComponent implements OnInit {

  formRegisterProfile: FormGroup;
  userId: string | undefined;

  constructor(private userService: UserService, private auth: AuthService, private fb: FormBuilder, private router: Router){
    this.formRegisterProfile = this.fb.group({});
  }
  async ngOnInit(){
    try {
      const user: FirebaseUser | null = await this.auth.getUser();
      console.log(user);
      if (user) {

        this.userId = user.uid;
        console.log(this.userId)
      } else {
        this.router.navigate(['/login']); // Redireciona para a página de login se o usuário não estiver logado
      }
    } catch (error) {
      console.error('Error fetching user', error);
    }
  }

  registerProfile(){

  }
}
