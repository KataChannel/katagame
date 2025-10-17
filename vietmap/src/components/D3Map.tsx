'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ProvinceFeature {
  type: 'Feature';
  properties: {
    name: string;
    id?: string;
    source?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon' | 'Point';
    coordinates: number[][] | number[][][] | number[][][][];
  };
  id?: number;
}

interface VietnamGeoJSON {
  type: 'FeatureCollection';
  features: ProvinceFeature[];
}

interface D3MapProps {
  geoData: VietnamGeoJSON;
  selectedProvince: string | null;
  onProvinceClick: (provinceName: string) => void;
  onProvinceHover: (provinceName: string | null) => void;
  exploredProvinces: Set<string>;
}

export default function D3Map({ 
  geoData, 
  selectedProvince, 
  onProvinceClick, 
  onProvinceHover, 
  exploredProvinces 
}: D3MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !geoData) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Clear previous content
    svg.selectAll("*").remove();

    // Set up projection - optimized for Vietnam
    const projection = d3.geoMercator()
      .center([108.2772, 16.0583]) // Center of Vietnam
      .scale(2000)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create container group
    const container = svg
      .append('g')
      .attr('class', 'map-container');

    // Add zoom behavior with smooth transitions
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        container
          .transition()
          .duration(100)
          .attr('transform', event.transform);
      });

    svg.call(zoom);

    // Add provinces with smooth animations
    const provinces = container
      .selectAll('path')
      .data(geoData.features.filter(f => f.geometry.type !== 'Point'))
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('class', 'province')
      .style('cursor', 'pointer')
      .style('stroke', '#1e40af')
      .style('stroke-width', 1)
      .style('opacity', 0) // Start invisible for animation
      .style('fill', (d) => {
        const provinceName = d.properties.name;
        if (selectedProvince === provinceName) return '#fbbf24'; // Yellow for selected
        if (exploredProvinces.has(provinceName)) return '#34d399'; // Green for explored
        if (hoveredProvince === provinceName) return '#60a5fa'; // Light blue for hovered
        return '#93c5fd'; // Default blue
      })
      .style('fill-opacity', 0.7);

    // Initial entrance animation
    provinces
      .transition()
      .duration(1000)
      .delay((_d, i) => i * 20) // Stagger animation
      .style('opacity', 1);

    // Add event handlers
    provinces
      .on('mouseover', function(this: SVGPathElement, event: MouseEvent, d: ProvinceFeature) {
        const provinceName = d.properties.name;
        setHoveredProvince(provinceName);
        onProvinceHover(provinceName);
        
        // Enhanced visual feedback with smooth transition
        d3.select(this)
          .transition()
          .duration(200)
          .style('stroke-width', 3)
          .style('fill-opacity', 0.9)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');

        // Enhanced tooltip with better positioning
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'linear-gradient(135deg, #1e40af, #3b82f6)')
          .style('color', 'white')
          .style('padding', '12px 16px')
          .style('border-radius', '8px')
          .style('pointer-events', 'none')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .style('z-index', '1000')
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.2)')
          .style('opacity', 0)
          .html(`
            <div style="text-align: center;">
              <div style="font-size: 16px; margin-bottom: 4px;">🇻🇳 ${provinceName}</div>
              <div style="font-size: 12px; opacity: 0.9;">
                ${exploredProvinces.has(provinceName) ? '✅ Đã khám phá' : '🔍 Click để khám phá'}
              </div>
            </div>
          `);

        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .transition()
          .duration(200)
          .style('opacity', 1);
      })
      .on('mousemove', function(event: MouseEvent) {
        d3.select('.tooltip')
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(this: SVGPathElement, _event: MouseEvent, _d: ProvinceFeature) {
        setHoveredProvince(null);
        onProvinceHover(null);
        
        // Remove visual feedback with smooth transition
        d3.select(this)
          .transition()
          .duration(200)
          .style('stroke-width', 1)
          .style('fill-opacity', 0.7)
          .style('filter', 'none');

        // Remove tooltip with fade out
        d3.select('.tooltip')
          .transition()
          .duration(200)
          .style('opacity', 0)
          .remove();
      })
      .on('click', function(this: SVGPathElement, event: MouseEvent, d: ProvinceFeature) {
        event.stopPropagation();
        const provinceName = d.properties.name;
        
        // Add click animation
        d3.select(this)
          .transition()
          .duration(150)
          .style('transform', 'scale(1.05)')
          .transition()
          .duration(150)
          .style('transform', 'scale(1)');
        
        onProvinceClick(provinceName);
      });

    // Add province labels for selected/hovered provinces
    container
      .selectAll('text')
      .data(geoData.features.filter(f => {
        const name = f.properties.name;
        return f.geometry.type !== 'Point' && (selectedProvince === name || hoveredProvince === name);
      }))
      .enter()
      .append('text')
      .attr('class', 'province-label')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#1e40af')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px white')
      .attr('transform', (d) => {
        const centroid = path.centroid(d as any);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .text(d => d.properties.name);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', '#1e40af')
      .text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM');

    // Reset zoom button
    const resetButton = svg
      .append('g')
      .attr('class', 'reset-button')
      .style('cursor', 'pointer')
      .on('click', () => {
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
      });

    resetButton
      .append('rect')
      .attr('x', width - 80)
      .attr('y', 10)
      .attr('width', 60)
      .attr('height', 30)
      .attr('rx', 5)
      .style('fill', 'white')
      .style('stroke', '#ccc')
      .style('stroke-width', 1);

    resetButton
      .append('text')
      .attr('x', width - 50)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('🏠 Reset');

  }, [geoData, selectedProvince, hoveredProvince, onProvinceClick, onProvinceHover, exploredProvinces]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="border-2 border-blue-300 rounded-lg shadow-lg bg-white"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h4 className="font-bold text-sm mb-2">Chú thích:</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-300 border border-blue-600 mr-2 rounded"></div>
            <span>Tỉnh chưa khám phá</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 border border-blue-600 mr-2 rounded"></div>
            <span>Tỉnh đã khám phá</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 border border-blue-600 mr-2 rounded"></div>
            <span>Tỉnh đang chọn</span>
          </div>
        </div>
      </div>

      {/* Controls Help */}
      <div className="absolute top-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <h4 className="font-bold text-sm mb-2">Điều khiển:</h4>
        <div className="text-xs space-y-1">
          <div>• 🖱️ Click để khám phá tỉnh</div>
          <div>• 🔍 Scroll để zoom in/out</div>
          <div>• 🤏 Drag để di chuyển bản đồ</div>
          <div>• 🏠 Click Reset để về vị trí ban đầu</div>
        </div>
      </div>
    </div>
  );
}
