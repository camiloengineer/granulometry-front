const ShiftSelector = ({ selectedShift, onShiftChange }) => (
    <div className="flex gap-2 bg-slate-100 rounded-lg p-1 inline-block max-w-[250px]" role="radiogroup" aria-label="Turnos">
        {['Todos', 'A', 'B', 'C', 'D'].map((shiftLetter) => (
            <button
                key={shiftLetter}
                onClick={() => onShiftChange(shiftLetter)}
                className={`h-8 px-3 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 ${selectedShift === shiftLetter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
            >
                {shiftLetter === 'Todos' ? 'Todos' : `${shiftLetter}`}
            </button>
        ))}
    </div>
);

export default ShiftSelector;