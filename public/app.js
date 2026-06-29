const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const drawBtn = document.getElementById('drawBtn');
const localBtn = document.getElementById('localBtn');
const nodeBtn = document.getElementById('nodeBtn');
const pythonBtn = document.getElementById('pythonBtn');
const matrixAContainer = document.getElementById('matrixA');
const matrixBContainer = document.getElementById('matrixB');
const resultContainer = document.getElementById('result');
const messageContainer = document.getElementById('message');

function createMatrixInputs(container, rows, cols, prefix) {
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = `${prefix}-${r}-${c}`;
      input.placeholder = '0';
      container.appendChild(input);
    }
  }
}

function getSelectedOperation() {
  return document.querySelector('input[name="operation"]:checked').value;
}

function readMatrix(container, rows, cols, prefix) {
  const matrix = [];
  for (let r = 0; r < rows; r += 1) {
    const row = [];
    for (let c = 0; c < cols; c += 1) {
      const input = document.getElementById(`${prefix}-${r}-${c}`);
      const value = input.value.trim();
      if (value === '') {
        throw new Error('Todos los campos de las matrices deben estar completos.');
      }
      const number = Number(value);
      if (Number.isNaN(number)) {
        throw new Error('Todos los valores deben ser numéricos.');
      }
      row.push(number);
    }
    matrix.push(row);
  }
  return matrix;
}

function renderResult(matrix) {
  resultContainer.innerHTML = '';
  matrix.forEach((row) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'result-row';
    row.forEach((value) => {
      const cell = document.createElement('div');
      cell.className = 'result-cell';
      cell.textContent = value;
      rowElement.appendChild(cell);
    });
    resultContainer.appendChild(rowElement);
  });
}

function showMessage(text, isError = true) {
  messageContainer.textContent = text;
  messageContainer.style.color = isError ? '#dc2626' : '#047857';
}

function clearMessage() {
  messageContainer.textContent = '';
}

function addMatrices(A, B) {
  const rows = A.length;
  const cols = A[0].length;
  const result = [];
  for (let r = 0; r < rows; r += 1) {
    const row = [];
    for (let c = 0; c < cols; c += 1) {
      row.push(A[r][c] + B[r][c]);
    }
    result.push(row);
  }
  return result;
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

function calculateLocal() {
  clearMessage();
  const rows = Number(rowsInput.value);
  const cols = Number(colsInput.value);
  const operation = getSelectedOperation();

  try {
    const matrixA = readMatrix(matrixAContainer, rows, cols, 'A');
    const matrixB = readMatrix(matrixBContainer, rows, cols, 'B');

    if (operation === 'multiply' && cols !== rows) {
      throw new Error('Para multiplicar matrices con el mismo tamaño, deben ser cuadradas.');
    }

    const result = operation === 'add' ? addMatrices(matrixA, matrixB) : multiplyMatrices(matrixA, matrixB);
    renderResult(result);
    showMessage('Cálculo local completado.', false);
  } catch (error) {
    renderResult([]);
    showMessage(error.message);
  }
}

async function calculateRemote(url) {
  clearMessage();
  const rows = Number(rowsInput.value);
  const cols = Number(colsInput.value);
  const operation = getSelectedOperation();

  try {
    const matrixA = readMatrix(matrixAContainer, rows, cols, 'A');
    const matrixB = readMatrix(matrixBContainer, rows, cols, 'B');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, cols, operation, matrixA, matrixB }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el servidor');
    }

    const data = await response.json();
    renderResult(data.result);
    showMessage(`Cálculo en servidor (${url}) completado.`, false);
  } catch (error) {
    renderResult([]);
    showMessage(error.message);
  }
}

function drawMatrices() {
  clearMessage();
  const rows = Number(rowsInput.value);
  const cols = Number(colsInput.value);

  if (rows < 1 || cols < 1) {
    showMessage('Ingrese valores válidos para filas y columnas.');
    return;
  }

  createMatrixInputs(matrixAContainer, rows, cols, 'A');
  createMatrixInputs(matrixBContainer, rows, cols, 'B');
  resultContainer.innerHTML = '';
}

function init() {
  drawMatrices();
  drawBtn.addEventListener('click', drawMatrices);
  localBtn.addEventListener('click', calculateLocal);
  nodeBtn.addEventListener('click', () => calculateRemote('http://localhost:3000/calculate'));
  pythonBtn.addEventListener('click', () => calculateRemote('http://localhost:5000/calculate'));
}

init();
