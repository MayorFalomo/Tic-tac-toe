import { onDisconnect } from "firebase/database";
import { database,} from "@/firebase-config/firebase";
import { push, ref, set, } from "@firebase/database";


export const handleUserPresence = async (userId: string, playerName: string) => {
    const userRef = ref(database, `activePlayers/${userId}`); //We reference the "activePlayers" db we created in the createPlayerfunc and find a player by their userId
    console.log(userRef, 'userRef');
    //Set the users status to online when they connect
    set(userRef, {
      playerName: playerName,
      status: 'looking',
    });

  console.log('ran past here');
  
    //Using firebase onDisconnect functionality to detect when a user goes offline
  onDisconnect(userRef).set({
    playerName: playerName,
    status: 'offline',
  });
  console.log('ran past disconnect');
  
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