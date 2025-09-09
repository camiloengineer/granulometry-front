import { Clock } from 'lucide-react';
import Card from './Card.jsx';

const CustomDateCard = ({
    setShowCustomRange,
    isSelected = false,
    customFromDate,
    customToDate,
    customFromTime,
    customToTime
}) => {
    const formatCustomRange = () => {
        if (!customFromDate || !customToDate) return null;
        return `${customFromDate} – ${customToDate}`;
    };

    const formatTimeRange = () => {
        return `${customFromTime} – ${customToTime}`;
    };

    return (
        <Card
            title={isSelected && customFromDate && customToDate ? formatCustomRange() : "Fecha personalizada"}
            icon={<Clock className="text-slate-500" size={18} />}
            className={`cursor-pointer transition-all duration-200 border ${isSelected
                ? '!bg-blue-50 !border-blue-300'
                : 'hover:bg-blue-50 hover:border-blue-300'
                }`}
            onClick={() => setShowCustomRange(true)}
        >
            <div className="space-y-3">
                {isSelected && customFromDate && customToDate ? (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Top 10%</span>
                            <div className="text-right">
                                <div className="text-lg font-bold text-yellow-700">74.20mm - 78.45mm</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">P80</span>
                            <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">42.5 mm</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">P50</span>
                            <div className="text-right">
                                <div className="text-lg font-bold text-purple-600">28.3 mm</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => setShowCustomRange(true)}
                            className="px-4 py-2 mt-6 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            Seleccionar Fecha
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CustomDateCard;