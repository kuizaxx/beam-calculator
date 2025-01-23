"use client";

import { useState, useMemo } from "react";
import BeamChart from "../components/BeamChart";
import Image from "next/image";

export default function SimpleBeam() {
  const [length, setLength] = useState(1); // Giá trị mặc định là 1
  const [loadValue, setLoadValue] = useState(10); // Giá trị mặc định là 10
  const [shearForceData, setShearForceData] = useState(null);
  const [bendingMomentData, setBendingMomentData] = useState(null);
  const [maxBendingMoment, setMaxBendingMoment] = useState(0);
  const [maxShearForce, setMaxShearForce] = useState(0);
  const [momentOfInertia, setMomentOfInertia] = useState(0);
  const [maxDeflection, setMaxDeflection] = useState(0);

  // State cho tiết diện, mặc định là hình chữ nhật
  const [sectionType, setSectionType] = useState("rectangle");
  const [sectionParams, setSectionParams] = useState({ b: 100, h: 200 }); // Giá trị mặc định

  // State cho vật liệu
  const [material, setMaterial] = useState("Thép"); // Giá trị mặc định là Thép
  const [elasticModulus, setElasticModulus] = useState(210000); // E mặc định cho Thép
  const [customE, setCustomE] = useState(0); // E tùy chỉnh
  const [showCustomEInput, setShowCustomEInput] = useState(false); // Ẩn/hiện ô input E tùy chỉnh

  // State cho việc hiển thị kết quả và biểu đồ
  const [showChart, setShowChart] = useState(false);

  // State cho việc chỉnh sửa
  const [editMode, setEditMode] = useState(false);

  // State cho việc submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  function calculateShearForce(length, loadValue, x) {
    const q = loadValue;
    return q * (length / 2 - x);
  }

  function calculateBendingMoment(length, loadValue, x) {
    const q = loadValue;
    return (q * x * (length - x)) / 2;
  }

  function calculateMomentOfInertia(sectionType, sectionParams) {
    let I = 0;
    switch (sectionType) {
      case "rectangle":
        I = (sectionParams.b * Math.pow(sectionParams.h, 3)) / 12;
        break;
      case "hollowRectangle":
        const b1 = sectionParams.b - 2 * sectionParams.t;
        const h1 = sectionParams.h - 2 * sectionParams.t;
        I =
          (sectionParams.b * Math.pow(sectionParams.h, 3) -
            b1 * Math.pow(h1, 3)) /
          12;
        break;
      case "circle":
        I = (Math.PI * Math.pow(sectionParams.r, 4)) / 4;
        break;
      case "hollowCircle":
        const r1 = sectionParams.r - sectionParams.t;
        I = (Math.PI * (Math.pow(sectionParams.r, 4) - Math.pow(r1, 4))) / 4;
        break;
      case "iSection":
        I =
          (sectionParams.b * Math.pow(sectionParams.h, 3)) / 12 -
          (sectionParams.b - sectionParams.tw) *
            Math.pow(sectionParams.h - 2 * sectionParams.tf, 3) /
            12;
        break;
      default:
        I = 0;
    }
    return I;
  }
  function calculateDeflection(x, length, loadValue, elasticModulus, momentOfInertia) {
    const q = loadValue; // kN/m
    const L = length;    // m
    const E = elasticModulus; // MPa (N/mm²)
    const I = momentOfInertia; // mm⁴

    return Math.pow(10, 12) * (Math.pow(L, 3) - 2 * L * Math.pow(x, 2) + Math.pow(x, 3)) * (q * x) / (24 * E * I); // Kết quả là mm
  }

  const {
    calculatedShearForceData,
    calculatedBendingMomentData,
    calculatedDeflectionData,
  } = useMemo(() => {
    const numPoints = 100;
    const xValues = [];
    const shearForceValues = [];
    const bendingMomentValues = [];
    const deflectionValues = [];

    for (let i = 0; i <= numPoints; i++) {
      const x = (length * i) / numPoints;
      xValues.push(x.toFixed(2));
      shearForceValues.push(
        calculateShearForce(length, loadValue, x).toFixed(2)
      );
      bendingMomentValues.push(
        calculateBendingMoment(length, loadValue, x).toFixed(2)
      );

      const newMomentOfInertia = calculateMomentOfInertia(
        sectionType,
        sectionParams
      );
      deflectionValues.push(calculateDeflection(x, length, loadValue, elasticModulus, newMomentOfInertia).toFixed(4));
    }

    return {
      calculatedShearForceData: {
        title: "Biểu đồ lực cắt",
        label: "Lực cắt (kN)",
        labels: xValues,
        data: shearForceValues,
      },
      calculatedBendingMomentData: {
        title: "Biểu đồ mô-men uốn",
        label: "Mô-men uốn (kN.m)",
        labels: xValues,
        data: bendingMomentValues,
      },
      calculatedDeflectionData: {
        title: "Biểu đồ độ võng",
        label: "Độ võng (mm)",
        labels: xValues,
        data: deflectionValues,
      },
    };
  }, [length, loadValue, sectionType, sectionParams, elasticModulus]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Bắt đầu submitting
    setIsSubmitting(true);

    // Parse sectionParams thành số trước khi tính toán
    const parsedSectionParams = {};
    for (const key in sectionParams) {
      parsedSectionParams[key] = parseFloat(sectionParams[key]);
    }

    // Tính toán lại các giá trị
    const newMomentOfInertia = calculateMomentOfInertia(
      sectionType,
      parsedSectionParams
    );

    // Tính độ võng lớn nhất
    const newMaxDeflection =
      (5 * loadValue * Math.pow(length, 4)) /
      (384 * elasticModulus * newMomentOfInertia * Math.pow(10, -12));

    // Cập nhật state
    setShearForceData(calculatedShearForceData);
    setBendingMomentData(calculatedBendingMomentData);
    setMaxBendingMoment(Math.max(...calculatedBendingMomentData.data));
    setMaxShearForce(Math.max(...calculatedShearForceData.data));
    setMomentOfInertia(newMomentOfInertia);
    setMaxDeflection(newMaxDeflection)

    // Hiển thị kết quả và biểu đồ, tắt chế độ chỉnh sửa
    setShowChart(true);
    setEditMode(false);

    // Kết thúc submitting sau khi đã set các state khác
    setIsSubmitting(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "length") {
      setLength(parseFloat(value));
    } else if (name === "loadValue") {
      setLoadValue(parseFloat(value));
    } else if (name === "sectionType") {
      setSectionType(value);
      // Reset sectionParams khi thay đổi loại tiết diện
      setSectionParams({});
    } else if (name === "material") {
      setMaterial(value);
      if (value === "Khác") {
        setShowCustomEInput(true);
        setElasticModulus(0); // Reset giá trị E khi chọn "Khác"
      } else {
        setShowCustomEInput(false);
        // Cập nhật E theo vật liệu
        switch (value) {
          case "Thép":
            setElasticModulus(210000);
            break;
          case "Gỗ":
            setElasticModulus(5500);
            break;
          case "Bê tông":
            setElasticModulus(27000);
            break;
          default:
            setElasticModulus(0);
        }
      }
    } else if (name === "customE") {
      setCustomE(parseFloat(value));
      setElasticModulus(parseFloat(value));
    } else {
      // Cập nhật sectionParams dựa trên loại tiết diện và tên trường
      setSectionParams((prevParams) => ({
        ...prevParams,
        [name]: value,
      }));
    }
  };

  const handleEdit = () => {
    // Bật chế độ chỉnh sửa, ẩn kết quả và biểu đồ
    setEditMode(true);
    setShowChart(false);
    // Cho phép submit lại
    setIsSubmitting(false);
  };

  return (
    <main>
      <h1>Dầm đơn giản, tải phân bố đều</h1>

      <div className="input-area">
        <div>
          <Image
            src="/images/simple-beam-diagram.png"
            alt="Sơ đồ dầm đơn giản chịu tải phân bố đều"
            width={500}
            height={300}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <div>
          <h2>Thông số dầm</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="length">Chiều dài dầm (L) (m): </label>
              <input
                type="number"
                id="length"
                name="length"
                value={length}
                onChange={handleInputChange}
                disabled={showChart && !editMode}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="loadValue">
                Giá trị tải phân bố đều (q) (kN/m):{" "}
              </label>
              <input
                type="number"
                id="loadValue"
                name="loadValue"
                value={loadValue}
                onChange={handleInputChange}
                disabled={showChart && !editMode}
                className="input-field"
              />
            </div>

            {/* Danh mục vật liệu */}
            <div>
              <label htmlFor="material">Vật liệu: </label>
              <select
                id="material"
                name="material"
                value={material}
                onChange={handleInputChange}
                disabled={showChart && !editMode}
                className="input-field"
              >
                <option value="Thép">Thép</option>
                <option value="Gỗ">Gỗ</option>
                <option value="Bê tông">Bê tông (B20)</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Hiển thị E hoặc cho phép nhập E tùy chỉnh */}
            {showCustomEInput ? (
              <div>
                <label htmlFor="customE">Mô đun đàn hồi E (MPa): </label>
                <input
                  type="number"
                  id="customE"
                  name="customE"
                  value={customE}
                  onChange={handleInputChange}
                  disabled={showChart && !editMode}
                  className="input-field"
                />
              </div>
            ) : (
              <div>
                <label>Mô đun đàn hồi E (MPa):</label>
                <input
                  type="text"
                  value={elasticModulus}
                  readOnly
                  className="input-field"
                  disabled={showChart && !editMode}
                />
              </div>
            )}

            <div>
              <label htmlFor="sectionType">Loại tiết diện:</label>
              <select
                id="sectionType"
                name="sectionType"
                value={sectionType}
                onChange={handleInputChange}
                disabled={showChart && !editMode}
                className="input-field"
              >
                <option value="rectangle">Hình chữ nhật</option>
                <option value="hollowRectangle">Hình chữ nhật rỗng</option>
                <option value="circle">Hình tròn</option>
                <option value="hollowCircle">Hình tròn rỗng</option>
                <option value="iSection">Chữ I</option>
              </select>
            </div>

            {/* Nhập thông số tiết diện */}
            {sectionType === "rectangle" && (
              <div>
                <div>
                  <label htmlFor="b">Chiều rộng b (mm):</label>
                  <input
                    type="number"
                    id="b"
                    name="b"
                    value={sectionParams.b || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label htmlFor="h">Chiều cao h (mm):</label>
                  <input
                    type="number"
                    id="h"
                    name="h"
                    value={sectionParams.h || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
              </div>
            )}

            {sectionType === "hollowRectangle" && (
              <div>
                <div>
                  <label htmlFor="b">Chiều rộng b (mm):</label>
                  <input
                    type="number"
                    id="b"
                    name="b"
                    value={sectionParams.b || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label htmlFor="h">Chiều cao h (mm):</label>
                  <input
                    type="number"
                    id="h"
                    name="h"
                    value={sectionParams.h || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label htmlFor="t">Chiều dày t (mm):</label>
                  <input
                    type="number"
                    id="t"
                    name="t"
                    value={sectionParams.t || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
              </div>
            )}

            {sectionType === "circle" && (
              <div>
                <label htmlFor="r">Bán kính r (mm):</label>
                <input
                  type="number"
                  id="r"
                  name="r"
                  value={sectionParams.r || ""}
                  onChange={handleInputChange}
                  disabled={showChart && !editMode}
                  className="input-field"
                  min="0"
                  step="0.0001"
                />
              </div>
            )}

            {sectionType === "hollowCircle" && (
              <div>
                <div>
                  <label htmlFor="r">Bán kính r (mm):</label>
                  <input
                    type="number"
                    id="r"
                    name="r"
                    value={sectionParams.r || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label htmlFor="t">Chiều dày t (mm):</label>
                  <input
                    type="number"
                    id="t"
                    name="t"
                    value={sectionParams.t || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
              </div>
            )}

            {sectionType === "iSection" && (
              <div>
                <div>
                  <label htmlFor="b">Chiều rộng b (mm):</label>
                  <input
                    type="number"
                    id="b"
                    name="b"
                    value={sectionParams.b || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label htmlFor="tf">Chiều dày cánh tf (mm):</label>
                  <input
                    type="number"
                    id="tf"
                    name="tf"
                    value={sectionParams.tf || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label htmlFor="h">Chiều cao h (mm):</label>
                  <input
                    type="number"
                    id="h"
                    name="h"
                    value={sectionParams.h || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label htmlFor="tw">Chiều dày bụng tw (mm):</label>
                  <input
                    type="number"
                    id="tw"
                    name="tw"
                    value={sectionParams.tw || ""}
                    onChange={handleInputChange}
                    disabled={showChart && !editMode}
                    className="input-field"
                    min="0"
                    step="0.0001"
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting}>
              Tính toán
            </button>

            {showChart && !editMode && (
              <button type="button" onClick={handleEdit} className="edit-button">
                Chỉnh sửa
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Khu vực hiển thị kết quả */}
      {showChart && !editMode && (
        <div className="chart-container">
          <div>
            <h2>Kết quả tính toán</h2>
            <p>
              Mô-men uốn lớn nhất (Mmax): {maxBendingMoment.toFixed(2)} kN.m
            </p>
            <p>Lực cắt lớn nhất (Vmax): {maxShearForce.toFixed(2)} kN</p>
            <p>
              Mô-men quán tính của tiết diện (I):{" "}
              {momentOfInertia.toFixed(2)} mm<sup>4</sup>
            </p>
            <p>Mô đun đàn hồi E: {elasticModulus} MPa</p>
            {/* Thêm dòng này để hiển thị độ võng */}
            <p>Độ võng lớn nhất: {maxDeflection.toFixed(2)} mm</p>
          </div>

          <div>
            <h2>Biểu đồ</h2>
            {calculatedShearForceData && (
              <BeamChart chartData={calculatedShearForceData} length={length} />
            )}
            {calculatedBendingMomentData && (
              <BeamChart
                chartData={calculatedBendingMomentData}
                length={length}
                invertYAxis={true}
              />
            )}
            {calculatedDeflectionData && (
              <BeamChart
                chartData={calculatedDeflectionData}
                length={length}
                invertYAxis={true}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}