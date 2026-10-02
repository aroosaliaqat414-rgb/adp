import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const measurements = [
    {
      size: 'XS',
      chest: unit === 'inches' ? '34"' : '86 cm',
      waist: unit === 'inches' ? '28"' : '71 cm',
      hip: unit === 'inches' ? '38"' : '96 cm',
      length: unit === 'inches' ? '40"' : '101 cm',
      shoulder: unit === 'inches' ? '14"' : '35.5 cm',
      trouser: unit === 'inches' ? '37"' : '94 cm'
    },
    {
      size: 'S',
      chest: unit === 'inches' ? '36"' : '91 cm',
      waist: unit === 'inches' ? '30"' : '76 cm',
      hip: unit === 'inches' ? '40"' : '101 cm',
      length: unit === 'inches' ? '41"' : '104 cm',
      shoulder: unit === 'inches' ? '14.5"' : '37 cm',
      trouser: unit === 'inches' ? '38"' : '96.5 cm'
    },
    {
      size: 'M',
      chest: unit === 'inches' ? '39"' : '99 cm',
      waist: unit === 'inches' ? '33"' : '84 cm',
      hip: unit === 'inches' ? '43"' : '109 cm',
      length: unit === 'inches' ? '42"' : '106.5 cm',
      shoulder: unit === 'inches' ? '15"' : '38 cm',
      trouser: unit === 'inches' ? '39"' : '99 cm'
    },
    {
      size: 'L',
      chest: unit === 'inches' ? '42"' : '106 cm',
      waist: unit === 'inches' ? '36"' : '91 cm',
      hip: unit === 'inches' ? '46"' : '117 cm',
      length: unit === 'inches' ? '43"' : '109 cm',
      shoulder: unit === 'inches' ? '16"' : '40.5 cm',
      trouser: unit === 'inches' ? '40"' : '101.5 cm'
    },
    {
      size: 'XL',
      chest: unit === 'inches' ? '45"' : '114 cm',
      waist: unit === 'inches' ? '39"' : '99 cm',
      hip: unit === 'inches' ? '49"' : '124 cm',
      length: unit === 'inches' ? '44"' : '112 cm',
      shoulder: unit === 'inches' ? '16.5"' : '42 cm',
      trouser: unit === 'inches' ? '40.5"' : '103 cm'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE6EE]">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#8E1EA2]" />
            <h3 className="font-serif text-xl font-bold text-[#231826]">
              Ladies Garments Comfort Size Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between my-4">
          <p className="text-xs text-[#5A4E5C]">
            All measurements refer to garment dimensions laid flat.
          </p>
          <div className="flex bg-[#F7F3EE] p-1 rounded-xl">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                unit === 'inches' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C]'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                unit === 'cm' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C]'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#EFE6EE] mb-6">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FCFAF8] text-[#231826] font-semibold border-b border-[#EFE6EE]">
              <tr>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Chest / Bust</th>
                <th className="py-3 px-4">Waist</th>
                <th className="py-3 px-4">Hip</th>
                <th className="py-3 px-4">Shoulder</th>
                <th className="py-3 px-4">Shirt Length</th>
                <th className="py-3 px-4">Trouser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6EE]">
              {measurements.map((row, i) => (
                <tr key={i} className="hover:bg-[#FCFAF8] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#8E1EA2]">{row.size}</td>
                  <td className="py-3 px-4 text-[#5A4E5C]">{row.chest}</td>
                  <td className="py-3 px-4 text-[#5A4E5C]">{row.waist}</td>
                  <td className="py-3 px-4 text-[#5A4E5C]">{row.hip}</td>
                  <td className="py-3 px-4 text-[#5A4E5C]">{row.shoulder}</td>
                  <td className="py-3 px-4 text-[#5A4E5C]">{row.length}</td>
                  <td className="py-3 px-4 text-[#5A4E5C]">{row.trouser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Tips */}
        <div className="bg-[#F8F4EE] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#5A4E5C]">
          <HelpCircle className="w-4 h-4 text-[#8E1EA2] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#231826]">Fit Recommendation:</span> For relaxed pret & everyday kurtis, we recommend choosing your exact size. If you fall between sizes or prefer an extra breezy feel, size up. All garments include generous seam margins for alterations.
          </div>
        </div>
      </div>
    </div>
  );
};
