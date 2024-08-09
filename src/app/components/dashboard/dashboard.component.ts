import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  backgroundColor: string = "blue";
  userProfile = '';

  constructor(private userService: UserService, private router: Router){}

  ngOnInit() {
    this.userService.user$.subscribe(async (user) =>{
      if(user){
        const userProfile = await this.userService.getUserProfile(user.uid);
        if(userProfile && userProfile['companyName']){
          this.userProfile = userProfile['companyName'];
        }
      }
    })
  }

  signOut(){

  }
}
