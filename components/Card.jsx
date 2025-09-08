const Card = ({ title, icon, action, children, className = '', onClick }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`} onClick={onClick}>
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

export default Card;