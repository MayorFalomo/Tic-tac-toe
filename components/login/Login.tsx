"use client";
import React, { useState } from "react";
import { LoadingSpinner } from "@/components/signup/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Props = {};

const Login = (props: Props) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const loginPlayer = () => {};
  return (
    <div>
      <div className="text-white">
        <div className="flex justify-center items-center h-screen">
          <form
            onSubmit={loginPlayer}
            className="bg-gray-800 rounded-lg p-8 shadow-lg w-96"
          >
            <h1 className="text-3xl font-bold mb-4">Login to your account</h1>
            <div className="flex flex-col gap-2">
              <h2>Player Name </h2>
              <Input
                className="text-black text-[17px] my-2 border-none outline-none"
                type="text"
                placeholder="Pick a name"
                onChange={(e) => setPlayerName(e.target.value)}
              />
              {loading ? (
                <Button className="flex gap-2 items-center my-3">
                  <span className="text-[16px]">Creating Profile </span>{" "}
                  <LoadingSpinner />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="text-[16px] my-3"
                  // onClick={createPlayer}
                >
                  {" "}
                  Create Profile{" "}
                </Button>
              )}
            </div>
            <Link href="/signup" className="flex justify-center text-[14px]">
              signup instead?{" "}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
