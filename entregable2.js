const { promises: fs } = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
    }

    async addProduct(productData) {
        try {
            const { title, description, price, thumbnail, code, stock } = productData;

            // Validar campos obligatorios
            if (!title || !description || !price || !thumbnail || !code || !stock) {
                console.error("Todos los campos son obligatorios.");
                return;
            }

            this.products = await this.readProductsFile();

            // Validar que no se repita el campo "code"
            if (this.products.some(product => product.code === code)) {
                console.error("El código de producto ya existe.");
                return;
            }

            // Agregar producto con id autoincrementable
            const newProduct = {
                id: this.products.length > 0 ? Math.max(...this.products.map(product => product.id)) + 1 : 1,
                title,
                description,
                price,
                thumbnail,
                code,
                stock
            };

            this.products.push(newProduct);
            await this.saveProductsFile(this.products);

            console.log('Producto creado correctamente.');

        } catch (error) {
            console.error('Error al crear el producto:', error);
        }
    }

    async getProducts() {
        return await this.readProductsFile();
    }

    async getProductById(id) {
        const products = await this.readProductsFile();
        const product = products.find(product => product.id === id);
        if (!product) {
            console.error("Producto no encontrado");
        }
        return product;
    }

    async updateProduct(id, updatedFields) {
        try {
            let products = await this.readProductsFile();
            const index = products.findIndex(product => product.id === id);
            if (index === -1) {
                console.error("Producto no encontrado");
                return;
            }
            products[index] = { ...products[index], ...updatedFields };
            await this.saveProductsFile(products);
            console.log('Producto actualizado correctamente.');
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
        }
    }

    async readProductsFile() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Si el archivo no existe, devuelve un array vacío
                return [];
            } else {
                throw error;
            }
        }
    }

    async saveProductsFile(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
        console.log('Archivo guardado correctamente.');
    }

    async deleteProduct(id) {
        try {
            let products = await this.readProductsFile();
            products = products.filter(product => product.id !== id);
            await this.saveProductsFile(products);
            console.log('Producto eliminado correctamente.');
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
        }
    }
}

// Función principal asincrónica para ejecutar el código
async function main() {
    // Ejemplo de uso
    const manager = new ProductManager('./products.json');

    console.log(await manager.getProducts()); // Ejemplo con array vacío

    await manager.addProduct({
        title: "Producto prueba",
        description: "Este es un producto de prueba",
        price: 200,
        thumbnail: "Sin imagen",
        code: "abc123",
        stock: 25
    });

    await manager.addProduct({
        title: "Producto prueba 2",
        description: "Este es otro producto de prueba",
        price: 250,
        thumbnail: "Sin imagen",
        code: "def456",
        stock: 20
    });

    console.log(await manager.getProducts());

    console.log(await manager.getProductById(1)); // Ejemplo de buscar un producto por id existente

    await manager.updateProduct(1, { title: "Producto actualizado", price: 300 }); // Ejemplo de actualizar un producto
    console.log(await manager.getProducts());

    await manager.deleteProduct(1); // Ejemplo de eliminar un producto
    console.log(await manager.getProducts());
}

// Llamar a la función principal
main().catch(error => console.error(error));
