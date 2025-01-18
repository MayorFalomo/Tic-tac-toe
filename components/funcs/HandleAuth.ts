import { onDisconnect } from "firebase/database";
import { database, db,} from "@/firebase-config/firebase";
import { push, ref, set, } from "@firebase/database";
import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import { PlayerStatus } from "@/app/types/types";


export const handleUserPresence = async (userId: string, playerName: string) => {
  try {
    const userRef = ref(database, `activePlayers/${userId}`); //We reference the "activePlayers" db we created in the createPlayerfunc and find a player by their userId

    //Set the users status to online when they connect
    await set(userRef, {
      playerName: playerName ?? 'Player',
      status: PlayerStatus?.LOOKING,
    });
  
    //Using firebase onDisconnect functionality to detect when a user goes offline
  await onDisconnect(userRef).set({
    playerName: playerName,
    status: PlayerStatus?.OFFLINE,
  });
    
  } catch (error) {
    console.log(error, 'Error has occurred');
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
        status: PlayerStatus?.LOOKING,
        createdAt: new Date().toISOString(),
      });
      
      return sessionRef.key;
    } catch (error) {
      console.log(error, 'error in game session');
    }
};

export const handlePlayersStatus = async (userId: string, status?: string) => {
  try {
    const userRef = ref(database, `activePlayers/${userId}`); //We reference the "activePlayers" db we created in the createPlayerfunc and find a player by their userId

    //Set the users status to online when they connect on firestore db first
    await set(userRef, {
      status: status,
    });

    //Change on firestore
     await setDoc(doc(db, 'players', userId), {
        status: status,
      });
  
    //Using firebase onDisconnect functionality to detect when a user goes offline
  await onDisconnect(userRef).set({
    status: PlayerStatus?.OFFLINE,
  });
    
  } catch (error) {
    console.log(error, 'Error has occurred');
  }
};

export const getAllPlayers = async (): Promise<any[]> => {
  try {
    const playersRef = collection(db, 'players'); // Reference to the players collection
    const playersQuery = query(playersRef); // Create a query for the players collection
    const querySnapshot = await getDocs(playersQuery); // Get all documents in the players collection

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => doc.data()); // Map over documents to extract data
    } else {
      return []; // Return an empty array if no players are found
    }
  } catch (error) {
    console.error(error, 'Error has occurred while trying to get players');
    throw error; // Rethrow the error for handling in the calling function
  }
};