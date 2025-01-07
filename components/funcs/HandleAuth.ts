import { onDisconnect } from "firebase/database";
import { database,} from "@/firebase-config/firebase";
import { push, ref, set, } from "@firebase/database";


export const handleUserPresence = async (userId: string, playerName: string) => {
  try {
    const userRef = ref(database, `activePlayers/${userId}`); //We reference the "activePlayers" db we created in the createPlayerfunc and find a player by their userId

    //Set the users status to online when they connect
    await set(userRef, {
      playerName: playerName,
      status: 'looking',
    });
  
    //Using firebase onDisconnect functionality to detect when a user goes offline
  await onDisconnect(userRef).set({
    playerName: playerName,
    status: 'offline',
  });
    
  } catch (error) {
    console.log(error, 'Error has happened in catch');
  }
};
  
   //Logic to create a game session
  // A function that takes in two params which are playerId and opponentId
export const createGameSession = async (playerId: string, opponentId: string, getBoolean: boolean) => {
    try {
      const sessionRef = push(ref(database, 'gameSessions')); //creates a ref to our database and name it "gameSessions"
      //Our session ref would create/set a new object in a sessionRef
      await set(sessionRef, {
        playerOneId: getBoolean ? playerId : opponentId,
        playerTwoId: getBoolean ? opponentId : playerId,
        status: 'looking',
        createdAt: new Date().toISOString(),
      });
      
      return sessionRef.key;
    } catch (error) {
      console.log(error, 'error in game session');
       
    }
};