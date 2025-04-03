const API_URL = '/api/master/productgroups/';

// Thêm hàm displayProductGroups để hiển thị dữ liệu phân trang
function displayProductGroups(paginatedProductGroups) {
    const productgroupsList = document.getElementById('productgroups-list');
    if (!productgroupsList) {
        return;
    }
    console.log(paginatedProductGroups);

    let html = '';
    paginatedProductGroups.forEach((productGroup, index) => {
        html += `
            <tr>
                <td>${productGroup.group_code}</td>
                <td>${productGroup.group_name}</td>
                <td>${productGroup.note}</td>
                <td>${productGroup.is_making_sale ? "Hàng tạo đơn COD" : "Hàng không tạo đơn COD"}</td>
                <td class="table-action">
                    <i class="bi-pencil-square action-btn" aria-hidden="true" onclick="editProductGroup('${productGroup.id}')"></i>
                    <i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="deleteProductGroup('${productGroup.id}')"></i>
                </td>
            </tr>`;
    });
    productgroupsList.innerHTML = html;
}

function loadProductGroups() {
    const token = getCookie('auth_token');
    $.ajax({
        url: API_URL,
        method: "GET",
        headers: { "Authorization": "Token " + token },
        success: function (data) {
            // Sử dụng Pagination để hiển thị dữ liệu
            Pagination.init({
                data: data,
                tableBodyId: 'productgroups-list',
                paginationId: 'pagination',
                paginationInfoId: 'pagination-info',
                itemsPerPageId: 'items-per-page',
                displayCallback: displayProductGroups
            });
        },
        error: function (xhr) {
            showAlert('Lỗi khi tải danh sách sản phẩm: ' + xhr.responseText, 'danger');
        },
    });
}

function showAddProductGroupForm() {
    const formContainer = document.getElementById('product-form-container');
    const formTitle = document.getElementById('form-title');
    const productForm = document.getElementById('product-form');

    // Reset form
    productForm.reset();
    formTitle.textContent = 'Thêm nhóm sản phẩm mới';
    document.getElementById('productgroup-id').value = '';
    document.getElementById('group_code').value = '';
    document.getElementById('group_name').value = '';
    document.getElementById('note').value = '';
    document.getElementById('is_making_sale').value = '';

    document.getElementById('group_code').readOnly = false;
    // Hiển thị modal
    $(formContainer).modal('show');
}

function hideAddProductGroupForm() {
    const formContainer = document.getElementById('product-form-container');
    $(formContainer).modal('hide');
}

function editProductGroup(id) {
    fetch(`${API_URL}${id}/`, {
        method: 'GET',
        headers: { 'Authorization': `Token ${getCookie('auth_token')}`, 'Content-Type': 'application/json' }
    })

        .then(response => response.json())
        .then(productGroup => {
            console.log('vào edit hay không?')
            document.getElementById('productgroup-id').value = productGroup.id;
            document.getElementById('group_code').value = productGroup.group_code;
            document.getElementById('group_name').value = productGroup.group_name;
            document.getElementById('note').value = productGroup.note;
            document.getElementById('is_making_sale').value = productGroup.is_making_sale;

            // Đặt input group_code thành readonly khi sửa
            document.getElementById('group_code').readOnly = true;

            document.getElementById('form-title').textContent = 'Sửa nhóm sản phẩm';
            $(document.getElementById('product-form-container')).modal('show');
        })
        .catch(error => console.error('Error:', error));
}

function deleteProductGroup(id) {
    if (!confirm('Bạn có chắc muốn xóa nhóm sản phẩm này?')) return;
    fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${getCookie('auth_token')}` }
    })
        .then(response => {
            if (!response.ok) throw new Error('Không thể xóa nhóm sản phẩm');
            loadProductGroups();
        })
        .catch(error => showAlert(error.message, 'danger'));
}
document.addEventListener('DOMContentLoaded', loadProductGroups);

document.getElementById('productgroup-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const productgroupId = document.getElementById('productgroup-id').value;
    const productgroupData = {
        group_code: document.getElementById('group_code').value,
        group_name: document.getElementById('group_name').value,
        note: document.getElementById('note').value,
        is_making_sale: document.getElementById('is_making_sale').checked
    };

    const method = productgroupId ? 'PUT' : 'POST';
    const url = productgroupId ? `${API_URL}${productgroupId}/` : API_URL;

    console.log('Payload:', productgroupData);
    fetch(url, {
        method: method, // Sửa lỗi: sử dụng biến method thay vì chuỗi 'method'
        headers: { 'Authorization': `Token ${getCookie('auth_token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(productgroupData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Lỗi ${response.status}: ${text}`); });
            }
            return response.json();
        })
        .then(() => {
            hideAddProductGroupForm();
            loadProductGroups();
        })
        .catch(error => showAlert(error.message, 'danger'));
});