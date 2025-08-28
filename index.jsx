import jsPDF from 'jspdf';
import { Activity, AlertTriangle, Beaker, ChevronDown, Clock, Download, Gauge, HelpCircle, TrendingUp } from 'lucide-react';
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
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { resumen, kpis, curvaGran, ultimasMuestras, mockGranulometryData, curvaGranByPeriod } from './mock-data.js';


// ===== UI helpers =====
const ShiftSelector = ({ selectedShift, onShiftChange }) => (
    <div className="flex bg-slate-100 rounded-lg p-1" role="radiogroup" aria-label="Turnos">
        {['Todos','A','B','C','D'].map((shiftLetter) => (
            <button
                key={shiftLetter}
                onClick={() => onShiftChange(shiftLetter)}
                className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${
                    selectedShift === shiftLetter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
                {shiftLetter === 'Todos' ? 'Todos' : `Turno ${shiftLetter}`}
            </button>
        ))}
    </div>
);

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
        <div className="flex items-center justify-between p-5 pb-0">
            <div className="flex items-center gap-2">
                {icon}
                <h3 className="text-base font-semibold text-slate-800 truncate" title={title}>{title}</h3>
            </div>
            {action}
        </div>
        <div className="p-5">{children}</div>
    </div>
);

const AxisCaption = ({ yAxisLabel }) => (
    <div className="px-1 border-t border-slate-200 pt-2 mt-2">
        <div className="text-xs text-slate-500 space-y-1">
            <div>Eje Y: {yAxisLabel}</div>
            <div>Eje X: Tamaño (mm)</div>
        </div>
    </div>
);


