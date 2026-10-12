
export interface AuthenticationSessionResponse {
  isSuccessful: boolean
  accessToken: string | null
  verificationId: string | null
}

export interface LoginRequest { 
    username: string; 
    password: string; 
}

export interface ReserveResponse { 
    verificationId: string 
}

export interface SendTokenRequest { 
    emailAddress: string; 
    verificationId: string | null; 
    type: number;
    isResend: boolean;
}

export interface SendTokenWithCaptchaRequest { 
    emailAddress: string; 
    type: number;
    isResend: boolean;
    CaptchaToken: string | null
}

export interface LogoutRequest { 
    closeAll: boolean; 
    flushCache: boolean; 
    type: number;
}

export interface ChangePasswordRequest { 
    oldPassword: string; 
    newPassword: string; 
}

export interface ResetPasswordRequest { 
    emailAddress: string; 
    token: string;
    password: string; 
}

