import { UserRole, SubscriptionTier } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            subscriptionTier: SubscriptionTier;            
        } & DefaultSession["user"];
    }

    interface User {
        role: UserRole;
        subscriptionTier: SubscriptionTier;     
    }  
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        subscriptionTier: SubscriptionTier;     
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role: UserRole;
        subscriptionTier: SubscriptionTier;
    }
}

declare module "@auth/prisma-adapter/node_modules/@auth/core/adapters" {
    interface AdapterUser {
        role: UserRole;
        subscriptionTier: SubscriptionTier;
    }
}