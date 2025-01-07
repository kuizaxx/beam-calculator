"use client";

import { useState, useMemo, useEffect } from "react";
import BeamChart from "../components/BeamChart";
import Image from "next/image";

export default function SimpleBeam() {
  const [length, setLength] = useState(0);
  const [loadValue, setLoadValue] = useState(0);
  const [material, setMaterial] = useState("Thép");
  const [elasticModulus, setElasticModulus] = useState(210000); // E cho Thép
  const [customE, setCustomE] = useState(0); // E tùy chỉnh
  const [showCustomEInput, setShowCustomEInput] = useState(false); // Hiển thị ô input E tùy chỉnh
  const [shearForceData, setShearForceData] = useState(null);
  const [bendingMomentData, setBendingMomentData] = useState(null);
  const [errorL, setErrorL] = useState("");
  const [errorQ, setErrorQ] = useState("");
  const [errorE, setErrorE] = useState(""); // Thêm error E
  const [showChart, setShowChart] = useState(false);

  // State cho tiết diện
  const [sectionType, setSectionType] = useState("rectangle"); // Mặc định là hình chữ nhật
  const [sectionParams, setSectionParams] = useState({}); // Lưu trữ các thông số kích thước
  const [sectionError, setSectionError] = useState("");

  // State cho kết quả tính toán
  const [maxBendingMoment, setMaxBendingMoment] = useState(0);
  const [maxShearForce, setMaxShearForce] = useState(0);
  const [momentOfInertia, setMomentOfInertia] = useState(0);

  // Hàm để lấy giá trị E dựa trên vật liệu
  const getElasticModulus = (selectedMaterial) => {
    switch (selectedMaterial) {
      case "Thép":
        return 210000; // MPa
      case "Gỗ":
        return 5500; // MPa
      case "Bê tông":
        return 27000; // MPa
      default:
        return 0;
    }
  };

 // Xử lý thay đổi form
 const handleInputChange = () => {
    const newLength = parseFloat(document.getElementById("length")?.value || "0");
    const newLoadValue = parseFloat(document.getElementById("loadValue")?.value || "0");
    const newMaterial = document.getElementById("material")?.value || "Thép";
    const newCustomE = parseFloat(document.getElementById("customE")?.value || "0");
    const newSectionType = document.getElementById("sectionType")?.value;

    setLength(newLength);
    setLoadValue(newLoadValue);
    setMaterial(newMaterial);
    setSectionType(newSectionType);
    setSectionParams({}); // Reset thông số tiết diện khi thay đổi loại
    setSectionError(""); // Reset lỗi

    if (newMaterial === "Khác") {
      setShowCustomEInput(true);
      setElasticModulus(newCustomE);
      if (newCustomE <= 0) {
        setErrorE("Giá trị E phải lớn hơn 0 (MPa).");
      } else {
        setErrorE("");
      }
    } else {
      setShowCustomEInput(false);
      setElasticModulus(getElasticModulus(newMaterial));
      setErrorE("");
    }

    if (newLength <= 0) {
      setErrorL("Chiều dài dầm phải lớn hơn 0 (m).");
    } else {
      setErrorL("");
    }

    if (newLoadValue === 0) {
      setErrorQ("Giá trị tải trọng phải khác 0 (kN/m).");
    } else {
      setErrorQ("");
    }

    // Lấy và validate thông số tiết diện
    const newSectionParams = getSectionParams(newSectionType);
    setSectionParams(newSectionParams);
    validateSectionParams(newSectionType, newSectionParams);

    // Chỉ ẩn biểu đồ khi giá trị không hợp lệ
    if (newLength <= 0 || newLoadValue === 0 || (newMaterial === "Khác" && newCustomE <= 0) || errorE !== "" || sectionError !== "") {
      setShowChart(false);
    }
  };

  // Lấy thông số tiết diện từ form
  const getSectionParams = (sectionType) => {
    let params = {};
    switch (sectionType) {
      case "rectangle":
        params = {
          b: parseFloat(document.getElementById("rectWidth")?.value || "0"),
          h: parseFloat(document.getElementById("rectHeight")?.value || "0"),
        };
        break;
      case "hollowRectangle":
        params = {
          b: parseFloat(document.getElementById("hollowRectWidth")?.value || "0"),
          h: parseFloat(document.getElementById("hollowRectHeight")?.value || "0"),
          t: parseFloat(document.getElementById("hollowRectThickness")?.value || "0"),
        };
        break;
      case "circle":
        params = {
          r: parseFloat(document.getElementById("circleRadius")?.value || "0"),
        };
        break;
      case "hollowCircle":
        params = {
          r: parseFloat(document.getElementById("hollowCircleRadius")?.value || "0"),
          t: parseFloat(document.getElementById("hollowCircleThickness")?.value || "0"),
        };
        break;
      case "iSection":
        params = {
          b: parseFloat(document.getElementById("iSectionWidth")?.value || "0"),
          tf: parseFloat(document.getElementById("iSectionFlangeThickness")?.value || "0"),
          h: parseFloat(document.getElementById("iSectionHeight")?.value || "0"),
          tw: parseFloat(document.getElementById("iSectionWebThickness")?.value || "0"),
        };
        break;
      default:
        break;
    }
    return params;
  };

  // Hàm validate thông số tiết diện
  const validateSectionParams = (type, params) => {
    let error = "";

    switch (type) {
      case "rectangle":
        if (!params.b || params.b <= 0) {
          error = "Chiều rộng (b) phải lớn hơn 0.";
        } else if (!params.h || params.h <= 0) {
          error = "Chiều cao (h) phải lớn hơn 0.";
        }
        break;
      case "hollowRectangle":
        if (!params.b || params.b <= 0) {
          error = "Chiều rộng (b) phải lớn hơn 0.";
        } else if (!params.h || params.h <= 0) {
          error = "Chiều cao (h) phải lớn hơn 0.";
        } else if (!params.t || params.t <= 0) {
          error = "Chiều dày (t) phải lớn hơn 0.";
        } else if (params.t * 2 >= params.b) {
          error = "Chiều dày (t) không hợp lệ.";
        } else if (params.t * 2 >= params.h) {
          error = "Chiều dày (t) không hợp lệ.";
        }
        break;
      case "circle":
        if (!params.r || params.r <= 0) {
          error = "Bán kính (r) phải lớn hơn 0.";
        }
        break;
      case "hollowCircle":
        if (!params.r || params.r <= 0) {
          error = "Bán kính (r) phải lớn hơn 0.";
        } else if (!params.t || params.t <= 0) {
          error = "Chiều dày (t) phải lớn hơn 0.";
        } else if (params.t >= params.r / 2) {
          error = "Chiều dày (t) không hợp lệ.";
        }
        break;
      case "iSection":
        if (!params.b || params.b <= 0) {
          error = "Chiều rộng (b) phải lớn hơn 0.";
        } else if (!params.tf || params.tf <= 0) {
          error = "Chiều dày cánh (tf) phải lớn hơn 0.";
        } else if (!params.h || params.h <= 0) {
          error = "Chiều cao (h) phải lớn hơn 0.";
        } else if (!params.tw || params.tw <= 0) {
          error = "Chiều dày bụng (tw) phải lớn hơn 0.";
        } else if (params.tw >= params.b) {
          error = "Chiều dày bụng (tw) không hợp lệ.";
        } else if (params.tf * 2 >= params.h) {
          error = "Chiều dày cánh (tf) không hợp lệ.";
        }
        break;
      default:
        break;
    }

    setSectionError(error);
  };

  useEffect(() => {
    const lengthInput = document.getElementById("length");
    const loadValueInput = document.getElementById("loadValue");
    const materialSelect = document.getElementById("material");
    const customEInput = document.getElementById("customE");
    const sectionTypeSelect = document.getElementById("sectionType");
    const rectWidthInput = document.getElementById("rectWidth");
    const rectHeightInput = document.getElementById("rectHeight");
    const hollowRectWidthInput = document.getElementById("hollowRectWidth");
    const hollowRectHeightInput = document.getElementById("hollowRectHeight");
    const hollowRectThicknessInput = document.getElementById("hollowRectThickness");
    const circleRadiusInput = document.getElementById("circleRadius");
    const hollowCircleRadiusInput = document.getElementById("hollowCircleRadius");
    const hollowCircleThicknessInput = document.getElementById("hollowCircleThickness");
    const iSectionWidthInput = document.getElementById("iSectionWidth");
    const iSectionFlangeThicknessInput = document.getElementById("iSectionFlangeThickness");
    const iSectionHeightInput = document.getElementById("iSectionHeight");
    const iSectionWebThicknessInput = document.getElementById("iSectionWebThickness");

    // Thiết lập lắng nghe sự kiện
    lengthInput?.addEventListener("input", handleInputChange);
    loadValueInput?.addEventListener("input", handleInputChange);
    materialSelect?.addEventListener("change", handleInputChange);
    customEInput?.addEventListener("input", handleInputChange);
    sectionTypeSelect?.addEventListener("change", handleInputChange);
    rectWidthInput?.addEventListener("input", handleInputChange);
    rectHeightInput?.addEventListener("input", handleInputChange);
    hollowRectWidthInput?.addEventListener("input", handleInputChange);
    hollowRectHeightInput?.addEventListener("input", handleInputChange);
    hollowRectThicknessInput?.addEventListener("input", handleInputChange);
    circleRadiusInput?.addEventListener("input", handleInputChange);
    hollowCircleRadiusInput?.addEventListener("input", handleInputChange);
    hollowCircleThicknessInput?.addEventListener("input", handleInputChange);
    iSectionWidthInput?.addEventListener("input", handleInputChange);
    iSectionFlangeThicknessInput?.addEventListener("input", handleInputChange);
    iSectionHeightInput?.addEventListener("input", handleInputChange);
    iSectionWebThicknessInput?.addEventListener("input", handleInputChange);

    handleInputChange()

    // Cleanup
    return () => {
      lengthInput?.removeEventListener("input", handleInputChange);
      loadValueInput?.removeEventListener("input", handleInputChange);
      materialSelect?.removeEventListener("change", handleInputChange);
      customEInput?.removeEventListener("input", handleInputChange);
      sectionTypeSelect?.removeEventListener("change", handleInputChange);
      rectWidthInput?.removeEventListener("input", handleInputChange);
      rectHeightInput?.removeEventListener("input", handleInputChange);
      hollowRectWidthInput?.removeEventListener("input", handleInputChange);
      hollowRectHeightInput?.removeEventListener("input", handleInputChange);
      hollowRectThicknessInput?.removeEventListener("input", handleInputChange);
      circleRadiusInput?.removeEventListener("input", handleInputChange);
      hollowCircleRadiusInput?.removeEventListener("input", handleInputChange);
      hollowCircleThicknessInput?.removeEventListener("input", handleInputChange);
      iSectionWidthInput?.removeEventListener("input", handleInputChange);
      iSectionFlangeThicknessInput?.removeEventListener("input", handleInputChange);
      iSectionHeightInput?.removeEventListener("input", handleInputChange);
      iSectionWebThicknessInput?.removeEventListener("input", handleInputChange);
    };
  }, []);

  function calculateShearForce(length, loadValue, x) {
    const q = loadValue;
    return q * (length / 2 - x);
  }

  function calculateBendingMoment(length, loadValue, x) {
    const q = loadValue;
    return (q * x * (length - x)) / 2;
  }

  // Tính toán mô-men quán tính dựa trên loại tiết diện và thông số
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

  const {
    calculatedShearForceData,
    calculatedBendingMomentData,
    calculatedMomentOfInertia,
  } = useMemo(() => {
    if (length > 0 && loadValue !== 0) {
      const numPoints = 100;
      const xValues = [];
      const shearForceValues = [];
      const bendingMomentValues = [];

      for (let i = 0; i <= numPoints; i++) {
        const x = (length * i) / numPoints;
        xValues.push(x.toFixed(2));
        shearForceValues.push(
          calculateShearForce(length, loadValue, x).toFixed(2)
        );
        bendingMomentValues.push(
          calculateBendingMoment(length, loadValue, x).toFixed(2)
        );
      }

      // Tính moment of inertia
      const I = calculateMomentOfInertia(sectionType, sectionParams);

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
        calculatedMomentOfInertia: I,
      };
    } else {
      return {
        calculatedShearForceData: null,
        calculatedBendingMomentData: null,
        calculatedMomentOfInertia: null,
      };
    }
  }, [length, loadValue, sectionType, sectionParams]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Chỉ hiển thị biểu đồ và kết quả khi tất cả thông số hợp lệ
    if (length > 0 && loadValue !== 0 && !errorL && !errorQ && !errorE && !sectionError) {
      setShearForceData(calculatedShearForceData);
      setBendingMomentData(calculatedBendingMomentData);
      setMaxBendingMoment(Math.max(...calculatedBendingMomentData.data));
      setMaxShearForce(Math.max(...calculatedShearForceData.data));
      setMomentOfInertia(calculatedMomentOfInertia);
      setShowChart(true);
    } else {
      setShowChart(false);
    }
  };

  return (
    <main>
      <h1>Dầm đơn giản, tải phân bố đều</h1>

      {/* Container cho hình minh họa và phần nhập thông số */}
      <div className="input-area">
        {/* Hình minh họa */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Image
            src="/images/simple-beam-diagram.png"
            alt="Sơ đồ dầm đơn giản chịu tải phân bố đều"
            width={500}
            height={300}
          />
        </div>

        {/* Khu vực nhập thông số */}
        <div>
          <h2>Thông số dầm</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="length">Chiều dài dầm (L) (m): </label>
              <input type="number" id="length" name="length" />
              {errorL && <p style={{ color: "red" }}>{errorL}</p>}
            </div>

            {/* Tải trọng */}
            <div>
              <label htmlFor="loadValue">
                Giá trị tải phân bố đều (q) (kN/m):{" "}
              </label>
              <input type="number" id="loadValue" name="loadValue" />
              {errorQ && <p style={{ color: "red" }}>{errorQ}</p>}
            </div>

            {/* Danh mục vật liệu */}
            <div>
              <label htmlFor="material">Vật liệu: </label>
              <select
                id="material"
                name="material"
                value={material}
                onChange={handleInputChange}
              >
                <option value="Thép">Thép (E = 210,000 MPa)</option>
                <option value="Gỗ">Gỗ (E = 5,500 MPa)</option>
                <option value="Bê tông">Bê tông (E = 27,000 MPa)</option>
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
                  onChange={(e) => setCustomE(e.target.value)}
                />
                {errorE && <p style={{ color: "red" }}>{errorE}</p>}
              </div>
            ) : (
              <div>
                <label>Mô đun đàn hồi E (MPa):</label>
                <input type="text" value={elasticModulus} readOnly />
              </div>
            )}

            {/* Chọn loại tiết diện */}
            <div>
              <label htmlFor="sectionType">Loại tiết diện:</label>
              <select
                id="sectionType"
                name="sectionType"
                value={sectionType}
                onChange={handleInputChange}
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
                  <label htmlFor="rectWidth">Chiều rộng b (mm):</label>
                  <input type="number" id="rectWidth" name="rectWidth" />
                </div>
                <div>
                  <label htmlFor="rectHeight">Chiều cao h (mm):</label>
                  <input type="number" id="rectHeight" name="rectHeight" />
                </div>
              </div>
            )}

            {sectionType === "hollowRectangle" && (
              <div>
                <div>
                  <label htmlFor="hollowRectWidth">Chiều rộng b (mm):</label>
                  <input
                    type="number"
                    id="hollowRectWidth"
                    name="hollowRectWidth"
                  />
                </div>
                <div>
                  <label htmlFor="hollowRectHeight">Chiều cao h (mm):</label>
                  <input
                    type="number"
                    id="hollowRectHeight"
                    name="hollowRectHeight"
                  />
                </div>
                <div>
                  <label htmlFor="hollowRectThickness">
                    Chiều dày t (mm):
                  </label>
                  <input
                    type="number"
                    id="hollowRectThickness"
                    name="hollowRectThickness"
                  />
                </div>
              </div>
            )}

            {sectionType === "circle" && (
              <div>
                <label htmlFor="circleRadius">Bán kính r (mm):</label>
                <input type="number" id="circleRadius" name="circleRadius" />
              </div>
            )}

            {sectionType === "hollowCircle" && (
              <div>
                <div>
                  <label htmlFor="hollowCircleRadius">Bán kính r (mm):</label>
                  <input
                    type="number"
                    id="hollowCircleRadius"
                    name="hollowCircleRadius"
                  />
                </div>
                <div>
                  <label htmlFor="hollowCircleThickness">
                    Chiều dày t (mm):
                  </label>
                  <input
                    type="number"
                    id="hollowCircleThickness"
                    name="hollowCircleThickness"
                  />
                </div>
              </div>
            )}

            {sectionType === "iSection" && (
              <div>
                <div>
                  <label htmlFor="iSectionWidth">Chiều rộng b (mm):</label>
                  <input type="number" id="iSectionWidth" name="iSectionWidth" />
                </div>
                <div>
                  <label htmlFor="iSectionFlangeThickness">
                    Chiều dày cánh tf (mm):
                  </label>
                  <input
                    type="number"
                    id="iSectionFlangeThickness"
                    name="iSectionFlangeThickness"
                  />
                </div>
                <div>
                  <label htmlFor="iSectionHeight">Chiều cao h (mm):</label>
                  <input type="number" id="iSectionHeight" name="iSectionHeight" />
                </div>
                <div>
                  <label htmlFor="iSectionWebThickness">
                    Chiều dày bụng tw (mm):
                  </label>
                  <input
                    type="number"
                    id="iSectionWebThickness"
                    name="iSectionWebThickness"
                  />
                </div>
              </div>
            )}
            {/* Nút "Tính toán" */}
            <button
              type="submit"
              disabled={
                length <= 0 ||
                loadValue === 0 ||
                errorL ||
                errorQ ||
                errorE ||
                sectionError
              }
            >
              Tính toán
            </button>
          </form>
        </div>
      </div>

      {/* Khu vực hiển thị kết quả */}
      {showChart && (
        <div className="chart-container">
          {/* Hiển thị thông tin tính toán */}
          <div>
            <h2>Kết quả tính toán</h2>
            <p>
              Mô-men uốn lớn nhất (Mmax):{" "}
              {maxBendingMoment.toFixed(2)} kN.m
            </p>
            <p>
              Lực cắt lớn nhất (Vmax): {maxShearForce.toFixed(2)} kN
            </p>
            <p>
              Mô-men quán tính của tiết diện (I):{" "}
              {momentOfInertia.toFixed(2)} mm<sup>4</sup>
            </p>
          </div>
          {/* Chart Area */}
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
          </div>
        </div>
      )}
    </main>
  );
}