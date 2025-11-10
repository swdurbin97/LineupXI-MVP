import React from 'react';
import pitchSvg from '../../assets/pitch.svg';
import { xyPercent } from '../../lib/coords';

interface FormationSlot {
  slot_id: string;
  slot_code: string;
  x: number;
  y: number;
}

interface Formation {
  code: string;
  name: string;
  slot_map: FormationSlot[];
}

interface FormationRendererProps {
  formation: Formation;
  interactive?: boolean;
  showLabels?: boolean;
  className?: string;
  targetHeight?: number;
  markerScale?: number;
}

/**
 * FormationRenderer - Shared component for rendering formations
 * Uses canonical coordinates from formations.json (105×68 pitch, bottom-left origin)
 * Renders identically to Lineup Builder's field visualization
 */
export default function FormationRenderer({
  formation,
  interactive = false,
  showLabels = true,
  className = '',
  targetHeight = 520,
  markerScale = 1.0
}: FormationRendererProps) {
  if (!formation?.slot_map) {
    return (
      <div className={`rounded-lg border bg-gray-50 flex items-center justify-center ${className}`}
           style={{ height: targetHeight }}>
        <p className="text-gray-500 text-sm">No formation data available</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ aspectRatio: '105 / 68' }}
    >
      <div className="absolute inset-0">
        {/* 1) Green gradient background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #198754 0%, #0f5132 100%)'
        }} />

        {/* 2) Pitch lines overlay */}
        <img
          src={pitchSvg}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          alt="Football pitch"
        />

        {/* 3) Formation markers */}
        {formation.slot_map.map((slot) => {
          // Use xyPercent() for consistent coordinate handling
          const { leftPct, topPct } = xyPercent(slot);

          return (
            <div
              key={slot.slot_id}
              className={`absolute ${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
                {/* Marker circle */}
                <div
                  className={`
                    rounded-full border-2 border-gray-900 flex items-center justify-center
                    ${slot.slot_code === 'GK' ? 'bg-gray-900' : 'bg-white'}
                  `}
                  style={{
                    width: `${32 * markerScale}px`,
                    height: `${32 * markerScale}px`,
                  }}
                >
                  {showLabels && (
                    <span
                      className={`
                        text-[10px] font-semibold
                        ${slot.slot_code === 'GK' ? 'text-white' : 'text-gray-900'}
                      `}
                    >
                      {slot.slot_code}
                    </span>
                  )}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
