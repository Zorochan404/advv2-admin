// customStyles.js

export const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? '#FFC107' : provided.borderColor,
    '&:hover': {
      borderColor: state.isFocused ? '#FFC107' : provided.borderColor,
    },
    boxShadow: state.isFocused ? '0 0 0 1px #FFC107' : provided.boxShadow,
    borderRadius: '0.375rem', // Adjust border radius
    width: '100%', // Make the width full
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: '#FFC107',
    color: 'white',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: 'white',
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: 'white',
    ':hover': {
      backgroundColor: '#FFB300',
      color: 'white',
    },
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9E9E9E',
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#212121',
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.375rem',
    width: '100%', // Ensure the menu is full width
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#FFC107' : state.isFocused ? '#FFF8E1' : provided.backgroundColor,
    color: state.isSelected ? 'white' : provided.color,
    ':hover': {
      backgroundColor: state.isSelected ? '#FFB300' : '#FFECB3',
      color: state.isSelected ? 'white' : provided.color,
    },
  }),
};

