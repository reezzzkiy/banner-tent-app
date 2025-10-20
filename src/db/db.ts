import Dexie, { Table } from "dexie";

// Тип продукта: баннер или тент
export type ProductType = "banner" | "tent";
export enum ProductTypeEnum {
  Banner = "banner",
  Tent = "tent",
}
// Интерфейс продукта
export interface Product {
  id: string;            // уникальный идентификатор
  type: ProductType;     // тип продукта
  size: string;          // размер (например "2x3 м")
  density: string;       // плотность (например "440 г/м²")
  price: number;         // стоимость
  quantity: number;      // количество проданных
  description?: string;   // описание
  imageBase64?: string;  // фото в Base64
  createdAt: Date;       // дата добавления
}

// Класс базы данных
export class BannerTentDB extends Dexie {
    products!: Table<Product>;
  sales!: Table<Sale>;

  constructor() {
    super("BannerTentDB");

    this.version(1).stores({
      products: "id, type, name, createdAt",
      sales: "id, productId, date",
    });
  }
}
export interface Sale {
  id: string;
  productId: string;
  date: Date;
  quantity: number;
}



// Экземпляр базы данных
export const db = new BannerTentDB();

// Функции для работы с базой

// Добавить продукт
export const addProduct = async (product: Product) => {
  await db.products.add(product);
};

// Обновить продукт
export const updateProduct = async (product: Product) => {
  await db.products.put(product);
};

// Получить все продукты
export const getAllProducts = async (): Promise<Product[]> => {
  return db.products.toArray();
};

// Получить продукт по id
export const getProductById = async (id: string): Promise<Product | undefined> => {
  return db.products.get(id);
};

// Удалить продукт
export const deleteProduct = async (id: string) => {
  await db.products.delete(id);
};
