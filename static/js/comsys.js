const loginUrl = "/api-token-auth/";

//Hàm xử lý get/ set Cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// Hàm setCookie lưu 180 ngày
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? ";Secure" : "";
    document.cookie = name + "=" + value + ";" + expires + ";path=/" + secureFlag;
}

//Đăng nhập và lấy token
$("#login-btn").click(function () {
    const username = $("#username").val();
    const password = $("#password").val();
    $.ajax({
        url: loginUrl,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ username: username, password: password }),
        success: function (response) {
            setCookie('auth_token', response.token, 180);
            window.location.href = "/app/";  // Chuyển hướng về index sau khi đăng nhập
        },
        error: function (xhr) {
            alert("Login failed: " + xhr.responseText);
        }
    });
});
//Định dạng tiền tệ về dạng 000.000đ
// Hàm định dạng giá tiền
function formatPrice(price) {
    // Chuyển số thành chuỗi, loại bỏ phần thập phân nếu là .00
    const numStr = Number(price).toFixed(2).replace('.00', '');
    // Thêm dấu chấm phân cách hàng nghìn và "đ"
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

//Định dạng ngày tháng về DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function showAlert(message, type = 'info') {
    const alert = document.getElementById('system-alert');
    const msgSpan = document.getElementById('msg_alert'); // Lấy phần tử span để hiển thị thông báo

    // Gán nội dung thông báo vào span
    msgSpan.textContent = message;

    // Cập nhật lớp CSS (thay đổi kiểu thông báo)
    alert.classList.remove('alert-info', 'alert-danger', 'alert-success', 'alert-warning');
    alert.classList.add(`alert-${type}`, 'show');

    // Hiển thị alert
    alert.style.display = 'block';

    // Luôn hiển thị alert, ngay cả khi trước đó đã bị ẩn
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => { alert.style.display = 'none'; }, 500); // Ẩn thông báo sau khi hiệu ứng kết thúc
    }, 5000);
}


// Module phân trang
const Pagination = (function () {
    let ITEMS_PER_PAGE = 10;    // Số lượng bản ghi mỗi trang (mặc định)
    let currentPage = 1;        // Trang hiện tại
    let allData = [];           // Lưu trữ toàn bộ dữ liệu
    let totalPages = 0;         // Tổng số trang
    let displayCallback = null; // Callback để hiển thị dữ liệu
    let tableBodyId = '';       // ID của tbody
    let paginationId = '';      // ID của pagination
    let paginationInfoId = '';  // ID của pagination-info
    let itemsPerPageId = '';    // ID của dropdown items-per-page

    // Khởi tạo phân trang
    function init({ data, tableBodyId: tbodyId, paginationId: pagId, paginationInfoId: infoId, itemsPerPageId: dropdownId, displayCallback: callback }) {
        allData = data;
        tableBodyId = tbodyId;
        paginationId = pagId;
        paginationInfoId = infoId;
        itemsPerPageId = dropdownId;
        displayCallback = callback;

        // Gắn sự kiện cho dropdown items-per-page
        $(document).on('change', `#${itemsPerPageId}`, function () {
            changeItemsPerPage($(this).val());
        });

        // Hiển thị trang đầu tiên
        displayPage(1);
    }

    // Hiển thị dữ liệu theo trang
    function displayPage(page) {
        currentPage = page;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedData = allData.slice(start, end);

        // Gọi callback để hiển thị dữ liệu
        if (displayCallback) {
            displayCallback(paginatedData);
        }

        // Cập nhật phân trang
        updatePagination();
    }

    // Cập nhật giao diện phân trang
    function updatePagination() {
        totalPages = Math.ceil(allData.length / ITEMS_PER_PAGE);
        let paginationHtml = '';

        // Nút Previous
        paginationHtml += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="Pagination.changePage(${currentPage - 1}); return false;">Previous</a>
            </li>`;

        // Các số trang
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="Pagination.changePage(${i}); return false;">${i}</a>
                </li>`;
        }

        // Nút Next
        paginationHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="Pagination.changePage(${currentPage + 1}); return false;">Next</a>
            </li>`;

        $(`#${paginationId}`).html(paginationHtml);

        // Cập nhật thông tin phân trang
        const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const end = Math.min(currentPage * ITEMS_PER_PAGE, allData.length);
        $(`#${paginationInfoId}`).text(`Hiển thị ${start}-${end} của ${allData.length} bản ghi`);
    }

    // Chuyển trang
    function changePage(page) {
        if (page < 1 || page > totalPages) return;
        displayPage(page);
    }

    // Thay đổi số lượng bản ghi mỗi trang
    function changeItemsPerPage(value) {
        ITEMS_PER_PAGE = parseInt(value);
        currentPage = 1; // Reset về trang đầu tiên
        displayPage(1);
    }

    // Cập nhật dữ liệu (khi dữ liệu thay đổi)
    function updateData(newData) {
        allData = newData;
        displayPage(currentPage);
    }

    // Trả về các hàm public
    return {
        init,
        changePage,
        updateData
    };
})();

// Giải thích:
// Module Pagination được tạo dưới dạng IIFE (Immediately Invoked Function Expression) để đóng gói logic phân trang.
// Các biến như ITEMS_PER_PAGE, currentPage, allData, v.v. được lưu trong closure.
// Hàm init nhận các tham số:
// data: Dữ liệu cần phân trang.
// tableBodyId, paginationId, paginationInfoId, itemsPerPageId: ID của các phần tử HTML.
// displayCallback: Hàm callback để hiển thị dữ liệu (do orders.js hoặc master_products.js cung cấp).
// Các hàm displayPage, updatePagination, changePage, changeItemsPerPage được tái sử dụng từ orders.js.
// Hàm updateData cho phép cập nhật dữ liệu khi có thay đổi (ví dụ: sau khi thêm/sửa/xóa).


// Hàm tự động điều chỉnh chiều cao của textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight === 0 ? 38 : textarea.scrollHeight}px`;
    return textarea.scrollHeight;
}

// Hàm điều chỉnh chiều cao của hàng dựa trên textarea cao nhất
function adjustRowHeight(row) {
    const textareas = row.querySelectorAll('textarea.editable');

    let maxHeight = 0;
    textareas.forEach(textarea => {
        const height = autoResizeTextarea(textarea);
        maxHeight = Math.max(maxHeight, height);
    });
    if (maxHeight > 0) {
        row.style.height = `${maxHeight}px`;
    }
}

//Hàm cho phép resize <textarea> theo độ cao của dữ liệu
function makeColumnsResizable(tableId) {
    const table = document.getElementById(tableId);

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        const resizeHandle = header.querySelector('.resize-handle');
        if (!resizeHandle) return;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const th = resizeHandle.parentElement;
            const startX = e.clientX;
            const startWidth = th.offsetWidth;

            const onMouseMove = (e) => {
                const newWidth = startWidth + (e.clientX - startX);
                if (newWidth > 50) {
                    th.style.width = `${newWidth}px`;
                    const cells = table.querySelectorAll(`td:nth-child(${index + 1})`);
                    cells.forEach(cell => {
                        cell.style.width = `${newWidth}px`;
                        const row = cell.parentElement;
                        adjustRowHeight(row);
                    });
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}
