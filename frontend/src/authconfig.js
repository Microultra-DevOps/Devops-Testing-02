export const msalConfig = {
    auth: {
      clientId: 'cec10081-d857-4e10-a58e-96379acd977', 
      authority: 'https://login.microsoftonline.com/534253fc-dfb6-462f-b5ca-cbe81939f5ee',
      redirectUri: 'http://localhost:5173',

    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  };
  
  export const loginRequest = {
    scopes: ['user.read'],
  };
  