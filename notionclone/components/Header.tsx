"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
  const { user } = useUser();
  return (
    <div className="flex justify-between items-center p-4 bg-white shadow-md">
      {user && (
        <Link href={"/"}>
          <h1 className="md:text-2xl md:font-bold font-semibold text-lg">
            {user?.firstName}
            {"'s"} space
          </h1>
        </Link>
      )}

      <Breadcrumbs />

      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
