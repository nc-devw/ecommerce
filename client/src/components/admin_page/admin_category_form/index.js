import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import strings from './strings';
import { FormStyled } from "../../styles/styled_global";
import { addCategory, editCategory, getCategory } from '../../../redux/actions/categories_actions';
import { Btn } from '../../styles/styled_global'
import { useParams, Redirect } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

const AdminCategoryForm = () => {
	const { id } = useParams();
	const language = useSelector(state => state.globalReducer.language);
	const s = strings[language];
	const category = useSelector(state => state.categoriesReducer.category.info)
	const dispatch = useDispatch();
	const { addToast } = useToasts();

	const [toAdmin, setToAdmin] = useState(false);

	useEffect(() => {
		if (id) dispatch(getCategory(id))
	}, [dispatch, id])

	const [input, setInput] = useState({
		name_es: '',
		name_en: ''
	})

	useEffect(() => {
		if (id && Object.keys(category).length > 0) {
			setInput(category);
		}
	}, [category, dispatch, id])

	const handleChange = (e) => {
		setInput({
			...input,
			[e.target.name]: e.target.value
		})
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		if (id) dispatch(editCategory(input))
		else dispatch(addCategory(input))
		addToast(id ? s.toastEdited : s.toastAdded, { appearance: 'success' })
		setToAdmin(true);
	}

	const opciones = id ? s.buttonEdit : s.buttonAdd;

	if (toAdmin) return <Redirect to="/admin/categories" />
	return (
		<>
			<h1 className="admin-h1">{opciones}</h1>
			<FormStyled onSubmit={handleSubmit} method="POST" autoComplete="off">
				<label>
					<span>{s.name_es}:</span>
					<input type='text' name='name_es' value={input.name_es} onChange={handleChange} required />
				</label>
				<label>
					<span>{s.name_en}:</span>
					<input type='text' name='name_en' value={input.name_en} onChange={handleChange} required />
				</label>
				<Btn type='submit' className="btn-ppal">{opciones}</Btn>
			</FormStyled>
		</>
	);
};

export default AdminCategoryForm;