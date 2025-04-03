const apiUrl = "/api/orders/";
const codOrdersUrl = "/api/cod-orders/"
// Lưu trữ dữ liệu gốc từ API
let allOrders = [];
let filteredOrders = [];
let sortField = 'order_datetime';
let sortDirection = 'asc';

// Chỉ chạy loadOrders nếu đang ở trang orders
if (window.location.pathname === '/app/orders/' && getCookie('auth_token')) {
    loadOrders();
}

// Hàm xác định class màu nền dựa trên order_confirmation và order_status
function getRowClass(orderConfirmation, orderStatus) {
    const normalizedConfirmation = (orderConfirmation || '').trim().toUpperCase();
    const normalizedStatus = (orderStatus || '').trim();

    let rowClass = '';
    if (normalizedConfirmation === 'KNM') {
        rowClass = 'bg-warning bg-opacity-25';
    } else if (normalizedConfirmation === 'NG') {
        rowClass = 'bg-danger bg-opacity-25';
    } else if (normalizedStatus === 'Draft form') {
        rowClass = 'bg-gray-200';
    }
    return rowClass;
}

// Hàm hiển thị dữ liệu đơn hàng
function displayOrders(paginatedOrders) {
    let html = "";
    paginatedOrders.forEach(order => {
        const rowClass = getRowClass(order.order_confirmation, order.order_status);

        html += `
            <tr class="${rowClass}" data-id="${order.id}" data-status="${order.order_status}">
                <td>
                    ${order.order_status === 'Draft form' ? `<div class="order-status"><strong>${order.order_status}</strong></div>` : ''}
                    ${formatDate(order.order_datetime)}</td>
                <td><textarea data-id="${order.id}" data-field="order_fullname" class="form-control editable bg-danger.bg-opacity-25" rows="1">${order.order_fullname}</textarea></td>
                <td>
                    ${order.order_phone}
                </td>
                <td><textarea data-id="${order.id}" data-field="order_address" class="form-control editable" rows="1">${order.order_address}</textarea></td>
                <td>
                    <div><strong>${order.product_name}</strong></div>
                    
                    ${order.price_name === null && order.price_amount === null
                ? order.order_qty_amt
                : `<div>${order.price_name ? order.price_name + ' - ' + formatPrice(order.price_amount) : ''}</div>`}                      
                </td>
                <td><textarea data-id="${order.id}" data-field="order_note" class="form-control editable" rows="1">${order.order_note}</textarea></td>
                <td>
                    <select class="form-control custom-select-btn editable form-select-sm" data-id="${order.id}" data-field="order_confirmation">
                        <option value="" ${order.order_confirmation === '' ? 'selected' : ''}>Chọn</option>
                        <option value="OK" ${order.order_confirmation === 'OK' ? 'selected' : ''}>OK</option>
                        <option value="NG" ${order.order_confirmation === 'NG' ? 'selected' : ''}>NG</option>
                        <option value="KNM" ${order.order_confirmation === 'KNM' ? 'selected' : ''}>KNM</option>
                    </select>
                </td>
            </tr>`;
    });
    $("#order-list").html(html);

    makeColumnsResizable(['ordersTable']);

    document.querySelectorAll('#order-list tr').forEach(row => {
        adjustRowHeight(row);
        const textareas = row.querySelectorAll('textarea.editable');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => {
                adjustRowHeight(row);
            });
        });
    });

    attachChangeEventToSelects();
}

// Lấy dữ liệu Orders
function loadOrders() {
    const token = getCookie('auth_token');
    const searchQuery = document.getElementById('search_input') ? document.getElementById('search_input').value : '';
    const startDate = document.getElementById('start_date') ? document.getElementById('start_date').value : '';
    const endDate = document.getElementById('end_date') ? document.getElementById('end_date').value : '';

    $.ajax({
        url: apiUrl,
        method: "GET",
        headers: { "Authorization": "Token " + token },
        data: {
            search: searchQuery,
            start_date: startDate,
            end_date: endDate
        },
        success: function (data) {
            allOrders = data;
            filteredOrders = [...allOrders];
            applySortAndFilter();
            attachColumnFilterEvents();
            attachSortEvents();
        },
        error: function (xhr) {
            showAlert('Lỗi khi tải danh sách đơn hàng: ' + xhr.responseText, 'danger');
        }
    });
}

