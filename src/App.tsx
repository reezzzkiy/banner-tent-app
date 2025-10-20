import React from "react";
import { ProductList } from "./components/ProductList";
import { SelectProduct } from "./components/SelectProduct";

function App() {
  return (
    <div className="max-w-2xl mx-auto mt-4">
      <h1 className="text-2xl font-bold mb-4">Учет баннеров и тентов</h1>
      <SelectProduct />
    </div>
  );
}

export default App;