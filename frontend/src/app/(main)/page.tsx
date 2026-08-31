'use client'

import { IsLogin } from "./component/home/IsLogin";

export default function Home() {

  return (
    <main className="p-4 md:p-8 h-auto bg-app-bg">
      <div className="max-w-7xl mx-auto">
          <IsLogin />   
      </div>
    </main>
  );
}