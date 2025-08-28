// ===== Mock data extracted from index.jsx =====

export const resumen = {
    ult30d: {
        p80: { valor: 42.67, unidad: 'mm' },
        p50: { valor: 28.96, unidad: 'mm' }
    },
    ult7d: {
        p80: { valor: 43.69, unidad: 'mm' },
        p50: { valor: 29.46, unidad: 'mm' }
    },
    ult24h: {
        p80: { valor: 43.43, unidad: 'mm' },
        p50: { valor: 29.21, unidad: 'mm' }
    }
};

export const kpis = {
    p80Actual: 43.43,
    p80Meta: 43.18,
    p50Actual: 29.21,
    p50Meta: 28.45,
    deteccionOversize: 97,
    falsosPositivos: 3,
    disponibilidad: 97,
    tiempoDeteccion: 30,
    inspeccionCamiones: 100,
    velocidadCinta: 3.2
};

export const curvaGran = [
    { size: 0, pct: 0, p80: null, p50: null },
    { size: 1.60, pct: 2, p80: null, p50: null },
    { size: 3.18, pct: 5, p80: null, p50: null },
    { size: 4.57, pct: 12, p80: null, p50: null },
    { size: 6.35, pct: 18, p80: null, p50: null },
    { size: 8.89, pct: 26, p80: null, p50: null },
    { size: 10.80, pct: 32, p80: null, p50: null },
    { size: 12.70, pct: 37, p80: null, p50: null },
    { size: 15.24, pct: 43, p80: null, p50: null },
    { size: 17.78, pct: 48, p80: null, p50: null },
    { size: 19.05, pct: 55, p80: null, p50: null },
    { size: 21.59, pct: 62, p80: null, p50: null },
    { size: 24.13, pct: 67, p80: null, p50: null },
    { size: 25.40, pct: 70, p80: null, p50: null },
    { size: 27.99, pct: 50, p80: null, p50: 50 },
    { size: 29.97, pct: 76, p80: null, p50: null },
    { size: 31.75, pct: 79, p80: null, p50: null },
    { size: 34.29, pct: 82, p80: null, p50: null },
    { size: 36.83, pct: 84, p80: null, p50: null },
    { size: 38.10, pct: 86, p80: null, p50: null },
    { size: 40.01, pct: 80, p80: 80, p50: null },
    { size: 41.91, pct: 88, p80: null, p50: null },
    { size: 44.45, pct: 92, p80: null, p50: null },
    { size: 46.99, pct: 94, p80: null, p50: null },
    { size: 50.80, pct: 96, p80: null, p50: null },
    { size: 54.61, pct: 97, p80: null, p50: null },
    { size: 58.42, pct: 98, p80: null, p50: null },
    { size: 63.50, pct: 99, p80: null, p50: null },
    { size: 69.85, pct: 99.5, p80: null, p50: null },
    { size: 76.20, pct: 100, p80: null, p50: null }
];

// Period-specific curves for histogram snapshots
const curvaGran_24h = [
    { size: 0, pct: 0, p80: null, p50: null },
    { size: 1.60, pct: 2.2, p80: null, p50: null },
    { size: 3.18, pct: 5.1, p80: null, p50: null },
    { size: 4.57, pct: 12.3, p80: null, p50: null },
    { size: 6.35, pct: 18.5, p80: null, p50: null },
    { size: 8.89, pct: 26.2, p80: null, p50: null },
    { size: 10.80, pct: 32.4, p80: null, p50: null },
    { size: 12.70, pct: 37.1, p80: null, p50: null },
    { size: 15.24, pct: 43.3, p80: null, p50: null },
    { size: 17.78, pct: 48.2, p80: null, p50: null },
    { size: 19.05, pct: 55.1, p80: null, p50: null },
    { size: 21.59, pct: 62.3, p80: null, p50: null },
    { size: 24.13, pct: 67.2, p80: null, p50: null },
    { size: 25.40, pct: 70.1, p80: null, p50: null },
    { size: 27.99, pct: 50.2, p80: null, p50: 50 },
    { size: 29.97, pct: 76.3, p80: null, p50: null },
    { size: 31.75, pct: 79.1, p80: null, p50: null },
    { size: 34.29, pct: 82.2, p80: null, p50: null },
    { size: 36.83, pct: 84.1, p80: null, p50: null },
    { size: 38.10, pct: 86.2, p80: null, p50: null },
    { size: 40.01, pct: 80.1, p80: 80, p50: null },
    { size: 41.91, pct: 88.3, p80: null, p50: null },
    { size: 44.45, pct: 92.1, p80: null, p50: null },
    { size: 46.99, pct: 94.2, p80: null, p50: null },
    { size: 50.80, pct: 96.1, p80: null, p50: null },
    { size: 54.61, pct: 97.2, p80: null, p50: null },
    { size: 58.42, pct: 98.1, p80: null, p50: null },
    { size: 63.50, pct: 99.1, p80: null, p50: null },
    { size: 69.85, pct: 99.6, p80: null, p50: null },
    { size: 76.20, pct: 100, p80: null, p50: null }
];

