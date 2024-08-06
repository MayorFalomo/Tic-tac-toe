"use client";
import React, { useEffect, useState } from "react";
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
  doc,
} from "firebase/firestore";
import { getDatabase, ref } from "firebase/database";
import { db } from "../../app/firebase-config/firebase";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setAPlayerId } from "@/lib/features/userSlice";
import { RootState } from "@/lib/store";
import Link from "next/link";

type Props = {};

const SignUp = (props: Props) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const gameId = useAppSelector((state: RootState) => state.user.playerId);
  const dispatch = useAppDispatch();
  // const rtdb = getDatabase(); //First Initialize the database

  const createPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (playerName) {
      try {
        setLoading(true); //SetThe loading spinner to be true

        //add a doc to the collection, the db called "activePlayers"
        const playerRef = await addDoc(collection(db, "activePlayers"), {
          name: playerName,
          status: "looking",
        });
        // console.log(playerName, "playerName");
        console.log(playerRef, "playerRef");

        searchForOpponent(playerRef.id);
        setLoading(false);

        //Set up for a listener that would listen for if the player disconnects
        window.addEventListener("beforeunload", async () => {
          await updateDoc(doc(db, "activePlayers", playerRef.id), {
            status: "offline",
          });
        });
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Clean up the event listener on component unmount
    return () => {
      if (gameId) {
        window.removeEventListener("beforeunload", async () => {
          await updateDoc(doc(db, "activePlayers", gameId), {
            status: "offline",
          });
        });
      }
    };
  }, [gameId]);

  const searchForOpponent = (playerId: string) => {
    //Query a collection in the db(database) and look for where fields named "status" == "looking"
    const q = query(
      collection(db, "activePlayers"),
      where("status", "==", "looking")
    );

    console.log(q, "q");

    const unsuscribe = onSnapshot(q, async (snapshot) => {
      console.log(snapshot, "snapshot should be an Id");
      if (snapshot.size > 1) {
        const opponentDoc = snapshot.docs.find((doc) => doc.id !== playerId);

        if (opponentDoc) {
          await updateDoc(opponentDoc.ref, {
            status: "inGame",
            gameId: playerId,
          });
          const currentPlayerRef = doc(db, "activePlayers", playerId);

          await updateDoc(currentPlayerRef, {
            status: "inGame",
            gameId: opponentDoc.id,
          });

          //create a game session after both players are matched
          await createGameSession(playerId, opponentDoc.id);

          dispatch(setAPlayerId(playerId));

          unsuscribe(); //Stop listening after pairing
        }
      }
    });
  };

  const createGameSession = async (playerId: string, opponentId: string) => {
    try {
      const gameSessionRef = await addDoc(collection(db, "gameSessions"), {
        player1: playerId,
        player2: opponentId,
      });
      console.log(gameSessionRef, "gameSessionRef");

      console.log(gameSessionRef.id, "Game session created with ID");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="text-white">
        <div className="flex justify-center items-center h-screen">
          <form
            onSubmit={createPlayer}
            className="bg-gray-800 rounded-lg p-8 shadow-lg w-96"
          >
            <h1 className="text-3xl font-bold mb-4">Sign up PlayerName</h1>
            <div className="flex flex-col gap-2">
              <h2>Player Name </h2>
              <Input
                className="text-black text-[17px] my-2 border-none outline-none"
                type="text"
                placeholder="Pick a name"
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <Button
                disabled={loading}
                type="submit"
                className="text-[16px] my-3"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    {" "}
                    Searching for player <LoadingSpinner />{" "}
                  </span>
                ) : (
                  "Creating Profile"
                )}{" "}
              </Button>
            </div>
            <Link href="/login" className="flex justify-center text-[14px]">
              Login instead?{" "}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
