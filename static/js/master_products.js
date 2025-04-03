const API_URL = '/api/master/products/';

// Thêm hàm displayProducts để hiển thị dữ liệu phân trang
function displayProducts(paginatedProducts) {
    const productList = document.getElementById('products-list');
    if (!productList) {
        // console.error('Phần tử products-list không tồn tại trong DOM');
        return;
    }
    // console.log(paginatedProducts);
    let html = '';
    paginatedProducts.forEach((product, index) => {
        const urlList = product.urls.map(url => `${url.url_name} - <a href="${url.landing_url}" target="_blank" rel="noopener noreferrer">${url.landing_url}</a><i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="deleteUrl('${product.id}', '${url.id}')"></i>`).join('<br>') || '';
        const priceList = product.prices.map(price => `${price.price_name}: ${price.prd_quantity} ${product.product_unit} - ${formatPrice(price.prd_amount)}<i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="deletePrice('${product.id}', '${price.id}')"></i>`).join('<br>') || '';
        html += `
            <tr>
                <td>${product.product_code}</td>
                <td>${product.product_name}</td>
                <td>${product.bill_name}</td>
                <td>${urlList}</td>
                <td>${priceList}</td>
                <td class="table-action">
                    <i class="bi-pencil-square action-btn" aria-hidden="true" onclick="editProduct('${product.id}')"></i>
                    <i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="deleteProduct('${product.id}')"></i>
                </td>
            </tr>`;
    });
    productList.innerHTML = html;
}

function loadProducts() {
    const token = getCookie('auth_token');
    $.ajax({
        url: API_URL,
        method: "GET",
        headers: { "Authorization": "Token " + token },
        success: function (data) {
            // Sử dụng Pagination để hiển thị dữ liệu
            Pagination.init({
                data: data,
                tableBodyId: 'products-list',
                paginationId: 'pagination',
                paginationInfoId: 'pagination-info',
                itemsPerPageId: 'items-per-page',
                displayCallback: displayProducts
            });
        },
        error: function (xhr) {
            showAlert('Lỗi khi tải danh sách sản phẩm: ' + xhr.responseText, 'danger');
        },
    });
}

function showAddProductForm() {
    const formContainer = document.getElementById('product-form-container');
    const formTitle = document.getElementById('form-title');
    const productForm = document.getElementById('product-form');

    // Reset form
    productForm.reset();
    formTitle.textContent = 'Thêm sản phẩm mới';
    document.getElementById('product-id').value = '';

    // Reset danh sách URL và Price
    const urlsList = document.getElementById('urls-list');
    const pricesList = document.getElementById('prices-list');
    urlsList.innerHTML = `
        <tr>
            <td><input type="text" class="form-control" name="url_number" value="1" readonly></td>
            <td><input type="text" class="form-control" name="url_name"></td>
            <td><input type="text" class="form-control" name="landing_url"></td>
            <td class="table-action"><i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="removeUrlRow(this)"></i></td>
        </tr>`;
    pricesList.innerHTML = `
        <tr>
            <td><input type="text" class="form-control" name="price_number" value="1" readonly></td>
            <td><input type="text" class="form-control" name="price_name"></td>
            <td><input type="number" class="form-control" name="prd_quantity"></td>
            <td><input type="text" class="form-control price-input" name="prd_amount" step="0.01"></td>
            <td><textarea class="form-control editable" rows="1" name="landing_qty_amt"></textarea></td>
            <td><input type="text" class="form-control" name="cost_product"></td>
            <td><input type="number" class="form-control" name="cost_product_qty"></td>
            <td class="table-action"><i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="removePriceRow(this)"></i></td>
        </tr>`;
    // Hiển thị modal
    $(formContainer).modal('show');

    // Đảm bảo tab "Landing" được chọn
    const tabContents = document.getElementsByClassName('tab-pane');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('show', 'active');
    }
    const tabLinks = document.getElementsByClassName('nav-link');
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove('active');
    }

    document.querySelector('#urls-tab').classList.add('show', 'active');
    document.querySelector('#nav-home-tab').classList.add('active');

    makeColumnsResizable(['prices-table']);

    document.querySelectorAll('#prices-list tr').forEach(row => {
        adjustRowHeight(row);
        const textareas = row.querySelectorAll('textarea.editable');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => {
                adjustRowHeight(row);
            });
        });
    });
}

