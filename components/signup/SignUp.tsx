"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoadingSpinner } from "./Loader";
import {
  query,
  addDoc,
  collection,
  onSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import db from "../../app/firebase-config/firebase";

type Props = {};

const SignUp = (props: Props) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [gameId, setGameId] = useState();

  const createPlayer = async () => {
    setLoading(true);
    const playerRef = await addDoc(collection(db, "activePlayers"), {
      name: playerName,
      status: "looking",
    });
    searchForOpponent(playerRef.id);
  };

  const searchForOpponent = (playerId) => {
    const q = query(
      collection(db, "activePlayers"),
      where("status", "==", "looking")
    );

    const unsuscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.size > 1) {
        //Pair with another player
        snapshot.docs.forEach(async (doc) => {
          if (doc.id !== playerId) {
            //Update both players to "inGame"
            await updateDoc(doc.ref, { status: "inGame", gameId: playerId });
            await updateDoc(doc(db, "activePlayers", playerId), {
              status: "inGame",
              gameId: doc.id,
            });
            setGameId(playerId);
            unsuscribe();
          }
        });
      }
    });
  };

  return (
    <div>
      <div className="text-white">
        <div className="flex justify-center items-center h-screen">
          <form className="bg-gray-800 rounded-lg p-8 shadow-lg w-96">
            <h1 className="text-3xl font-bold mb-4">Sign up</h1>
            <div className="flex flex-col gap-2">
              <h2>Player Name </h2>
              <Input
                className="text-black text-[17px] my-2 border-none outline-none"
                type="text"
                placeholder="Pick a name"
                onChange={(e) => setPlayerName(e.target.value)}
              />
              {loading ? (
                <Button
                  className="flex gap-2 items-center"
                  onClick={createPlayer}
                >
                  <span className="text-[16px]">Creating Profile </span>{" "}
                  <LoadingSpinner />
                </Button>
              ) : (
                <Button className="text-[16px]" onClick={createPlayer}>
                  {" "}
                  Create Profile{" "}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
