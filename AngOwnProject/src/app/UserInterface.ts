export interface User {
  userId: number;
  userName: string;
  emailId: string;
  userRole: string;
  userStatus: string;
  userLoginDate: Date;  // Use Date type instead of string
  mobileNo: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  profileImage: string | null;
}
