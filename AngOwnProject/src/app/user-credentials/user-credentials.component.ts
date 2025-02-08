import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { emailAtSymbolValidator, emailDomainValidator } from '../Validations/email-validation';
import { HttpClient } from '@angular/common/http';
import { CredentailsService } from '../API-Services/credentails.service';
import { Router } from '@angular/router';
import { ProgressBar } from 'primeng/progressbar';
import { ProgressSpinner } from 'primeng/progressspinner';
@Component({
  selector: 'app-user-credentials',
  templateUrl: './user-credentials.component.html',
  styleUrls: ['./user-credentials.component.css']
})
export class UserCredentialsComponent implements OnInit {
  userForm: FormGroup;
  loginForm:FormGroup;
  forgotEmail:FormGroup;
  forgotPassword:FormGroup

  isLoginMode: boolean = true;
  isForgotPasswordMode: boolean = false;
  isResetPasswordMode = false
  constructor(private fb: FormBuilder,private http: HttpClient,  private router: Router,
              private messageService: MessageService,private credentailsService: CredentailsService) {

    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email,emailAtSymbolValidator(), emailDomainValidator(['gmail.com', 'yahoo.com'])]],
      userPassword: ['', [Validators.required, Validators.minLength(5)]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      country: ['', Validators.required],
      profileImage: [null]
    });

    this.loginForm = this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required]]
    });

    this.forgotEmail=this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
    })
    this.forgotPassword=this.fb.group({
      userPassword: ['', [Validators.required, Validators.minLength(5)]],
    })
  }

  ngOnInit(): void {}
  onSubmit() {
    if (this.userForm.valid) {
      const formData = new FormData();
      formData.append('userName', this.userForm.get('userName')!.value);
      formData.append('emailId', this.userForm.get('emailId')!.value);
      formData.append('userPassword', this.userForm.get('userPassword')!.value);
      formData.append('mobileNo', this.userForm.get('mobileNo')!.value);
      formData.append('address', this.userForm.get('address')!.value);
      formData.append('city', this.userForm.get('city')!.value);
      formData.append('state', this.userForm.get('state')!.value);
      formData.append('pinCode', this.userForm.get('pinCode')!.value);
      formData.append('country', this.userForm.get('country')!.value);
      
      // Correctly append the file
      const fileInput = this.userForm.get('profileImage')!.value;
      if (fileInput && fileInput.files.length > 0) {
          formData.append('profileImage', fileInput.files[0]); // Append the actual file
      }
      
      this.credentailsService.signIn(formData).subscribe(
        (response: any) => {         
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User  created successfully!' });
          this.isLoginMode = !this.isLoginMode; 
          this.router.navigate(['home']);
        },
        (error: any) => {
           
          if (error.status === 409) { // Assuming 409 Conflict for user already exists
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User Email already exists!' });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while creating the user.' });
          }
        }
      );
    } else {
      console.error('Form is invalid');
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill out all required fields.' });
    }
  }
  isSubmitting = false;
  
  onLoginSubmit() {
    if (this.loginForm.valid) {
     this. isSubmitting = true;
        const emailId = this.loginForm.get('emailId')!.value;
        const userPassword = this.loginForm.get('userPassword')!.value;
        const loginRequest = { emailId, userPassword };

        this.credentailsService.login(loginRequest).subscribe(
            (response: any) => {
                if (response.message) {
                       this.credentailsService.setLoggedIn(true);
                       
                      //  const userId = response.userId;
                      //  sessionStorage.setItem('userId', userId);
                    
                       this.router.navigate(['home']);
                     
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                    
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Login failed!' });
                }
            },
            (error: any) => {
                if (error.status === 401 || error.status === 409) {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid email or password' });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred' });
                }
            }
        );
    }
}

  
  

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userForm.patchValue({
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }
  toggleForm() {
    this.isLoginMode = !this.isLoginMode; // Toggle the form mode
    this.isForgotPasswordMode = false; // Reset forgot password mode when toggling forms
  }

  toggleForgotPassword() {
    this.isForgotPasswordMode = !this.isForgotPasswordMode; // Toggle forgot password mode
    this.isLoginMode = false; // Ensure we are not in login mode
  }

  onForgotPassword() {
    if (this.forgotEmail.valid) {
      const email = this.forgotEmail.get('emailId')?.value;
      this.credentailsService.checkEmail(email).subscribe(
        (exists) => {
          if (exists) {
            this.isForgotPasswordMode = false;
            this.isResetPasswordMode = true;
            this.isLoginMode = true;
           // this.onResetPassword();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail:'Email not found'});
          }
        },
        (error) => {
          if (error.status === 404 || error.status === 409) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail:'Email not found'});
          } else if (error.status === 500) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail:'An error occurred while checking the email. Please try again later.'});
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail:'Unexpected error occurred. Please try again.'});
          }
        }
      );
    }
  }
       

  onResetPassword() {
    const userPassword = this.forgotPassword.get('userPassword')?.value;
    const emailId = this.forgotEmail.get('emailId')?.value;
    const resetEmPsd = { emailId, userPassword };
    this.isLoginMode = true;
    this.credentailsService.resetPassword(resetEmPsd).subscribe(
      (response) => {
        if (response.message) {
         
          this.credentailsService.setLoggedIn(true);           
          // this.router.navigate(['home']);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
            setTimeout(() => {
              this.router.navigate(['home']);
              // window.location.reload();
            }, 3000);  // 3000ms = 3 seconds
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Login failed!' });
        }
      },
      (error: any) => {
        if (error.status === 401 || error.status === 409) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid email or password' });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred' });
        }
    }
    );
  }

 
  
  


  value: number = 50;

  increaseProgress() {
    if (this.value < 100) {
      this.value += 10;  // Increase progress by 10%
    }
  }
  
  
}
