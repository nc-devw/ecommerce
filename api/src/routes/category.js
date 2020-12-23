const server = require('express').Router();
const { Op } = require('sequelize');
const { Product, Category, Image } = require('../db.js');
//----------"/category"--------------

server.post('/', (req, res) => {
	const { name_es, name_en } = req.body
	if (!name_es && !name_en) {
		return res.status(400).json({ message: 'Bad Request' })
	}
	Category.create({ name_en, name_es })
		.then((data) => {
			res.status(201).json(data)
		})
		.catch(() => {
			res.status(500).json({ message: 'Internal server error' })
		})
})

server.get('/:catName', (req, res) => {
	let { catName } = req.params
	catName = catName.toLowerCase();
	Product.findAll({
		order: [
			[Image, 'id', 'ASC']
		],
		include: [
			{
				model: Category,
				where: {
					[Op.or]: [
						{ name_en: catName },
						{ name_es: catName }
					]
				}
			}, {
				model: Image
			}
		]
	})
		.then(data => res.json(data))
})

server.put('/:catId', (req, res) => {
	let { catId } = req.params;
	let { name_es, name_en } = req.body;
	Category.update({
		name_es,
		name_en
	}, {
		where: { id: catId },
		returning: true
	})
		.then(category => {
			data = category[1][0]
			res.status(200).json(data)
		})
})

server.delete('/:catId', (req, res) => {
	const { catId } = req.params;
	var category = {};
	Category.findOne({
		where: { id: catId }
	})
		.then(data => {
			category = data;
			return Category.destroy({
				where: { id: catId }
			})
		})
		.then(() => {
			res.json(category)
		})
})

module.exports = server;