function applySortAndFilter() {
    let data = [...filteredOrders]; // Dữ liệu đã tải từ API

    if (filteredOrders.length === 0) {
        showAlert("Không tìm thấy đơn hàng", "warning");
    }
    // Lọc theo các cột khác
    document.querySelectorAll('.column-filter').forEach(input => {
        const field = input.dataset.field;
        const value = input.value.toLowerCase().trim();
        if (value) {
            data = data.filter(order => {
                const fieldValue = order[field] ? order[field].toString().toLowerCase().trim() : '';
                return fieldValue.includes(value);
            });
        }
    });

    // Lọc theo order_confirmation (checkbox)
    const selectedConfirmations = [];
    document.querySelectorAll('.confirmation-filter:checked').forEach(checkbox => {
        selectedConfirmations.push(checkbox.value);                                     // Lấy các giá trị được chọn
    });

    data = data.filter(order => {
        const confirmation = order.order_confirmation || '';                            // Giá trị hiện tại của order_confirmation
        return selectedConfirmations.includes(confirmation.trim());                     // Chỉ giữ các dòng khớp với lựa chọn
    });

    // Sắp xếp dữ liệu
    data.sort((a, b) => {
        let valueA = a[sortField] ? a[sortField].toString() : '';
        let valueB = b[sortField] ? b[sortField].toString() : '';

        if (sortField === 'order_datetime') {
            valueA = new Date(a[sortField]);
            valueB = new Date(b[sortField]);
        }

        return sortDirection === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    // Cập nhật phân trang và hiển thị
    Pagination.init({
        data: data,
        tableBodyId: 'order-list',
        paginationId: 'pagination',
        paginationInfoId: 'pagination-info',
        itemsPerPageId: 'items-per-page',
        displayCallback: displayOrders
    });

    // Cập nhật icon sắp xếp
    updateSortIcons();
}


// Gắn sự kiện lọc theo cột
function attachColumnFilterEvents() {
    document.querySelectorAll('.column-filter').forEach(input => {
        input.addEventListener('keyup', applySortAndFilter);
    });
}

// Gắn sự kiện sắp xếp
function attachSortEvents() {
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const field = header.dataset.field;
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            applySortAndFilter();
        });
    });
}

function filterOrders() {
    loadOrders();
}

function resetFilters() {
    document.getElementById('search_input').value = '';
    document.getElementById('start_date').value = '';
    document.getElementById('end_date').value = '';
    document.querySelectorAll('.column-filter').forEach(input => {
        input.value = '';
    });
    loadOrders();
}

function attachChangeEventToSelects() {
    const editableFields = document.querySelectorAll('#order-list .editable');
    if (editableFields.length === 0) { return; }

    editableFields.forEach(field => {
        const eventType = field.tagName === 'SELECT' ? 'change' : 'blur';
        field.addEventListener(eventType, function () {
            const orderId = this.dataset.id;
            const fieldName = this.dataset.field;
            const newValue = this.value;

            // Lấy giá trị cũ của order_confirmation từ allOrders
            const order = allOrders.find(order => order.id === orderId);
            const oldConfirmation = order ? order.order_confirmation : '';

            // Cập nhật order (PATCH /api/orders/<id>/)
            updateOrder(orderId, fieldName, newValue);

            // Nếu field là order_confirmation và giá trị mới là "OK" (mà giá trị cũ không phải "OK")
            if (fieldName === 'order_confirmation' && newValue === 'OK' && oldConfirmation !== 'OK') {
                createCodOrder(orderId);
            }

            // Cập nhật màu nền của row
            if (fieldName === 'order_confirmation') {
                const row = this.closest('tr');
                if (row) {
                    const orderStatus = row.dataset.status;
                    const newClass = getRowClass(newValue, orderStatus);

                    row.classList.remove('bg-warning', 'bg-opacity-25', 'bg-danger', 'bg-gray-200');
                    if (newClass && newClass.trim() !== '') {
                        row.classList.add(...newClass.split(' '));
                    }
                }
            }
        });
    });
}

