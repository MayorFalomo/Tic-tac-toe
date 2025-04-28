import { formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns';
import { TimeStamp } from '../types/types';
 import { format, isToday, isYesterday } from 'date-fns';
import { Timestamp as TimeStampType } from 'firebase/firestore';


// interface FirebaseTimestamp {
//   toDate: () => Date;
// }

export function formatTimeToNow(date: Date | TimeStamp): string {
  const dateObject = isFirestoreTimestamp(date)
    ? new Date(date.seconds * 1000 + date.nanoseconds / 1000000)
    : date;

  return dateFnsFormatDistanceToNow(dateObject, { addSuffix: true });
}

function isFirestoreTimestamp(value: any): value is TimeStamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value
  );
}

 export function formatDateToDMY(isoDate: string) {
    const date = new Date(isoDate);

    //I Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if necessary
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    //Then Return the formatted date
    return `${day}/${month}/${year}`;
  }

 

export const formatTimestamp = (firebaseTimestamp: TimeStampType): string => {
  // Convert Firebase Timestamp to JavaScript Date object
  const date = firebaseTimestamp.toDate();

  // Check if the date is today or yesterday
  if (isToday(date)) {
    return format(date, 'HH:mm'); // Format as HH:mm for today's messages
  } else if (isYesterday(date)) {
    return 'Yesterday'; // Return 'Yesterday' for yesterday's messages
  } else {
    return format(date, 'EEEE'); // Format as day of the week for older messages
  }
};