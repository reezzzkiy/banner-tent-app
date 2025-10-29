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

export const ProductList: React.FC<ProductListProps> = ({ filter }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Состояние для поиска
  const [searchSize, setSearchSize] = useState("");
  const [searchDensity, setSearchDensity] = useState("");

  const [addingProduct, setAddingProduct] = useState<Product | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(0);

  const handleAddQuantity = async () => {
  if (!addingProduct) return;

  const newQuantity = addingProduct.quantity + addQuantity;

  // Обновляем продукт в базе
  await db.products.update(addingProduct.id, { quantity: newQuantity });

  setAddingProduct(null);
  setAddQuantity(0);
  loadProducts();
};
const loadProducts = async () => {
  let all = await getAllProducts();

  if (filter) all = all.filter(p => p.type === filter);

  if (searchSize) {
    const match = searchSize.match(/^(\d+)x(\d+)$/);
    if (match) {
      const searchW = parseInt(match[1], 10);
      const searchH = parseInt(match[2], 10);

      all = all.filter(p => {
        const m = p.size.match(/^(\d+)x(\d+)$/);
        if (!m) return false;
        const w = parseInt(m[1], 10);
        const h = parseInt(m[2], 10);

        return Math.abs(w - searchW) <= 2 && Math.abs(h - searchH) <= 2;
      });
    } else {
      // если формат некорректный, не фильтруем
    }
  }

  if (searchDensity)
    all = all.filter(p => p.density.toLowerCase().includes(searchDensity.toLowerCase()));

  all.sort((a, b) => parseFloat(a.density) - parseFloat(b.density));

  setProducts(all);
};

  // Подгружаем продукты при изменении фильтров
  useEffect(() => {
    loadProducts();
  }, [filter, searchSize, searchDensity]);

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
const handleOpenAddQuantity = (p: Product) => {
  setAddingProduct(p);
  setOpenMenuId(null); // сбрасываем popup
};
useEffect(() => {
  const handleClickOutside = () => setOpenMenuId(null);
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);
  return (
    <div className="container">
      <h2 className="text-xl font-bold mb-4">Список товаров</h2>

      {/* Поля поиска сверху */}
      <div className="search-fields mb-4 flex flex-wrap gap-2">
<input
  type="text"
  placeholder="например 15x52"
  className="input-field"
  value={searchSize}
  onChange={(e) => {
    let val = e.target.value.replace(/\D/g, ""); // 1. Оставляем только цифры
    
    if (val.length === 2) {
      // 2 цифры (например, "34"): делим после ПЕРВОЙ цифры -> "3x4"
      const firstPart = val.substring(0, 1); 
      const secondPart = val.substring(1); 
      val = `${firstPart}x${secondPart}`;
      
    } else if (val.length === 3) {
      // 3 цифры (например, "515"): делим после ПЕРВОЙ цифры -> "5x15"
      const firstPart = val.substring(0, 1); 
      const secondPart = val.substring(1); 
      val = `${firstPart}x${secondPart}`;
      
    } else if (val.length >= 4) {
      // 4 и более цифр (например, "1020"): делим после ВТОРОЙ цифры -> "10x20"
      const firstPart = val.substring(0, 2); 
      const secondPart = val.substring(2); 
      val = `${firstPart}x${secondPart}`;
    }
    // Если val.length < 2, то 'val' остается без изменений (например, "3" -> "3")

    setSearchSize(val);
  }}
/>
        <input
          type="text"
          placeholder="Поиск по плотности"
          value={searchDensity}
          onChange={(e) => setSearchDensity(e.target.value)}
          className="input-field"
        />
      </div>

      {showForm && (
        <div className="form-container">
          <ProductForm product={editingProduct ?? undefined} onSave={handleFormSave} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Список продуктов */}
      <div className="product-list">
        {products.map((p) => (
          <div
            key={p.id}
            className="product-item cursor-pointer"
            onClick={() => handleSelectProduct(p)}
          >
            <div className="product-info">
              <strong>({p.type})</strong> — {p.size}, {p.density} г/м² — {p.price}₽ - {p.quantity} шт
            </div>

            {/* Десктоп */}
            <div className="actions-desktop">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="button button-blue">Редактировать</button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="button button-red">Удалить</button>
              <button onClick={(e) => { e.stopPropagation(); setAddingProduct(p); }} className="button button-green">Добавить товар</button>
            </div>

            {/* Мобильная кнопка ... */}
            <div className="actions-mobile">
              <button className="ellipsis-button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }}>…</button>
              {openMenuId === p.id && (
                <div className="actions-popup">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(p); setOpenMenuId(null); }} className="button button-blue">Редактировать</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); setOpenMenuId(null); }} className="button button-red">Удалить</button>
                  <button onClick={(e) => { e.stopPropagation(); setAddingProduct(p); setOpenMenuId(null); }} className="button button-green">Добавить</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-gray-500">Нет продуктов для отображения.</div>}
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
      {addingProduct && (
  <Modal  onClose={() => setAddingProduct(null)}>
    <h3 className="font-bold mb-2">Добавить товар: {addingProduct.size}-{addingProduct.density} г/м²</h3>
    <input
      type="number"
      min={1}
      value={addQuantity}
      onChange={(e) => setAddQuantity(parseInt(e.target.value))}
      className="input-field mb-2"
      placeholder="Сколько прибавить?"
      onFocus={(e) => {
      if (e.target.value === "0") e.target.value = "";
    }}
    />
    <button onClick={handleAddQuantity} className="button button-blue mr-2">Сохранить</button>
    <button onClick={() => setAddingProduct(null)} className="button button-gray">Отмена</button>
  </Modal>
)}
    </div>
  );
};
