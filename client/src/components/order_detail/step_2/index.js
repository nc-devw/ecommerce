import React from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import CreditCard from '../step_2/CreditCard';
import { addCreditCard } from '../../../redux/actions/global_actions';
import strings from './strings';
//------>Styles
import { StyledSVG, StepTwo } from '../../styles/styled_order_detail';
import PurchaseStep2 from '../../../assets/img/purchase-steps-2.svg';


const Step2 = ({ cart, language }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const s = strings[language];

	const handleSubmit = (e, credCard) => {
		e.preventDefault();
		const { expiry, cvc, number, name } = credCard;
		if (expiry.length === 4 && cvc.length === 3 && number.length === 16 && name.includes(' ')) {
			dispatch(addCreditCard(credCard));
			history.push('/order/detail')
		} else {
			alert('Datos erróneos')
		}
	}

	if (cart.length < 1) {
		return <Redirect to='/' />
	}

	return (
		<>
			<h2>{s.details}</h2>
			<StyledSVG src={PurchaseStep2} />
			<StepTwo>
				<CreditCard language={language} handleSubmit={handleSubmit} />
			</StepTwo>
		</>
	)
}
export default Step2;