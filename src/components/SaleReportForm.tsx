import React, { useEffect, useState } from "react";
import { db, Product, Sale } from "../db/db";
import "./styles.css";

interface ReportFormProps {
  onClose: () => void;
}

interface SaleReportItem {
  productName: string;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

export const SaleReportForm: React.FC<ReportFormProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [report, setReport] = useState<SaleReportItem[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Устанавливаем текущий месяц по умолчанию
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().slice(0, 10));
    setEndDate(lastDay.toISOString().slice(0, 10));

    const loadData = async () => {
      const allProducts = await db.products.toArray();
      const allSales = await db.sales.toArray();
      setProducts(allProducts);
      setSales(allSales);
    };
    loadData();
  }, []);

  const generateReport = () => {
    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999); // включаем весь день

    const filteredSales = sales.filter(
      (s) => s.date >= from && s.date <= to
    );

    const reportMap: Record<string, SaleReportItem> = {};

    filteredSales.forEach((s) => {
      const product = products.find((p) => p.id === s.productId);
      if (!product) return;

      if (!reportMap[product.id]) {
        reportMap[product.id] = {
          productName: `${product.type} ${product.size} ${product.density}г/м²`,
          quantitySold: 0,
          totalRevenue: 0,
          totalProfit: 0,
        };
      }

      const saleRevenue = s.quantity * product.price;
      const saleProfit = s.quantity * (product.price - (product.costPrice || 0));

      reportMap[product.id].quantitySold += s.quantity;
      reportMap[product.id].totalRevenue += saleRevenue;
      reportMap[product.id].totalProfit += saleProfit;
    });

    setReport(Object.values(reportMap));
  };

  return (
    <div
      className="mobile-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mobile-modal">
        <div className="form-header">
          <h3>Отчет по продажам</h3>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mb-2">
          <label>От:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="mb-2">
          <label>До:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>

        <button onClick={generateReport} className="button button-blue mb-4">
          Сформировать отчет
        </button>

        {report.length > 0 ? (
          <div className="table-wrapper">
            <table className="report-table mobile-friendly">
              <thead>
                <tr>
                  <th>Продукт</th>
                  <th>Количество</th>
                  <th>Выручка (₽)</th>
                  <th>Прибыль (₽)</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.productName}</td>
                    <td>{r.quantitySold}</td>
                    <td>{r.totalRevenue.toFixed(2)}</td>
                    <td>{r.totalProfit.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Итого</strong></td>
                  <td><strong>{report.reduce((sum, r) => sum + r.quantitySold, 0)}</strong></td>
                  <td><strong>{report.reduce((sum, r) => sum + r.totalRevenue, 0).toFixed(2)}</strong></td>
                  <td><strong>{report.reduce((sum, r) => sum + r.totalProfit, 0).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p>Нет данных за выбранный период</p>
        )}
      </div>
    </div>
  );
};
