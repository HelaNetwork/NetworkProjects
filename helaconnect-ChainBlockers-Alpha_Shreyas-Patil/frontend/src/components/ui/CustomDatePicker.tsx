import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  selected: Date | null;
  onChange: (date: string) => void;
  placeholder: string;
};

export default function CustomDatePicker({
  onChange,
  selected,
  placeholder,
}: Props) {
  return (
    <div className="w-full relative">
      <DatePicker
        showYearDropdown
        selected={selected}
        dropdownMode="scroll"
        scrollableYearDropdown
        dateFormat="MM/dd/yyyy"
        yearDropdownItemNumber={20}
        wrapperClassName="w-full"
        placeholderText={placeholder}
        className="input-field"
        onChange={(date: any) => onChange(date ? new Date(date).toLocaleDateString() : '')}
      />
    </div>
  );
}
