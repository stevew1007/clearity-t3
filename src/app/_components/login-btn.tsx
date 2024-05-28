"use client";
import { signIn } from "next-auth/react";

export function SignInBtn() {
  return <button onClick={() => signIn("eveonline")} />;
}

export function AddAccEveBtn() {
  return (
    <button
      onClick={async () => {
        await signIn("eveonline");
      }}
    >
      Add new EVE account
    </button>
  );
}
