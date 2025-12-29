"use client";

import React from "react";
import CreatableSelect from "react-select/creatable";
import { ActionMeta } from "react-select";
import { customStyles } from "@/lib/customStyles";
import { Badge } from "./badge";

type Category = {
  value: string;
  label: string;
};

interface FancySingleSelectProps {
  options: Category[];
  initialSelected?: Category | null; // Change to nullable type
  placeholder?: string;
  onChange?: (selected: string | null) => void; // Change the type to string | null
}

export function FancySingleSelect({
  options,
  initialSelected = null,
  placeholder = "Select...",
  onChange,
}: FancySingleSelectProps) {
  const [selected, setSelected] = React.useState<Category | null>(initialSelected);

  // Update selected value when initialSelected prop changes
  React.useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const handleChange = (
    newValue: Category | null, // Updated type to reflect single select
    actionMeta: ActionMeta<Category>
  ) => {
    setSelected(newValue);
    if (onChange) {
      const selectedValue = newValue ? newValue.value : null; // Pass the selected value or null
      onChange(selectedValue); // Pass the value to the parent
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-2 my-3">
        <CreatableSelect
          value={selected}
          onChange={handleChange}
          options={options}
          className="basic-single-select"
          classNamePrefix="select"
          placeholder={placeholder}
          isClearable
          formatCreateLabel={(inputValue: any) => `Create "${inputValue}"`}
          styles={customStyles}
        />
        {selected && (
          <div className="my-3">
            <Badge variant="default">
              {selected.label}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

