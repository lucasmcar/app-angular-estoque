import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormDialogComponent } from '../../shared/dialog/form-dialog/form-dialog.component';
import { AuthService } from '../../services/auth.service';
import { User as FirebaseUser } from 'firebase/auth';
import { Router } from '@angular/router';
import { CarPaintsService } from '../../services/car-paints.service';



@Component({
  selector: 'app-car-paints',
  templateUrl: './car-paints.component.html',
  styleUrl: './car-paints.component.css'
})
export class CarPaintsComponent implements OnInit {

  carPaints: any[] = [];
  userId: string | undefined;
  displayedColumns: string[] = ['colorGroup', 'colorName', 'code', 'brand', 'actions'];
  currentSortDirection: 'asc' | 'desc' = 'asc';
  currentSortColumn: string = '';

  constructor(private dialog: MatDialog, private auth: AuthService, private router: Router, private carPaintService: CarPaintsService){

  }

  async ngOnInit() {
    this.getListColors('colorName', this.currentSortDirection);
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
  }

  removePaint(code: string){}

  getListColors(orderByField: string = '', orderDirection: 'asc' | 'desc' = 'asc'): void {
    this.carPaintService.getCarPaints(orderByField, orderDirection).subscribe(carPaints => {
      this.carPaints = carPaints;
      this.currentSortColumn = orderByField;
      this.currentSortDirection = orderDirection;
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



  openFab(){
    const dialogRef = this.dialog.open(FormDialogComponent, {
      data: {
        title: 'Cadastro de tintas'
      },
      width: '40%'
    });
  }
}
