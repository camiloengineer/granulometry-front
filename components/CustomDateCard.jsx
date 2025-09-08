import { Clock } from 'lucide-react';
import Card from './Card.jsx';

const CustomDateCard = ({ setShowCustomRange, isSelected = false }) => (
    <Card 
        title="Fecha personalizada" 
        icon={<Clock className="text-slate-500" size={18} />}
        className={`cursor-pointer transition-all duration-200 ${isSelected
            ? 'bg-blue-50 border-blue-300'
            : 'hover:bg-blue-50 hover:border-blue-300'
        }`}
    >
        <div className="space-y-3">
            <div className="flex items-center justify-center">
                <button
                    onClick={() => setShowCustomRange(true)}
                    className="px-4 mt-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                    Seleccionar Fecha
                </button>
            </div>
        </div>
    </Card>
);

export default CustomDateCard;