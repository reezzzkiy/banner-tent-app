import React, { useState } from "react";
import { ProductList } from "./ProductList";
import { ProductTypeEnum } from "../db/db";
import { ProductForm } from "./ProductForm";
import { SaleForm } from "./SaleForm";
import './styles.css';

export const SelectProduct: React.FC = () => {
  const [filter, setFilter] = useState<ProductTypeEnum | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"add" | "sell" | null>(null);
  const [searchSize, setSearchSize] = useState("");
  const [searchDensity, setSearchDensity] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // состояние меню

  const handleShowBanners = () => { setFilter(ProductTypeEnum.Banner); setShowForm(false); setMenuOpen(false); };
  const handleShowTents = () => { setFilter(ProductTypeEnum.Tent); setShowForm(false); setMenuOpen(false); };
  const handleShowAll = () => { setFilter(null); setShowForm(false); setMenuOpen(false); };
  const handleAddProduct = () => { setMode("add"); setShowForm(true); setMenuOpen(false); };
  const handleSellProduct = () => { setMode("sell"); setShowForm(true); setMenuOpen(false); };
  const handleFormSave = () => { setShowForm(false); setMode(null); };

  return (
<div className="p-4 relative">
  {/* Десктопное меню — сверху, всегда видно */}
  <div className="menu-desktop">
    <button onClick={handleShowAll} className="button button-gray">Все продукты</button>
    <button onClick={handleShowBanners} className="button button-blue">Все баннеры</button>
    <button onClick={handleShowTents} className="button button-green">Все тенты</button>
    <button onClick={handleAddProduct} className="button button-indigo">Добавить продукт</button>
    <button onClick={handleSellProduct} className="button button-yellow">Продать продукт</button>
  </div>

  {/* Кнопка меню для мобильных */}
  <button 
    className="menu-toggle-button"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    ☰
  </button>

  {/* Мобильное боковое меню */}
  <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
    <button onClick={handleShowAll} className="button button-gray w-full">Все продукты</button>
    <button onClick={handleShowBanners} className="button button-blue w-full">Все баннеры</button>
    <button onClick={handleShowTents} className="button button-green w-full">Все тенты</button>
    <button onClick={handleAddProduct} className="button button-indigo w-full">Добавить продукт</button>
    <button onClick={handleSellProduct} className="button button-yellow w-full">Продать продукт</button>
  </div>
{/* Основное содержимое */}
{showForm && mode === "add" && (
  <div className="form-overlay">
    <ProductForm
      onSave={handleFormSave}
      onClose={() => {
        setShowForm(false);
        setMode(null);
      }}
    />
  </div>
)}
      {showForm && mode === "sell" && (
        <div className="form-overlay">
          <SaleForm
            onSave={handleFormSave}
            onClose={() =>setShowForm(false)}
          />
        </div>
      )}
      {!showForm && (
        <ProductList
          filter={filter}
          sizeFilter={searchSize}
          densityFilter={searchDensity}
        />
      )}
  {/* Затемнение при открытом мобильном меню */}
  {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}
</div>
  );
};
