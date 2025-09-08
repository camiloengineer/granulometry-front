const Card = ({ title, icon, action, children, className = '', onClick }) => {
    const hasHeader = Boolean(title) || Boolean(icon) || Boolean(action);
    return (
        <div className={`h-full bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`} onClick={onClick}>
            {hasHeader && (
                <div className="flex items-center justify-between px-5 pt-4 pb-1">
                    <div className="flex items-center gap-2 min-h-[1.75rem]">
                        {icon}
                        {title && (
                            <h3 className="text-base font-semibold text-slate-800 truncate" title={title}>{title}</h3>
                        )}
                    </div>
                    {action}
                </div>
            )}
            <div className={`px-5 ${hasHeader ? 'pb-5' : 'py-5'}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;
