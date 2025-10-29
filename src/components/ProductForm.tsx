import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db, Product, ProductTypeEnum } from "../db/db";
import { v4 as uuidv4 } from "uuid";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import './styles.css';

const productSchema = z.object({
  type: z.nativeEnum(ProductTypeEnum),
  size: z.string().min(1, "Введите размер"),
  density: z.string().min(1, "Введите плотность"),
  price: z.number().min(0, "Цена не может быть отрицательной"),
  costPrice: z.number().min(0, "Цена закупки не может быть отрицательной"),
  quantity: z.number().min(0, "Количество не может быть отрицательным"),
  description: z.string().optional(),
  imageBase64: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave?: () => void;
   onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose}) => {
  const defaultValues: ProductFormData = { 
    type: product?.type === "banner" ? ProductTypeEnum.Banner : ProductTypeEnum.Tent,
    size: product?.size || "",
    density: product?.density || "", 
    price: product?.price ?? 0, 
    costPrice: product?.costPrice ?? 0,
    quantity: product?.quantity ?? 0, 
    description: product?.description || "", 
    imageBase64: product?.imageBase64, 
  };

  const { register, handleSubmit, setValue, reset, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const [imagePreview, setImagePreview] = useState<string | undefined>(product?.imageBase64);

  // Опции плотности
  const bannerDensities = ["330", "450", "450-510"];
  const tentDensities = ["100", "120", "150", "180", "270"];
  const tentSizes = [
    "2x3", "3x4", "3x5", "3x6", "3x8",
    "4x4", "4x5", "4x6", "4x8", "4x10",
    "5x6", "5x10", "6x6", "6x8", "6x10",
    "8x8", "8x10", "8x12", "10x10", "10x12", "10x15", "10x20"
  ];
  const selectedType = watch("type"); 

  useEffect(() => {
    if (product) {
      reset({
        type: product.type === "banner" ? ProductTypeEnum.Banner : ProductTypeEnum.Tent,
        size: product.size,
        density: product.density,
        price: product.price,
        quantity: product.quantity,
        description: product.description ?? "",
        imageBase64: product.imageBase64 ?? "",
      });
      setImagePreview(product.imageBase64);
    } else {
      reset(defaultValues);
      setImagePreview(undefined);
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    const newProduct: Product = {
      id: product?.id || uuidv4(),
      createdAt: product?.createdAt || new Date(),
      type: data.type as Product["type"],
      size: data.size,
      density: data.density,
      price: data.price,
      costPrice: data.costPrice,
      quantity: data.quantity,
      description: data.description,
      imageBase64: data.imageBase64,
    };

    if (product) {
      await db.products.put(newProduct);
    } else {
      await db.products.add(newProduct);
    }

    onSave?.();
  };

  const handleImageChange = async () => {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
        const newPermissions = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
        if (newPermissions.camera !== 'granted' || newPermissions.photos !== 'granted') {
          alert('Необходимо предоставить разрешения для камеры и галереи');
          return;
        }
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 800,
        height: 600,
        correctOrientation: true
      });

      if (image.dataUrl) {
        setImagePreview(image.dataUrl);
        setValue("imageBase64", image.dataUrl);
      }
    } catch (error) {
      console.log("Пользователь отменил выбор фото", error);
    }
  };

  const removeImage = () => {
    setImagePreview(undefined);
    setValue("imageBase64", "");
  };

  return ( <div className="mobile-modal-backdrop"
    
    onClick={(e) => {
      // если клик был именно по фону (а не по внутренней форме)
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}
  >
    <form onSubmit={handleSubmit(onSubmit)} className="test" >
      <div className="test">
  <div className="form-header" >
  <h3>{product ? "Редактировать продукт" : "Добавить продукт"}</h3>
  <button
    type="button"
    className="close-button"
    onClick={()=>{onClose?.()
      console.log(1)
    }}  // ← это должно быть именно так
  >
    ×
  </button>
</div>
      <div>
        <label>Тип:</label>
        <select {...register("type")} className="input-field">
          <option value={ProductTypeEnum.Banner}>Баннер</option>
          <option value={ProductTypeEnum.Tent}>Тент</option>
        </select>
      </div>

      <div>
  <label>Размер:</label>
  {selectedType === ProductTypeEnum.Tent ? (
    <select {...register("size")} className="input-field" defaultValue={product?.size || ""}>
      <option value="">Выберите размер</option>
      {tentSizes.map(size => (
        <option key={size} value={size}>{size}</option>
      ))}
    </select>
  ) : (
    <input
      {...register("size", {
        required: "Введите размер",
        validate: (value) => {
          if (!/^\d+x\d+$/.test(value)) return "Размер должен быть в формате NxN";
          return true;
        },
      })}
      className="input-field"
      placeholder="например 15x5"
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
        setValue("size", val);
      }}
    />
  )}
</div>

      <div>
        <label>Плотность:</label>
        <select {...register("density")} className="input-field" defaultValue={product?.density || ""}>
          <option value="">Выберите плотность</option>
          {(selectedType === ProductTypeEnum.Banner ? bannerDensities : tentDensities).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div>
  <label>Цена:</label>
  <input
    type="number"
    {...register("price", { valueAsNumber: true })}
    className="input-field"
    onFocus={(e) => {
      if (e.target.value === "0") e.target.value = "";
    }}
  />
</div>
 <div>
  <label>Цена закупки:</label>
  <input
    type="number"
    {...register("costPrice", { valueAsNumber: true })}
    className="input-field"
    onFocus={(e) => {
      if (e.target.value === "0") e.target.value = "";
    }}
  />
</div>

<div>
  <label>Количество:</label>
  <input
    type="number"
    {...register("quantity", { valueAsNumber: true })}
    className="input-field"
    onFocus={(e) => {
      if (e.target.value === "0") e.target.value = "";
    }}
  />
</div>

      <div>
        <label>Описание:</label>
        <textarea {...register("description")} className="input-field" />
      </div>

      <div>
        <label>Фото:</label>
        <button type="button" className="button button-indigo" onClick={handleImageChange}>
          Выбрать фото
        </button>
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button type="button" className="button button-red mt-2" onClick={removeImage}>
              Удалить фото
            </button>
          </div>
        )}
      </div>

      <button type="submit" className="button button-blue">Сохранить</button>
      </div>
    </form>
    </div>
  );
};
