import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentailsService } from '../API-Services/credentails.service';
import { User } from '../UserInterface';
import { MessageService } from 'primeng/api';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
@Component({
  selector: 'app-control-setting',
  templateUrl: './control-setting.component.html',
  styleUrls: ['./control-setting.component.css']
})
export class ControlSettingComponent implements OnInit {
  
  constructor(private credentialsService: CredentailsService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.getAllUsers()
  }
  users: User[] = [];  // Empty array to hold user data

  getAllUsers(): void {
    this.credentialsService.getAllUsers().subscribe(
      (data) => {
        this.users = data;  // Bind the response data to the users array
      },
      (error) => {
        console.error('Error fetching users:', error);  // Handle any errors
      }
    );
  }

  displayRoleChangeDialog: boolean = false;  // Controls dialog visibility
  selectedUser: any;  // The user whose role we want to change
  selectedRole: string = '';  // The role the user selects
  availableRoles: string[] = ['Admin', 'User', 'Manager','Delivery Boy'];  // Array of strings (roles)

  openRoleChangePopup(user: any) {
    this.selectedUser = user;  // Set the user whose role is being changed
    this.selectedRole = user.userRole;  // Optionally, set the role to the current role
    this.displayRoleChangeDialog = true;  // Open the dialog
  }

  submitRoleChange() {
    if (this.selectedUser && this.selectedRole) {
    
      this.displayRoleChangeDialog = false;  // Close the dialog
      this.credentialsService.updateRole(this.selectedUser.userId, this.selectedRole).subscribe(
        (response: any) => {
          if (response.message) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message + "for "+this.selectedUser.userName});
        }
        const updatedUserIndex = this.users.findIndex(user => user.userId === this.selectedUser.userId);
        if (updatedUserIndex !== -1) {
          this.users[updatedUserIndex].userRole = this.selectedRole; // Update the role in the users array
        }
      },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error updating role' });
        }
      );

    }
  }

  closeRoleChangeDialog() {
    this.displayRoleChangeDialog = false;  // Close the dialog
  }
  isDropdownVisible: boolean = false;  // Controls visibility of the dropdown
  currentUser: any; // Current user data to be passed

  // Toggles the visibility of the dropdown
  toggleDropdown(user: any): void {
    this.currentUser = user;
    this.isDropdownVisible = !this.isDropdownVisible;
  }
  
  shareOptions:string[]=['whatsapp','mail','pdf']
  selectedShareOption:any
  // Share via a selected platform
  shareVia(platform: string): void {
    this.isDropdownVisible = false; // Hide dropdown after selection

    // Handle sharing logic based on the platform
    switch (platform) {
      case 'whatsapp':
      //  window.open(`https://wa.me/?text=Check out this user: ${this.currentUser.userName}`, '_blank');
      this.shareToWhatsApp(this.currentUser);
        break;

      case 'mail':
        window.location.href = `mailto:?subject=Check out this user&body=Hello! Here's a user I wanted to share: ${this.currentUser.name}`;
        break;

        case 'pdf':
         this.generatePDF(this.currentUser);
       // this.generatePDFUsingHtml2Canvas(this.currentUser); //for same as in html download table
          break;
        
        case 'export':
        this.exportAllUsersPdf(this.users);
        break;

      default:
        console.log('Unknown platform');
        break;
    }
  }
  // Generate PDF for the user data
generatePDF2(user: any): void {
  const doc = new jsPDF();
  // Add title and user information
  doc.setFontSize(18);
  doc.text('User Information', 14, 20);

  // Add user details
  doc.setFontSize(12);
  doc.text(`Name: ${user.userName}`, 14, 30);
  doc.text(`Email: ${user.emailId}`, 14, 40);
  doc.text(`Role: ${user.userRole}`, 14, 50);
  doc.text(`Mobile No.: ${user.mobileNo}`, 14, 60);
  doc.text(`Address: ${user.address}`, 14, 70);
  doc.text(`City: ${user.city}`, 14, 80);
  doc.text(`State: ${user.state}`, 14, 90);
  doc.text(`Country: ${user.country}`, 14, 100);
  doc.text(`Login Date: ${user.userLoginDate }`, 14, 110);

  // Save the PDF
  doc.save(`${user.userName}.pdf`);
}

