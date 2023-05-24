import AsyncStorage from "@react-native-async-storage/async-storage";
import { PLAYER_COLLECTION } from "@storage/storageConfig";
import { AppError } from "@utils/AppError"; 
import {playersGetByGroup} from './playersGetByGroup';
import { PlayerStorageDTO } from './PlayerStorageDTO';

export async function playerAddByGroup(newPlayer:PlayerStorageDTO, group: string) {
  try {
    const storagePlayers = await playersGetByGroup(group);
    const playerAlreadExists = storagePlayers.filter(player => player.name === newPlayer.name)
    if(playerAlreadExists.length > 0){
      throw new AppError("Essa pessoa já está adicionada em um time.");
    }
    const storage = JSON.stringify([...storagePlayers, newPlayer]);
    await AsyncStorage.setItem(`${PLAYER_COLLECTION}-${group}`, storage)
  } catch (error) {
    throw(error)
  }
}
