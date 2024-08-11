import { Component, OnInit } from '@angular/core';
import { CollaboratorsService } from '../../services/collaborators.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrl: './collaborators.component.css'
})


export class CollaboratorsComponent implements OnInit{

  collaborators: any[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'access', 'actions'];
  formAddCollaborator: FormGroup;

  constructor(private userService: UserService, private collaboratorService: CollaboratorsService, private fb: FormBuilder){
    this.formAddCollaborator = fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['collaborator', Validators.required]
    })
  }



  ngOnInit(): void {
    this.loadCollaborators();
  }

  async toggleAccess(email: string, access: boolean){
    try{
      const uid = await this.collaboratorService.getCollaboratorUidByEmail(email);

      if(uid){
        await this.collaboratorService.updateCollaboratorAccess(uid, access);
        this.loadCollaborators();
      }

    }catch(error){
      console.error('Can\'t update collaborator access', error);
    }
  }

  /*async addCollaborator1(){
    this.userService.user$.subscribe(async (user) =>{
      if(user){
        const collaborator = {
          ...this.formAddCollaborator.value,
          user: user.uid,
        };
        try{
          await this.collaboratorService.addColaborator1(collaborator);
          this.formAddCollaborator.reset();
        }catch(error){
          console.error("Erro ao add colaborador", error);
        }
      }
    })
  }*/

  async addCollaborator(){
    if(this.formAddCollaborator.valid){
      const {name,  email, password, role } = this.formAddCollaborator.value;
      try{
        await this.collaboratorService.addCollaborator(name, email, password, role);
        this.loadCollaborators();
        this.formAddCollaborator.reset();
      } catch(error){
        console.error('Erro ao adicionar colaborador', error);
      }
    }
  }

  removeCollaborator(email: string){

  }

  async loadCollaborators(){
    this.collaborators = await this.collaboratorService.getCollaborators();
  }

}