function hideAddProductForm() {
    const formContainer = document.getElementById('product-form-container');
    $(formContainer).modal('hide');
}

function addUrlRow() {
    const tbody = document.getElementById('urls-list');
    const currentRows = tbody.querySelectorAll('tr').length + 1;
    const newRow = `
        <tr>
            <td><input type="text" class="form-control" name="url_number" value="${currentRows}" readonly></td>
            <td><input type="text" class="form-control" name="url_name"></td>
            <td><input type="text" class="form-control" name="landing_url"></td>
            <td class="table-action"><i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="removeUrlRow(this)"></i></td>
        </tr>`;
    tbody.insertAdjacentHTML('beforeend', newRow);
    updateUrlNumbers();
}

function addPriceRow() {
    const tbody = document.getElementById('prices-list');
    const currentRows = tbody.querySelectorAll('tr').length + 1;
    const newRow = `
        <tr>
            <td><input type="text" class="form-control" rows="1" name="price_number" value="${currentRows}" readonly></td>
            <td><input type="text" class="form-control" name="price_name"></td>
            <td><input type="number" class="form-control" name="prd_quantity"></td>
            <td><input type="text" class="form-control price-input" name="prd_amount"></td>
            <td><textarea class="form-control editable" rows="1" name="landing_qty_amt"></textarea></td>
            <td><input type="text" class="form-control" name="cost_product"></td>
            <td><input type="number" class="form-control" name="cost_product_qty"></td>
            <td class="table-action"><i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="removePriceRow(this)"></i></td>
        </tr>`;
    tbody.insertAdjacentHTML('beforeend', newRow);
    updatePriceNumbers();

    // Gắn sự kiện input cho input prd_amount trong hàng mới
    const newRowElement = tbody.lastElementChild; // Lấy hàng vừa thêm
    const prdAmountInput = newRowElement.querySelector('input[name="prd_amount"]');
    if (prdAmountInput) {
        prdAmountInput.addEventListener('input', function () {
            formatPriceInput(this);
        });
    }
}

function removeUrlRow(button) {
    button.parentElement.parentElement.remove();
    updateUrlNumbers();
}

function removePriceRow(button) {
    button.parentElement.parentElement.remove();
    updatePriceNumbers();
}

function updateUrlNumbers() {
    const rows = document.querySelectorAll('#urls-list tr');
    rows.forEach((row, index) => {
        row.querySelector('input[name="url_number"]').value = index + 1;
    });
}

function updatePriceNumbers() {
    const rows = document.querySelectorAll('#prices-list tr');
    rows.forEach((row, index) => {
        row.querySelector('input[name="price_number"]').value = index + 1;
    });
}

