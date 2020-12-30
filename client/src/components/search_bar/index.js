import React, { useState } from 'react';
import strings from './strings';
import { FormSearchBar } from '../styles/styled_search_bar';
import loupe from '../../assets/img/loupe.svg';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getSearchProducts } from '../../redux/actions/products_actions';
import { resetCurrentPage } from '../../redux/actions/global_actions';


const SearchBar = () => {

	const [inputText, setInputText] = useState('');
	const history = useHistory()
	const dispatch = useDispatch()
	const language = useSelector(state => state.globalReducer.language)

	const limitPerPage = 8;

	const handleChange = (ev) => {
		setInputText(ev.target.value);
	};

	const handleSubmit = (ev) => {
		ev.preventDefault();
		setInputText('');
		dispatch(getSearchProducts(inputText.trim(), { limit: limitPerPage }));
		dispatch(resetCurrentPage())
		history.push(`/search?query=${inputText.trim().toLowerCase()}`);
	};
	return (
		<FormSearchBar onSubmit={handleSubmit}>
			<input onChange={handleChange} type="text" placeholder={strings[language].placeholder} value={inputText} />
			<button type="submit">
				<img src={loupe} alt="" />
			</button>
		</FormSearchBar>
	)
};

SearchBar.defaultProps = {
	propFunction: function (text) {
		alert(`Escribiste: ${text}`)
	}
};

export default SearchBar;