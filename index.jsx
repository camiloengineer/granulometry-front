import jsPDF from 'jspdf';
import { Activity, AlertTriangle, Beaker, ChevronDown, Clock, Download, Gauge, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';

// ===== Mock data (maqueta) =====
const resumen = {
    ult30d: {
        p80: { valor: 1.68, unidad: 'in' },
        p50: { valor: 1.14, unidad: 'in' }
    },
    ult7d: {
        p80: { valor: 1.72, unidad: 'in' },
        p50: { valor: 1.16, unidad: 'in' }
    },
    ult24h: {
        p80: { valor: 1.71, unidad: 'in' },
        p50: { valor: 1.15, unidad: 'in' }
    }
};

const kpis = {
    p80Actual: 1.71,
    p80Meta: 1.70,
    p50Actual: 1.15,
    p50Meta: 1.12,
    deteccionOversize: 97,
    falsosPositivos: 3,
    disponibilidad: 97,
    tiempoDeteccion: 30,
    inspeccionCamiones: 100,
    velocidadCinta: 3.2
};


const serieP80 = [
    { hora: '09:00', p80: 1.65, p50: 1.10 },
    { hora: '09:30', p80: 1.67, p50: 1.11 },
    { hora: '10:00', p80: 1.70, p50: 1.13 },
    { hora: '10:30', p80: 1.66, p50: 1.09 },
    { hora: '11:00', p80: 1.64, p50: 1.08 },
    { hora: '11:30', p80: 1.69, p50: 1.14 },
    { hora: '12:00', p80: 1.68, p50: 1.12 },
    { hora: '12:30', p80: 1.71, p50: 1.16 },
    { hora: '13:00', p80: 1.72, p50: 1.15 },
    { hora: '13:30', p80: 1.74, p50: 1.17 },
    { hora: '14:00', p80: 1.75, p50: 1.18 },
    { hora: '14:30', p80: 1.73, p50: 1.16 },
    { hora: '15:00', p80: 1.69, p50: 1.13 },
    { hora: '15:30', p80: 1.67, p50: 1.11 },
    { hora: '16:00', p80: 1.70, p50: 1.14 },
    { hora: '16:30', p80: 1.72, p50: 1.15 },
    { hora: '17:00', p80: 1.68, p50: 1.12 }
];


// Curva granulométrica (maqueta): tamaño (in) vs % acumulado
// Nota: en un caso real, el eje X suele usarse en escala log, aquí lo mostramos simple para la maqueta.
const curvaGran = [
    { size: 0, pct: 0, p80: null, p50: null },
    { size: 0.063, pct: 2, p80: null, p50: null },
    { size: 0.125, pct: 5, p80: null, p50: null },
    { size: 0.18, pct: 12, p80: null, p50: null },
    { size: 0.25, pct: 18, p80: null, p50: null },
    { size: 0.35, pct: 26, p80: null, p50: null },
    { size: 0.425, pct: 32, p80: null, p50: null },
    { size: 0.5, pct: 37, p80: null, p50: null },
    { size: 0.6, pct: 43, p80: null, p50: null },
    { size: 0.7, pct: 48, p80: null, p50: null },
    { size: 0.75, pct: 55, p80: null, p50: null },
    { size: 0.85, pct: 62, p80: null, p50: null },
    { size: 0.95, pct: 67, p80: null, p50: null },
    { size: 1.0, pct: 70, p80: null, p50: null },
    { size: 1.102, pct: 50, p80: null, p50: 50 },
    { size: 1.18, pct: 76, p80: null, p50: null },
    { size: 1.25, pct: 79, p80: null, p50: null },
    { size: 1.35, pct: 82, p80: null, p50: null },
    { size: 1.45, pct: 84, p80: null, p50: null },
    { size: 1.5, pct: 86, p80: null, p50: null },
    { size: 1.575, pct: 80, p80: 80, p50: null },
    { size: 1.65, pct: 88, p80: null, p50: null },
    { size: 1.75, pct: 92, p80: null, p50: null },
    { size: 1.85, pct: 94, p80: null, p50: null },
    { size: 2.0, pct: 96, p80: null, p50: null },
    { size: 2.15, pct: 97, p80: null, p50: null },
    { size: 2.3, pct: 98, p80: null, p50: null },
    { size: 2.5, pct: 99, p80: null, p50: null },
    { size: 2.75, pct: 99.5, p80: null, p50: null },
    { size: 3.0, pct: 100, p80: null, p50: null }
];



// Últimas 10 muestras (maqueta) - datos estáticos para evitar re-renders
const ultimasMuestras = [
    { id: 1, fecha: '2025-09-29 10:00', p80: '1.82', imagen: '' },
    { id: 2, fecha: '2025-09-29 11:00', p80: '1.75', imagen: '' },
    { id: 3, fecha: '2025-09-29 12:00', p80: '1.69', imagen: '' },
    { id: 4, fecha: '2025-09-29 13:00', p80: '1.91', imagen: '' },
    { id: 5, fecha: '2025-09-24 14:00', p80: '1.73', imagen: '' },
    { id: 6, fecha: '2025-09-24 15:00', p80: '1.88', imagen: '' },
    { id: 7, fecha: '2025-09-24 16:00', p80: '1.77', imagen: '' },
    { id: 8, fecha: '2025-09-24 17:00', p80: '1.84', imagen: '' },
    { id: 9, fecha: '2025-09-29 18:00', p80: '1.71', imagen: '' },
    { id: 10, fecha: '2025-09-29 19:00', p80: '1.93', imagen: '' }
];

// ===== UI helpers =====
const Badge = ({ tone = 'ok', children }) => {
    const map = {
        ok: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        warn: 'bg-amber-100 text-amber-800 border-amber-200',
        bad: 'bg-rose-100 text-rose-700 border-rose-200',
        info: 'bg-sky-100 text-sky-700 border-sky-200'
    };
    return <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${map[tone]}`}>{children}</span>;
};

const Card = ({ title, icon, action, children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`}>
        <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2">
                {icon}
                <h3 className="text-slate-800 font-semibold">{title}</h3>
            </div>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
);


