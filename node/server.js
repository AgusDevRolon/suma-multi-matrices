const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const publicDir = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

function validatePayload(body) {
  const { rows, cols, operation, matrixA, matrixB } = body;
  if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(cols) || cols < 1) {
    throw new Error('Filas y columnas deben ser números enteros positivos.');
  }
  if (!['add', 'multiply'].includes(operation)) {
    throw new Error('Operación inválida.');
  }
  if (!Array.isArray(matrixA) || !Array.isArray(matrixB)) {
    throw new Error('Las matrices deben enviarse como arreglos.');
  }

  if (matrixA.length !== rows || matrixB.length !== rows) {
    throw new Error('El tamaño de las matrices no coincide con las filas indicadas.');
  }

  matrixA.forEach((row) => {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error('Las filas de la matriz A tienen un tamaño incorrecto.');
    }
    row.forEach((item) => {
      if (typeof item !== 'number' || Number.isNaN(item)) {
        throw new Error('Todos los valores de la matriz A deben ser numéricos.');
      }
    });
  });

  matrixB.forEach((row) => {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error('Las filas de la matriz B tienen un tamaño incorrecto.');
    }
    row.forEach((item) => {
      if (typeof item !== 'number' || Number.isNaN(item)) {
        throw new Error('Todos los valores de la matriz B deben ser numéricos.');
      }
    });
  });

  if (operation === 'multiply' && cols !== rows) {
    throw new Error('Para multiplicar matrices con el mismo tamaño, deben ser cuadradas.');
  }

  return { rows, cols, operation, matrixA, matrixB };
}

function addMatrices(A, B) {
  return A.map((row, r) => row.map((value, c) => value + B[r][c]));
}

function multiplyMatrices(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let r = 0; r < rowsA; r += 1) {
    for (let c = 0; c < colsB; c += 1) {
      for (let k = 0; k < colsA; k += 1) {
        result[r][c] += A[r][k] * B[k][c];
      }
    }
  }

  return result;
}

app.post('/calculate', (req, res) => {
  try {
    const { operation, matrixA, matrixB } = validatePayload(req.body);
    const result = operation === 'add' ? addMatrices(matrixA, matrixB) : multiplyMatrices(matrixA, matrixB);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor NodeJS ejecutándose en http://localhost:${port}`);
});
