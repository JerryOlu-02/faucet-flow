function coord(value: number) {
  return value.toFixed(2);
}

type FlowMeterProps = {
  claimAmount: string;
  symbol: string;
  cooldownSeconds: number;
  secondsRemaining: number;
};

export function FlowMeter({
  claimAmount,
  symbol,
  cooldownSeconds,
  secondsRemaining,
}: FlowMeterProps) {
  const size = 280;
  const center = size / 2;
  const radius = 108;
  const circumference = 2 * Math.PI * radius;

  const remaining =
    cooldownSeconds <= 0
      ? 0
      : Math.min(Math.max(secondsRemaining, 0), cooldownSeconds);

  const elapsed =
    cooldownSeconds <= 0 ? 1 : (cooldownSeconds - remaining) / cooldownSeconds;

  const drawn = elapsed * circumference;

  const ticks = Array.from({ length: 24 }, (_, hour) => {
    const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
    const inner = hour % 6 === 0 ? 86 : 92;
    const outer = 100;
    return {
      hour,
      x1: coord(center + Math.cos(angle) * inner),
      y1: coord(center + Math.sin(angle) * inner),
      x2: coord(center + Math.cos(angle) * outer),
      y2: coord(center + Math.sin(angle) * outer),
      major: hour % 6 === 0,
    };
  });

  const needleAngle = elapsed * Math.PI * 2 - Math.PI / 2;
  const needleInner = 74;
  const needleOuter = 96;
  const needleX1 = coord(center + Math.cos(needleAngle) * needleInner);
  const needleY1 = coord(center + Math.sin(needleAngle) * needleInner);
  const needleX = coord(center + Math.cos(needleAngle) * needleOuter);
  const needleY = coord(center + Math.sin(needleAngle) * needleOuter);

  return (
    <div className="ff-meter" aria-hidden="true">
      <svg viewBox={`0 0 ${size} ${size}`} className="ff-meter-svg">
        <circle className="ff-meter-track" cx={center} cy={center} r={radius} />
        <circle
          className="ff-meter-progress"
          cx={center}
          cy={center}
          r={radius}
          strokeDasharray={`${coord(drawn)} ${coord(circumference)}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
        {ticks.map((tick) => (
          <line
            key={tick.hour}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            className={tick.major ? "ff-tick ff-tick-major" : "ff-tick"}
          />
        ))}
        <line
          className="ff-needle"
          x1={needleX1}
          y1={needleY1}
          x2={needleX}
          y2={needleY}
        />
      </svg>
      <div className="ff-meter-readout">
        <p className="ff-meter-amount">{claimAmount}</p>
        <p className="ff-meter-unit">{symbol}</p>
      </div>
    </div>
  );
}