export default function DashboardGranulometria() {
    const [activeTab, setActiveTab] = useState('ejecutiva');
    const [currentPage, setCurrentPage] = useState(1);
    const [timePeriod, setTimePeriod] = useState('24h'); // Default for Vista Ejecutiva
    const [selectedFormula, setSelectedFormula] = useState('swebrec');
    const [showFormulaDropdown, setShowFormulaDropdown] = useState(false);
    const [bucketSize, setBucketSize] = useState(20);
    const [normalizeByBinWidth, setNormalizeByBinWidth] = useState(false);
    const [showHistogramTooltip, setShowHistogramTooltip] = useState(false);
    const [shift, setShift] = useState('Todos');
    const dropdownRef = useRef(null);
    const histogramTooltipRef = useRef(null);

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

    // Handle tab change and set default time period per view
    useEffect(() => {
        if (activeTab === 'ejecutiva') {
            setTimePeriod('24h');
        } else if (activeTab === 'tecnica') {
            setTimePeriod('30d');
        }
    }, [activeTab]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFormulaDropdown(false);
            }
            if (histogramTooltipRef.current && !histogramTooltipRef.current.contains(event.target)) {
                setShowHistogramTooltip(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const generateHistogramData = (curve, buckets, normalizeByBinWidth = false) => {
        const maxSize = 76.20;
        const bucketWidth = maxSize / buckets;

        // alien: ensure curve is monotonic non-decreasing in pct before interpolation
        const sortedCurvaGran = [...curve].sort((a, b) => a.size - b.size);
        for (let i = 1; i < sortedCurvaGran.length; i++) {
            sortedCurvaGran[i].pct = Math.max(sortedCurvaGran[i].pct, sortedCurvaGran[i - 1].pct);
        }

        // Function to interpolate % passing at a given size using linear interpolation
        const interpolatePercentPassing = (targetSize) => {
            // Find the two points in sortedCurvaGran that bracket targetSize
            for (let i = 0; i < sortedCurvaGran.length - 1; i++) {
                const point1 = sortedCurvaGran[i];
                const point2 = sortedCurvaGran[i + 1];

                if (targetSize >= point1.size && targetSize <= point2.size) {
                    // Linear interpolation
                    const t = (targetSize - point1.size) / (point2.size - point1.size);
                    return point1.pct + t * (point2.pct - point1.pct);
                }
            }

            // If targetSize is outside the range, return boundary values
            if (targetSize <= sortedCurvaGran[0].size) return sortedCurvaGran[0].pct;
            if (targetSize >= sortedCurvaGran[sortedCurvaGran.length - 1].size) return sortedCurvaGran[sortedCurvaGran.length - 1].pct;

            return 0;
        };

        const histogramData = [];

        for (let i = 0; i < buckets; i++) {
            const bucketStart = i * bucketWidth;
            const bucketEnd = (i + 1) * bucketWidth;
            const bucketCenter = bucketStart + bucketWidth / 2;

            // Get % passing at start and end of bin
            const pctStart = interpolatePercentPassing(bucketStart);
            const pctEnd = interpolatePercentPassing(bucketEnd);

            // alien: removed Math.abs for correct calculation
            const diffPct = pctEnd - pctStart;
            let frequency;

            if (normalizeByBinWidth === false) {
                // Frecuencia: en porcentaje del 0–100
                frequency = diffPct;
            } else {
                // Densidad: probabilidad por mm
                frequency = (diffPct / 100) / bucketWidth;
            }

            histogramData.push({
                size: bucketCenter,
                frequency: frequency,
                range: `${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)}`
            });
        }

        return histogramData;
    };

    const histCurve = curvaGranByPeriod[timePeriod] || curvaGranByPeriod['24h'];
    const histogramData = generateHistogramData(histCurve, bucketSize, normalizeByBinWidth);

    // Get current granulometry data based on selected time period
    const getCurrentGranulometryData = () => {
        return mockGranulometryData[timePeriod] || mockGranulometryData['24h'];
    };

    const currentGranulometryData = getCurrentGranulometryData();

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
        doc.text(`• Última medición P80: ${kpis.p80Actual.toFixed(2)} mm`, 25, yPosition);
        yPosition += 8;
        doc.text(`• Última medición P50: ${kpis.p50Actual.toFixed(2)} mm`, 25, yPosition);
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
            ['P100', '75.0'],
            ['P90', '47.0'],
            ['P80', '40.0'],
            ['P70', '36.0'],
            ['P60', '32.0'],
            ['P50', '28.0'],
            ['P40', '25.0'],
            ['P30', '21.0'],
            ['P20', '16.0'],
            ['P10', '11.0']
        ];

        let xCol1 = 30, xCol2 = 80, xCol3 = 130, xCol4 = 180;

        doc.setFont('helvetica', 'bold');
        doc.text('Percentil', xCol1, yPosition);
        doc.text('Valor (mm)', xCol2, yPosition);
        doc.text('Percentil', xCol3, yPosition);
        doc.text('Valor (mm)', xCol4, yPosition);
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
                                            <div className="font-medium text-slate-800">{formula.name}</div>
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
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">Vista Ejecutiva: {getTimePeriodLabel()}</h2>
                                <Badge tone="info">Modo ejecutivo</Badge>
                            </div>

                            <div className="relative">
                                <div className="sticky top-2 z-20 flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setTimePeriod('30d')}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${timePeriod === '30d'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        30 días
                                    </button>
                                    <button
                                        onClick={() => setTimePeriod('7d')}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${timePeriod === '7d'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        7 días
                                    </button>
                                    <button
                                        onClick={() => setTimePeriod('24h')}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${timePeriod === '24h'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        24 horas
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* === KPIs / resumen === */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card title="Últimos 10 minutos" icon={<Gauge className="text-slate-500" size={18} />}>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">P80</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">{kpis.p80Actual.toFixed(2)} mm</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">P50</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-600">{kpis.p50Actual.toFixed(2)} mm</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <Card title="Últimos 30 días" icon={<Activity className="text-slate-500" size={18} />}>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">P80</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">{resumen.ult30d.p80.valor} {resumen.ult30d.p80.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">P50</span>
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
                                        <span className="text-sm text-slate-600">P80</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">{resumen.ult7d.p80.valor} {resumen.ult7d.p80.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">P50</span>
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
                                        <span className="text-sm text-slate-600">P80</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-600">{resumen.ult24h.p80.valor} {resumen.ult24h.p80.unidad}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">P50</span>
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

                        <Card title="Distribución granulométrica" icon={<TrendingUp className="text-slate-500" size={18} />} action={timePeriod === '24h' ? <ShiftSelector selectedShift={shift} onShiftChange={setShift} /> : null}>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={currentGranulometryData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis domain={[0, 55.9]} />
                                        <Legend />
                                        <Line type="monotone" dataKey="p80" name="P80" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        <Line type="monotone" dataKey="p50" name="P50" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>


                        <Card
                            title={normalizeByBinWidth ? "Histograma — Densidad por rango de tamaño" : "Histograma — Frecuencia por rango de tamaño"}
                            action={timePeriod === '24h' ? <ShiftSelector selectedShift={shift} onShiftChange={setShift} /> : null}>
                            <div className="mb-4 flex gap-2 items-center justify-end">
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setBucketSize(5)}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${bucketSize === 5
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        5 rangos
                                    </button>
                                    <button
                                        onClick={() => setBucketSize(10)}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${bucketSize === 10
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        10 rangos
                                    </button>
                                    <button
                                        onClick={() => setBucketSize(20)}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${bucketSize === 20
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        20 rangos
                                    </button>
                                </div>
                                <button
                                    onClick={() => setNormalizeByBinWidth(!normalizeByBinWidth)}
                                    className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${normalizeByBinWidth
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    {normalizeByBinWidth ? 'Densidad' : 'Frecuencia'}
                                </button>
                                <div className="relative" ref={histogramTooltipRef}>
                                    <button
                                        onClick={() => setShowHistogramTooltip(!showHistogramTooltip)}
                                        className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                        title="Información sobre el histograma"
                                        aria-label="Información sobre el histograma"
                                    >
                                        <HelpCircle className="text-slate-600" size={14} />
                                    </button>
                                    {showHistogramTooltip && (
                                        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-80 z-50" aria-live="polite">
                                            <div className="text-xs space-y-2">
                                                <div className="font-medium text-slate-800">Modos del histograma</div>
                                                <div className="text-slate-600">
                                                    <div>• <strong>Frecuencia (%):</strong> cuánta parte del material cae en cada rango. Suma 100%.</div>
                                                    <div className="mt-1">• <strong>Densidad:</strong> lo mismo, pero ajustado para que el total se conserve aunque cambies la cantidad de rangos. El área total = 1.</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={histogramData}
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            bottom: 10,
                                            left: 16
                                        }}
                                        barCategoryGap={0}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="size" type="number" domain={[0, 76.2]} tickFormatter={(v) => `${v.toFixed(1)} mm`} tickMargin={6} />
                                        <YAxis
                                            width={40}
                                        />
                                        <Tooltip
                                            formatter={(value) => [
                                                normalizeByBinWidth
                                                    ? `${value.toFixed(3)}`
                                                    : `${value.toFixed(1)}%`,
                                                normalizeByBinWidth ? 'Densidad (1/mm)' : 'Frecuencia'
                                            ]}
                                            labelFormatter={(size) => `Tamaño: ${size} mm`}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="frequency" name={normalizeByBinWidth ? 'Densidad' : 'Frecuencia (%)'} fill="#3b82f6" stroke="transparent" strokeWidth={0} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <AxisCaption yAxisLabel={normalizeByBinWidth ? 'Densidad (1/mm)' : 'Frecuencia (%)'} />
                        </Card>

                        <Card title={`Muestra ${currentPage} de 10`} icon={<AlertTriangle className="text-slate-500" size={18} />}>
                            <div className="space-y-1">
                                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                    <div className="w-full bg-slate-50 flex items-center justify-center gap-4 p-4">
                                        <img src="/raw.jpg" alt={`Muestra Raw ${currentPage}`} className="w-auto h-72 object-contain rotate-90 shadow-sm" />
                                        <img src="/muestra.jpg" alt={`Muestra ${currentPage}`} className="w-auto h-72 object-contain rotate-90 shadow-sm" />
                                    </div>
                                    <div className="p-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">{ultimasMuestras[currentPage - 1]?.fecha}</span>
                                            <Badge tone="info">P80: {ultimasMuestras[currentPage - 1]?.p80} mm</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                        aria-label="Página anterior"
                                    >
                                        Anterior
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 rounded-full text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${currentPage === page
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                aria-label={`Página ${page}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                                        disabled={currentPage === 10}
                                        className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                        aria-label="Página siguiente"
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
                                <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">Análisis técnico: {getTimePeriodLabel()}</h2>
                                <Badge tone="info">Modo experto</Badge>
                            </div>

                            <div className="relative">
                                <div className="sticky top-2 z-20 flex bg-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setTimePeriod('30d')}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${timePeriod === '30d'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        30 días
                                    </button>
                                    <button
                                        onClick={() => setTimePeriod('7d')}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${timePeriod === '7d'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        7 días
                                    </button>
                                    <button
                                        onClick={() => setTimePeriod('24h')}
                                        className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${timePeriod === '24h'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        24 horas
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Card Resumen */}
                            <Card title="Resumen curva granulométrica" icon={<Beaker className="text-slate-500" size={18} />} action={<ShiftSelector selectedShift={shift} onShiftChange={setShift} />}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Tabla Percent Passing */}
                                    <div>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-600 border-b">
                                                    <th className="py-2 pr-4">Percent Passing</th>
                                                    <th className="py-2">Value (mm)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P100</td>
                                                    <td className="py-2 text-slate-700">75.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P90</td>
                                                    <td className="py-2 text-slate-700">47.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P80</td>
                                                    <td className="py-2 text-slate-700">40.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P70</td>
                                                    <td className="py-2 text-slate-700">36.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P60</td>
                                                    <td className="py-2 text-slate-700">32.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P50</td>
                                                    <td className="py-2 text-slate-700">28.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P40</td>
                                                    <td className="py-2 text-slate-700">25.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P30</td>
                                                    <td className="py-2 text-slate-700">21.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P20</td>
                                                    <td className="py-2 text-slate-700">16.0</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-4 text-slate-700">P10</td>
                                                    <td className="py-2 text-slate-700">11.0</td>
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
                                                    <XAxis dataKey="size" type="number" domain={[0, 76.2]} tickFormatter={(v) => `${v.toFixed(1)} mm`} />
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
                            <Card title="Distribución granulométrica" icon={<Beaker className="text-slate-500" size={18} />} action={<ShiftSelector selectedShift={shift} onShiftChange={setShift} />}>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={currentGranulometryData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis domain={[0, 56]} />
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
                                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                            <div className="w-full bg-slate-50 space-y-2 p-4">
                                                <div className="flex justify-center">
                                                    <img src="/raw.jpg" alt={`Muestra Raw ${currentPage}`} className="max-w-full max-h-72 object-contain rotate-90 shadow-sm" />
                                                </div>
                                                <div className="flex justify-center">
                                                    <img src="/muestra.jpg" alt={`Muestra ${currentPage}`} className="max-w-full max-h-72 object-contain rotate-90 shadow-sm" />
                                                </div>
                                            </div>
                                            <div className="p-4 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">{ultimasMuestras[currentPage - 1]?.fecha}</span>
                                                    <Badge tone="info">P80: {ultimasMuestras[currentPage - 1]?.p80} mm</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Paginación */}
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                                aria-label="Página anterior"
                                            >
                                                Anterior
                                            </button>

                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: 10 }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-8 h-8 rounded-full text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${currentPage === page
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        aria-label={`Página ${page}`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
                                                disabled={currentPage === 10}
                                                className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                                aria-label="Página siguiente"
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
                                                    <XAxis dataKey="size" type="number" domain={[0, 76.2]} tickFormatter={(v) => `${v.toFixed(1)} mm`} />
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
                                                    <th className="py-2">Value (mm)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P100</td>
                                                    <td className="py-2 text-slate-700">75.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P90</td>
                                                    <td className="py-2 text-slate-700">47.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P80</td>
                                                    <td className="py-2 text-slate-700">40.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P70</td>
                                                    <td className="py-2 text-slate-700">36.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P60</td>
                                                    <td className="py-2 text-slate-700">32.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P50</td>
                                                    <td className="py-2 text-slate-700">28.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P40</td>
                                                    <td className="py-2 text-slate-700">25.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P30</td>
                                                    <td className="py-2 text-slate-700">21.0</td>
                                                </tr>
                                                <tr className="border-b">
                                                    <td className="py-2 pr-4 text-slate-700">P20</td>
                                                    <td className="py-2 text-slate-700">16.0</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-4 text-slate-700">P10</td>
                                                    <td className="py-2 text-slate-700">11.0</td>
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
