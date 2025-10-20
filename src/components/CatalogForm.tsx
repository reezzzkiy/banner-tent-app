import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db, Product, ProductTypeEnum } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import './styles.css';

// Схема валидации для справочника
const catalogSchema = z.object({
  type: z.nativeEnum(ProductTypeEnum),
  size: z.string().min(1, "Введите размер"),
  density: z.string().min(1, "Введите плотность"),
  price: z.number().min(0, "Цена не может быть отрицательной"),
  description: z.string().optional(),
  imageBase64: z.string().optional(),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

export const CatalogForm: React.FC<{ onSave?: () => void }> = ({ onSave }) => {
  const { register, handleSubmit, setValue } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      type: ProductTypeEnum.Banner,
      price: 0,
    },
  });

  const [imagePreview, setImagePreview] = useState<string | undefined>();

  const onSubmit = async (data: CatalogFormData) => {
    const newProduct: Product = {
      id: uuidv4(),
      createdAt: new Date(),
      type: data.type as Product["type"],
      size: data.size,
      density: data.density,
      price: data.price,
      quantity: 0, // для справочника количество всегда 0
      description: data.description,
      imageBase64: data.imageBase64,
    };

    await db.products.add(newProduct);
    alert("Продукт добавлен в справочник!");
    onSave?.();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setValue("imageBase64", base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded-md space-y-4">
      <div>
        <label>Тип:</label>
        <select {...register("type")} className="border p-1 rounded">
          <option value={ProductTypeEnum.Banner}>Баннер</option>
          <option value={ProductTypeEnum.Tent}>Тент</option>
        </select>
      </div>

      <div>
        <label>Размер:</label>
        <input {...register("size")} className="border p-1 rounded w-full" />
      </div>

      <div>
        <label>Плотность:</label>
        <input {...register("density")} className="border p-1 rounded w-full" />
      </div>

      <div>
        <label>Цена:</label>
        <input type="number" {...register("price", { valueAsNumber: true })} className="border p-1 rounded w-full" />
      </div>

      <div>
        <label>Описание:</label>
        <textarea {...register("description")} className="border p-1 rounded w-full" />
      </div>

      <div>
        <label>Фото:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover border" />}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Добавить в справочник
      </button>
    </form>
  );
};
