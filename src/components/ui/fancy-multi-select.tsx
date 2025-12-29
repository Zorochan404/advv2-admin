"use client";

import React from "react";
import CreatableSelect from "react-select/creatable";

import { Badge } from "@/components/ui/badge";
import { customStyles } from "@/lib/customStyles";
import { ActionMeta, MultiValue } from "react-select";

type Category = {
  value: string;
  label: string;
};

interface FancyMultiSelectProps {
  options: Category[];
  initialSelected?: Category[];
  placeholder?: string;
  onChange?: (selected: string[]) => void;
}

export function FancyMultiSelect({
  options,
  initialSelected = [],
  placeholder = "Select...",
  onChange,
}: FancyMultiSelectProps) {
  const [selected, setSelected] = React.useState<Category[]>(initialSelected);

  const handleChange = (
    newValue: MultiValue<Category>,
    actionMeta: ActionMeta<Category>
  ) => {
    const newSelected = newValue.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    setSelected(newSelected);
    if (onChange) {
      const selectedValues = newSelected.map((category) => category.value);
      onChange(selectedValues);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-2 my-3">
        <CreatableSelect
          isMulti
          value={selected}
          onChange={handleChange}
          options={options}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder={placeholder}
          isClearable
          formatCreateLabel={(inputValue: any) => `Create "${inputValue}"`}
          styles={customStyles}
        />
        <div className="flex flex-wrap gap-1 my-3">
          {selected.map((framework) => (
            <Badge key={framework.value} variant="default">
              {framework.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
