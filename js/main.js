// js/main.js
// ...
async function loadInitialData() {
    try {
        // --- CORRECCIÓN AQUÍ: CAMBIO DE RUTA PARA config.json y products.json ---
        const [configResponse, productsResponse] = await Promise.all([
            fetch('./data/config.json'), // Ruta correcta: están en la carpeta 'data'
            fetch('./data/products.json') // Ruta correcta: están en la carpeta 'data'
        ]);

        if (!configResponse.ok) throw new Error(`HTTP error! status: ${configResponse.status} for config.json`);
        if (!productsResponse.ok) throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);

        const configData = await configResponse.json();
        const productsData = await productsResponse.json();

        appState.banners = configData.banners;
        appState.brands = configData.brands;
        appState.contactInfo = {
            contactPhone: configData.contactPhone,
            contactEmail: configData.contactEmail,
            address: configData.address
        };
        appState.products = productsData; // Asigna los productos cargados al appState
        console.log('Datos iniciales cargados con éxito.');

    } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
        // ...
    }
}
// ...
