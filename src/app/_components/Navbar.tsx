"use client";

import { signOut, useSession } from "next-auth/react";
import { SignInBtn } from "./login-btn";

function AuthButton() {
  const { data: session } = useSession();
  // console.log("status::: ", status);

  if (session) {
    return (
      <>
        {session?.user?.name} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  } else {
    return (
      <>
        Not signed in <br />
        <SignInBtn />
      </>
    );
  }
}

export default function Navbar() {
  return (
    <div>
      <AuthButton />
    </div>
  );
}
