const cuponRepository = require('../repository/cuponRepository');

const cuponService = {
    getCupones: () => {
        return cuponRepository.obtenerCupones();
    }
};

module.exports = cuponService;