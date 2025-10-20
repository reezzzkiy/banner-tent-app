import React, { useEffect, useState } from "react";
import { db, Product, deleteProduct, getAllProducts, ProductTypeEnum } from "../db/db";
import { ProductForm } from "./ProductForm";
import './styles.css';
import { Modal } from "./Modal"; // импортируем модальное окно

interface ProductListProps {
  filter?: ProductTypeEnum | null;
  sizeFilter?: string;
  densityFilter?: string;
}

export const ProductList: React.FC<ProductListProps> = ({ filter, sizeFilter, densityFilter }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Для просмотра деталей

  const loadProducts = async () => {
    let all = await getAllProducts();

    if (filter) all = all.filter(p => p.type === filter);
    if (sizeFilter) all = all.filter(p => p.size.includes(sizeFilter));
    if (densityFilter) all = all.filter(p => p.density.toLowerCase().includes(densityFilter.toLowerCase()));

    setProducts(all);
  };

  useEffect(() => { 
    loadProducts(); 
  },[filter, sizeFilter, densityFilter]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Удалить этот продукт?")) {
      await deleteProduct(id);
      loadProducts();
      setSelectedProduct(null);
    }
  };

  const handleFormSave = () => {
    setEditingProduct(null);
    setShowForm(false);
    loadProducts();
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="container">
      <h2 className="text-xl font-bold mb-4">Список товаров</h2>

     

      {showForm && (
        <div className="form-container">
          <ProductForm product={editingProduct ?? undefined} onSave={handleFormSave} onClose={() => setShowForm(false)}/>
        </div>
      )}

      <div className="product-list">
        {products.map((p) => (
          <div
            key={p.id}
            className="product-item cursor-pointer"
            onClick={() => handleSelectProduct(p)}
          >
            <div>
              <strong>({p.type})</strong> — {p.size}, {p.density} г/м² — {p.price}₽ - {p.quantity} шт
            </div>
            <div className="actions">
              <button
                onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                className="button button-blue"
              >
                Редактировать
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                className="button button-red"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-gray-500">Нет продуктов для отображения.</div>
        )}
      </div>

      {selectedProduct && (
  <Modal onClose={() => setSelectedProduct(null)}>
    <h3 className="font-bold mb-2">Детали продукта</h3>
    <p><strong>Тип:</strong> {selectedProduct.type}</p>
    <p><strong>Размер:</strong> {selectedProduct.size}</p>
    <p><strong>Плотность:</strong> {selectedProduct.density}</p>
    <p><strong>Цена:</strong> {selectedProduct.price}₽</p>
    {selectedProduct.description && <p><strong>Описание:</strong> {selectedProduct.description}</p>}
    {selectedProduct.imageBase64 && (
      <img src={selectedProduct.imageBase64} alt="Продукт" className="mt-2 w-48 h-48 object-cover border" />
    )}
  </Modal>
)}
    </div>
  );
};
