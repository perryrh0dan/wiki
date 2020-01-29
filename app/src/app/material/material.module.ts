import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Material from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    Material.MatDialogModule,
    Material.MatFormFieldModule,
    Material.MatInputModule,
    Material.MatSelectModule,
    Material.MatCardModule,
    Material.MatButtonModule,
    Material.MatToolbarModule,
    Material.MatTooltipModule,
  ],
  exports: [
    Material.MatDialogModule,
    Material.MatFormFieldModule,
    Material.MatInputModule,
    Material.MatSelectModule,
    Material.MatCardModule,
    Material.MatButtonModule,
    Material.MatToolbarModule,
    Material.MatTooltipModule,
  ],
  providers: [],
  declarations: [],
})
export class MaterialModule { }