const curvaGran_7d = [
    { size: 0, pct: 0, p80: null, p50: null },
    { size: 1.60, pct: 1.8, p80: null, p50: null },
    { size: 3.18, pct: 4.7, p80: null, p50: null },
    { size: 4.57, pct: 11.5, p80: null, p50: null },
    { size: 6.35, pct: 17.8, p80: null, p50: null },
    { size: 8.89, pct: 25.6, p80: null, p50: null },
    { size: 10.80, pct: 31.7, p80: null, p50: null },
    { size: 12.70, pct: 36.8, p80: null, p50: null },
    { size: 15.24, pct: 42.6, p80: null, p50: null },
    { size: 17.78, pct: 47.9, p80: null, p50: null },
    { size: 19.05, pct: 54.7, p80: null, p50: null },
    { size: 21.59, pct: 61.8, p80: null, p50: null },
    { size: 24.13, pct: 66.9, p80: null, p50: null },
    { size: 25.40, pct: 69.7, p80: null, p50: null },
    { size: 27.99, pct: 49.8, p80: null, p50: 50 },
    { size: 29.97, pct: 75.9, p80: null, p50: null },
    { size: 31.75, pct: 78.7, p80: null, p50: null },
    { size: 34.29, pct: 81.8, p80: null, p50: null },
    { size: 36.83, pct: 83.9, p80: null, p50: null },
    { size: 38.10, pct: 85.8, p80: null, p50: null },
    { size: 40.01, pct: 79.9, p80: 80, p50: null },
    { size: 41.91, pct: 87.8, p80: null, p50: null },
    { size: 44.45, pct: 91.9, p80: null, p50: null },
    { size: 46.99, pct: 93.8, p80: null, p50: null },
    { size: 50.80, pct: 95.9, p80: null, p50: null },
    { size: 54.61, pct: 96.8, p80: null, p50: null },
    { size: 58.42, pct: 97.9, p80: null, p50: null },
    { size: 63.50, pct: 98.8, p80: null, p50: null },
    { size: 69.85, pct: 99.4, p80: null, p50: null },
    { size: 76.20, pct: 100, p80: null, p50: null }
];

const curvaGran_30d = [
    { size: 0, pct: 0, p80: null, p50: null },
    { size: 1.60, pct: 2.4, p80: null, p50: null },
    { size: 3.18, pct: 5.3, p80: null, p50: null },
    { size: 4.57, pct: 12.7, p80: null, p50: null },
    { size: 6.35, pct: 18.9, p80: null, p50: null },
    { size: 8.89, pct: 26.8, p80: null, p50: null },
    { size: 10.80, pct: 32.9, p80: null, p50: null },
    { size: 12.70, pct: 37.6, p80: null, p50: null },
    { size: 15.24, pct: 43.8, p80: null, p50: null },
    { size: 17.78, pct: 48.6, p80: null, p50: null },
    { size: 19.05, pct: 55.4, p80: null, p50: null },
    { size: 21.59, pct: 62.7, p80: null, p50: null },
    { size: 24.13, pct: 67.6, p80: null, p50: null },
    { size: 25.40, pct: 70.4, p80: null, p50: null },
    { size: 27.99, pct: 50.4, p80: null, p50: 50 },
    { size: 29.97, pct: 76.7, p80: null, p50: null },
    { size: 31.75, pct: 79.4, p80: null, p50: null },
    { size: 34.29, pct: 82.6, p80: null, p50: null },
    { size: 36.83, pct: 84.4, p80: null, p50: null },
    { size: 38.10, pct: 86.6, p80: null, p50: null },
    { size: 40.01, pct: 80.4, p80: 80, p50: null },
    { size: 41.91, pct: 88.7, p80: null, p50: null },
    { size: 44.45, pct: 92.4, p80: null, p50: null },
    { size: 46.99, pct: 94.6, p80: null, p50: null },
    { size: 50.80, pct: 96.4, p80: null, p50: null },
    { size: 54.61, pct: 97.6, p80: null, p50: null },
    { size: 58.42, pct: 98.4, p80: null, p50: null },
    { size: 63.50, pct: 99.4, p80: null, p50: null },
    { size: 69.85, pct: 99.7, p80: null, p50: null },
    { size: 76.20, pct: 100, p80: null, p50: null }
];

export const curvaGranByPeriod = {
    '24h': curvaGran_24h,
    '7d': curvaGran_7d,
    '30d': curvaGran_30d
};

