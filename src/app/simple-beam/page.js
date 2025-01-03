"use client";

import { useState, useMemo, useEffect } from "react";
import BeamChart from "../components/BeamChart";
import Image from "next/image";

export default function SimpleBeam() {
  const [length, setLength] = useState(0);
  const [loadValue, setLoadValue] = useState(0);
  const [shearForceData, setShearForceData] = useState(null);
  const [bendingMomentData, setBendingMomentData] = useState(null);
  const [errorL, setErrorL] = useState("");
  const [errorQ, setErrorQ] = useState("");
  const [showChart, setShowChart] = useState(false);

  const handleInputChange = () => {
    const newLength = parseFloat(
      document.getElementById("length")?.value || "0"
    );
    const newLoadValue = parseFloat(
      document.getElementById("loadValue")?.value || "0"
    );

    setLength(newLength);
    setLoadValue(newLoadValue);

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
  };

  useEffect(() => {
    const lengthInput = document.getElementById("length");
    const loadValueInput = document.getElementById("loadValue");

    handleInputChange();

    lengthInput?.addEventListener("input", handleInputChange);
    loadValueInput?.addEventListener("input", handleInputChange);

    return () => {
      lengthInput?.removeEventListener("input", handleInputChange);
      loadValueInput?.removeEventListener("input", handleInputChange);
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

  const { calculatedShearForceData, calculatedBendingMomentData } = useMemo(
    () => {
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
        };
      } else {
        return {
          calculatedShearForceData: null,
          calculatedBendingMomentData: null,
        };
      }
    },
    [length, loadValue]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (length > 0 && loadValue !== 0) {
        setShearForceData(calculatedShearForceData);
        setBendingMomentData(calculatedBendingMomentData);
        setShowChart(true);
    }
  };

  return (
    <main>
      <h1>Dầm đơn giản, tải phân bố đều</h1>

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

          <button
            type="submit"
            disabled={length <= 0 || loadValue === 0 || errorL || errorQ}
          >
            Tính toán
          </button>
        </form>
      </div>

      {/* Khu vực hiển thị kết quả */}
      {showChart && (
        <div style={{ width: "70%", margin: "0 auto" }}>
          <h2>Kết quả</h2>
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
      )}
    </main>
  );
}