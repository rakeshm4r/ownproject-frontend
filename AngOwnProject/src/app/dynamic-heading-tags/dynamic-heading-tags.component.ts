import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicHeadingTagsService } from '../API-Services/dynamic-heading-tags.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dynamic-heading-tags',
  templateUrl: './dynamic-heading-tags.component.html',
  styleUrls: ['./dynamic-heading-tags.component.css']
})
export class DynamicHeadingTagsComponent implements OnInit {
    dynamicForm: FormGroup;
  
    constructor(private fb: FormBuilder, private dynamicHeadingTagsService: DynamicHeadingTagsService,private messageService:MessageService) {
      this.dynamicForm = this.fb.group({
        fields: this.fb.array([this.createField()])
      });
    }
  
    ngOnInit(): void {
        this.getAllHeadingTags()
    }
  
    createField(): FormGroup {
      return this.fb.group({
        headerName: ['', Validators.required],
      //  fieldName: ['', Validators.required]
      });
    }
  
    get fields(): FormArray {
      return this.dynamicForm.get('fields') as FormArray;
    }
  
    addField(): void {
      this.fields.push(this.createField());
    }
    headingTags: any[] = [];
    // Submit the form and call the API
    onSubmit(): void {
      if (this.dynamicForm.valid) {
        const formData = this.dynamicForm.value.fields.map((field: any) => ({
          headerName: field.headerName,
         // fieldValue: field.fieldName
        }));
    
        // Call the backend API to save the form data
        this.dynamicHeadingTagsService.submitForm(formData).subscribe({
          next: (response) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form submitted successfully' });
           window.location.reload();
          },
          error: (error) => {
            // Handle error here based on the status code or message
            if (error.status === 400 && error.error) {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error submitting form' });
            }
          }
        });
      }
    }

   
    getAllHeadingTags() {
      this.dynamicHeadingTagsService.getAllHeadingTags().subscribe({
        next: (response: any) => {
          // Adding the isEditMode flag to each tag when the data is fetched
          this.headingTags = response.map((tag: any) => ({
            ...tag,
            isEditMode: false  // Adding the flag for each tag
          }));
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
        }
      });
    }
  
    // Toggle edit mode for a specific tag
    editTag(index: number) {
      this.headingTags[index].isEditMode = true;
    }
  
    // Save the edited tag
    saveTag(index: number) {
      const tag = this.headingTags[index];
      const updatedTag = {
        headingId: tag.headingId, // Assuming you have this ID for the heading
        headerName: tag.headerName, // The new field header value after edit
      };
      // Call the service to update heading tags on the server
      this.dynamicHeadingTagsService.updateHeadingTags(updatedTag).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tag updated successfully' });
         
          // Updating the isEditMode to false for the UI
          this.headingTags[index].isEditMode = false;
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error });
        }
      });
    }
    
  
    // Cancel editing and revert changes
    cancelEdit(index: number) {
      this.headingTags[index].isEditMode = false;
      // Optionally revert changes if needed
      // this.headingTags[index] = this.originalTag;
    }
  
    // Delete a tag
    deleteTag(index: number) {
      const tag = this.headingTags[index];
      const tagToDelete = {
        headingId: tag.headingId, // Assuming you have this ID for the heading
        headerName: tag.headerName, // The new field header value after edit
        headerStatus:"1"
      };
      this.dynamicHeadingTagsService.updateHeadingTags(tagToDelete).subscribe({
        next: (response) => {
          this.headingTags.splice(index, 1);  
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tag deleted successfully' });
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tag' });
        }
      });
    }
    activateTag(index: number) {
      const tag = this.headingTags[index];
      tag.headerStatus = tag.headerStatus === '1' ? '0' : '1';
      const tagToDelete = {
        headingId: tag.headingId, // Assuming you have this ID for the heading
        headerName: tag.headerName, // The new field header value after edit
        headerStatus:tag.headerStatus
      };
      this.dynamicHeadingTagsService.updateHeadingTags(tagToDelete).subscribe({
        next: (response) => {
          if (tag.headerStatus === '1') {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tag  Activated  successfully' });
          } else {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tag De-Activated successfully' });
          }
          window.location.reload()
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete tag' });
        }
      });
    }
}
