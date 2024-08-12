import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CollaboratorsService } from '../../services/collaborators.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  backgroundColor: string = "blue";
  userProfile = '';

  constructor(private userService: UserService, private collaboratorService: CollaboratorsService, private auth: AuthService, private router: Router){}

  ngOnInit() {
    this.userService.user$.subscribe(async (user) =>{
      if(user){
        console.log(user.uid)
        const userProfile = await this.userService.getUserProfile(user.uid);
        if(userProfile && userProfile['companyName']){
          this.userProfile = userProfile['companyName'];
        } else {
          const collaboratorProfile = await this.collaboratorService.getCollaboratorProfile(user.uid);
          this.userProfile = collaboratorProfile!['name'];
        }
      }
    })
  }

  async signOut(){
    try {
      await this.auth.signOut();
      this.router.navigate(['/login']); // Redireciona para a página de login após o logout
    } catch (error) {
      console.error('Error signing out', error);
    }
  }
}
