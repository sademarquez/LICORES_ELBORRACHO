const fs = require('fs');

const productsFilePath = './products.json';
const productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));

const newProducts = [];
const existingIds = new Set(productsData.map(p => p.id));

for (let i = 1; i <= 50; i++) {
    let newId = `new-product-${i}`;
    let counter = 1;
    while (existingIds.has(newId)) {
        newId = `new-product-${i}-${counter}`;
        counter++;
    }
    existingIds.add(newId);

    const newProduct = {
        "id": newId,
        "name": `Producto de Prueba ${i}`,
        "price": Math.floor(Math.random() * 100000) + 10000,
        "category": "Licor",
        "imageUrl": "images/products/ron.png", // Using a placeholder image
        "description": `Descripción del producto de prueba ${i}.`
    };
    newProducts.push(newProduct);
}

const updatedProductsData = [...productsData, ...newProducts];

fs.writeFileSync(productsFilePath, JSON.stringify(updatedProductsData, null, 2));

console.log('50 new products have been added to products.json');
