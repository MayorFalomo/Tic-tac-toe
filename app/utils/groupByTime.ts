import { format } from "date-fns";
import { GlobalChatType, GroupedChatters, TimeStamp } from "../types/types";
import { formatTimeToNow } from "./date";

export const groupChattersByTime = (arr: GlobalChatType[]): GroupedChatters => {
    return arr.reduce<GroupedChatters>((acc, chatters) => {
        const dateObject = convertToDate(chatters.timeStamp)
        const key = formatDateKey(dateObject);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(chatters);
        return acc;
    }, {});
}

function isFirestoreTimestamp(value: any): value is TimeStamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value
  );
}

export const convertToDate = (timestamp: TimeStamp | Date): Date => {
    return isFirestoreTimestamp(timestamp)
        ? new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
        : timestamp;
};

export const formatTime = (date: Date): string => {
    return format(date, 'hh:mm a'); // Formats time as hh:mm AM/PM
};

// Function to format the date key
const formatDateKey = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Check for recent dates
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    if (diff < oneDay) {
        return "Today";
    } else if (diff < 2 * oneDay) {
        return "Yesterday";
    } else if (diff < oneWeek) {
        return format(date, 'EEEE'); // Returns the day of the week
    } else {
        return format(date, 'MM/dd/yyyy'); // Returns the formatted date
    }
};

//Same thing as using the reduce option and grouping chats.
//I'm commenting this out and not using this due to lack of support from some older browsers
// export const groupedChats = (arr: GlobalChatType[]): Record<string, GlobalChatType[]> => {
//     const grouped = Object.groupBy(arr, chats => {
//         const dateObject = isFirestoreTimestamp(chats.timeStamp) ? new Date(chats.timeStamp?.seconds * 1000 + chats?.timeStamp?.nanoseconds / 1000000) : chats?.timeStamp;
//         return formatDateKey(dateObject);
//     });
//     return Object.fromEntries(
//         Object.entries(grouped).map(([key, value]) => [key, value ?? []])
//     ) as Record<string, GlobalChatType[]>;
// }
