const Badge = ({ tone = 'ok', children }) => {
    const map = {
        ok: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        warn: 'bg-amber-100 text-amber-800 border-amber-200',
        bad: 'bg-rose-100 text-rose-700 border-rose-200',
        info: 'bg-sky-100 text-sky-700 border-sky-200'
    };
    return <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${map[tone]}`}>{children}</span>;
};

export default Badge;