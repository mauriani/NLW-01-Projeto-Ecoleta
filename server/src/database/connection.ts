import Knex from "Knex";
import path from "path";

const connection = Knex({
  client: "sqlite3",
  connection: {
    // dirname retorna o diretorio
    filename: path.resolve(__dirname, "database.sqlite"),
  },
  useNullAsDefault: true,
});

export default connection;