generatePDF(user: any): void {
  const doc = new jsPDF();

  // Add brand logo to the top-right corner (adjust the image dimensions and position as needed)
  const logoUrl = 'assets/Brand_Logo/mrk-1.webp';  // Path to your logo image 
  doc.addImage(logoUrl, 'PNG', 170, 1, 30, 30);  // x, y, width, height

  // Add title
  doc.setFontSize(18);
  doc.text('User Information', 15, 25);

  // Table header
  const headers = ['Field', 'Information'];
  const data = [
    ['Name', user.userName],
    ['Email', user.emailId],
    ['Role', user.userRole],
    ['Mobile No.', user.mobileNo],
    ['Address', user.address],
    ['City', user.city],
    ['State', user.state],
    ['Country', user.country],
    ['Login Date and Time ',this. formatDate(user.userLoginDate)]
  ];

  // Add the table to the PDF using autoTable
  autoTable(doc, {
    startY: 40, // Start drawing the table after the title
    head: [headers],
    body: data,
    theme: 'grid',  // Use grid style for the table
    headStyles: {
      fillColor: [22, 160, 133],  // Set header background color (optional)
      textColor: [255, 255, 255],  // Set text color for the header
      fontSize: 12,
    },
    bodyStyles: {
      fontSize: 10,  // Set font size for table content
    }
  });

  // Save the PDF
  doc.save(`${user.userName}.pdf`);
}
AllUsers:any
exportAllUsersPdf(users: User[]): void {
  const doc = new jsPDF();

  // Add brand logo to the top-right corner (adjust the image dimensions and position as needed)
  const logoUrl = 'assets/Brand_Logo/mrk-1.webp';  // Path to your logo image 
  doc.addImage(logoUrl, 'WEBP', 170, 1, 30, 30);  // x, y, width, height

  // Add title
  doc.setFontSize(18);
  doc.text('Users Information', 15, 25);

  // Table header
  const headers = ['Field', 'Information'];

  let yOffset = 40;  // Initial vertical offset after the title and logo

  // Create the table data for each user
  users.forEach((user, index) => {
    // Prepare user data for the table
    const data = [
      ['Name', user.userName],
      ['Email', user.emailId],
      ['Role', user.userRole],
      ['Mobile No.', user.mobileNo],
      ['Address', user.address],
      ['City', user.city],
      ['State', user.state],
      ['Country', user.country],
      ['Login Date and Time ',this. formatDate(user.userLoginDate)]
      
    ];

    // If not the first user, add space between tables
    if (index > 0) {
      yOffset += 10;  // Increase space between user tables
    }

    // Add the current user's data to the PDF using autoTable
    autoTable(doc, {
      startY: yOffset,  // Start drawing the table at the current Y offset
      head: [headers],
      body: data,
      theme: 'grid',  // Use grid style for the table
      headStyles: {
        fillColor: [22, 160, 133],  // Set header background color (optional)
        textColor: [255, 255, 255],  // Set text color for the header
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,  // Set font size for table content
      },
      didDrawPage: (data) => {
        // After the table is drawn, we check the bottom of the table (use data.cursor.y)
        if (data.cursor) {
          // Update the yOffset for the next table based on the current cursor position
          yOffset = data.cursor.y + 5;  // Add extra space below the table
        }
      }
    });
  });

  // Save the generated PDF file
  doc.save('Users_Information.pdf');
}

 // Function to format the date
 formatDate(date:any) {
  if (!date) return ''; // If no date, return empty string
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0'); // Pad single digit days with leading zero
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = d.getFullYear();
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
}



generatePDFUsingHtml2Canvas(user: any): void {
  const element = document.getElementById('user-table-row-' + user.userId); // Assuming you have a unique ID for each row
  if (element) {
    html2canvas(element).then((canvas) => {
      const doc = new jsPDF();
      // Convert canvas to image data (base64)
      const imgData = canvas.toDataURL('image/png');
      // Add image to PDF with adjusted dimensions
      doc.addImage(imgData, 'PNG', 10, 10, canvas.width * 0.1, canvas.height * 0.1); // Scale the image to fit the PDF page
      // Save the generated PDF
      doc.save(`${user.userName}.pdf`);
    });
  }
}

shareToWhatsApp(user: any): void {
  // Construct the message to send
  const message = `Check out this user:\n\nName:
   ${user.userName}\nEmail: ${user.emailId}\nRole: ${user.userRole}\nMobile: ${user.mobileNo}\nAddress: ${user.address}\nCity: ${user.city}\nState: ${user.state}\nCountry: ${user.country}\nLogin Date: ${user.userLoginDate}`;

  // URL encode the message to handle spaces and special characters properly
  const encodedMessage = encodeURIComponent(message);

  // Open WhatsApp with the pre-filled message
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}
}
