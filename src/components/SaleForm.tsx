import React, { useEffect, useState } from "react";
import { db, Product, Sale } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import "./styles.css";

interface SaleFormProps {
  onSave?: () => void;
  onClose: () => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({ onSave, onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const all = await db.products.toArray();
      setProducts(all);
    };
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const productId = (form.elements.namedItem("productId") as HTMLSelectElement).value;
    const quantity = parseInt((form.elements.namedItem("quantity") as HTMLInputElement).value);
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;

    if (!productId || quantity <= 0) {
      alert("Выберите продукт и введите корректное количество");
      return;
    }

    const product = await db.products.get(productId);
    if (!product) return;

    if (product.quantity < quantity) {
      alert("Недостаточно товара для продажи");
      return;
    }

    await db.products.update(productId, { quantity: product.quantity - quantity });

    const sale: Sale = {
      id: uuidv4(),
      productId,
      quantity,
      date: new Date(date),
    };
    await db.sales.add(sale);

    alert("Продажа сохранена!");
    onSave?.();
  };

  return (
    <form onSubmit={handleSubmit} className="test">
      <div className="form-header">
        <h3>Добавить продажу</h3>
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div>
        <label>Продукт:</label>
        <select name="productId" className="input-field" required>
          <option value="">Выберите продукт</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              ({p.type}) — осталось: {p.quantity}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Дата продажи:</label>
        <input
          type="date"
          name="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label>Количество:</label>
        <input
          type="number"
          name="quantity"
          min={1}
          className="input-field"
          required
        />
      </div>

      <button type="submit" className="button button-blue">
        Сохранить продажу
      </button>
    </form>
  );
};
