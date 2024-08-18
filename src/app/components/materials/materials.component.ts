import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormMaterialComponent } from '../../shared/dialog/form-material/form-material.component';
import { MatDialog } from '@angular/material/dialog';
import { MaterialsService } from '../../services/materials.service';
import { User as FirebaseUser } from 'firebase/auth';
import { UserService } from '../../services/user.service';
import { CollaboratorsService } from '../../services/collaborators.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { DataRefreshService } from '../../services/data-refresh.service';
import { Materials } from '../../models/materials';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.css'
})
export class MaterialsComponent implements OnInit {


  material: any[] = [];
  userRole = '';
  isLoading: boolean = true;
  isAdmin: boolean = false;
  userProfile: string = ''
  currentSortDirection: 'asc' | 'desc' = 'asc';
  currentSortColumn: string = '';
  userId = '';
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;
  displayedColumns: string[] = ['materialGroup', 'materialName', 'materialCategory', 'quantity', 'actions'];
  editForm: FormGroup;
  editIndex: number | null = null;


  constructor(
    private dialog: MatDialog,
    private materialService: MaterialsService,
    private userService: UserService,
    private collaboratorService: CollaboratorsService,
    private auth: AuthService,
    private materialLog: LogService,
    private router: Router,
    private dataRefreshService: DataRefreshService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      materialName: ['']
    });
  }


  async ngOnInit() {
    this.getListMaterial('materialName', this.currentSortDirection);
    this.userService.user$.subscribe(async (user) => {
      if (user) {
        const userProfile = await this.userService.getUserProfile(user.uid);
        if (userProfile && userProfile['companyName']) {
          this.userProfile = userProfile['companyName'];
          this.isAdmin = true;

        } else {
          const collaboratorProfile = await this.collaboratorService.getCollaboratorProfile(user.uid);
          this.userRole = collaboratorProfile!['role'];
          this.isAdmin = !collaboratorProfile!['role'];
          this.userProfile = collaboratorProfile!['name'];



        }
      }
      this.isLoading = false;
    })
    try {
      const user: FirebaseUser | null = await this.auth.getUser();
      if (user) {
        this.userId = user.uid;
      } else {
        this.router.navigate(['/login']); // Redireciona para a página de login se o usuário não estiver logado
      }
    } catch (error) {
      console.error('Error fetching user', error);
    }
    this.dataRefreshService.refresh$.subscribe(() => {
      this.getListMaterial('materialName', this.currentSortDirection);
    });
  }

  getListMaterial(orderByField: string = '', orderDirection: 'asc' | 'desc' = 'asc'): void {
    this.materialService.getMaterials(orderByField, orderDirection).subscribe(materials => {
      this.dataSource.data = materials;
      this.material = materials;
      this.currentSortColumn = orderByField;
      this.currentSortDirection = orderDirection;
      this.dataSource.paginator = this.paginator
    });
  }


  saveEdit(id: string) {
    if (this.editForm.valid) {

      const { materialName } = this.editForm.value;

      const material: Materials = {
        materialName: materialName
      }

      this.materialService.updateMaterial(id, material).subscribe(() => {
        this.getListMaterial('materialName');
        this.editIndex = null;
      });
    }
  }

  async useMaterial(material: any) {
    if (material.quantity > 0) {
      const newQuantity = material.quantity - 1;

      this.materialService.useMaterial(material.materialName, newQuantity, this.userProfile).then(() => {
        if (newQuantity === 0) {
          material.quantity = 'Em falta';
        } else {
          material.quantity = newQuantity;
        }
        this.refreshData();
      });
    }
  }

  openFab() {
    const dialogRef = this.dialog.open(FormMaterialComponent, {
      data: {
        title: 'Cadastro de tintas'
      },
      width: '40%'
    });
  }

  refreshData(): void {
    this.getListMaterial(this.currentSortColumn, this.currentSortDirection);
  }
  //Métodos de modificação e visualização da lista

  removeMaterial(materialName: string) {
    return this.materialService.removeMaterial(materialName).then(() => {
      this.getListMaterial('materialName', 'asc');
    });
  };

  startEdit(index: number) {
    this.editIndex = index;
    const material = this.material[index];
    this.editForm.patchValue(material);
  }

  cancelEdit() {
    this.editIndex = null;
  }

  //Reagrupamento de tabelas
  reagrupar(columnName: string): void {
    if (this.currentSortColumn === columnName) {

      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {

      this.currentSortDirection = 'asc';
    }

    this.getListMaterial(columnName, this.currentSortDirection);
  }

  getSortIcon(columnName: string): string {
    if (this.currentSortColumn === columnName) {
      return this.currentSortDirection === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
    }
    return 'unfold_more';
  }


}
