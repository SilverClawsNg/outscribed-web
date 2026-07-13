
// Requests
export interface SendTokenRequest { 
    emailAddress: string; 
    captchaToken: string; 
    type: number 
}

export interface VerifyTokenRequest { 
    verificationId: string; 
    token: string; 
    type: number 
}

export interface ResetPasswordRequest { 
    verificationId: string; 
    password: string; 
    confirm: boolean 
}

// Responses
export interface SendTokenResponse { 
    verificationId: string 
}

export interface CheckUsernameResponse { 
    isAvailable: boolean 
}

export interface LoginRequest { 
    username: string; 
    password: string; 
}
