import jsPDF from 'jspdf';
import { Activity, AlertTriangle, Beaker, ChevronDown, Clock, Download, Gauge, HelpCircle, RefreshCcw, TrendingUp } from 'lucide-react';
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
import Badge from './components/Badge.jsx';
import Card from './components/Card.jsx';
import AxisCaption from './components/AxisCaption.jsx';
import CustomDateCard from './components/CustomDateCard.jsx';
import TimeCard from './components/TimeCard.jsx';




export default function DashboardGranulometria() {
    const [currentPage, setCurrentPage] = useState(1);
    const totalSamples = 20;
    const totalPages = totalSamples;
    const [timePeriod, setTimePeriod] = useState('10m');
    const [customDateSelected, setCustomDateSelected] = useState(false);
    const [showFormulaDropdown, setShowFormulaDropdown] = useState(false);
    const [bucketSize, setBucketSize] = useState(20);
    const [showHistogramTooltip, setShowHistogramTooltip] = useState(false);
    const [showDistributionTooltip, setShowDistributionTooltip] = useState(false);
    const [showCurveTooltip, setShowCurveTooltip] = useState(false);
    const [shift, setShift] = useState('Todos');
    const [showCustomRange, setShowCustomRange] = useState(false);
    const [showMonthDropdown, setShowMonthDropdown] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('Seleccionar periodo');
    const [customFromDate, setCustomFromDate] = useState(() => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const day = String(lastMonth.getDate()).padStart(2, '0');
        const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
        const year = lastMonth.getFullYear();
        return `${day}/${month}/${year}`;
    });
    const [customToDate, setCustomToDate] = useState(() => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
    });
    const [customFromTime, setCustomFromTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [customToTime, setCustomToTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));
    const [customShift, setCustomShift] = useState('Todos');
    const [dateRangeError, setDateRangeError] = useState('');
    const dropdownRef = useRef(null);
    const histogramTooltipRef = useRef(null);
    const distributionTooltipRef = useRef(null);
    const curveTooltipRef = useRef(null);
    const monthDropdownRef = useRef(null);

    const estadoP80 = kpis.p80Actual <= kpis.p80Meta + 0.2 ? 'ok' : 'bad';

    // Handle click outside to close tooltips
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (distributionTooltipRef.current && !distributionTooltipRef.current.contains(event.target)) {
                setShowDistributionTooltip(false);
            }
            if (curveTooltipRef.current && !curveTooltipRef.current.contains(event.target)) {
                setShowCurveTooltip(false);
            }
            if (histogramTooltipRef.current && !histogramTooltipRef.current.contains(event.target)) {
                setShowHistogramTooltip(false);
            }
        };

        if (showDistributionTooltip || showCurveTooltip || showHistogramTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDistributionTooltip, showCurveTooltip, showHistogramTooltip]);

    const handleCustomDateSearch = () => {
        if (!customFromDate || !customToDate) {
            setDateRangeError('Por favor selecciona las fechas desde y hasta');
            return;
        }

        // Convert dd/mm/yyyy to yyyy-mm-dd for Date constructor
        const convertToISO = (dateStr) => {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month}-${day}`;
        };

        const fromDateTime = new Date(convertToISO(customFromDate) + (customFromTime ? `T${customFromTime}` : 'T00:00'));
        const toDateTime = new Date(convertToISO(customToDate) + (customToTime ? `T${customToTime}` : 'T23:59'));

        if (isNaN(fromDateTime.getTime()) || isNaN(toDateTime.getTime())) {
            setDateRangeError('Las fechas seleccionadas no son válidas');
            return;
        }

        if (fromDateTime > toDateTime) {
            setDateRangeError('La fecha desde debe ser anterior a la fecha hasta');
            return;
        }

        setDateRangeError('');
        setShowCustomRange(false);
        setCustomDateSelected(true);
        setTimePeriod('');
    };

    const handleDownloadCustomReport = () => {
        generatePDF('custom');
    };

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
            // Frecuencia: en porcentaje del 0–100
            const frequency = diffPct;

            histogramData.push({
                size: bucketCenter,
                frequency: frequency,
                range: `${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)}`
            });
        }

        return histogramData;
    };

    const histCurve = curvaGranByPeriod[timePeriod] || curvaGranByPeriod['24h'];
    const histogramData = generateHistogramData(histCurve, bucketSize, false);

    // Generate timeline labels for Ejecutiva based on period
    const asExecTimeline = (series, period) => {
        let targetLength, labelGenerator;

        switch (period) {
            case '10m':
                targetLength = 10; // Keep 10 points for line visibility
                labelGenerator = (i) => `Min ${i + 1}`;
                break;
            case '6h':
                targetLength = 36; // 6h * 6 points per hour (every 10 min)
                labelGenerator = (i) => {
                    const totalMinutes = i * 10;
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                };
                break;
            case '24h':
                targetLength = 24;
                labelGenerator = (i) => `Hora ${i + 1}`;
                break;
            case '30d':
                targetLength = 30;
                labelGenerator = (i) => `Día ${i + 1}`;
                break;
            default:
                targetLength = 24;
                labelGenerator = (i) => `Hora ${i + 1}`;
        }

        // Normalize series to target length
        const normalizedSeries = [];
        const sourceLength = series.length;

        if (period === '10m') {
            // For 10m period, create a line break at minute 5 showing single detection
            const centralItem = series[Math.floor(sourceLength / 2)];
            const p80Detection = centralItem.pct * 0.8;
            const p50Detection = centralItem.pct * 0.5;

            // Create baseline values (before detection)
            const p80Baseline = p80Detection * 0.85; // Slightly lower baseline
            const p50Baseline = p50Detection * 0.85;

            for (let i = 0; i < targetLength; i++) {
                normalizedSeries.push({
                    time: labelGenerator(i),
                    p80: i < 4 ? p80Baseline : p80Detection, // Break at minute 5 (index 4)
                    p50: i < 4 ? p50Baseline : p50Detection
                });
            }
        } else {
            for (let i = 0; i < targetLength; i++) {
                const sourceIndex = Math.floor((i * sourceLength) / targetLength);
                const item = series[Math.min(sourceIndex, sourceLength - 1)];

                normalizedSeries.push({
                    time: labelGenerator(i),
                    p80: item.pct * 0.8,
                    p50: item.pct * 0.5
                });
            }
        }

        return normalizedSeries;
    };

    // Get current granulometry data based on selected time period
    const getCurrentGranulometryData = () => {
        if (customDateSelected) {
            // Use 30d data for custom date selections
            return asExecTimeline(curvaGranByPeriod['30d'], '30d');
        }

        // Use curvaGranByPeriod data with proper timeline processing
        const baseSeries = curvaGranByPeriod[timePeriod] || curvaGranByPeriod['24h'];
        return asExecTimeline(baseSeries, timePeriod || '24h');
    };

    // Generate date/time range string based on current period
    const getDateTimeRange = () => {
        const now = new Date();
        let fromDate;

        // For custom date selection, use custom dates if selected
        if (customDateSelected && customFromDate && customToDate) {
            const convertToISO = (dateStr) => {
                const [day, month, year] = dateStr.split('/');
                return `${year}-${month}-${day}`;
            };
            const customFrom = new Date(convertToISO(customFromDate) + (customFromTime ? `T${customFromTime}` : 'T00:00'));
            const customTo = new Date(convertToISO(customToDate) + (customToTime ? `T${customToTime}` : 'T23:59'));
            return `${customFrom.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} – ${customTo.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
        }

        switch (timePeriod) {
            case '10m':
                fromDate = new Date(now.getTime() - 10 * 60 * 1000);
                break;
            case '6h':
                fromDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
                break;
            case '24h':
                fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            default:
                fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
        }

        return `${fromDate.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} – ${now.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
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
        doc.text(`• Fórmula utilizada: Swebrec`, 25, yPosition);
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



    return (
        <div className="min-h-screen bg-slate-50">

            <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">

                <>
                    {/* Período activo */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">Monitoreo de granulometría</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center px-3 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors min-h-[40px]"
                                title="Actualizar datos"
                            >
                                <RefreshCcw size={16} />
                            </button>
                            <button
                                onClick={() => generatePDF('30d')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <Download size={16} />
                                Descargar Reporte
                            </button>
                        </div>
                    </div>

                    {/* === KPIs / resumen === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <TimeCard
                            period="10m"
                            title="Últimos 10 minutos"
                            icon={<Gauge className="text-slate-500" size={18} />}
                            isActive={timePeriod === '10m'}
                            onClick={(period) => {
                                setTimePeriod(period);
                                setCustomDateSelected(false);
                            }}
                            p80={kpis.p80Actual.toFixed(2)}
                            p50={kpis.p50Actual.toFixed(2)}
                        />
                        <TimeCard
                            period="6h"
                            title="Últimas 6 horas"
                            icon={<Activity className="text-slate-500" size={18} />}
                            isActive={timePeriod === '6h'}
                            onClick={(period) => {
                                setTimePeriod(period);
                                setCustomDateSelected(false);
                            }}
                            p80={resumen.ult24h.p80.valor}
                            p50={resumen.ult24h.p50.valor}
                        />
                        <TimeCard
                            period="24h"
                            title="Últimas 24 horas"
                            icon={<Clock className="text-slate-500" size={18} />}
                            isActive={timePeriod === '24h'}
                            onClick={(period) => {
                                setTimePeriod(period);
                                setCustomDateSelected(false);
                            }}
                            p80={resumen.ult24h.p80.valor}
                            p50={resumen.ult24h.p50.valor}
                        />
                        <CustomDateCard
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            showMonthDropdown={showMonthDropdown}
                            setShowMonthDropdown={setShowMonthDropdown}
                            setShowCustomRange={setShowCustomRange}
                            generatePDF={generatePDF}
                            showDownloadButton={true}
                            monthDropdownRef={monthDropdownRef}
                            isSelected={customDateSelected}
                            customFromDate={customFromDate}
                            customToDate={customToDate}
                            customFromTime={customFromTime}
                            customToTime={customToTime}
                        />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="text-slate-500" size={18} />
                        <h3 className="text-lg font-semibold text-slate-800">Distribución granulométrica:</h3>
                        <h3 className="text-md text-slate-700">{getDateTimeRange()}</h3>
                    </div>

                    <Card>
                        <div className="flex items-center justify-between mb-2">
                            <div className="relative" ref={distributionTooltipRef}>
                                <button
                                    onClick={() => setShowDistributionTooltip(!showDistributionTooltip)}
                                    className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                    title="Información sobre distribución granulométrica"
                                    aria-label="Información sobre distribución granulométrica"
                                >
                                    <HelpCircle className="text-slate-600" size={14} />
                                </button>
                                {showDistributionTooltip && (
                                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-80 z-50" aria-live="polite">
                                        <div className="text-xs space-y-2">
                                            <div className="font-medium text-slate-800">Distribución granulométrica</div>
                                            <div className="text-slate-600">
                                                <div>Muestra la evolución temporal de los percentiles P80 y P50, indicadores clave del tamaño de partículas en el material procesado.</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={currentGranulometryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis domain={[0, 55.9]} tickFormatter={(v) => `${v} mm`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="p80" name="P80" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="p50" name="P50" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <AxisCaption yAxisLabel="Tamaño de partícula (mm)" xAxisLabel="Tiempo transcurrido" />
                    </Card>

                    <div className="flex items-center gap-2 mb-3">
                        <Beaker className="text-slate-500" size={18} />
                        <h3 className="text-lg font-semibold text-slate-800">Curva granulométrica</h3>
                    </div>

                    <Card>
                        <div className="flex items-center justify-end mb-2">
                            <div className="relative" ref={curveTooltipRef}>
                                <button
                                    onClick={() => setShowCurveTooltip(!showCurveTooltip)}
                                    className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                    title="Información sobre curva granulométrica"
                                    aria-label="Información sobre curva granulométrica"
                                >
                                    <HelpCircle className="text-slate-600" size={14} />
                                </button>
                                {showCurveTooltip && (
                                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-80 z-50" aria-live="polite">
                                        <div className="text-xs space-y-2">
                                            <div className="font-medium text-slate-800">Curva granulométrica</div>
                                            <div className="text-slate-600">
                                                <div>Representa el porcentaje acumulado de material que pasa por cada tamaño, fundamental para caracterizar la distribución del tamaño de partículas.</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Badge tone="info">Fórmula Swebrec</Badge>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Curva granulométrica */}
                            <div>
                                <div className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={curvaGran} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="size" type="number" domain={[0, 76.2]} tickFormatter={(v) => `${v.toFixed(1)} mm`} />
                                            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                            <Legend />
                                            <Line type="monotone" dataKey="pct" name="Curva de tamaño de partículas" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                                            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "P80", position: "topLeft" }} />
                                            <ReferenceLine y={50} stroke="#7c3aed" strokeDasharray="5 5" label={{ value: "P50", position: "topLeft" }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

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
                        </div>
                        <AxisCaption yAxisLabel="Porcentaje que pasa (%)" />
                    </Card>

                    <div className="flex items-center gap-2 mb-3">
                        <Gauge className="text-slate-500" size={18} />
                        <h3 className="text-lg font-semibold text-slate-800">Histograma</h3>
                    </div>

                    <Card>
                        <div className="mb-3 flex gap-2 items-center justify-end">
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
                                            <div className="font-medium text-slate-800">Histograma</div>
                                            <div className="text-slate-600">
                                                <div>El histograma muestra la distribución granulométrica del material, indicando cuánta parte del total cae en cada rango de tamaño. La suma de todas las frecuencias es 100%.</div>
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
                                        tickFormatter={(v) => `${v}%`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [
                                            `${value.toFixed(1)}%`
                                        ]}
                                        labelFormatter={(size) => `${size} mm`}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="frequency" name="Frecuencia (%)" fill="#3b82f6" stroke="transparent" strokeWidth={0} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <AxisCaption yAxisLabel="Frecuencia (%)" />
                    </Card>

                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-slate-500" size={18} />
                        <h3 className="text-lg font-semibold text-slate-800">Muestras fotográficas</h3>
                    </div>

                    <Card>
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
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                        aria-label="Primera página"
                                        title="Primera página"
                                    >
                                        ««
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                        aria-label="Página anterior"
                                    >
                                        Anterior
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const pages = [];
                                        const showEllipsis = totalPages > 7;

                                        if (!showEllipsis) {
                                            // Show all pages if 7 or fewer
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i)}
                                                        className={`w-8 h-8 rounded-full text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${currentPage === i
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        aria-label={`Página ${i}`}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            }
                                        } else {
                                            // Smart pagination with ellipsis
                                            // Always show first page
                                            pages.push(
                                                <button
                                                    key={1}
                                                    onClick={() => setCurrentPage(1)}
                                                    className={`w-8 h-8 rounded-full text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${currentPage === 1
                                                        ? 'bg-slate-900 text-white'
                                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    aria-label="Página 1"
                                                >
                                                    1
                                                </button>
                                            );

                                            // Show ellipsis if current page is far from start
                                            if (currentPage > 4) {
                                                pages.push(
                                                    <span key="start-ellipsis" className="px-2 text-slate-400">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            // Show pages around current page
                                            const start = Math.max(2, currentPage - 1);
                                            const end = Math.min(totalPages - 1, currentPage + 1);

                                            for (let i = start; i <= end; i++) {
                                                if (i !== 1 && i !== totalPages) {
                                                    pages.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => setCurrentPage(i)}
                                                            className={`w-8 h-8 rounded-full text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${currentPage === i
                                                                ? 'bg-slate-900 text-white'
                                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                                }`}
                                                            aria-label={`Página ${i}`}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }
                                            }

                                            // Show ellipsis if current page is far from end
                                            if (currentPage < totalPages - 3) {
                                                pages.push(
                                                    <span key="end-ellipsis" className="px-2 text-slate-400">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            // Always show last page
                                            if (totalPages > 1) {
                                                pages.push(
                                                    <button
                                                        key={totalPages}
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        className={`w-8 h-8 rounded-full text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${currentPage === totalPages
                                                            ? 'bg-slate-900 text-white'
                                                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        aria-label={`Página ${totalPages}`}
                                                    >
                                                        {totalPages}
                                                    </button>
                                                );
                                            }
                                        }

                                        return pages;
                                    })()}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                        aria-label="Página siguiente"
                                    >
                                        Siguiente
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="h-8 px-3 rounded-md border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300"
                                        aria-label="Última página"
                                        title="Última página"
                                    >
                                        »»
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>

            </main>

            {/* Sidebar: Fecha personalizada */}
            {showCustomRange && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-slate-900/30 z-40"
                        onClick={() => setShowCustomRange(false)}
                    />

                    {/* Sidebar */}
                    <aside
                        className="fixed right-0 top-0 h-screen w-[460px] bg-white shadow-xl border-l z-50 flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="custom-date-title"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 pb-0 mb-6">
                            <h2 id="custom-date-title" className="text-lg font-semibold text-slate-800">
                                Fecha personalizada
                            </h2>
                            <button
                                onClick={() => setShowCustomRange(false)}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                                aria-label="Cerrar"
                            >
                                ×
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-4">
                            <div className="space-y-4">
                                {/* Date Fields - One below the other */}
                                <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                        <label htmlFor="fecha-desde" className="block text-sm font-medium text-slate-700 mb-1">
                                            Fecha desde
                                        </label>
                                        <input
                                            id="fecha-desde"
                                            type="text"
                                            placeholder="dd/mm/yyyy"
                                            value={customFromDate}
                                            onChange={(e) => {
                                                setCustomFromDate(e.target.value);
                                                setDateRangeError('');
                                            }}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${dateRangeError ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="hora-desde" className="block text-sm font-medium text-slate-700 mb-1">
                                            Hora desde
                                        </label>
                                        <input
                                            id="hora-desde"
                                            type="time"
                                            step="60"
                                            value={customFromTime}
                                            onChange={(e) => setCustomFromTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="fecha-hasta" className="block text-sm font-medium text-slate-700 mb-1">
                                            Fecha hasta
                                        </label>
                                        <input
                                            id="fecha-hasta"
                                            type="text"
                                            placeholder="dd/mm/yyyy"
                                            value={customToDate}
                                            onChange={(e) => {
                                                setCustomToDate(e.target.value);
                                                setDateRangeError('');
                                            }}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${dateRangeError ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="hora-hasta" className="block text-sm font-medium text-slate-700 mb-1">
                                            Hora hasta
                                        </label>
                                        <input
                                            id="hora-hasta"
                                            type="time"
                                            step="60"
                                            value={customToTime}
                                            onChange={(e) => setCustomToTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer with CTAs */}
                        <div className="sticky bottom-0 bg-white border-t p-4 space-y-3">
                            <div className="flex justify-center">
                                <button
                                    onClick={handleCustomDateSearch}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </aside>
                </>
            )}
        </div>
    );
}
