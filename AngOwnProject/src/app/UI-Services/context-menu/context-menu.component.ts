import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { CredentailsService } from 'src/app/API-Services/credentails.service';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css'],
})
export class ContextMenuComponent implements OnInit {
  @Output() actionClicked: EventEmitter<string> = new EventEmitter();
  @ViewChild('menu') menuElement!: ElementRef;

  @Input() xPos: number = 0;
  @Input() yPos: number = 0;

  menuItems: string[] = ['Refresh'];

  constructor(private credentailsService: CredentailsService){}

  ngOnInit(): void {
    // Add "LogOut" option if the user is logged in
    if (this.credentailsService.isLogged_Frm_Session_Stg()) {
      this.menuItems.push('LogOut');
    }
  }
  
  // Emit action when a menu item is clicked
  onMenuItemClick(action: string) {
    this.actionClicked.emit(action);
    if (action === 'LogOut') {
      this.credentailsService.logOut();  // Log out the user
      
    }
  }
}
