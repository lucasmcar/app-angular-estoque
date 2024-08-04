import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-success',
  templateUrl: './dialog-success.component.html',
  styleUrl: './dialog-success.component.css'
})
export class DialogSuccessComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogSuccessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { successMsg: string },
    private router: Router
  ) {}

  onClose(){
    this.dialogRef.close();
    this.router.navigate(['/dashboard']);
  }
}
