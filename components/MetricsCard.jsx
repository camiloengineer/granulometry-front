import { Clock, Calendar, CalendarDays } from 'lucide-react';
import Card from './Card';

const timeConfigs = {
    '10min': {
        title: 'Últimos 10 minutos',
        icon: <Clock className="text-slate-500" size={18} />,
        key: 'ult10min'
    },
    '6h': {
        title: 'Últimas 6 horas', 
        icon: <Clock className="text-slate-500" size={18} />,
        key: 'ult6h'
    },
    '24h': {
        title: 'Últimas 24 horas',
        icon: <Clock className="text-slate-500" size={18} />,
        key: 'ult24h'
    },
    '7d': {
        title: 'Últimos 7 días',
        icon: <Calendar className="text-slate-500" size={18} />,
        key: 'ult7d'
    },
    '30d': {
        title: 'Últimos 30 días',
        icon: <CalendarDays className="text-slate-500" size={18} />,
        key: 'ult30d'
    }
};

const MetricsCard = ({ period, resumen }) => {
    const config = timeConfigs[period];
    const data = resumen[config.key];
    
    return (
        <Card title={config.title} icon={config.icon}>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">P80</span>
                    <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{data.p80.valor} {data.p80.unidad}</div>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">P50</span>
                    <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{data.p50.valor} {data.p50.unidad}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default MetricsCard;