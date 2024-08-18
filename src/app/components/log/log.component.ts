import { Component, OnInit } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';
import { LogService } from '../../services/log.service';
import { PaintCarUsageLog } from '../../models/paint-car-usage-log';
import { MaterialUsageLog } from '../../models/material-usage-log';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrl: './log.component.css'
})
export class LogComponent implements OnInit{

  displayedColumns : string[] = ['materialName', 'type', 'usedBy',  'quantityUsed', 'usedAt'];
  logs: MaterialUsageLog[] = [];
  selectedFilter: string = 'all'; // Valor padrão
  allItems: any[] = []; // Sua lista completa de itens (tintas e materiais)
  filteredItems: any[] = [];


  constructor(private materialLog: LogService){
  }

  ngOnInit(): void {
    this.filteredItems = this.allItems; // Mo
    this.materialLog.getMaterialUsageLogs().subscribe(logs => {
      this.logs = logs.map(log => ({
          ...log,
          usedAt: log.usedAt.toDate()  // Convertendo o Timestamp para Date
      }));

      
  });
  }



}
