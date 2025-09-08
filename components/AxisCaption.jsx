const AxisCaption = ({ yAxisLabel, xAxisLabel = "Tamaño (mm)" }) => (
    <div className="px-1 border-t border-slate-200 pt-2 mt-2">
        <div className="text-xs text-slate-500 space-y-1">
            <div>Eje Y: {yAxisLabel}</div>
            <div>Eje X: {xAxisLabel}</div>
        </div>
    </div>
);

export default AxisCaption;