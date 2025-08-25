'use client';
import { signOut } from "next-auth/react";

export function LogoutBtn(){
    return <button onClick={()=>signOut({ callbackUrl:'/login' })} className="text-sm underline">Se déconnecter</button>;
}
