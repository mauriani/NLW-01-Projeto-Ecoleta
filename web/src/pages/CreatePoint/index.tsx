import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowDownLeft, FiThumbsDown } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import Dropzone from "../../components/Dropzone";
import api from "../../services/api";
import { LeafletMouseEvent } from "leaflet";
import logo from "../../assests/logo.svg";
import "./styles.css";

const CreatePoint = () => {
  // array ouy objeto: manualmente informar o tipo da variável
  interface Item {
    id: number;
    name: string;
    image_url: string;
  }
  // tipo uf
  interface IBGEUFResponse {
    sigla: string;
  }
  // para cidade
  interface IBGECityResponse {
    nome: string;
  }

  // mexendo com o meu estado - trabalhando com os items
  // exibir lampadas, pilhas <etc className=""></etc>
  const [items, setIems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<String[]>([]);
  const [cities, setCities] = useState<String[]>([]);

  //estados para carregar a posição real do usuário
  const [inicialPosition, setInicialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  // estado para controlar qual uf estou selecionando
  const [selectUf, setSelectUf] = useState("0");
  const [selectCity, setSelectCity] = useState("0");
  const [selectItems, setSelectItems] = useState<Number[]>([]);
  const [selectPosition, setSelectPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  // useEffect para posição inicial do user
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInicialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get("items").then((response) => {
      setIems(response.data);
    });
  });

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
  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectUf(uf);
  }

  // função select cidade
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    console.log(event.target.value);
    setSelectCity(city);
  }
  // função para posição atual do usuário
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectPosition([event.latlng.lat, event.latlng.lng]);
  }

  //amrmazenar os inputs
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    /** O formData permite que as minhas informações fiquem armazenadadas
     * se não informasse o campo o mesmo poderia substituir outros campos,
     * logo esse só altera os campos que vou mudar.
     *
     */
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  //armazenar items que o usuário selecionou
  function handleSelectItem(id: number) {
    // verifica se o usuário já selecionou aquele item
    const alreadySelected = selectItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectItems.filter((item) => item !== id);
      setSelectItems(filteredItems);
    } else {
      /**Não podemos alterar a informação dentro do estado de forma direta.
    Precisamos criar uma nova informação */
      setSelectItems([...selectItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectUf;
    const city = selectCity;
    const [latitude, longitude] = selectPosition;
    const items = selectItems;

    const data = new FormData();

    data.append("name", name);
    data.append("email", email);
    data.append("whatsapp", whatsapp);
    data.append("uf", uf);
    data.append("city", city);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("items", items.join(","));

    if (selectedFile) {
      data.append("image", selectedFile);
    }

    await api.post("points", data);
    alert("Ponto de coleta criado!");
    history.push("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowDownLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>
        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            ></input>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              ></input>
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              ></input>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={inicialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectPosition}></Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf, index) => (
                  <option key={index}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city, index) => (
                  <option key={index}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Items de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectItems.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt={item.name}></img>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
