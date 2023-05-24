import AsyncStorage from "@react-native-async-storage/async-storage";

import {GRUOUP_COLLECTION,PLAYER_COLLECTION} from '@storage/storageConfig';

import {groupsGetAll} from './groupsGetAll';

export async function groupRemoveByName(groupDeleted: string) {
  try {
    const storagedGroups = await groupsGetAll();
    const groups = storagedGroups.filter(group => group !== groupDeleted);
    await AsyncStorage.setItem(GRUOUP_COLLECTION, JSON.stringify(groups));
    await AsyncStorage.removeItem(`${PLAYER_COLLECTION}-${groupDeleted}`);
  } catch (error) {
    throw error;
  }
}