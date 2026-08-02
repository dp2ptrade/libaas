'use client';

import { motion } from 'framer-motion';

export default function SizeGuidePage() {
  const womenSizes = [
    { size: 'S', chest: '32-34', waist: '26-28', hip: '34-36' },
    { size: 'M', chest: '34-36', waist: '28-30', hip: '36-38' },
    { size: 'L', chest: '36-38', waist: '30-32', hip: '38-40' },
    { size: 'XL', chest: '38-40', waist: '32-34', hip: '40-42' },
  ];
  const menSizes = [
    { size: 'S', chest: '36-38', waist: '30-32', shoulder: '17' },
    { size: 'M', chest: '38-40', waist: '32-34', shoulder: '18' },
    { size: 'L', chest: '40-42', waist: '34-36', shoulder: '19' },
    { size: 'XL', chest: '42-44', waist: '36-38', shoulder: '20' },
  ];

  return (
    <div className="container-luxury py-28 md:py-32 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-gold-600 text-xs uppercase tracking-[0.3em] mb-3">Information</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-8">Size Guide</h1>
        <p className="text-sm text-muted-foreground mb-8">All measurements are in inches. For custom tailoring, contact us.</p>

        <h2 className="font-serif text-2xl mb-4">Women</h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Chest</th>
                <th className="text-left px-4 py-3 font-medium">Waist</th>
                <th className="text-left px-4 py-3 font-medium">Hip</th>
              </tr>
            </thead>
            <tbody>
              {womenSizes.map((row) => (
                <tr key={row.size} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{row.size}</td>
                  <td className="px-4 py-3">{row.chest}"</td>
                  <td className="px-4 py-3">{row.waist}"</td>
                  <td className="px-4 py-3">{row.hip}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-serif text-2xl mb-4">Men</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Chest</th>
                <th className="text-left px-4 py-3 font-medium">Waist</th>
                <th className="text-left px-4 py-3 font-medium">Shoulder</th>
              </tr>
            </thead>
            <tbody>
              {menSizes.map((row) => (
                <tr key={row.size} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{row.size}</td>
                  <td className="px-4 py-3">{row.chest}"</td>
                  <td className="px-4 py-3">{row.waist}"</td>
                  <td className="px-4 py-3">{row.shoulder}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
