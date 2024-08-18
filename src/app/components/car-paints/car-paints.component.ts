import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent } from '../../shared/dialog/form-dialog/form-dialog.component';
import { AuthService } from '../../services/auth.service';
import { User as FirebaseUser } from 'firebase/auth';
import { Router } from '@angular/router';
import { CarPaintsService } from '../../services/car-paints.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { DataRefreshService } from '../../services/data-refresh.service';
import { CollaboratorsService } from '../../services/collaborators.service';
import { UserService } from '../../services/user.service';



@Component({
  selector: 'app-car-paints',
  templateUrl: './car-paints.component.html',
  styleUrl: './car-paints.component.css'
})
export class CarPaintsComponent implements OnInit {

  carPaints: any[] = [];
  userId: any | undefined;
  displayedColumns: string[] = ['colorGroup', 'colorName', 'code', 'quantity', 'brand', 'actions'];
  currentSortDirection: 'asc' | 'desc' = 'asc';
  currentSortColumn: string = '';
  userRole = '';
  isLoading: boolean = true;
  isAdmin: boolean = false;
  userProfile: string = ''
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;

  constructor(
    private dialog: MatDialog,
    private dataRefreshService: DataRefreshService,
    private auth: AuthService,
    private router: Router,
    private carPaintService: CarPaintsService,
    private collaboratorService: CollaboratorsService,
    private userService: UserService
  ){

  }

  async ngOnInit() {
    this.getListColors('colorName', this.currentSortDirection);
    this.userService.user$.subscribe(async (user) =>{
      if(user){
        const userProfile = await this.userService.getUserProfile(user.uid);
        if(userProfile && userProfile['companyName']){
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
      this.getListColors('colorName', this.currentSortDirection);
    });
  }

  removePaint(code: string){
    return this.carPaintService.removeCarPaints(code).then(() => {
      this.getListColors('colorName', 'asc');
    });
  };

  getListColors(orderByField: string = '', orderDirection: 'asc' | 'desc' = 'asc'): void {
    this.carPaintService.getCarPaints(orderByField, orderDirection).subscribe(carPaints => {
      this.dataSource.data = carPaints;
      this.currentSortColumn = orderByField;
      this.currentSortDirection = orderDirection;
      this.dataSource.paginator = this.paginator
    });
  }

  reagrupar(columnName: string): void {
    if (this.currentSortColumn === columnName) {

      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {

      this.currentSortDirection = 'asc';
    }

    this.getListColors(columnName, this.currentSortDirection);
  }

  getSortIcon(columnName: string): string {
    if (this.currentSortColumn === columnName) {
      return this.currentSortDirection === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
    }
    return 'unfold_more';
  }


  useCarPaint(paint: any): void {
    if (paint.quantity > 0) {
      const newQuantity = paint.quantity - 1;

      this.carPaintService.useCarPaint(paint.code, newQuantity, this.userProfile).then(() => {
        if (newQuantity === 0) {
          paint.quantity = 'Em falta';
        } else {
          paint.quantity = newQuantity;
        }
        this.refreshData();
      });
    }
  }

  openFab(){
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        title: 'Cadastro de tintas'
      },
      width: '40%'
    });
  }

  refreshData(): void {
    this.getListColors(this.currentSortColumn, this.currentSortDirection);
  }
}
