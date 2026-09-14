'use client';
import React from 'react';
import { ApartmentWingCardHeader } from './ApartmentWingCardHeader';
import { ApartmentWingTypeTable } from './ApartmentWingTypeTable';
import { ApartmentWingCardFooter } from './ApartmentWingCardFooter';
import { WingCardProps } from '@/types/property-tax/apartment';

export const ApartmentWingCard: React.FC<WingCardProps> = ({ data, isSelected, onClick, onAmcClick, onEdit }) => {
  return (
    <div
      onClick={onClick}
      className={`w-full bg-white border ${isSelected ? 'border-2 border-blue-500' : 'border-slate-300'} rounded-xl ml-1 flex flex-col h-full cursor-pointer transition-all duration-300 shadow-md z-10`}
    >
      <ApartmentWingCardHeader
        letter={data.letter}
        name={data.name}
        rating={data.rating}
        blockName={data.blockName}
        stats={data.stats}
        colorClass={data.colorClass}
        onAmcClick={(e) => {
          e.stopPropagation();
          onAmcClick?.(e);
        }}
        onEdit={(e) => {
          e.stopPropagation();
          onEdit?.(e);
        }}
      />
      <div className="flex-grow">
        <ApartmentWingTypeTable types={data.types} />
      </div>
      <ApartmentWingCardFooter
        wingName={data.name}
        exemption={data.exemption}
        overallTax={data.overallTax}
        revenueImpact={data.revenueImpact}
      />
    </div>
  );
};

export default ApartmentWingCard;
