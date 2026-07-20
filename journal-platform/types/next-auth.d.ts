import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      fullName: string;
      isAdmin: number;
    };
  }

  interface User {
    isAdmin: number;
    fullName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: number;
    fullName: string;
  }
}
