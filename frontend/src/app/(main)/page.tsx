'use client'

import { useAuth } from "../hooks/useAuth";
import { NotLogin } from "./component/home/NotLogin";
import { IsLogin } from "./component/home/IsLogin";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <main className="p-10 h-full">
      {isLoading ? (
        <></>  
      ) : user ? (
        <IsLogin />
      ) : (
        <NotLogin />
      )}
    </main>
  );
}