export default function DashboardGranulometria() {
    const [activeTab, setActiveTab] = useState('ejecutiva');
    const [currentPage, setCurrentPage] = useState(1);
    const [timePeriod, setTimePeriod] = useState('30d');
    const [selectedFormula, setSelectedFormula] = useState('swebrec');
    const [showFormulaDropdown, setShowFormulaDropdown] = useState(false);
    const [bucketSize, setBucketSize] = useState(20);
    const dropdownRef = useRef(null);

    const formulas = {
        swebrec: {
            name: 'Swebrec',
            tooltip: 'La fórmula Swebrec permite ajustar con precisión tanto los tamaños pequeños como los muy grandes.'
        },
        gaudin: {
            name: 'Gaudin-Schuhmann',
            tooltip: 'Esta fórmula es más simple y asume que el tamaño de cada partícula se distribuye de forma proporcional al tamaño máximo presente en el material.'
        },
        rosin: {
            name: 'Rosin-Rammler',
            tooltip: 'Esta fórmula genera una curva suave que empieza muy lentamente en los tamaños finos y luego sube cada vez más rápido, como una S estirada.'
        }
    };

    const estadoP80 = kpis.p80Actual <= kpis.p80Meta + 0.2 ? 'ok' : 'bad';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFormulaDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const generateHistogramData = (buckets) => {
        const maxSize = 3.0;
        
        // Predefined frequencies to avoid Math.random() causing re-renders
        const predefinedFrequencies = {
            5: [0, 0, 2, 8, 12, 6, 3],
            10: [0, 0, 1, 2, 3, 8, 12, 9, 4, 2, 1, 0],
            20: [0, 0, 0, 1, 1, 2, 3, 4, 6, 8, 10, 12, 9, 7, 5, 3, 2, 1, 1, 0, 0, 1, 0]
        };

        const frequencies = predefinedFrequencies[buckets] || [];
        const totalBuckets = frequencies.length;
        const bucketWidth = maxSize / totalBuckets;
        const histogramData = [];

        // Generate sample data based on a typical granulometric distribution
        const sampleValues = [
            0.063, 0.125, 0.18, 0.25, 0.35, 0.425, 0.5, 0.6, 0.7, 0.75,
            0.85, 0.95, 1.0, 1.102, 1.18, 1.25, 1.35, 1.45, 1.5, 1.575,
            1.65, 1.75, 1.85, 2.0, 2.15, 2.3, 2.5, 2.75
        ];

        for (let i = 0; i < totalBuckets; i++) {
            const bucketStart = i * bucketWidth;
            const bucketEnd = (i + 1) * bucketWidth;
            const bucketCenter = bucketStart + bucketWidth / 2;

            // Count how many sample values fall in this bucket
            let count = 0;
            sampleValues.forEach(value => {
                if (value >= bucketStart && value < bucketEnd) {
                    count++;
                }
            });

            // Use predefined frequency if available, otherwise use count
            let frequency = frequencies[i] !== undefined ? frequencies[i] : count;
            
            // Ensure minimum frequency for realistic distribution
            if (frequency === 0 && bucketCenter > 0.5 && bucketCenter < 2.5) {
                frequency = 1;
            }

            histogramData.push({
                size: bucketCenter,
                frequency: frequency,
                range: `${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)}`
            });
        }

        // Filter out initial buckets with zero frequency to align with the curve start
        const firstNonZeroIndex = histogramData.findIndex(bucket => bucket.frequency > 0);
        const filteredData = firstNonZeroIndex > 0 ? histogramData.slice(firstNonZeroIndex) : histogramData;
        
        // Return exactly the number of buckets requested
        return filteredData.slice(0, buckets);
    };

    const histogramData = generateHistogramData(bucketSize);

    const generatePDF = (periodo = '30d') => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        let yPosition = 20;

        // Branding text básico, sin circo SVG
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text('ROBOTIA SENTINEL', pageWidth - 15, 15, { align: 'right' });

        doc.setTextColor(0, 0, 0);
        yPosition = 30;

        // Título del reporte
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte Ejecutivo - Análisis Granulométrico', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const fechaReporte = new Date().toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        doc.text(`Fecha de generación: ${fechaReporte}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        const periodoLabel = periodo === '30d' ? 'Últimos 30 días' :
            periodo === '7d' ? 'Últimos 7 días' : 'Últimas 24 horas';
        doc.text(`Período analizado: ${periodoLabel}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 20;

        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 15;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen Ejecutivo', 20, yPosition);
        yPosition += 10;

        const datosResumen = resumen[`ult${periodo === '30d' ? '30d' : periodo === '7d' ? '7d' : '24h'}`];

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`• P80 promedio: ${datosResumen.p80.valor} ${datosResumen.p80.unidad}`, 25, yPosition);
        yPosition += 8;
        doc.text(`• P50 promedio: ${datosResumen.p50.valor} ${datosResumen.p50.unidad}`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Última medición P80: ${kpis.p80Actual.toFixed(2)} in`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Última medición P50: ${kpis.p50Actual.toFixed(2)} in`, 25, yPosition);
        yPosition += 15;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Indicadores de Rendimiento', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`• Detección de oversize: ${kpis.deteccionOversize}%`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Disponibilidad del sistema: ${kpis.disponibilidad}%`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Tiempo promedio de detección: ${kpis.tiempoDeteccion}s`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Velocidad de cinta: ${kpis.velocidadCinta} m/s`, 25, yPosition);
        yPosition += 15;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Análisis Técnico', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Distribución Granulométrica (Percentiles):', 25, yPosition);
        yPosition += 10;

        const percentiles = [
            ['P100', '2.953'],
            ['P90', '1.850'],
            ['P80', '1.575'],
            ['P70', '1.417'],
            ['P60', '1.260'],
            ['P50', '1.102'],
            ['P40', '0.984'],
            ['P30', '0.827'],
            ['P20', '0.630'],
            ['P10', '0.433']
        ];

        let xCol1 = 30, xCol2 = 80, xCol3 = 130, xCol4 = 180;

        doc.setFont('helvetica', 'bold');
        doc.text('Percentil', xCol1, yPosition);
        doc.text('Valor (in)', xCol2, yPosition);
        doc.text('Percentil', xCol3, yPosition);
        doc.text('Valor (in)', xCol4, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        for (let i = 0; i < percentiles.length; i += 2) {
            doc.text(percentiles[i][0], xCol1, yPosition);
            doc.text(percentiles[i][1], xCol2, yPosition);
            if (percentiles[i + 1]) {
                doc.text(percentiles[i + 1][0], xCol3, yPosition);
                doc.text(percentiles[i + 1][1], xCol4, yPosition);
            }
            yPosition += 7;
        }

        yPosition += 10;

        if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Metodología', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`• Fórmula utilizada: ${formulas[selectedFormula].name}`, 25, yPosition);
        yPosition += 8;
        doc.text('• Análisis basado en procesamiento de imágenes', 25, yPosition);
        yPosition += 8;
        doc.text('• Mediciones continuas cada 1 minuto', 25, yPosition);
        yPosition += 8;
        doc.text('• Calibración automática del sistema', 25, yPosition);
        yPosition += 15;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Observaciones', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const estadoTexto = estadoP80 === 'ok' ? 'dentro de los parámetros establecidos' : 'fuera de los parámetros establecidos';
        doc.text(`• El P80 actual se encuentra ${estadoTexto}`, 25, yPosition);
        yPosition += 8;
        doc.text('• Sistema operando con alta disponibilidad', 25, yPosition);
        yPosition += 8;
        doc.text('• Detección de oversize funcionando correctamente', 25, yPosition);
        yPosition += 8;
        doc.text('• Se recomienda monitoreo continuo', 25, yPosition);

        // Footer
        yPosition = pageHeight - 20;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Este reporte fue generado automáticamente por Robotia Sentinel', pageWidth / 2, yPosition, { align: 'center' });

        const nombreArchivo = `reporte-granulometrico-${periodo}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nombreArchivo);
    };


    const getTimePeriodLabel = () => {
        switch (timePeriod) {
            case '30d': return 'Últimos 30 días';
            case '7d': return 'Últimos 7 días';
            case '24h': return 'Últimas 24 horas';
            default: return 'Últimos 30 días';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="top-0 z-10 bg-white/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setActiveTab('ejecutiva')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ejecutiva'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-900/70 hover:bg-slate-900/90 text-white'
                                    }`}
                            >
                                Vista Ejecutiva
                            </button>
                            <button
                                onClick={() => setActiveTab('tecnica')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tecnica'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-900/70 hover:bg-slate-900/90 text-white'
                                    }`}
                            >
                                Análisis Técnico
                            </button>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowFormulaDropdown(!showFormulaDropdown)}
                                className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200 flex items-center gap-2 hover:bg-slate-50 transition-colors"
                                title={formulas[selectedFormula].tooltip}
                            >
                                <Beaker className="text-slate-500" size={16} />
                                <span className="text-slate-700 text-sm font-medium">Fórmula: {formulas[selectedFormula].name}</span>
                                <ChevronDown className="text-slate-500" size={14} />
                            </button>
                            {showFormulaDropdown && (
                                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 min-w-80 z-50">
                                    {Object.entries(formulas).map(([key, formula]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setSelectedFormula(key);
                                                setShowFormulaDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedFormula === key ? 'bg-slate-50' : ''
                                                }`}
                                        >
                                            <div className="font-medium text-slate-800 mb-1">{formula.name}</div>
                                            <div className="text-xs text-slate-600">{formula.tooltip}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">

                {/* === Vista ejecutiva === */}
                {activeTab === 'ejecutiva' && (
                    <>
                        {/* Período activo */}
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-slate-800 font-semibold">Vista Ejecutiva</h2>
                            <Badge tone="info">Últimas 4 horas</Badge>
                        </div>

                        {/* === KPIs / resumen === */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card title="Última medicion" icon={<Gauge className="text-slate-500" size={18} />}>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between"><span className="text-slate-500 text-sm">P80</span><Badge tone={estadoP80}>{kpis.p80Actual.toFixed(2)} in</Badge></div>
                                    <div className="flex items-center justify-between"><span className="text-slate-500 text-sm">P50</span><Badge tone="info">{kpis.p50Actual.toFixed(2)} in</Badge></div>
                                </div>
                            </Card>
                            <Card title="Últimos 30 días" icon={<Activity className="text-slate-500" size={18} />}>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">P80</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">{resumen.ult30d.p80.valor} {resumen.ult30d.p80.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">P50</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-600">{resumen.ult30d.p50.valor} {resumen.ult30d.p50.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <button
                                            onClick={() => generatePDF('30d')}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            <Download size={14} />
                                            <span>Descargar reporte</span>
                                        </button>
                                    </div>
                                </div>
                            </Card>
                            <Card title="Últimos 7 días" icon={<Activity className="text-slate-500" size={18} />}>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">P80</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">{resumen.ult7d.p80.valor} {resumen.ult7d.p80.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">P50</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-600">{resumen.ult7d.p50.valor} {resumen.ult7d.p50.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <button
                                            onClick={() => generatePDF('7d')}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            <Download size={14} />
                                            <span>Descargar reporte</span>
                                        </button>
                                    </div>
                                </div>
                            </Card>
                            <Card title="Últimas 24 horas" icon={<Clock className="text-slate-500" size={18} />}>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">P80</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">{resumen.ult24h.p80.valor} {resumen.ult24h.p80.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">P50</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-600">{resumen.ult24h.p50.valor} {resumen.ult24h.p50.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <button
                                            onClick={() => generatePDF('24h')}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            <Download size={14} />
                                            <span>Descargar reporte</span>
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card title="Distribución granulométrica" icon={<TrendingUp className="text-slate-500" size={18} />}>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={serieP80}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hora" />
                                        <YAxis domain={[0, 2.2]} />
                                        <Legend />
                                        {/* <ReferenceArea y1={1.9} y2={2.2} fill="#ef4444" fillOpacity={0.12} label={{ value: 'Grande', position: 'insideTop' }} /> */}
                                        <Line type="monotone" dataKey="p80" name="P80" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="p50" name="P50" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title="Curva Granulométrica">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={curvaGran} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="size" type="number" domain={[0, 3.0]} tickFormatter={(v) => `${v.toFixed(2)} in`} />
                                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="pct" name="Curva granulométrica" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                                        <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "P80", position: "topLeft" }} />
                                        <ReferenceLine y={50} stroke="#7c3aed" strokeDasharray="5 5" label={{ value: "P50", position: "topLeft" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title="Histograma - Distribución no acumulativa (Frecuencia)"
                            action={
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setBucketSize(5)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${bucketSize === 5
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        5 buckets
                                    </button>
                                    <button
                                        onClick={() => setBucketSize(10)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${bucketSize === 10
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        10 buckets
                                    </button>
                                    <button
                                        onClick={() => setBucketSize(20)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${bucketSize === 20
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        20 buckets
                                    </button>
                                </div>
                            }>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={histogramData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="size" type="number" domain={[0, 3.0]} tickFormatter={(v) => `${v.toFixed(2)} in`} />
                                        <YAxis />
                                        <Legend />
                                        <Bar dataKey="frequency" name="Frecuencia" fill="#3b82f6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card title={`Muestra ${currentPage} de 10`} icon={<AlertTriangle className="text-slate-500" size={18} />}>
                            <div className="space-y-1">
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    <div className="w-full bg-slate-100 flex items-center justify-center gap-4 p-4">
                                        <img src="/raw.jpg" alt={`Muestra Raw ${currentPage}`} className="w-auto h-72 object-contain rotate-90" />
                                        <img src="/muestra.jpg" alt={`Muestra ${currentPage}`} className="w-auto h-72 object-contain rotate-90" />
                                    </div>
                                    <div className="p-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 text-xs">{ultimasMuestras[currentPage - 1]?.fecha}</span>
                                            <Badge tone="info">P80: {ultimasMuestras[currentPage - 1]?.p80} in</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                    >
                                        Anterior
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 rounded-full text-sm ${currentPage === page
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                                        disabled={currentPage === 10}
                                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </>
                )}

                {/* === Sección de análisis técnico === */}
                {activeTab === 'tecnica' && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Beaker size={18} className="text-slate-500" />
                                <h2 className="text-slate-800 font-semibold">Análisis técnico: {getTimePeriodLabel()}</h2>
                                <Badge tone="info">Modo experto</Badge>
                            </div>

                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => setTimePeriod('30d')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timePeriod === '30d'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    30 días
                                </button>
                                <button
                                    onClick={() => setTimePeriod('7d')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timePeriod === '7d'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    7 días
                                </button>
                                <button
                                    onClick={() => setTimePeriod('24h')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timePeriod === '24h'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    24 horas
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Card Resumen */}
                            <Card title="Resumen curva granulométrica" icon={<Beaker className="text-slate-500" size={18} />}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Tabla Percent Passing */}
                                    <div>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-600 border-b">
                                                    <th className="py-2 pr-4">Percent Passing</th>
                                                    <th className="py-2">Value (in)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P100</td>
                                                    <td className="py-2 text-slate-700">2.953</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P90</td>
                                                    <td className="py-2 text-slate-700">1.850</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P80</td>
                                                    <td className="py-2 text-slate-700">1.575</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P70</td>
                                                    <td className="py-2 text-slate-700">1.417</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P60</td>
                                                    <td className="py-2 text-slate-700">1.260</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P50</td>
                                                    <td className="py-2 text-slate-700">1.102</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P40</td>
                                                    <td className="py-2 text-slate-700">0.984</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P30</td>
                                                    <td className="py-2 text-slate-700">0.827</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P20</td>
                                                    <td className="py-2 text-slate-700">0.630</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-4 text-slate-700">P10</td>
                                                    <td className="py-2 text-slate-700">0.433</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Curva granulométrica */}
                                    <div>
                                        <div className="h-96">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={curvaGran} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="size" type="number" domain={[0, 3.0]} tickFormatter={(v) => `${v.toFixed(2)} in`} />
                                                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="pct" name="Curva granulométrica" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                                                    <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "P80", position: "topLeft" }} />
                                                    <ReferenceLine y={50} stroke="#7c3aed" strokeDasharray="5 5" label={{ value: "P50", position: "topLeft" }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Card Distribución granulométrica */}
                            <Card title="Distribución granulométrica" icon={<Beaker className="text-slate-500" size={18} />}>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={serieP80} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="hora" />
                                            <YAxis domain={[0, 2.2]} />
                                            <Legend />
                                            <Line type="monotone" dataKey="p80" name="P80" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                            <Line type="monotone" dataKey="p50" name="P50" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Card Muestra X de 10 */}
                            <Card title={`Muestra ${currentPage} de 10`} icon={<Beaker className="text-slate-500" size={18} />}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Muestra y paginación */}
                                    <div className="space-y-4">
                                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                            <div className="w-full bg-slate-100 space-y-2 p-4">
                                                <div className="flex justify-center">
                                                    <img src="/raw.jpg" alt={`Muestra Raw ${currentPage}`} className="max-w-full max-h-72 object-contain rotate-90" />
                                                </div>
                                                <div className="flex justify-center">
                                                    <img src="/muestra.jpg" alt={`Muestra ${currentPage}`} className="max-w-full max-h-72 object-contain rotate-90" />
                                                </div>
                                            </div>
                                            <div className="p-4 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 text-xs">{ultimasMuestras[currentPage - 1]?.fecha}</span>
                                                    <Badge tone="info">P80: {ultimasMuestras[currentPage - 1]?.p80} in</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Paginación */}
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 rounded-lg border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                            >
                                                Anterior
                                            </button>

                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-8 h-8 rounded-full text-sm ${currentPage === page
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                                                disabled={currentPage === 10}
                                                className="px-3 py-2 rounded-lg border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>

                                    {/* Curva granulométrica y tabla */}
                                    <div>
                                        <div className="h-72 mb-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={curvaGran} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="size" type="number" domain={[0, 3.0]} tickFormatter={(v) => `${v.toFixed(2)} in`} />
                                                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="pct" name="Curva granulométrica" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-600 border-b">
                                                    <th className="py-2 pr-4">Percent Passing</th>
                                                    <th className="py-2">Value (in)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P100</td>
                                                    <td className="py-2 text-slate-700">2.953</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P90</td>
                                                    <td className="py-2 text-slate-700">1.850</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P80</td>
                                                    <td className="py-2 text-slate-700">1.575</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P70</td>
                                                    <td className="py-2 text-slate-700">1.417</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P60</td>
                                                    <td className="py-2 text-slate-700">1.260</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P50</td>
                                                    <td className="py-2 text-slate-700">1.102</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P40</td>
                                                    <td className="py-2 text-slate-700">0.984</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P30</td>
                                                    <td className="py-2 text-slate-700">0.827</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P20</td>
                                                    <td className="py-2 text-slate-700">0.630</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-4 text-slate-700">P10</td>
                                                    <td className="py-2 text-slate-700">0.433</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Card>

                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
