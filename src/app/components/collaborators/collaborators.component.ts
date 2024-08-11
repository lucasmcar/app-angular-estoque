import { Component, OnInit } from '@angular/core';
import { CollaboratorsService } from '../../services/collaborators.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrl: './collaborators.component.css'
})
export class CollaboratorsComponent implements OnInit{

  collaborators: any[] = [];
  displayedColumns: string[] = ['email', 'role', 'access', 'actions'];
  formAddCollaborator: FormGroup;

  constructor(private collaboratorService: CollaboratorsService, private fb: FormBuilder){
    this.formAddCollaborator = fb.group({

    })
  }


  ngOnInit(): void {
    this.loadCollaborators();
  }

  toggleAccess(email: string, access: boolean){

  }

  async addCollaborator(){
    if(this.formAddCollaborator.valid){
      const { email, password, role } = this.formAddCollaborator.value;
      try{
        await this.collaboratorService.addCollaborator(email, password, role);
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
