/**
 * @module src/lib/constants.ts
 * @description Shared constants for the entire application.
 */

export const PREDEFINED_COLORS = [
    { name: 'Black', hex: '#000000', border: true },
    { name: 'White', hex: '#FFFFFF', border: true },
    { name: 'Grey', hex: '#808080' },
    { name: 'Charcoal', hex: '#374151' },
    { name: 'Navy', hex: '#000080' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Cream', hex: '#fef3c7' },
    { name: 'Beige', hex: '#D2B48C' },
    { name: 'Camel', hex: '#C19A6B' },
    { name: 'Khaki', hex: '#fde047' },
    { name: 'Olive', hex: '#4d7c0f' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Burgundy', hex: '#9f1239' },
    { name: 'Red', hex: '#ef4444' }
];

export const SIZE_SCALES = {
    "Standard": ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
    "Numerical": ["32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54"],
    "Age": ["0-3M", "3-6M", "6-12M", "12-18M", "18-24M", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "10Y", "12Y", "14Y"],
    "Shoes": ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"]
};

export const COLOR_MAP_HEX: Record<string, string> = PREDEFINED_COLORS.reduce((acc, curr) => {
    acc[curr.name] = curr.hex;
    return acc;
}, {} as Record<string, string>);
