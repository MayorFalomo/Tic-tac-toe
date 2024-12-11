import { onDisconnect } from "firebase/database";
import { database, db } from "@/firebase-config/firebase";
import { onValue, push, ref, set, update } from "@firebase/database";
import { GameSession, PlayerDetails } from "@/app/types/types";
import { doc, getDoc, setDoc } from "firebase/firestore";


export const handleUserPresence = async (userId: string, playerName: string) => {
    const userRef = ref(database, `activePlayers/${userId}`); //We reference the "activePlayers" db we created in the createPlayerfunc and find a player by their userId
    console.log(userRef, 'userRef');
    //Set the users status to online when they connect
    set(userRef, {
      playerName: playerName,
      status: 'looking',
    });

    //Using firebase onDisconnect functionality to detect when a user goes offline
  onDisconnect(userRef).set({
    playerName: playerName,
    status: 'offline',
  });
};
  
   //Logic to create a game session
  // A function that takes in two params which are playerId and opponentId
  export const createGameSession = async (playerId: string, opponentId: string) => {
    //might return the sessionId,
    const sessionRef = push(ref(database, 'gameSessions')); //creates a ref to our database and name it "gameSessions"

    //Our session ref would create/set a new object in a sessionRef
    await set(sessionRef, {
      playerOneId: playerId,
      playerTwoId: opponentId,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    return sessionRef.key;
};