const { promises: fs } = require('fs');
const path = require('path');

class ProductManager {
    constructor() {
        this.products = [];
        this.productId = 1;
        this.path = `./products.json`;
    }

    async addProduct(title, description, price, thumbnail, code, stock) {
        try {
            // Se carga el contenido del archivo antes de realizar cualquier operación con los productos
            this.products = await this.readProductsFile();

            // Validar campos obligatorios
            if (!title || !description || !price || !thumbnail || !code || !stock) {
                console.error("Todos los campos son obligatorios.");
                return;
            }

            // Validar que no se repita el campo "code"
            if (this.products.some(product => product.code === code)) {
                console.error("El código de producto ya existe.");
                return;
            }

            // Agregar producto con id autoincrementable
            const newProduct = {
                id: this.productId++,
                title,
                description,
                price,
                thumbnail,
                code,
                stock
            };

            this.products.push(newProduct);

            // Se guarda el contenido actualizado del archivo
            await this.saveProductsFile(this.products);

            console.log('Producto creado correctamente.');

        } catch (error) {
            console.error('Error al crear el producto:', error);
        }
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (!product) {
            console.error("Producto no encontrado");
        }
        return product;
    }

    async readProductsFile() {
        try {
            // Verificar si el archivo existe
            const filePath = path.join(__dirname, this.path);
            if (!fs.existsSync(filePath)) {
                await this.saveProductsFile([]); // Si no existe, crear un archivo vacío
            }

            // Leer el archivo y devolver los datos
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer el archivo de productos:', error);
            return [];
        }
    }

    async saveProductsFile(products) {
        try {
            // Guardar los productos en el archivo
            const filePath = path.join(__dirname, this.path);
            await fs.writeFile(filePath, JSON.stringify(products, null, 2));
            console.log('Archivo guardado correctamente.');
        } catch (error) {
            console.error('Error al guardar el archivo de productos:', error);
        }
    }
}

// Ejemplo de uso
const manager = new ProductManager();

console.log(manager.getProducts()); // Ejemplo con array vacio

manager.addProduct("Producto prueba", "Este es un producto de prueba", 200, "Sin imagen", "abc123", 25);
manager.addProduct("Producto prueba", "Este es un producto de prueba", 200, "Sin imagen", "abc123", 25); // Ejemplo de codigo repetido
console.log(manager.getProducts());

console.log(manager.getProductById(1)); // Ejemplo de buscar un producto por id existente
console.log(manager.getProductById(2)); // Ejemplo de buscar un producto por id inexistente
