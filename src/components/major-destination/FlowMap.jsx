import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, useMapContext } from "react-simple-maps";

// Coordinates for countries (approximate)
const countryCoords = {
  philippines: [122.0, 12.5],
  usa: [-98.0, 39.0],
  canada: [-100.0, 58.0],
  australia: [135.0, -27.0],
  italy: [12.5, 42.8],
  united_kingdom: [-2.0, 54.0],
  germany: [10.5, 51.0],
  japan: [138.0, 37.0],
  new_zealand: [174.0, -41.0],
  south_korea: [127.5, 37.0],
  spain: [-3.7, 40.4],
};

const countryFlags = {
  usa: "🇺🇸",
  canada: "🇨🇦",
  australia: "🇦🇺",
  italy: "🇮🇹",
  united_kingdom: "🇬🇧",
  germany: "🇩🇪",
  japan: "🇯🇵",
  new_zealand: "🇳🇿",
  south_korea: "🇰🇷",
  spain: "🇪🇸"
};

const countryColors = {
  usa: "#2563eb",
  canada: "#22d3ee",
  australia: "#f59e42",
  italy: "#f87171",
  united_kingdom: "#a78bfa",
  germany: "#10b981",
  japan: "#fbbf24",
  new_zealand: "#6366f1",
  south_korea: "#e11d48",
  spain: "#facc15"
};

const majorCountries = [
  "usa",
  "canada",
  "australia",
  "italy",
  "united_kingdom",
  "germany",
  "japan",
  "new_zealand",
  "south_korea",
  "spain"
];

const countryLabels = {
  usa: "USA",
  canada: "Canada",
  australia: "Australia",
  italy: "Italy",
  united_kingdom: "UK",
  germany: "Germany",
  japan: "Japan",
  new_zealand: "New Zealand",
  south_korea: "South Korea",
  spain: "Spain"
};

function MarkerTooltip({ x, y, name, flag }) {
  // Adjust tooltip position if near the left/top edge
  let fx = x - 60;
  let fy = y - 60;
  if (fx < 10) fx = x + 10; // shift right if too far left
  if (fy < 10) fy = y + 10; // shift down if too far up

  return (
    <foreignObject x={fx} y={fy} width={120} height={40}>
      <div
        style={{
          background: "white",
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 10,
          fontWeight: 100,
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          pointerEvents: "none"
        }}
      >
        <span style={{ fontSize: 22 }}>{flag}</span>
        <span>{name}</span>
      </div>
    </foreignObject>
  );
}

// This component must be rendered INSIDE <ComposableMap>
function MapMarkersAndArrows({ origin, hoveredCountry, setHoveredCountry, totals }) {
  const { projection } = useMapContext();

  // Arrows
  const arrows = majorCountries.map((country) => {
    const dest = countryCoords[country];
    if (!dest) return null;
    const thickness = 2;
    const [x1, y1] = projection(origin);
    const [x2, y2] = projection(dest);
    const curvature = 0.25;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx = (x1 + x2) / 2 - dy * curvature;
    const cy = (y1 + y2) / 2 + dx * curvature;
    const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
    return (
      <path
        key={`line-${country}`}
        d={d}
        fill="none"
        stroke="#a1a1a1ff"
        strokeWidth={thickness}
        opacity={1}
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
    );
  });

  // Origin marker
  const originMarker = (
    <Marker coordinates={origin}>
      <circle r={8} fill="#dc2626" stroke="#fff" strokeWidth={2} />
      <circle r={3} fill="#fff" />
      <text 
        textAnchor="middle" 
        y={-15} 
        style={{ 
          fontSize: 10, 
          fontWeight: 700,
          fill: "#1f2937"
        }}
      >
        Philippines
      </text>
    </Marker>
  );

  // Tooltip for hovered country (show at centroid)
  let tooltip = null;
  if (hoveredCountry && countryCoords[hoveredCountry]) {
    const [mx, my] = projection(countryCoords[hoveredCountry]);
    tooltip = (
      <MarkerTooltip
        x={mx}
        y={my}
        name={countryLabels[hoveredCountry]}
        flag={countryFlags[hoveredCountry]}
      />
    );
  }

  return (
    <>
      {arrows}
      {originMarker}
      {tooltip}
    </>
  );
}

export default function FlowMap({ totals }) {
  const origin = countryCoords.philippines;
  const [hoveredCountry, setHoveredCountry] = useState(null);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Philippine Migration Flow Map</h2>
            <p className="text-gray-600">Major destination countries for Filipino emigrants</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 140, center: [60, 20] }}
              width={800}
              height={450}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name?.toLowerCase();
                    // Find the country key if it's a major destination
                    const countryKey = majorCountries.find(c => {
                      const label = countryLabels[c]?.toLowerCase();
                      return countryName?.includes(c.replace('_', ' ')) || 
                             label === countryName ||
                             (c === 'usa' && countryName?.includes('united states')) ||
                             (c === 'united_kingdom' && countryName?.includes('united kingdom'));
                    });
                    const isHighlighted = !!countryKey;
                    const fillColor = isHighlighted ? countryColors[countryKey] : "#d1d5db";
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke="#fff"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", filter: "brightness(1.1)" },
                          pressed: { outline: "none" }
                        }}
                        onMouseEnter={() => {
                          if (countryKey) setHoveredCountry(countryKey);
                        }}
                        onMouseLeave={() => {
                          if (countryKey) setHoveredCountry(null);
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,8 L8,4 z" fill="#a1a1a1ff" />
                </marker>
              </defs>

              <MapMarkersAndArrows
                origin={origin}
                hoveredCountry={hoveredCountry}
                setHoveredCountry={setHoveredCountry}
                totals={totals}
              />
            </ComposableMap>
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            {majorCountries.map((country) => {
              const value = totals?.[country] || 0;
              return (
                <div key={country} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: countryColors[country] }}
                  ></div>
                  <span className="font-medium text-gray-700">
                    {countryLabels[country]}
                <span className="text-gray-500 text-xs ml-2">
                    {value ? value.toLocaleString() : '-'}
                </span>
                </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}