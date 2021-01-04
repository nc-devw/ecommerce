const server = require('express').Router();
// const { Op } = require('sequelize');
const { Serial, Product } = require('../db.js');
//----------"/users"--------------

server.get('/:id', (req, res) => {
	const { id } = req.params;

	Serial.findAll({
		where: {
			productId: id
		}
	})
		.then(serials => {
			res.json(serials);
		})
		.catch(() => res.status(500).json({ message: 'Internal server error' }));
});

server.delete('/:id', (req, res) => {
	const { id } = req.params;

	Serial.findByPk(id)
		.then(instance => {
			if (!instance) return res.status(404).json({ message: 'Serial not found' });
			instance.destroy()
				.then(() => res.json({ message: 'Serial deleted' }))
		})
		.catch(() => res.status(500).json({ message: 'Internal server error' }));
});

server.post('/:id', (req, res) => {
	const { id } = req.params;
	let { serials } = req.body;

	Product.findByPk(id)
		.then(product => {
			if (!product) return res.status(404).json({ message: 'Product not found' });
			serials = serials.map(serial => ({ serial, productId: id }))
			return Serial.bulkCreate(serials)
		})
		.then(() => {
			res.json({ message: 'Serials created successfully' })
		})
		.catch(e => {
			let type = e.errors[0].type;
			let value = e.errors[0].value;
			res.status(400).json({ type, value });
		});
})

module.exports = server; 