function editProduct(id) {
    fetch(`${API_URL}${id}/`, {
        method: 'GET',
        headers: { 'Authorization': `Token ${getCookie('auth_token')}`, 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(product => {
            document.getElementById('product-id').value = product.id;
            document.getElementById('product_code').value = product.product_code;
            document.getElementById('product_name').value = product.product_name;
            document.getElementById('bill_name').value = product.bill_name;
            document.getElementById('product_unit').value = product.product_unit;
            document.getElementById('group_code').value = product.group_code;

            const urlsTbody = document.getElementById('urls-list');
            urlsTbody.innerHTML = '';
            product.urls.forEach(url => {
                urlsTbody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td><input type="text" class="form-control" name="url_number" value="${url.url_number}" readonly></td>
                        <td><input type="text" class="form-control" name="url_name" value="${url.url_name}"></td>
                        <td><input type="text" class="form-control" name="landing_url" value="${url.landing_url}"></td>
                        <td class="table-action"><i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="removeUrlRow(this)"></i></td>
                    </tr>`);
            });

            const pricesTbody = document.getElementById('prices-list');
            pricesTbody.innerHTML = '';
            product.prices.forEach(price => {
                pricesTbody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td><input type="text" class="form-control" name="price_number" value="${price.price_number}" readonly></td>
                        <td><input type="text" class="form-control" name="price_name" value="${price.price_name}"></td>
                        <td><input type="number" class="form-control" name="prd_quantity" value="${price.prd_quantity}"></td>
                        <td><input type="text" class="form-control price-input" name="prd_amount" value="${formatPrice(price.prd_amount)}"></td>
                        <td><textarea class="form-control editable" rows="1" name="landing_qty_amt">${price.landing_qty_amt || ''}</textarea></td>
                        <td><input type="text" class="form-control" name="cost_product" value="${price.cost_product}"></td>
                        <td><input type="number" class="form-control" name="cost_product_qty" value="${price.cost_product_qty}"></td>
                        <td class="table-action"><i class="bi-trash3-fill action-btn" aria-hidden="true" onclick="removePriceRow(this)"></i></td>
                    </tr>`);
            });

            document.getElementById('form-title').textContent = 'Sửa sản phẩm';
            $(document.getElementById('product-form-container')).modal('show');

            requestAnimationFrame(() => {
                makeColumnsResizable(['prices-table']);
                document.querySelectorAll('#prices-list tr').forEach(row => {
                    adjustRowHeight(row);
                    const textareas = row.querySelectorAll('textarea.editable');
                    textareas.forEach(textarea => {
                        textarea.addEventListener('input', () => {
                            adjustRowHeight(row);
                        });
                    });
                });
            });
        });
}

function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${getCookie('auth_token')}` }
    })
        .then(response => {
            if (!response.ok) throw new Error('Không thể xóa sản phẩm');
            loadProducts();
        })
        .catch(error => showAlert(error.message, 'danger'));
}

function deleteUrl(productId, urlId) {
    if (!confirm('Bạn có chắc muốn xóa URL này?')) return;
    fetch(`${API_URL}${productId}/urls/${urlId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${getCookie('auth_token')}` }
    })
        .then(response => {
            if (!response.ok) throw new Error('Không thể xóa URL');
            loadProducts();
        })
        .catch(error => showAlert(error.message, 'danger'));
}

function deletePrice(productId, priceId) {
    if (!confirm('Bạn có chắc muốn xóa Price này?')) return;
    fetch(`${API_URL}${productId}/prices/${priceId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${getCookie('auth_token')}` }
    })
        .then(response => {
            if (!response.ok) throw new Error('Không thể xóa Price');
            loadProducts();
        })
        .catch(error => showAlert(error.message, 'danger'));
}

document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const productId = document.getElementById('product-id').value;
    const productData = {
        product_code: document.getElementById('product_code').value,
        product_name: document.getElementById('product_name').value,
        bill_name: document.getElementById('bill_name').value,
        product_unit: document.getElementById('product_unit').value,
        group_code: document.getElementById('group_code').value,
        urls: [],
        prices: []
    };

    const urlRows = document.querySelectorAll('#urls-list tr');
    urlRows.forEach(row => {
        const landingUrl = row.querySelector('input[name="landing_url"]').value;
        const urlName = row.querySelector('input[name="url_name"]').value;
        if (landingUrl) productData.urls.push({
            url_name: urlName,
            landing_url: landingUrl
        });
    });

    const priceRows = document.querySelectorAll('#prices-list tr');
    priceRows.forEach(row => {
        const priceName = row.querySelector('input[name="price_name"]').value;
        const prdQuantity = parsePriceInput(row.querySelector('input[name="prd_quantity"]').value);
        const prdAmount = parsePriceInput(row.querySelector('input[name="prd_amount"]').value);
        const landingQtyAmt = row.querySelector('textarea[name="landing_qty_amt"]').value;
        const costProduct = row.querySelector('input[name="cost_product"]').value;
        const costProductqty = row.querySelector('input[name="cost_product_qty"]').value;

        if (prdQuantity && prdAmount) {
            productData.prices.push({
                price_name: priceName || '',
                prd_quantity: parseInt(prdQuantity),
                prd_amount: parseFloat(prdAmount), // Giữ nguyên dạng số cho API
                landing_qty_amt: landingQtyAmt || '',
                cost_product: costProduct,
                cost_product_qty: parseInt(costProductqty)
            });
        }
    });

    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `${API_URL}${productId}/` : API_URL;

    fetch(url, {
        method: method, // Sửa lỗi: sử dụng biến method thay vì chuỗi 'method'
        headers: { 'Authorization': `Token ${getCookie('auth_token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Lỗi ${response.status}: ${text}`); });
            }
            return response.json();
        })
        .then(() => {
            hideAddProductForm();
            loadProducts();
        })
        .catch(error => showAlert(error.message, 'danger'));
});

function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('tab-pane');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('show', 'active');
    }
    const tabLinks = document.getElementsByClassName('nav-link');
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove('active');
    }
    document.getElementById(tabName).classList.add('show', 'active');
    evt.currentTarget.classList.add('active');
}

