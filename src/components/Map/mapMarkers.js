export const buildHomePinSvg = (isSelected, color) => `
  <svg width="35" height="35" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="24" height="24" rx="12"
          fill="${isSelected ? color : '#94a3b8'}"
          stroke="white"
          stroke-width="2"/>
    <path d="M12 3L4 9v11h5v-6h6v6h5V9l-8-6z"
          fill="white"
          transform="translate(0, 1)"/>
  </svg>
`;

export const buildDestPinSvg = (isSelected, destinationNumber, color) => `
  <svg width="35" height="43" viewBox="0 0 28.8 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.4 0C6.45 0 0 6.45 0 14.4c0 10.8 14.4 21.6 14.4 21.6s14.4-10.8 14.4-21.6C28.8 6.45 22.35 0 14.4 0z"
          fill="${isSelected ? color : '#94a3b8'}"
          stroke="white"
          stroke-width="1.5"/>
    <text x="14.4" y="16"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="${destinationNumber >= 10 ? '11' : '12'}"
          font-weight="bold"
          fill="white">${destinationNumber}</text>
  </svg>
`;

export const buildActivityPinSvg = (isSelected, color, mutedColor) => `
  <svg width="17" height="22" viewBox="0 0 28.8 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.4 0C6.45 0 0 6.45 0 14.4c0 10.8 14.4 21.6 14.4 21.6s14.4-10.8 14.4-21.6C28.8 6.45 22.35 0 14.4 0z"
          fill="${isSelected ? color : mutedColor}"
          stroke="white"
          stroke-width="1.5"/>
  </svg>
`;
