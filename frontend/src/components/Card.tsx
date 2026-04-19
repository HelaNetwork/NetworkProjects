import React from 'react';

const Card = ({ title, description, icon }) => {
  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#111827] p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl"></div>
      <div className="relative">
        <div className="flex items-center gap-4 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default Card;
