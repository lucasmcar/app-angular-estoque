import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { LogService } from '../../services/log.service';
import { MaterialUsageLog } from '../../models/material-usage-log';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataRefreshService } from '../../services/data-refresh.service';
import { User as FirebaseUser } from 'firebase/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrl: './log.component.css'
})
export class LogComponent implements OnInit {

  displayedColumns: string[] = ['materialName', 'type', 'usedBy', 'quantityUsed', 'usedAt'];
  logs: MaterialUsageLog[] = [];
  selectedFilter: string = 'all';
  allItems: any[] = [];
  filteredItems: any[] = [];
  currentSortDirection: 'asc' | 'desc' = 'asc';
  currentSortColumn: string = '';
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;
  userId: any;


  constructor(private auth: AuthService, private materialLog: LogService, private router: Router, private dataRefreshService: DataRefreshService) {
  }

  async ngOnInit() {
    this.filteredItems = this.allItems;
    this.getListLog('usedAt', 'desc');
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
      this.getListLog('usedAt', 'desc');
    });
  }

  async removeLog(): Promise<void> {
    try {
      await this.materialLog.clearLogs();
      this.dataSource.data = [];
    } catch (error) {
      console.error('Erro ao limpar a lista de logs: ', error);
    }
  }

  reagrupar(columnName: string): void {
    if (this.currentSortColumn === columnName) {

      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {

      this.currentSortDirection = 'asc';
    }

    this.getListLog(columnName, this.currentSortDirection);
  }

  getListLog(orderByField = 'usedAt', orderDirection: 'asc' | 'desc' = 'desc') {
    this.materialLog.getMaterialUsageLogs(orderByField, orderDirection).subscribe(logs => {
      this.dataSource.data = logs.map(log => ({
        ...log,
        usedAt: log.usedAt.toDate()  // Convertendo o Timestamp para Date
      }));

      this.currentSortColumn = orderByField;
      this.currentSortDirection = orderDirection;
      this.dataSource.paginator = this.paginator;
    });
  }

  getSortIcon(columnName: string): string {
    if (this.currentSortColumn === columnName) {
      return this.currentSortDirection === 'asc' ? 'arrow_drop_up' : 'arrow_drop_down';
    }
    return 'unfold_more';
  }

}
