const fs = require('fs');
const path = require('path');

const ruta = path.join(__dirname, '../data/descuento.json');

const cuponRepository = {
    obtenerCupones: () => {
        const data = fs.readFileSync(ruta, 'utf8');
        return JSON.parse(data);
    }
};

module.exports = cuponRepository;