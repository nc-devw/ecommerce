const server = require('express').Router();
const { Op } = require('sequelize');
const { User, Order, Product } = require('../db.js');
//----------"/users"--------------

server.get('/', (req, res) => {
	User.findAll()
		.then((users) => {
			res.status(200).send(users);
		})
		.catch((err) => {
			res.status(500).json({ message: "Internal server error" });
		})
});

server.put('/:id', (req, res) => {
	const { id } = req.params;
	const toUpdate = req.body;
	User.findByPk(id)
		.then((foundUser) => {
			if (!foundUser) {
				return res.status(404).json({ message: "User not found" });
			}
			return foundUser.update(toUpdate);
		})
		.then(updatedUser => {
			return res.json(updatedUser)
		})
		.catch((err) => {
			if (err.errors[0].message) {
				return res.status(409).json({ message: err.errors[0].message });
			}
			return res.status(500).json({ message: "Internal server error" });
		})
});

server.delete('/:userId', (req, res) => {
	const { userId } = req.params;
	var user = {};

	User.findOne({
		where: {
			id: userId
		}
	})
		.then(data => {
			user = data;
			return User.destroy({
				where: {
					id: userId
				}
			})
		})
		.then((data) => {
			if (data === 0) {
				res.status(404).json({ message: "Bad request" })
			}
			res.json(user)
		})
		.catch((err) => {
			res.status(500).json({ message: "Internal server error" });
		})
})


server.get('/:id/orders', (req, res) => {
	const { id } = req.params;
	if (!+id) res.status(400).json({ message: "Bad Request" });

	Order.findAll({
		where: {
			userId: id
		},
		include: [
			{
				model: Product,
				through: { attributes: [] }
			}
		]
	})
		.then(orders => {
			return res.json(orders);
		})
		.catch(() => {
			res.status(500).json({ message: "Internal server error" })
		});
});

module.exports = server; 