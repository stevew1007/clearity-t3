import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import Link from "next/link";
// import { SignInAuthorizationParams, signIn } from "next-auth/react";

// import type {
//   GetServerSidePropsContext,
//   // InferGetServerSidePropsType,
// } from "next";
// import { signIn } from "next-auth/react";
import { AddAccEveBtn } from "./_components/login-btn";
import { getServerSession } from "next-auth";
import SessionProvider from "./_components/SessionProvider";
import Navbar from "./_components/navbar";
import { authOptions } from "~/server/auth";
import { redirect } from "next/navigation";
import { TooltipProvider } from "~/components/ui/tooltip";
// import { getServerSession } from "next-auth/next";
// // import { authOptions } from "../api/auth/[...nextauth]";
// import { authOptions } from "~/server/auth";

export const metadata = {
  title: "Clearity T3",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const revalidate = 3600;

function TopNav() {
  // const session = getServerSession();
  // console.log("session::: ", session);
  // Add a top nav bar with login
  return (
    <nav className="flex items-center justify-between border-b px-4 py-2 text-xl text-black">
      <div>
        <Link href="/">Clearity</Link>
      </div>
      <div className="flex flex-row gap-4">
        <Link href="/api/auth/signin">Login</Link>
        <AddAccEveBtn />
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
}

// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   const session = await getServerSession(context.req, context.res, authOptions);

//   // If the user is already logged in, redirect.
//   // Note: Make sure not to redirect to the same page
//   // To avoid an infinite loop!
//   if (session) {
//     return { redirect: { destination: "/" } };
//   }

//   const providers = await getProviders();

//   return {
//     props: { providers: providers ?? [] },
//   };
// }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // const queryClient = new QueryClient();
  // console.log("session::: ", session);
  if (!session) {
    redirect("/api/auth/signin");
  }
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <SessionProvider session={session}>
        <TooltipProvider>
          <body className="bg-muted/40 flex min-h-screen w-full flex-col">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
              <Navbar />
              {children}
            </div>
            {/* <TopNav /> */}
          </body>
        </TooltipProvider>
      </SessionProvider>
    </html>
  );
}
