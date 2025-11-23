import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IndexFormComponent } from '../../../index-form/index-form';
import { OwnerService } from '../../../shared/service/owner.service';
import { OwnerFormModel } from '../../../shared/types/owner.types';
import { fromBackendOwner } from '../../../shared/utils/mapper';

@Component({
  selector: 'app-owner-edit',
  standalone: true,
  imports: [CommonModule, IndexFormComponent],
  templateUrl: './owner-edit.html',
  styleUrls: ['./owner-edit.scss'],
})
export class OwnerEditComponent {
  id!: string;
  model!: OwnerFormModel;
  selectedFiles: File[] = [];
  loading = true;

  constructor(
    private ownerSvc: OwnerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    await this.loadOwner();
  }

  async loadOwner() {
    try {
      const back = await this.ownerSvc.loadOwner(this.id);
      this.model = fromBackendOwner(back);
      this.loading = false;
    } catch (err) {
      console.error(err);
    }
  }

  onFilesSelected(files: File[]) {
    this.selectedFiles = files;
  }

  async onSubmit(front: OwnerFormModel) {
    try {
      await this.ownerSvc.updateOwner(this.id, front, this.selectedFiles);
      this.router.navigate(['/lista-proprietari']);
    } catch (err) {
      console.error(err);
    }
  }

  async onDeleteDoc(filename: string) {
    const updated = this.model.documents.filter((d) => d !== filename);
    await this.ownerSvc.deleteDocument(this.id, updated);
    this.model.documents = updated;
  }
}
