import { onDisconnect, update } from "firebase/database";
import { database, db,} from "@/firebase-config/firebase";
import { push, ref, set, } from "@firebase/database";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import { firebaseCollections, GameSession, PlayerDetails, PlayerStatus } from "@/app/types/types";
import emailjs from '@emailjs/browser';
import { useAppDispatch } from "@/lib/hooks";
import { givePlayerNames } from "@/lib/features/PlayerSlice";
import { setCombinedGameSessionId, setPlayersSessionId } from "@/lib/features/TrackerSlice";


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
      
      console.log(sessionRef.key, 'sessionRef key');
      
      return sessionRef.key;
    } catch (error) {
      console.log(error, 'error in game session');
    }
};

export const handlePlayersStatus = async (userId: string, status?: string) => {
  if (userId!) {
    try {
      const userRef = ref(database, `activePlayers/${userId}`); //We reference the "activePlayers" db we created in the createPlayerfunc and find a player by their userId
  
      //Set the users status to online when they connect on firestore db first
      await update(userRef, {
        status: status,
      });
  
      //Change on firestore
       await updateDoc(doc(db, 'players', userId), {
          status: status,
        });
    
      //Using firebase onDisconnect functionality to detect when a user goes offline
    await onDisconnect(userRef).set({
      status: PlayerStatus?.OFFLINE,
    });
      
    } catch (error) {
      console.log(error, 'Error has occurred');
    }
  }
};

export const getAllPlayers = async (): Promise<any[]> => {
  try {
    const playersRef = collection(db, 'players'); // Reference to the players collection
    const playersQuery = query(playersRef); // Create a query for the players collection
    const querySnapshot = await getDocs(playersQuery); // Get all documents in the players collection
    console.log(querySnapshot, 'querySnapshot');
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id // Include the document ID
      })); // Map over documents to extract data with ID
    } else {
      return []; // Return an empty array if no players are found
    }
  } catch (error) {
    console.error(error, 'Error has occurred while trying to get players');
    throw error; // Rethrow the error for handling in the calling function
  }
};

export const sendEmail = async (playerName: string) => {
  if (playerName) {
    await emailjs
      .send(
        `${process.env.NEXT_PUBLIC_SERVICE_ID}`,
        `${process.env.NEXT_PUBLIC_TEMPLATE_ID}`,
        {
          to_name: 'Falomo Mayowa, source: TicTacToe Searching',
          from_name: playerName,
          message: `Request For an Opponent from ${playerName}
          `,
        }
      )
  }
}
