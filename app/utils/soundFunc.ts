export const playSound = async (sound: string) => {
    const audioObj = new Audio(sound)
    audioObj.play();
}