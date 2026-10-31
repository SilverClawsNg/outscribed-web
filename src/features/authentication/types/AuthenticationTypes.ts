
export interface AuthenticationSessionResponse {
  isSuccessful: boolean
  accessToken: string | null
  verificationId: string | null
}

export interface LoginRequest { 
    username: string; 
    password: string; 
}

export interface RegisterRequest { 
    username: string; 
    password: string; 
    verificationId: string | null
}

export interface VerificationResponse { 
    verificationId: string 
}

export interface SendTokenRequest { 
    emailAddress: string; 
    type: number;
    isResend: boolean;
    captchaToken: string | null
}

export interface VerifyTokenRequest { 
    verificationId: string | null
    token: string
}

export interface PollRequest { 
    transactionId: string
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

