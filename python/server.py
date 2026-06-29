from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def validate_payload(data):
    try:
        rows = int(data.get('rows'))
        cols = int(data.get('cols'))
    except (TypeError, ValueError):
        raise ValueError('Filas y columnas deben ser números enteros positivos.')

    if rows < 1 or cols < 1:
        raise ValueError('Filas y columnas deben ser números enteros positivos.')

    operation = data.get('operation')
    if operation not in ['add', 'multiply']:
        raise ValueError('Operación inválida.')

    matrixA = data.get('matrixA')
    matrixB = data.get('matrixB')

    if not isinstance(matrixA, list) or not isinstance(matrixB, list):
        raise ValueError('Las matrices deben enviarse como arreglos.')

    if len(matrixA) != rows or len(matrixB) != rows:
        raise ValueError('El tamaño de las matrices no coincide con las filas indicadas.')

    for row in matrixA:
        if not isinstance(row, list) or len(row) != cols:
            raise ValueError('Las filas de la matriz A tienen un tamaño incorrecto.')
        for item in row:
            if not isinstance(item, (int, float)):
                raise ValueError('Todos los valores de la matriz A deben ser numéricos.')

    for row in matrixB:
        if not isinstance(row, list) or len(row) != cols:
            raise ValueError('Las filas de la matriz B tienen un tamaño incorrecto.')
        for item in row:
            if not isinstance(item, (int, float)):
                raise ValueError('Todos los valores de la matriz B deben ser numéricos.')

    if operation == 'multiply' and cols != rows:
        raise ValueError('Para multiplicar matrices con el mismo tamaño, deben ser cuadradas.')

    return rows, cols, operation, matrixA, matrixB


def add_matrices(A, B):
    return [[A[r][c] + B[r][c] for c in range(len(A[0]))] for r in range(len(A))]


def multiply_matrices(A, B):
    rowsA = len(A)
    colsA = len(A[0])
    colsB = len(B[0])
    result = [[0 for _ in range(colsB)] for _ in range(rowsA)]

    for r in range(rowsA):
        for c in range(colsB):
            for k in range(colsA):
                result[r][c] += A[r][k] * B[k][c]

    return result


@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        rows, cols, operation, matrixA, matrixB = validate_payload(request.json)
        result = add_matrices(matrixA, matrixB) if operation == 'add' else multiply_matrices(matrixA, matrixB)
        return jsonify({'result': result})
    except ValueError as error:
        return jsonify({'error': str(error)}), 400
    except Exception:
        return jsonify({'error': 'Error interno del servidor'}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)
