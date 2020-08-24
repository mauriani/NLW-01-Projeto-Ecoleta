import Knex from "../database/connection";
import { Request, Response } from "express";

class PointsController {
  async index(request: Request, response: Response) {
    // cidade, uf, items (Query Params)

    const { city, uf, items } = request.query;

    // converter meus items em array
    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    // selecionando meus pontos

    const points = await Knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.point_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct("points.*");

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.1.148:3333/uploads/${point.image}`,
      };
    });

    return response.json(serializedPoints);
  }
  async show(request: Request, response: Response) {
    const { id } = request.params;

    /* buscando os pontos
    porque first ? Se não uso ele a minha váriavel fica como array, 
    com ele consigo apenas um point.*/
    const point = await Knex("points").where("id", id).first();

    if (!point) {
      return response.status(400).json({ message: "Point not found." });
    }

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.1.148:3333/uploads/${point.image}`,
    };
    // listar todos os ítens com esse ponto de coleta
    /** SELECT * FROM items
     * JOIN point_items on items.id = point_items.item_id
     * WHERE point_items.point_id = {id}
     */
    const items = await Knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    return response.json({ point: serializedPoint, items });
  }
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    // Se uma falhar a outra não vai executar - transaction
    const trx = await Knex.transaction();

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);

    const point_id = insertedIds[0];

    //relacionamento com a tabela de items
    const pointItems = items
      .split(",")
      .map((item: String) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx("point_items").insert(pointItems);

    // esse comit vai fazer esses inserts na base de dados
    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }
}
export default PointsController;
