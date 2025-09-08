import Card from './Card.jsx';

const TimeCard = ({ period, title, icon, isActive, onClick, p80, p50 }) => (
    <Card
        title={title}
        icon={icon}
        className={`cursor-pointer transition-all duration-200 ${isActive
            ? 'bg-[hsl(210_40%_96%)] border-[hsl(213_27%_84%)] text-white shadow-md'
            : 'hover:bg-[hsl(210_40%_96%)] hover:border-[hsl(213_27%_84%)]'
            }`}
        onClick={() => onClick(period)}
    >
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className={`text-sm ${isActive ? 'text-blue-100' : 'text-slate-600'}`}>P80</span>
                <div className="text-right">
                    <div className={`text-lg font-bold ${isActive ? 'text-white' : 'text-blue-600'}`}>{p80} mm</div>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className={`text-sm ${isActive ? 'text-blue-100' : 'text-slate-600'}`}>P50</span>
                <div className="text-right">
                    <div className={`text-lg font-bold ${isActive ? 'text-white' : 'text-purple-600'}`}>{p50} mm</div>
                </div>
            </div>
        </div>
    </Card>
);

export default TimeCard;