import React from 'react';
import { useDispatch } from 'react-redux';

import { Link } from 'react-router-dom';
import { deleteCategory } from '../../../redux/actions/categories_actions';
import { Btn, DataTable } from '../../styles/styled_global';
import Swal from 'sweetalert2';
import swals from '../../../utils/swals';
import strings from './strings';

const AdminCategoryList = ({ categories, language }) => {
	const dispatch = useDispatch();
	const s = strings[language];

	const handleDelete = (id) => {
		swals.FIRE('warning', s.alertTitle, s.alertText, s.alertButtonConfirm, true, s.alertButtonCancel)
			.then((result) => {
				if (result.isConfirmed) {
					Swal.fire(
						s.alertSuccessTitle,
						s.alertSuccessText,
						'success',
						dispatch(deleteCategory(id))
					)
				}
			})
	}

	return (
		<>
			<h1 className='admin-h1'>{s.title}</h1>
			<Link to="/admin/category"><Btn className="btn-ppal">{s.addCategory}</Btn></Link>
			<DataTable>
				<thead>
					<tr>
						<th className="cell-small">ID</th>
						<th>{s.tableName}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{categories && categories.map(category => (
						<tr key={category.id}>
							<td>{category.id}</td>
							<td>{category[`name_${language}`]}</td>
							<td>
								<ul>
									<li><Link to={`/admin/category/${category.id}`}><button>{s.buttonEdit}</button></Link></li>
									<li><button onClick={() => handleDelete(category.id)}>{s.buttonDelete}</button></li>
								</ul>
							</td>
						</tr>
					))}
				</tbody>
			</DataTable>
		</>
	);
};

export default AdminCategoryList;