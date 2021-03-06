const server = require('express').Router();
const { User } = require('../db.js');
const nodemailer = require('nodemailer');
const { EMAIL_ACCOUNT, EMAIL_PASSWORD } = process.env;
const smtpTransport = require('nodemailer-smtp-transport');
const { isAuthenticated, isAdmin } = require('../../utils/customMiddlewares');
//----------"/users"--------------

server.get('/', isAdmin, (req, res) => {

	User.findAll({
		order: [['id', 'ASC']]
	})
		.then((users) => {
			res.status(200).json(users);
		})
		.catch((err) => {
			res.status(500).json({ message: "Internal server error" });
		})
});

server.post('/reset/password', (req, res) => { // <----- testing
	const { email } = req.body;

	if (!email) return res.status(400).json({ message: 'Bad request' });

	let reset_code = Math.random().toString().slice(2, 7);

	let transporter = nodemailer.createTransport(smtpTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		auth: {
			user: EMAIL_ACCOUNT,
			pass: EMAIL_PASSWORD
		}
	}));

	let mailOptions = {
		from: EMAIL_ACCOUNT,
		to: email,
		subject: "Password Reset",
		text: "Here's your code to reset your password:" + reset_code
	}

	User.update({ reset_code }, { where: { email } })
		.then(resp => {
			if (!resp[0]) return res.status(404).json({ message: "User not found" })

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					res.status(400).json({ message: "Mail could not be sent" })
				} else {
					res.status(200).json({ message: "Code sent", ok: true })
				}
			});
		})
})

server.post('/mail/send', (req, res) => {
	const { email, subject, message } = req.body;

	let transporter = nodemailer.createTransport(smtpTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		auth: {
			user: EMAIL_ACCOUNT,
			pass: EMAIL_PASSWORD
		}
	}));

	let mailOptions = {
		from: EMAIL_ACCOUNT,
		to: EMAIL_ACCOUNT,
		subject: `${email} ~ ${subject}`,
		text: message
	}

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			res.status(400).json({ message: "Mail could not be sent" })
		} else {
			res.status(200).json({ message: "Code sent", ok: true })
		}
	})
})

server.post('/reset/verification', async (req, res) => {
	const { email, reset_code, step, password } = req.body;
	if (!email || !reset_code) return res.status(400).json({ message: 'Bad request' });

	try {
		var user = await User.findOne({ where: { email } });
		var match = await user.compare(reset_code, true);


		switch (step) {
			case "1":
				if (match) {
					return res.status(200).json({ message: 'Code accepted', ok: true });
				} else {
					return res.status(400).json({ message: 'Code denied' });
				}
			case "2":
				if (match) {
					if (!password) return res.status(400).json({ message: 'Bad request' });

					let updateRes = await user.update({ password, reset_code: null })
					if (updateRes) {
						return res.status(200).json({ message: 'Password changed successfully', ok: true })
					}
				} else {
					return res.status(400).json({ message: 'Bad request' });
				}
			default:
				return res.status(400).json({ message: 'Bad request' });
		}

	} catch (err) {
		console.log(err)
		return res.status(500).json({ message: "Internal server error" });
	}
})

server.put('/:id', isAuthenticated, (req, res) => {
	const { id } = req.params;
	if (!req.user.is_admin && req.user.id !== Number(id)) return res.sendStatus(401);
	const toUpdate = req.body;
	delete toUpdate?.reset_code;

	if (!toUpdate.password) {
		delete toUpdate.password
	}
	// Hashear el password porque no funciona

	User.findByPk(id)
		.then((foundUser) => {
			if (!foundUser) {
				return res.status(404).json({ message: "User not found" });
			}
			return foundUser.update(toUpdate, { hooks: true });
		})
		.then(updatedUser => {
			return res.json(updatedUser)
		})
		.catch((err) => {
			if (err.errors && err.errors[0].message) {
				return res.status(409).json({ message: err.errors[0].message });
			}
			return res.status(500).json({ message: "Internal server error" });
		})
});

server.delete('/:userId', isAuthenticated, (req, res) => {
	const { userId } = req.params;

	if (!req.user.is_admin && (req.user.id !== Number(userId))) return res.sendStatus(401);

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

//TAL VEZ SIRVA PARA ADMIN
// server.get('/:id/orders', (req, res) => {

// 	const { id } = req.params;
// 	if (!+id) res.status(400).json({ message: "Bad Request" });

// 	Order.findAll({
// 		where: {
// 			userId: id
// 		},
// 		include: [
// 			{
// 				model: Product,
// 				through: {
// 					attributes: [
// 						'unit_price', 'quantity'
// 					]
// 				}
// 			}
// 		]
// 	})
// 		.then(orders => {
// 			return res.json(orders);
// 		})
// 		.catch(() => {
// 			res.status(500).json({ message: "Internal server error" })
// 		});
// });

module.exports = server; 