'use client';

import { useEffect, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { feature } from 'topojson-client';
import type { Alert } from '@/types/alerts';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type GeoFeature = {
  rsmKey: string;
  properties: {
    ISO_A3: string;
    name: string;
  };
};

export default function WorldMap({ alerts }: { alerts: Alert[] }) {
  const [geographies, setGeographies] = useState<GeoFeature[]>([]);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // 聚合每个国家的错误信息
  const countryStatsMap: Record<
    string,
    { count: number; devices: string[]; severities: string[] }
  > = {};

  alerts.forEach(({ tags }) => {
    const country = tags.country;
    if (!countryStatsMap[country]) {
      countryStatsMap[country] = {
        count: 0,
        devices: [],
        severities: [],
      };
    }
    countryStatsMap[country].count++;
    countryStatsMap[country].devices.push(tags.device);
    countryStatsMap[country].severities.push(tags.severity);
  });

  const colorScale = scaleLinear<string>()
    .domain([0, Math.max(...Object.values(countryStatsMap).map((d) => d.count))])
    .range(['#ffe5e5', '#990000']);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((topology) => {
        const geoData = feature(topology, topology.objects.countries) as any;
        setGeographies(geoData.features);
      });
  }, []);

  const handleMouseMove = (
    event: React.MouseEvent<SVGPathElement, MouseEvent>,
    countryName: string
  ) => {
    const data = countryStatsMap[countryName];
    if (!data) {
      setTooltipContent(null);
      return;
    }

    const deviceSummary = [...new Set(data.devices)].join(', ');
    const severitySummary = [...new Set(data.severities)].join(', ');

    setTooltipContent(
      `${countryName}
Errors: ${data.count}
Devices: ${deviceSummary}
Severity: ${severitySummary}`
    );

    const container = mapContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    setMousePosition({
      x: event.clientX - rect.left + 10,
      y: event.clientY - rect.top + 10,
    });
  };

  return (
    <div className="mt-10 relative">
      <h2 className="text-xl font-semibold mb-4 text-center">Impact Map (by Country)</h2>
      <div
        ref={mapContainerRef}
        className="mx-auto w-full max-w-3xl border rounded-xl shadow bg-white p-4 relative"
      >
        <ComposableMap projectionConfig={{ scale: 150 }}>
          <Geographies geography={geographies}>
            {({ geographies }: { geographies: GeoFeature[] }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const data = countryStatsMap[countryName];
                const count = data?.count || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={count > 0 ? colorScale(count) : '#EEE'}
                    stroke="#999"
                    onMouseMove={(e: React.MouseEvent<SVGPathElement, MouseEvent>) => handleMouseMove(e, countryName)}
                    onMouseLeave={() => setTooltipContent(null)}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        outline: 'none',
                        cursor: data ? 'pointer' : 'default',
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltipContent && (
          <div
            className="absolute z-50 text-sm whitespace-pre bg-white border shadow px-3 py-2 rounded"
            style={{
              top: mousePosition.y,
              left: mousePosition.x,
              pointerEvents: 'none',
              maxWidth: '240px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
    </div>
  );
}
