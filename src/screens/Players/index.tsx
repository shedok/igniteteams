import { useState, useEffect, useRef } from 'react';
import { Container, Form, HeaderList, NumberOfPlayers } from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert, FlatList, TextInput } from 'react-native';
import { Input } from '@components/Input';
import { Filter } from '@components/Filter';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { ListEmpty } from '@components/ListEmpty';
import { Highlight } from '@components/Highlight';
import { ButtonIcon } from '@components/ButtonIcon';
import { PlayerCard } from '@components/PlayerCard';
import { playerAddByGroup } from '@storage/player/playerAddByGroup';
import { playersGetByGroup } from '@storage/player/playersGetByGroup';
import { playersGetByGroupAndTeam } from '@storage/player/playersGetByGroupAndTeam';
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO';
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup';
import { groupRemoveByName } from '@storage/group/groupRemoveByName';
import { AppError } from '@utils/AppError';
import { Loading } from '@components/Loading';

type RouteParams = {
  group: string;
};

export default function Players() {
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState('Time A');
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);
  const [newPlayerName, setNewPlayerName] = useState(''); 
  const route = useRoute();
  const { group } = route.params as RouteParams;
  const newPlayNameInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  async function handleAddPlayer() {
    if(newPlayerName.trim().length === 0){
      return Alert.alert('Nova Pessoa', "Informe o nome da pessoa para adicionar.");
    }

    const newPlayer = {
      name: newPlayerName,
      team,
    }

    try {
      console.log(newPlayer);
      await playerAddByGroup(newPlayer, group);
      newPlayNameInputRef.current?.blur();
      setNewPlayerName('');
      fetchPlayersByTeam();
    } catch (error) {
      if(error instanceof AppError){
        Alert.alert("Nova pessoa", error.message)
      }else{
        console.log(error);
        Alert.alert("Nova pessoa", "Não foi possível adicionar.")
      }
    }
  }

  async function fetchPlayersByTeam() {
    try {
      setIsLoading(true);
      const playersByTeam = await playersGetByGroupAndTeam(group, team)
      setPlayers(playersByTeam);
      
    } catch (error) {
      console.log(error)
      Alert.alert("Pessoas", "Não foi possível carregar as pessoas do time.")
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePlayerRemove(playerName:string) {
    try {
      await playerRemoveByGroup(playerName, group);
      fetchPlayersByTeam();
    } catch (error) {
      console.log(error);
      Alert.alert('Remover pessoa', 'Não foi possível remover essa pessoa.');
    }
  }
  
  async function groupRemove() {
    try {
      await groupRemoveByName(group);

      navigation.navigate('groups');
    } catch (error) {
      console.log(error);
      Alert.alert('Remover turma', 'Não foi possível remover a turma.');
    }
  }

  async function handleGroupRemove() {
    Alert.alert('Remover', 'Deseja remover a turma?',
      [
        {text: 'Não', style: 'cancel'},
        {text: 'Sim', onPress: ()=> groupRemove()}
      ]
    )
  }

  useEffect(()=> {
    fetchPlayersByTeam();
  },[team])
  return (
    <Container>
      <Header showBackButton />
      <Highlight title={group} subtitle="adicione a galera e separ os times" />
      <Form>
        <Input
          inputRef={newPlayNameInputRef}
          placeholder="Nome da pessoa"
          autoCorrect={false}
          onChangeText={setNewPlayerName}
          value={newPlayerName}
          onSubmitEditing={handleAddPlayer}
          returnKeyType='done'
        />
        <ButtonIcon icon="add" onPress={handleAddPlayer}/>
      </Form>
      <HeaderList>
        <FlatList
          data={['Time A', 'Time B']}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Filter
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
        />
        <NumberOfPlayers>{players.length}</NumberOfPlayers>
      </HeaderList>
      { isLoading ? <Loading/> : 
          <FlatList
            data={players}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <PlayerCard name={item.name} onRemove={() => handlePlayerRemove(item.name)} />
            )}
            ListEmptyComponent={() => (
              <ListEmpty message="Não há pessoas nesse time" />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              { paddingBottom: 100 },
              players.length === 0 && { flex: 1 },
            ]}
          />
      }
      <Button title="Remover turma" type="SECONDARY" onPress={handleGroupRemove}/>
    </Container>
  );
}
