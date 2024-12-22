import L from 'leaflet'; // Убедитесь, что Leaflet импортирован

export const icons = {
    defaultIcon: L.divIcon({className: 'custom-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" /></svg>`,
        iconSize: [24, 24]
    }),
    rockIcon: L.divIcon({className: 'custom-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" fill="#3E2723" viewBox="0 0 24 24"><path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" /></svg>`,
        iconSize: [24, 24]
    }),    
    springIcon: L.divIcon({className: 'custom-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" fill="blue" viewBox="0 0 24 24"><path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" /></svg>`,
        iconSize: [24, 24]
    }),
    starIcon: L.divIcon({className: 'custom-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C15.9 2 19 5.1 19 9C19 14.2 12 22 12 22S5 14.2 5 9C5 5.1 8.1 2 12 2M12 4C9.2 4 7 6.2 7 9C7 10 7 12 12 18.7C17 12 17 10 17 9C17 6.2 14.8 4 12 4M12 11.5L14.4 13L13.8 10.2L16 8.3L13.1 8.1L12 5.4L10.9 8L8 8.3L10.2 10.2L9.5 13L12 11.5Z" /></svg>`,
        iconSize: [24, 24]
    }),    
    tentIcon: L.divIcon({
        className: 'custom-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22" /></svg>`,
        iconSize: [24, 24]
    }),
    creekIcon: L.divIcon({
        className: 'custom-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="blue" viewBox="0 0 24 24">
                <path d="M3 12h18v2H3zm0-6h18v2H3zm0 12h18v2H3z"/>
               </svg>`,
        iconSize: [24, 24]
    })
    // Добавьте другие иконки здесь
};