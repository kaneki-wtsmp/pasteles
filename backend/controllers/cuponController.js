const cuponService = require('../services/cuponService');

const cuponController = {
    getCupones: (req, res) => {
        try {
            const cupones = cuponService.getCupones();
            res.json(cupones);
        } catch (e) {
            console.log("error en controller", e);
            res.status(500).json({ mensaje: "error" });
        }
    }
};

module.exports = cuponController;