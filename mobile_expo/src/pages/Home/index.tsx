import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Feather as Icon } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Picker,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

// tipo uf
interface IBGEUFResponse {
  sigla: string;
}
// para cidade
interface IBGECityResponse {
  nome: string;
}

const Home = () => {
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectUf, setSelectUf] = useState("0");
  const [selectCity, setSelectCity] = useState("0");

  const navigation = useNavigation();

  function handleNavigateToPoints() {
    navigation.navigate("Points", {
      selectUf,
      selectCity,
    });
    console.log(selectUf);
  }
  // mostrar os UF
  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);
        setUfs(ufInitials);
      });
  }, []);
  // selecionando o municipio
  useEffect(() => {
    if (selectUf === "0") {
      return;
    }
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);
        setCities(cityNames);
      });
  }, [selectUf]);

  // function que controla o clique da minha UF
  // function que controla o clique da minha UF
  // function que controla o clique da minha UF
  function handleSelectUf(event: { target: { value: any } }) {
    const uf = event.target.value;
    console.log(uf);
    setSelectUf(uf);
  }

  // função select cidade
  function handleSelectCity(event: { target: { value: any } }) {
    const city = event.target.value;
    setSelectCity(city);
  }
  return (
    <ImageBackground
      source={require("../../assets/home-background.png")}
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require("../../assets/logo.png")}></Image>
        <View>
          <Text style={styles.title}>
            Seu marketplace de coleta de resíduos
          </Text>
          <Text style={styles.description}>
            Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Picker
            mode="dialog"
            style={styles.input}
            selectedValue={selectUf}
            onValueChange={handleSelectUf}
          >
            <Picker.Item label="Selecione a UF" />
            {ufs.map((uf, index) => (
              <Picker.Item key={index} label={uf} />
            ))}
          </Picker>
        </View>

        <View>
          <Picker
            mode="dialog"
            style={styles.input}
            selectedValue={selectCity}
            onValueChange={handleSelectCity}
          >
            <Picker.Item label="Selecione a cidade" value={"0"} />
            {cities.map((city, index) => (
              <Picker.Item key={index} label={city} value={"5"} />
            ))}
          </Picker>
        </View>

        <View>
          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#fff" size={24}></Icon>
              </Text>
            </View>
            <Text style={styles.buttonText}>Entrar</Text>
          </RectButton>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginBottom: 10,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});
export default Home;
