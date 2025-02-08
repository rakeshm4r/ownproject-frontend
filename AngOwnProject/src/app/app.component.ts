import { Component, HostListener, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ContextMenuComponent } from './UI-Services/context-menu/context-menu.component';
import { CredentailsService } from './API-Services/credentails.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService]
})
export class AppComponent {
  constructor(private credentailsService: CredentailsService){}
  title = 'AngOwnProject';
  @ViewChild(ContextMenuComponent) contextMenuComponent!: ContextMenuComponent;
  isMenuVisible = false;
  mouseX = 0;
  mouseY = 0;

  // Handle right-click event (global)
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault(); // Prevent the default right-click menu
  
    // Get the mouse coordinates
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  
    // Get the width and height of the menu to prevent overflow
    const menuWidth = 150; // Update as needed
    const menuHeight = 200; // Update as needed
  
    // Adjust position if the menu goes off the screen
    const rightEdge = window.innerWidth - this.mouseX;
    const bottomEdge = window.innerHeight - this.mouseY;
  
    // Ensure the menu stays within the screen bounds
    if (rightEdge < menuWidth) {
      this.mouseX -= menuWidth; // Adjust to the left
    }
  
    if (bottomEdge < menuHeight) {
      this.mouseY -= menuHeight; // Adjust upwards
    }
  
    // Show the custom menu at mouse position
    this.isMenuVisible = true;
  }
  

 

  // Close the menu when clicking anywhere else
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // Close the menu if clicked outside
    const clickedInsideMenu = this.contextMenuComponent?.menuElement?.nativeElement.contains(event.target);
    if (!clickedInsideMenu) {
      this.isMenuVisible = false;
    }
  }
   // Handle the action from the context menu
   onActionClicked(action: string) {
    if (action === 'Refresh') {
     window.location.reload()
    } else if (action === 'LogOut') {
      this.logOut()
    } 
    // Hide the context menu after action
    this.isMenuVisible = false;
  }
  isLoggedIn:any
  ngOnInit(): void {
    // Check if the user is logged in when the app starts
    this.isLoggedIn = this.credentailsService.isLogged_Frm_Session_Stg();
  }

  userId = sessionStorage.getItem('userId');

   logOut() {
    // Remove the userId from sessionStorage
    sessionStorage.removeItem('userId');
  
    // Remove the userRole cookie
    this.deleteCookie('userRole');
  
    // Reload the page to reset the app state (if needed)
    window.location.reload();
  }
  
  // Utility to delete a cookie by setting its expiry to a past date
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
  }
}