// Hàm format giá trị input (thêm validation)
function formatPriceInput(input) {
    let value = input.value.replace(/[^0-9]/g, ''); // Chỉ cho phép số
    if (value) {
        input.value = formatPrice(value);
    } else {
        input.value = '';
    }
}

// Hàm parse giá trị từ input để lấy số gốc
function parsePriceInput(value) {
    return parseFloat(value.replace(/[^0-9]/g, '')) || 0;
}

//Xử lý format giá tiền khi nhập dữ liệu trên form
document.addEventListener('DOMContentLoaded', loadProducts);
document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('product-form-container');

    // Sự kiện khi modal hiển thị
    $(formContainer).on('shown.bs.modal', function () {
        // console.log('Modal đã hiển thị hoàn toàn'); // Debug: Kiểm tra modal hiển thị
        // Đảm bảo các field có thể tương tác
        const inputs = formContainer.querySelectorAll('input, button');
        // console.log('Số lượng input/button trong modal:', inputs.length); // Debug: Kiểm tra số lượng phần tử

        // Xóa các listener cũ để tránh trùng lặp
        inputs.forEach(input => {
            input.removeEventListener('click', handleClick);
            input.removeEventListener('focus', handleFocus);
            input.removeEventListener('input', handleInput);
        });

        // Gắn lại các listener
        inputs.forEach(input => {
            input.addEventListener('click', handleClick);
            input.addEventListener('focus', handleFocus);
            input.addEventListener('input', handleInput);
        });

        // Hàm xử lý click
        function handleClick() {
            // console.log('Đã click vào:', this.name || this.tagName);
        }

        // Hàm xử lý focus
        function handleFocus() {
            // console.log('Đã focus vào:', this.name || this.tagName);
        }

        // Hàm xử lý input
        function handleInput() {
            // console.log('Đã nhập vào:', this.name || this.tagName, this.value); // Debug: Kiểm tra sự kiện input
            // console.log('Classes của input:', this.classList.toString()); // Debug: Kiểm tra các class của input
            // console.log('Có class price-input không:', this.classList.contains('price-input')); // Debug: Kiểm tra class
            if (this.classList.contains('price-input')) {
                formatPriceInput(this);
                // console.log('Đã format giá tiền:', this); // Log bạn đã thêm
            }
        }
    });

    // // Sự kiện khi modal ẩn
    // $(formContainer).on('hidden.bs.modal', function () {
    //     console.log('Modal đã ẩn hoàn toàn');
    //     $('.modal-backdrop').remove();
    //     $('body').removeClass('modal-open');
    // });
});