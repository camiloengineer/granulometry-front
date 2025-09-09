import Card from './Card.jsx';
import Badge from './Badge.jsx';

const TimeCard = ({ period, title, icon, isActive, onClick, p80, p50, top }) => (
    <Card
        title={title}
        icon={icon}
        className={`cursor-pointer transition-all duration-200 ${isActive
            ? 'bg-[hsl(214_100%_97%)] border-[hsl(212_96%_78%)]'
            : 'hover:bg-blue-50 hover:border-blue-300'
            }`}
        onClick={() => onClick(period)}
    >
        <div className="flex items-center justify-end mb-3">
            <Badge tone="info">top: {top}mm</Badge>
        </div>
        <div className="space-y-3">
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