export const ultimasMuestras = [
    { id: 1, fecha: '2025-09-29 10:00', p80: '46.23', imagen: '' },
    { id: 2, fecha: '2025-09-29 11:00', p80: '44.45', imagen: '' },
    { id: 3, fecha: '2025-09-29 12:00', p80: '42.93', imagen: '' },
    { id: 4, fecha: '2025-09-29 13:00', p80: '48.51', imagen: '' },
    { id: 5, fecha: '2025-09-24 14:00', p80: '43.94', imagen: '' },
    { id: 6, fecha: '2025-09-24 15:00', p80: '47.75', imagen: '' },
    { id: 7, fecha: '2025-09-24 16:00', p80: '44.96', imagen: '' },
    { id: 8, fecha: '2025-09-24 17:00', p80: '46.74', imagen: '' },
    { id: 9, fecha: '2025-09-29 18:00', p80: '43.43', imagen: '' },
    { id: 10, fecha: '2025-09-29 19:00', p80: '49.02', imagen: '' }
];

export const densidadData = [
    { mm: 0.5, densidad: 0.8 },
    { mm: 1, densidad: 1.2 },
    { mm: 2, densidad: 2.1 },
    { mm: 4, densidad: 3.8 },
    { mm: 8, densidad: 6.2 },
    { mm: 16, densidad: 8.5 },
    { mm: 32, densidad: 4.1 },
    { mm: 64, densidad: 1.2 }
];

export const frecuenciaData = [
    { mm: 0.5, frecuencia: 2.1 },
    { mm: 1, frecuencia: 3.8 },
    { mm: 2, frecuencia: 7.2 },
    { mm: 4, frecuencia: 12.5 },
    { mm: 8, frecuencia: 18.3 },
    { mm: 16, frecuencia: 22.1 },
    { mm: 32, frecuencia: 15.8 },
    { mm: 64, frecuencia: 8.2 }
];

