"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Canvg } from "canvg";
import { RotateCcw } from "lucide-react";

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function renderCurvedText({
  text,
  cx,
  cy,
  r,
  startAngle,
  endAngle,
  fontSize,
  letterSpacing = 0,
  isBottom = false,
  fontFamily = 'Arial, sans-serif',
  fill = '#000000',
}: {
  text: string;
  cx: number;
  cy: number;
  r: number;
  startAngle: number;
  endAngle: number;
  fontSize: number;
  letterSpacing?: number;
  isBottom?: boolean;
  fontFamily?: string;
  fill?: string;
}) {
  const chars = text.split("");
  const angleRange = endAngle - startAngle;
  const deltaAngle = angleRange / Math.max(chars.length - 1, 1);
  return chars.map((char, i) => {
    const angle = isBottom
      ? endAngle - i * deltaAngle
      : startAngle + i * deltaAngle;
    const { x, y } = polarToCartesian(cx, cy, r, angle);
    const fx = Number(x.toFixed(2));
    const fy = Number(y.toFixed(2));
    const fAngle = Number((angle + (isBottom ? 180 : 0)).toFixed(2));
    return (
      <text
        key={i}
        x={fx}
        y={fy}
        fontSize={Number(fontSize.toFixed(2))}
        textAnchor="middle"
        dominantBaseline={isBottom ? "hanging" : "baseline"}
        transform={`rotate(${fAngle} ${fx} ${fy})`}
        letterSpacing={letterSpacing}
        fontFamily={fontFamily}
        fill={fill}
      >
        {char}
      </text>
    );
  });
}

export function StampGenerator() {
  const [companyName, setCompanyName] = useState("A E STAMP MALAYSIA SDN. BHD.");
  const [companyNo, setCompanyNo] = useState("199301030815");
  const [registration, setRegistration] = useState("(285554-A)");
  const [size, setSize] = useState(300);
  const [color, setColor] = useState("#000000");
  const [rotation, setRotation] = useState(0);
  const [companyTextRotation, setCompanyTextRotation] = useState(0);
  const stampRef = useRef<HTMLDivElement>(null);

  const handleDownloadSVG = () => {
    if (stampRef.current) {
      const svg = stampRef.current.querySelector('svg');
      if (!svg) return;
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svg);
      if (!svgString.startsWith('<?xml')) {
        svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
      }
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stamp.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownload = async () => {
    if (stampRef.current) {
      const svg = stampRef.current.querySelector('svg');
      if (!svg) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        const v = await Canvg.from(ctx, svgString);
        await v.render();
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'stamp.png';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        alert('PNG export failed. Please use the SVG download instead.');
      }
    }
  };

  // SVG layout
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR - 8;
  const centerR = innerR - 38;
  const textR = (innerR + centerR) / 2 - 5;
  const fontSize = size / 18;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Stamp Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            {/* Company No. */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company No.</label>
              <Input
                value={companyNo}
                onChange={(e) => setCompanyNo(e.target.value)}
                placeholder="Enter company number"
              />
            </div>
            {/* Registration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration</label>
              <Input
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder="Enter registration"
              />
            </div>
            {/* Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[size]}
                  onValueChange={([value]) => setSize(value)}
                  min={200}
                  max={500}
                  step={1}
                  className="flex-1"
                />
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition cursor-pointer flex items-center justify-center"
                  onClick={() => setSize(300)}
                  aria-label="Reset size"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{size}px</p>
            </div>
            {/* Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#000000">Black</SelectItem>
                  <SelectItem value="#ff0000">Red</SelectItem>
                  <SelectItem value="#0000ff">Blue</SelectItem>
                  <SelectItem value="#008000">Green</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Rotation */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rotation</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={-45}
                  max={45}
                  step={1}
                  className="flex-1"
                />
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition cursor-pointer flex items-center justify-center"
                  onClick={() => setRotation(0)}
                  aria-label="Reset rotation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{rotation}°</p>
            </div>
            {/* Company Name Rotation */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name Rotation</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[companyTextRotation]}
                  onValueChange={([value]) => setCompanyTextRotation(value)}
                  min={0}
                  max={360}
                  step={1}
                  className="flex-1"
                />
                <button
                  type="button"
                  className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition cursor-pointer flex items-center justify-center"
                  onClick={() => setCompanyTextRotation(0)}
                  aria-label="Reset company name rotation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{companyTextRotation}°</p>
            </div>
            {/* Download Buttons */}
            <div className="flex gap-x-2">
              <Button onClick={handleDownload} className="w-full">
                Download PNG
              </Button>
              <Button onClick={handleDownloadSVG} className="w-full" variant="secondary">
                Download SVG (Best Quality)
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center bg-muted rounded-lg p-8">
          <div
            ref={stampRef}
            style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 0 0 1px #eee', transform: `rotate(${rotation}deg)` }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Outer circles */}
              <circle cx={cx} cy={cy} r={outerR} stroke={color} strokeWidth={3} fill="none" />
              <circle cx={cx} cy={cy} r={innerR} stroke={color} strokeWidth={2} fill="none" />
              {/* Center ring around company number and registration */}
              <circle cx={cx} cy={cy} r={centerR} stroke={color} strokeWidth={2} fill="none" />
              {/* Curved text (top) */}
              {renderCurvedText({
                text: companyName + ' ★',
                cx,
                cy,
                r: textR,
                startAngle: 30 + companyTextRotation,
                endAngle: 360 + companyTextRotation,
                fontSize,
                letterSpacing: 0,
                isBottom: false,
                fontFamily: 'Arial, sans-serif',
                fill: color,
              })}
              {/* Center text */}
              <text
                x={cx}
                y={cy - fontSize * 0.3}
                fontSize={fontSize * 0.95}
                textAnchor="middle"
                fill={color}
                fontFamily="Arial, sans-serif"
              >
                {companyNo}
              </text>
              <text
                x={cx}
                y={cy + fontSize * 1.1}
                fontSize={fontSize * 0.95}
                textAnchor="middle"
                fill={color}
                fontFamily="Arial, sans-serif"
              >
                {registration}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 