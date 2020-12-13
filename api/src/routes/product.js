const server = require('express').Router();
const { Op } = require('sequelize');
const { Product, Category, Image } = require('../db.js');
//----------"/products"--------------

server.get('/', (req, res, next) => {
	Product.findAll({
		include: [{
			model: Image,
		}]
	})
		.then((products) => {
			res.send(products);
		})
		.catch(next);
});

server.post('/', (req, res) => {
	const {
		name,
		description_es,
		description_en,
		price,
		img,
		categories,
		is_active
	} = req.body
	if (name && description_en && description_es && price && is_active) {

		//Filtro las categorias que vienen en true y las coloco en un array
		let newCategories = [];
		if (!!Object.keys(categories).length) {
			for (cat in categories) {
				if (categories[cat] === true) {
					newCategories.push(cat)
				}
			}
		}

		let product;
		Product.create({
			name,
			description_es,
			description_en,
			price,
			is_active,
			stock: 0, //may be subject to change
			sales: 0,  //may be subject to change
			score: 0
		})
			.then((data) => {
				product = data;
				return Category.findAll({
					where: {
						id: newCategories
					}
				})
			})
			.then((categories) => {
				categories.forEach(category => {
					product.addCategories(category); //Creo la relacion de la categoria con el producto recien creado
				})
				return Image.create({  // Le agrego la imagen al producto
					url: img,
					productId: product.id
				})
			})
			.catch((err) => {
				res.status(500).json({ message: "Internal server error" })
			})
	} else {
		res.status(400).json({ message: "Bad Request" })
	}
})

server.get('/search', (req, res) => {
	const { query } = req.query;
	if (query) {
		Product.findAll({
			where: {
				[Op.or]: [
					{ name: { [Op.iLike]: `%${query}%` } },
					{ description_es: { [Op.iLike]: `%${query}%` } },
					{ description_en: { [Op.iLike]: `%${query}%` } }
				]
			},
			include: [{
				model: Image,
			}]
		})
			.then((products) => {
				res.status(200).json(products);
			})
			.catch(err => {
				res.status(500).json({ message: 'Internal server error', })
			})

	} else {
		res.status(400).json({ message: "Query is empty" });
	}
})

server.put('/:id', (req, res) => {
	const { id } = req.params;
	const {
		name,
		description_es,
		description_en,
		price,
		is_active
	} = req.body

	Product.update({
		name,
		description_es,
		description_en,
		price,
		is_active
	}, {
		where: { id },
		returning: true
	})
		.then(data => {
			if (!data[0]) {
				res.status(400).json({ message: 'Bad request' })
			} else {
				res.status(200).json(data[1][0])
			}
		})
		.catch(() => {
			res.status(500).json({ message: 'Internal server error' })
		})
})


server.get('/categories', (req, res) => {
	Category.findAll({
		order: [
			['name_es', 'ASC']
		],
	})
		.then((categories) => {
			res.json(categories);
		})
		.catch(err => {
			res.status(500).json({ message: 'Internal server error' })
		});
});

server.post('/category', (req, res) => {
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

server.get('/category/:catName', (req, res) => {
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
		.then(data => {
			console.log(data[0].images)
			res.json(data)
		})
})

server.put('/category/:catId', (req, res) => {
	let { catId } = req.params;
	let { name_es, name_en } = req.body;
	Category.update({
		name_es,
		name_en
	}, {
		where: { id: catId },
		returning: true
	})
		.then(data => {
			data = data[1][0]
			res.status(200).json({
				message: "Category edited successfuly.",
				data
			})
		})
})

server.delete('/category/:catId', (req, res) => {
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

server.post('/:prodId/category/:catId', (req, res) => {
	let { prodId, catId } = req.params;
	let prod = Product.findOne({
		where: { id: prodId }
	})
	let cat = Category.findOne({
		where: { id: catId }
	})
	Promise.all([prod, cat])
		.then(([prod, cat]) => {
			prod.addCategories(cat)
			res.status(201).json({ message: "Product associated with category successfully." })
		})
})

server.delete('/:prodId/category/:catId', (req, res) => {
	let { prodId, catId } = req.params;
	let prod = Product.findOne({
		where: { id: prodId }
	})
	let cat = Category.findOne({
		where: { id: catId }
	})
	Promise.all([prod, cat])
		.then(([prod, cat]) => {
			prod.removeCategories(cat)
			res.status(200).json({ message: "Category deleted." })
		})
})

server.delete('/:id', (req, res) => {
	const prodId = req.params.id;
	Product.destroy({
		where: {
			id: prodId
		}
	}).then(data => {
		if (!data) {
			res.status(404).json({ message: 'Product not found.' })
		} else {
			res.status(200).json({ message: 'Product deleted.' })
		}
	}).catch(() => {
		res.status(500).json({
			message: 'Internal server error',
		})
	});
});

server.get('/:id', (req, res) => {
	const prodId = req.params.id;
	if (!Number.isInteger(+prodId)) {
		return res.status(400).json({
			message: 'Bad Request'
		});
	};

	Product.findOne({
		where: { id: prodId },
		include: [
			{
				model: Category,
				through: { attributes: [] }
			}, {
				model: Image
			}
		]
	})
		.then(prod => {
			if (!prod) {
				return res.status(404).json({ message: 'Product not found.' });
			} else {
				prod = prod.get();
				const obj = {
					...prod,
					categories: prod.categories.map(cat => ({
						...cat.dataValues
					}))
				};
				res.json(obj);
			}
		})
		.catch(() => {
			res.status(500).json({
				message: 'Internal server error',
			});
		});
});

module.exports = server;