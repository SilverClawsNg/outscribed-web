
// Requests
export interface SendTokenRequest { 
    emailAddress: string; 
    verificationId: string; 
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
export interface ReserveResponse { 
    verificationId: string 
}

export interface CheckUsernameResponse { 
    isTaken: boolean 
}

export interface LoginRequest { 
    username: string; 
    password: string; 
}

export interface ReserveRequest { 
    username: string; 
    password: string; 
    captchaToken: string;
}


export interface VerifyRequest { 
    username: string; 
    password: string; 
    verificationId: string;
}

export interface RegisterRequest { 
    username: string; 
    password: string; 
    verificationId: string;
    captchaToken: string;
}

export interface LogoutRequest { 
    closeAll: boolean; 
    flushCache: boolean; 
    type: number;
}
 // 🎯 Contract for the specific identity wrapper returned by these endpoints
export interface AuthEnvelopeResponse {
  isSuccessful: boolean
  accessToken: string | null
  verificationId: string | null
}
