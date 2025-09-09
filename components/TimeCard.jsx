import Card from './Card.jsx';

const TimeCard = ({ period, title, icon, isActive, onClick, p80, p50 }) => (
    <Card
        title={title}
        icon={icon}
        className={`cursor-pointer transition-all duration-200 border ${isActive
            ? '!bg-blue-50 !border-blue-300'
            : 'hover:bg-blue-50 hover:border-blue-300'
            }`}
        onClick={() => onClick(period)}
    >
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Top 10%</span>
                <div className="text-right">
                    <div className="text-lg font-bold text-gray-700">72.15mm - 79.83mm</div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">P80</span>
                <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{p80} mm</div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">P50</span>
                <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{p50} mm</div>
                </div>
            </div>
        </div>
    </Card>
);

export default TimeCard;