function updateOrder(id, field, value) {
    const token = getCookie('auth_token');
    let data = {};
    data[field] = value;
    $.ajax({
        url: apiUrl + id + "/",
        method: "PATCH",
        headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        success: function (response) {
            allOrders = allOrders.map(order =>
                order.id === id ? { ...order, [field]: value } : order
            );
            filteredOrders = filteredOrders.map(order =>
                order.id === id ? { ...order, [field]: value } : order
            );
            // applySortAndFilter();
        },
        error: function (xhr) {
            showAlert('Lỗi khi update đơn hàng: ' + xhr.responseText, 'danger');
        }
    });
}

$(document).on('change', '.editable', function () {
    const id = $(this).data('id');
    const field = $(this).data('field');
    const value = $(this).val();
    updateOrder(id, field, value);
});


// Hàm gửi yêu cầu POST đến /api/codorders/
function createCodOrder(orderId) {
    const token = getCookie('auth_token');
    const order = allOrders.find(order => order.id === orderId);

    if (!order) {
        showAlert('Không tìm thấy đơn hàng với ID: ' + orderId, 'danger');
        return;
    }

    // Chuẩn bị dữ liệu gửi lên API /api/codorders/
    const data = {
        order_id: order.id,  // Sử dụng order.id làm order_id
        product_code: order.product_code,  // Giả định order có product_code
        price_number: order.price_number || 1  // Giả định order có price_number, mặc định là 1 nếu không có
    };

    console.log("Sending POST to /api/codorders/ with data:", data);

    $.ajax({
        url: codOrdersUrl,
        method: "POST",
        headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        success: function (response) {
            console.log("Created CodOrder:", response);
            showAlert("Tạo CodOrder thành công!", "success");
        },
        error: function (xhr) {
            let errorMsg = "Lỗi khi tạo CodOrder";
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMsg = xhr.responseJSON.error;
            } else if (xhr.responseJSON) {
                errorMsg = JSON.stringify(xhr.responseJSON);
            } else {
                errorMsg = xhr.responseText;
            }
            console.log("Error creating CodOrder:", errorMsg);
            showAlert(errorMsg, "danger");
        }
    });
}

function updateSortIcons() {
    document.querySelectorAll('.sortable').forEach(header => {
        const field = header.dataset.field;
        const icon = header.querySelector('.sort-icon');
        if (field === sortField) {
            if (sortDirection === 'asc') {
                icon.classList.remove('fa-sort', 'fa-sort-down');
                icon.classList.add('fa-sort-up');
            } else {
                icon.classList.remove('fa-sort', 'fa-sort-up');
                icon.classList.add('fa-sort-down');
            }
        } else {
            icon.classList.remove('fa-sort-up', 'fa-sort-down');
            icon.classList.add('fa-sort');
        }
    });
}

// Gắn sự kiện click vào nút dropdown
document.getElementById('confirmationDropdown').addEventListener('click', function () {
    const menu = document.getElementById('confirmationMenu');
    const dropdownButton = this.getBoundingClientRect();

    // Xác định vị trí của nút bấm
    const topPosition = dropdownButton.bottom; // Vị trí dưới của nút bấm
    const leftPosition = dropdownButton.left + (dropdownButton.width / 2) - (menu.offsetWidth / 2); // Căn giữa menu với nút

    // Gán vị trí cố định cho menu
    menu.style.top = `${topPosition}px`;
    menu.style.left = `${leftPosition}px`;
    menu.style.display = 'block'; // Hiển thị menu

    // Gắn sự kiện keydown cho menu
    menu.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {     // Kiểm tra phím "Enter"
            applySortAndFilter();        // Gọi hàm lọc
            menu.style.display = 'none'; // Ẩn menu sau khi áp dụng
        }
    });
});

// Đóng menu nếu nhấp ra ngoài
document.addEventListener('click', function (event) {
    const menu = document.getElementById('confirmationMenu');
    if (!menu.contains(event.target) && event.target.id !== 'confirmationDropdown') {
        menu.style.display = 'none'; // Ẩn menu
    }
});

// Gắn sự kiện cho nút "Áp dụng"
document.getElementById('applyConfirmationFilter').addEventListener('click', () => {
    applySortAndFilter();
    document.getElementById('confirmationMenu').style.display = 'none'; // Đóng menu sau khi áp dụng
});