// Time series data with timestamps
export const series = {
    '24h': [
        { ts: '2024-01-15T09:00:00Z', time: '09:00', p80: 41.91, p50: 27.94, label: '09:00' },
        { ts: '2024-01-15T09:30:00Z', time: '09:30', p80: 42.42, p50: 28.19, label: '09:30' },
        { ts: '2024-01-15T10:00:00Z', time: '10:00', p80: 43.18, p50: 28.70, label: '10:00' },
        { ts: '2024-01-15T10:30:00Z', time: '10:30', p80: 42.16, p50: 27.69, label: '10:30' },
        { ts: '2024-01-15T11:00:00Z', time: '11:00', p80: 41.66, p50: 27.43, label: '11:00' },
        { ts: '2024-01-15T11:30:00Z', time: '11:30', p80: 42.93, p50: 28.96, label: '11:30' },
        { ts: '2024-01-15T12:00:00Z', time: '12:00', p80: 42.67, p50: 28.45, label: '12:00' },
        { ts: '2024-01-15T12:30:00Z', time: '12:30', p80: 43.43, p50: 29.46, label: '12:30' },
        { ts: '2024-01-15T13:00:00Z', time: '13:00', p80: 43.69, p50: 29.21, label: '13:00' },
        { ts: '2024-01-15T13:30:00Z', time: '13:30', p80: 44.20, p50: 29.72, label: '13:30' },
        { ts: '2024-01-15T14:00:00Z', time: '14:00', p80: 44.45, p50: 29.97, label: '14:00' },
        { ts: '2024-01-15T14:30:00Z', time: '14:30', p80: 43.94, p50: 29.46, label: '14:30' },
        { ts: '2024-01-15T15:00:00Z', time: '15:00', p80: 42.93, p50: 28.70, label: '15:00' },
        { ts: '2024-01-15T15:30:00Z', time: '15:30', p80: 42.42, p50: 28.19, label: '15:30' },
        { ts: '2024-01-15T16:00:00Z', time: '16:00', p80: 43.18, p50: 28.96, label: '16:00' },
        { ts: '2024-01-15T16:30:00Z', time: '16:30', p80: 43.69, p50: 29.21, label: '16:30' },
        { ts: '2024-01-15T17:00:00Z', time: '17:00', p80: 42.67, p50: 28.45, label: '17:00' }
    ],
    '7d': [
        { ts: '2024-01-09T00:00:00Z', time: 'Día 1', p80: 42.1, p50: 28.3, label: 'Día 1' },
        { ts: '2024-01-10T00:00:00Z', time: 'Día 2', p80: 43.2, p50: 29.1, label: 'Día 2' },
        { ts: '2024-01-11T00:00:00Z', time: 'Día 3', p80: 41.8, p50: 27.9, label: 'Día 3' },
        { ts: '2024-01-12T00:00:00Z', time: 'Día 4', p80: 44.1, p50: 29.8, label: 'Día 4' },
        { ts: '2024-01-13T00:00:00Z', time: 'Día 5', p80: 42.9, p50: 28.7, label: 'Día 5' },
        { ts: '2024-01-14T00:00:00Z', time: 'Día 6', p80: 43.5, p50: 29.3, label: 'Día 6' },
        { ts: '2024-01-15T00:00:00Z', time: 'Día 7', p80: 43.69, p50: 29.46, label: 'Día 7' }
    ],
    '30d': [
        { ts: '2023-12-17T00:00:00Z', time: 'Día 1', p80: 41.5, p50: 27.8, label: 'Día 1' },
        { ts: '2023-12-18T00:00:00Z', time: 'Día 2', p80: 42.3, p50: 28.5, label: 'Día 2' },
        { ts: '2023-12-19T00:00:00Z', time: 'Día 3', p80: 43.1, p50: 29.2, label: 'Día 3' },
        { ts: '2023-12-20T00:00:00Z', time: 'Día 4', p80: 41.9, p50: 28.1, label: 'Día 4' },
        { ts: '2023-12-21T00:00:00Z', time: 'Día 5', p80: 42.8, p50: 28.9, label: 'Día 5' },
        { ts: '2023-12-22T00:00:00Z', time: 'Día 6', p80: 43.4, p50: 29.5, label: 'Día 6' },
        { ts: '2023-12-23T00:00:00Z', time: 'Día 7', p80: 42.2, p50: 28.4, label: 'Día 7' },
        { ts: '2023-12-24T00:00:00Z', time: 'Día 8', p80: 41.7, p50: 27.9, label: 'Día 8' },
        { ts: '2023-12-25T00:00:00Z', time: 'Día 9', p80: 43.6, p50: 29.7, label: 'Día 9' },
        { ts: '2023-12-26T00:00:00Z', time: 'Día 10', p80: 42.5, p50: 28.6, label: 'Día 10' },
        { ts: '2023-12-27T00:00:00Z', time: 'Día 11', p80: 41.3, p50: 27.5, label: 'Día 11' },
        { ts: '2023-12-28T00:00:00Z', time: 'Día 12', p80: 43.9, p50: 29.8, label: 'Día 12' },
        { ts: '2023-12-29T00:00:00Z', time: 'Día 13', p80: 42.1, p50: 28.2, label: 'Día 13' },
        { ts: '2023-12-30T00:00:00Z', time: 'Día 14', p80: 41.8, p50: 28.0, label: 'Día 14' },
        { ts: '2023-12-31T00:00:00Z', time: 'Día 15', p80: 43.2, p50: 29.1, label: 'Día 15' },
        { ts: '2024-01-01T00:00:00Z', time: 'Día 16', p80: 42.7, p50: 28.8, label: 'Día 16' },
        { ts: '2024-01-02T00:00:00Z', time: 'Día 17', p80: 41.4, p50: 27.6, label: 'Día 17' },
        { ts: '2024-01-03T00:00:00Z', time: 'Día 18', p80: 43.8, p50: 29.9, label: 'Día 18' },
        { ts: '2024-01-04T00:00:00Z', time: 'Día 19', p80: 42.3, p50: 28.5, label: 'Día 19' },
        { ts: '2024-01-05T00:00:00Z', time: 'Día 20', p80: 41.9, p50: 28.1, label: 'Día 20' },
        { ts: '2024-01-06T00:00:00Z', time: 'Día 21', p80: 43.5, p50: 29.4, label: 'Día 21' },
        { ts: '2024-01-07T00:00:00Z', time: 'Día 22', p80: 42.0, p50: 28.3, label: 'Día 22' },
        { ts: '2024-01-08T00:00:00Z', time: 'Día 23', p80: 41.6, p50: 27.8, label: 'Día 23' },
        { ts: '2024-01-09T00:00:00Z', time: 'Día 24', p80: 43.1, p50: 29.0, label: 'Día 24' },
        { ts: '2024-01-10T00:00:00Z', time: 'Día 25', p80: 42.8, p50: 28.9, label: 'Día 25' },
        { ts: '2024-01-11T00:00:00Z', time: 'Día 26', p80: 41.2, p50: 27.4, label: 'Día 26' },
        { ts: '2024-01-12T00:00:00Z', time: 'Día 27', p80: 43.7, p50: 29.6, label: 'Día 27' },
        { ts: '2024-01-13T00:00:00Z', time: 'Día 28', p80: 42.4, p50: 28.7, label: 'Día 28' },
        { ts: '2024-01-14T00:00:00Z', time: 'Día 29', p80: 41.1, p50: 27.3, label: 'Día 29' },
        { ts: '2024-01-15T00:00:00Z', time: 'Día 30', p80: 42.67, p50: 28.96, label: 'Día 30' }
    ]
};

// Legacy data structure for backward compatibility
export const mockGranulometryData = series;