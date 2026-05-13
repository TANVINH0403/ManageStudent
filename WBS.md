# Cấu Trúc Phân Rã Công Việc (WBS) - Dự Án ManageStudent

## Tổng Quan Dự Án
**ManageStudent** là một hệ thống quản lý công việc và sinh viên toàn diện được xây dựng bằng:
- **Frontend**: React 19.2.4 + Vite + Redux Toolkit + React Router
- **Backend**: .NET 8.0 Web API với Entity Framework Core + SQL Server/PostgreSQL
- **Kiến trúc**: Ứng dụng web full-stack với các tính năng thời gian thực và quản lý tệp

---

## 1. QUẢN LÝ DỰ ÁN VÀ LẬP KẾ HOẠCH

### 1.1 Khởi Động Dự Án
- [ ] Xác định phạm vi và mục tiêu dự án
- [ ] Xác định các bên liên quan và người dùng
- [ ] Tạo bản sắc dự án
- [ ] Thiết lập tiêu chí thành công

### 1.2 Thu Thập Yêu Cầu
- [ ] Thu thập yêu cầu chức năng
- [ ] Ghi chép yêu cầu không chức năng
- [ ] Tạo sơ đồ use case
- [ ] Định nghĩa các nhân vật người dùng

### 1.3 Kiến Trúc & Thiết Kế
- [ ] Thiết kế kiến trúc hệ thống
- [ ] Thiết kế sơ đồ cơ sở dữ liệu
- [ ] Tài liệu hợp đồng API
- [ ] Các wireframe và mockup UI/UX

---

## 2. PHÁT TRIỂN BACKEND (.NET API)

### 2.1 Xác Thực & Phân Quyền
- [ ] **Triển Khai AuthController**
  - [ ] Endpoint đăng ký người dùng
  - [ ] Endpoint đăng nhập người dùng
  - [ ] Sinh mã JWT token và làm mới
  - [ ] Chức năng đăng xuất
  - [ ] Lấy hồ sơ người dùng hiện tại (me)
  
- [ ] **Dịch Vụ Bảo Mật**
  - [ ] Dịch vụ sinh mã JWT token (AuthService)
  - [ ] Hashing mật khẩu sử dụng BCrypt
  - [ ] Middleware xác thực token
  - [ ] Kiểm soát truy cập dựa trên vai trò (RBAC)
  - [ ] Quản lý phiên người dùng

### 2.2 Quản Lý Người Dùng
- [ ] **Triển Khai UserController**
  - [ ] Lấy hồ sơ người dùng
  - [ ] Cập nhật hồ sơ người dùng
  - [ ] Lấy cài đặt người dùng
  - [ ] Cập nhật cài đặt người dùng
  - [ ] Thay đổi mật khẩu
  - [ ] Yêu cầu thay đổi email & xác nhận
  
- [ ] **Dịch Vụ Người Dùng**
  - [ ] GetProfileService
  - [ ] UpdateProfileService
  - [ ] ChangePasswordService
  - [ ] EmailChangeService (xác thực OTP)
  - [ ] Dịch vụ thông báo email

### 2.3 Quản Lý Công Việc
- [ ] **Triển Khai TaskController**
  - [ ] Lấy tất cả công việc (với bộ lọc & phân trang)
  - [ ] Lấy công việc theo ID
  - [ ] Tạo công việc mới
  - [ ] Cập nhật chi tiết công việc
  - [ ] Xóa công việc
  - [ ] Cập nhật trạng thái công việc
  - [ ] Lấy công việc theo danh mục
  - [ ] Lấy công việc con
  
- [ ] **Dịch Vụ Công Việc**
  - [ ] GetAllTaskHandle (bộ lọc truy vấn)
  - [ ] CreateTaskHandler
  - [ ] UpdateTaskHandle
  - [ ] DeleteTaskHandle
  - [ ] GetTaskByIdHandle
  - [ ] UpdateStatusHandle
  - [ ] GetTasksByCategoryHandle
  - [ ] GetSubTasksHandle
  - [ ] Xác thực công việc (FluentValidation)

### 2.4 Quản Lý Danh Mục
- [ ] **Triển Khai CategoryController**
  - [ ] Tạo danh mục
  - [ ] Lấy tất cả danh mục
  - [ ] Lấy danh mục theo ID
  - [ ] Cập nhật danh mục
  - [ ] Xóa danh mục
  - [ ] Đánh dấu danh mục là hoàn thành
  - [ ] Cập nhật khả năng hiển thị danh mục
  
- [ ] **Dịch Vụ Danh Mục**
  - [ ] CreateCategoryHandle
  - [ ] GetAllCategoryHandler
  - [ ] GetCategoryByIdHandle
  - [ ] UpdateCategoryHandle
  - [ ] DeleteCategoryHandle
  - [ ] CompletedCategoryHandle
  - [ ] UpdateVisibility

### 2.5 Quản Lý Thẻ
- [ ] **Triển Khai TagController**
  - [ ] Tạo thẻ
  - [ ] Lấy tất cả thẻ
  - [ ] Lấy thẻ theo ID
  - [ ] Cập nhật thẻ
  - [ ] Xóa thẻ
  
- [ ] **Dịch Vụ Thẻ**
  - [ ] CreateTagHandler
  - [ ] GetAllTagHandler
  - [ ] GetTagByIdHandler
  - [ ] UpdateTagHandler
  - [ ] DeleteTagHandler
  - [ ] Liên kết Thẻ-Công Việc

### 2.6 Quản Lý Tệp
- [ ] **Triển Khai TaskFileController**
  - [ ] Tải lên tệp cho công việc
  - [ ] Lấy tệp cho công việc
  - [ ] Xóa tệp
  - [ ] Kiểm soát truy cập tệp
  
- [ ] **Dịch Vụ Tệp**
  - [ ] UploadFileHandler (tích hợp NPOI)
  - [ ] GetFileHandler
  - [ ] DeleteFileHandler
  - [ ] Lưu trữ & truy xuất tệp
  - [ ] Tích hợp Supabase cho lưu trữ đám mây

### 2.7 Thông Báo
- [ ] **Triển Khai NotificationController**
  - [ ] Lấy thông báo của người dùng
  - [ ] Lấy số lượng chưa đọc
  - [ ] Đánh dấu thông báo là đã đọc
  - [ ] Đánh dấu tất cả thông báo là đã đọc
  
- [ ] **Dịch Vụ Thông Báo**
  - [ ] NotificationHandler
  - [ ] Gửi thông báo thời gian thực (SignalR)
  - [ ] Lưu trữ thông báo
  - [ ] Tùy chọn thông báo email/Push

### 2.8 Bảng Điều Khiển & Phân Tích
- [ ] **Triển Khai DashboardController**
  - [ ] Lấy dữ liệu bảng điều khiển
  - [ ] Thống kê công việc
  - [ ] Tiến độ danh mục
  
- [ ] **Dịch Vụ Bảng Điều Khiển**
  - [ ] GetDashboardHandle
  - [ ] Tổng hợp dữ liệu & phân tích

### 2.9 Quản Lý Bảng Kanban
- [ ] **Triển Khai BoardController**
  - [ ] Lấy bảng của người dùng
  - [ ] Cập nhật bảng thời gian thực
  
- [ ] **Dịch Vụ Bảng**
  - [ ] BoardHandle
  - [ ] Hoạt động bảng Kanban

### 2.10 Cơ Sở Dữ Liệu & Truy Cập Dữ Liệu
- [ ] **Entity Framework Core**
  - [ ] Di chuyển cơ sở dữ liệu
  - [ ] Cấu hình mô hình
  - [ ] Thiết lập mối quan hệ
  - [ ] Cấu hình ngữ cảnh cơ sở dữ liệu
  
- [ ] **Hỗ Trợ Cơ Sở Dữ Liệu**
  - [ ] Hỗ trợ SQL Server
  - [ ] Hỗ trợ PostgreSQL (Npgsql)
  - [ ] Quản lý chuỗi kết nối

### 2.11 Tài Liệu API & Kiểm Tra
- [ ] **Swagger/OpenAPI**
  - [ ] Thiết lập giao diện Swagger
  - [ ] Tài liệu endpoint API
  - [ ] Ví dụ yêu cầu/phản hồi
  
- [ ] **Kiểm Tra Đơn Vị & Tích Hợp**
  - [ ] Kiểm tra lớp dịch vụ
  - [ ] Kiểm tra bộ điều khiển
  - [ ] Kiểm tra cơ sở dữ liệu
  - [ ] Kiểm tra tích hợp API

---

## 3. PHÁT TRIỂN FRONTEND (React + Vite)

### 3.1 Thiết Lập & Cấu Hình Dự Án
- [ ] Cấu hình Vite
- [ ] Thiết lập ESLint
- [ ] Cấu hình kho lưu trữ Redux
- [ ] Thiết lập React Router
- [ ] Biến môi trường

### 3.2 Các Thành Phần Cốt Lõi & Bố Cục
- [ ] **Điều Hướng & Bố Cục**
  - [ ] Thanh tiêu đề/Thanh điều hướng
  - [ ] Menu thanh bên
  - [ ] Bọc bố cục
  - [ ] Footer
  
- [ ] **Thành Phần Chung**
  - [ ] Thành phần nút
  - [ ] Trường nhập liệu
  - [ ] Hộp thoại modal
  - [ ] Vòng quay tải
  - [ ] Thông báo toast
  - [ ] Thành phần cảnh báo
  - [ ] Thành phần thẻ
  - [ ] Thành phần hiệu

### 3.3 Các Trang Xác Thực
- [ ] **Các Trang Xác Thực**
  - [ ] Trang đăng nhập
  - [ ] Trang đăng ký
  - [ ] Trang khôi phục mật khẩu
  - [ ] Trang xác minh email
  
- [ ] **Tính Năng Xác Thực**
  - [ ] Quản lý mã JWT
  - [ ] Phiên bền vững
  - [ ] Các tuyến được bảo vệ
  - [ ] Logic chuyển hướng

### 3.4 Bảng Điều Khiển & Tổng Quan
- [ ] **Trang Bảng Điều Khiển**
  - [ ] Hiển thị thống kê
  - [ ] Tổng quan công việc
  - [ ] Tóm tắt danh mục
  - [ ] Biểu đồ tiến độ (Chart.js/Recharts)
  
- [ ] **Tiện Ích**
  - [ ] Tiện ích số lượng công việc
  - [ ] Tiện ích tỷ lệ hoàn thành
  - [ ] Tiện ích hoạt động gần đây
  - [ ] Bảng điều khiển phân tích

### 3.5 Các Trang Quản Lý Công Việc
- [ ] **Trang Danh Sách Công Việc**
  - [ ] Liệt kê công việc với bộ lọc
  - [ ] Phân trang
  - [ ] Chức năng tìm kiếm
  - [ ] Các tùy chọn sắp xếp
  - [ ] Hành động hàng loạt
  
- [ ] **Tạo/Chỉnh Sửa Công Việc**
  - [ ] Biểu mẫu tạo công việc
  - [ ] Biểu mẫu chỉnh sửa công việc
  - [ ] Xác thực biểu mẫu
  - [ ] Trình soạn thảo văn bản phong phú
  - [ ] Tích hợp bộ chọn ngày
  
- [ ] **Trang Chi Tiết Công Việc**
  - [ ] Hiển thị thông tin công việc
  - [ ] Quản lý trạng thái công việc
  - [ ] Quản lý công việc con
  - [ ] Phần bình luận
  - [ ] Dòng thời gian hoạt động
  
- [ ] **Bộ Lọc & Tìm Kiếm Công Việc**
  - [ ] Bộ lọc theo trạng thái
  - [ ] Bộ lọc theo ưu tiên
  - [ ] Bộ lọc theo danh mục
  - [ ] Bộ lọc theo thẻ
  - [ ] Tìm kiếm theo từ khóa

### 3.6 Quản Lý Danh Mục
- [ ] **Trang Danh Sách Danh Mục**
  - [ ] Hiển thị tất cả danh mục
  - [ ] Tạo danh mục
  - [ ] Chỉnh sửa danh mục
  - [ ] Xóa danh mục
  - [ ] Xem chi tiết danh mục
  
- [ ] **Tính Năng Danh Mục**
  - [ ] Chuyển đổi khả năng hiển thị danh mục
  - [ ] Hiển thị số lượng công việc
  - [ ] Chỉ báo tiến độ
  - [ ] Mã hóa màu

### 3.7 Quản Lý Thẻ
- [ ] **Các Hoạt Động Thẻ**
  - [ ] Tạo thẻ
  - [ ] Chỉnh sửa thẻ
  - [ ] Xóa thẻ
  - [ ] Gợi ý thẻ
  - [ ] Tự động hoàn thành

### 3.8 Quản Lý Tệp
- [ ] **Tải Lên/Tải Xuống Tệp**
  - [ ] Giao diện tải lên tệp
  - [ ] Tải lên nhiều tệp
  - [ ] Xem trước tệp
  - [ ] Tải xuống tệp
  - [ ] Xóa tệp
  - [ ] Xác thực loại tệp
  
- [ ] **Tích Hợp Lưu Trữ Tệp**
  - [ ] Tích hợp Supabase
  - [ ] Theo dõi tiến độ tải lên
  - [ ] Xử lý lỗi

### 3.9 Hồ Sơ & Cài Đặt Người Dùng
- [ ] **Trang Hồ Sơ Người Dùng**
  - [ ] Hiển thị thông tin hồ sơ
  - [ ] Biểu mẫu chỉnh sửa hồ sơ
  - [ ] Tải lên hình ảnh hồ sơ
  - [ ] Tùy chọn người dùng
  
- [ ] **Trang Cài Đặt**
  - [ ] Cài đặt tài khoản
  - [ ] Cài đặt thông báo
  - [ ] Cài đặt quyền riêng tư
  - [ ] Cài đặt chủ đề (nếu áp dụng)
  - [ ] Thay đổi mật khẩu
  - [ ] Thay đổi email

### 3.10 Thông Báo
- [ ] **Giao Diện Thông Báo**
  - [ ] Biểu tượng chuông thông báo
  - [ ] Thả xuống thông báo
  - [ ] Trang danh sách thông báo
  - [ ] Chức năng đánh dấu là đã đọc
  - [ ] Chi tiết thông báo
  
- [ ] **Cập Nhật Thời Gian Thực**
  - [ ] Tích hợp SignalR
  - [ ] Quản lý kết nối WebSocket
  - [ ] Gửi thông báo thời gian thực

### 3.11 Bảng Kanban
- [ ] **Chế Độ Xem Bảng**
  - [ ] Thiết lập cột Kanban
  - [ ] Kéo & thả thẻ
  - [ ] Cập nhật trạng thái qua kéo & thả
  - [ ] Thêm thẻ vào cột
  - [ ] Bộ lọc chế độ xem bảng
  - [ ] Tùy chỉnh bảng

### 3.12 Biểu Đồ & Trực Quan Hóa
- [ ] **Tích Hợp Biểu Đồ**
  - [ ] Thiết lập Chart.js
  - [ ] Thiết lập Recharts
  - [ ] Biểu đồ hoàn thành công việc
  - [ ] Biểu đồ tiến độ danh mục
  - [ ] Biểu đồ dòng thời gian
  - [ ] Trực quan hóa thống kê

### 3.13 Quản Lý Trạng Thái (Redux)
- [ ] **Kho Lưu Trữ Redux**
  - [ ] Lát cắt xác thực
  - [ ] Lát cắt công việc
  - [ ] Lát cắt danh mục
  - [ ] Lát cắt người dùng
  - [ ] Lát cắt thông báo
  - [ ] Lát cắt giao diện
  
- [ ] **Phần Mềm Redux**
  - [ ] Phần mềm gọi API
  - [ ] Phần mềm xử lý lỗi
  - [ ] Quản lý trạng thái tải

### 3.14 Máy Khách HTTP & Tích Hợp API
- [ ] **Cấu Hình Axios**
  - [ ] URL cơ sở API
  - [ ] Bộ ngắt yêu cầu
  - [ ] Bộ ngắt phản hồi
  - [ ] Xử lý lỗi
  - [ ] Đính kèm token
  - [ ] Cấu hình hết thời gian chờ

### 3.15 Thiết Kế Đáp Ứng & Bootstrap
- [ ] **Tích Hợp Bootstrap**
  - [ ] Hệ thống lưới
  - [ ] Kiểu thành phần
  - [ ] Điểm ngắt đáp ứng
  - [ ] Chủ đề tùy chỉnh (nếu cần)
  
- [ ] **Các Trang Đáp Ứng**
  - [ ] Tối ưu hóa di động
  - [ ] Tối ưu hóa máy tính bảng
  - [ ] Bố cục máy tính để bàn
  - [ ] Giao diện thân thiện với cảm ứng

### 3.16 Kiểm Tra
- [ ] **Kiểm Tra Thành Phần**
  - [ ] Kiểm tra đơn vị
  - [ ] Kiểm tra kết xuất thành phần
  - [ ] Kiểm tra tích hợp
  
- [ ] **Kiểm Tra End-to-End**
  - [ ] Kiểm tra quy trình người dùng
  - [ ] Kiểm tra điều hướng
  - [ ] Kiểm tra gửi biểu mẫu

---

## 4. CÁC TÍNH NĂNG THỜI GIAN THỰC

### 4.1 Tích Hợp SignalR
- [ ] **Thiết Lập Backend SignalR**
  - [ ] Cấu hình trung tâm SignalR
  - [ ] Quản lý kết nối
  - [ ] Định tuyến tin nhắn
  - [ ] Gửi tin nhắn cụ thể cho người dùng
  
- [ ] **Máy Khách Frontend SignalR**
  - [ ] Thư viện máy khách SignalR
  - [ ] Quản lý kết nối
  - [ ] Logic kết nối lại
  - [ ] Trình xử lý tin nhắn

### 4.2 Thông Báo Thời Gian Thực
- [ ] Thông báo cập nhật công việc
- [ ] Thông báo bình luận mới
- [ ] Thông báo gán công việc
- [ ] Thông báo hoạt động danh mục

### 4.3 Cập Nhật Bảng Thời Gian Thực
- [ ] Cập nhật trạng thái công việc
- [ ] Đồng bộ hóa kéo & thả
- [ ] Cập nhật người dùng đồng thời

---

## 5. QUẢN LÝ CƠSỞ DỮ LIỆU & DỮ LIỆU

### 5.1 Sơ Đồ Cơ Sở Dữ Liệu
- [ ] Bảng người dùng
- [ ] Bảng công việc
- [ ] Bảng danh mục
- [ ] Bảng thẻ
- [ ] Mối quan hệ Công Việc-Thẻ
- [ ] Bảng tệp
- [ ] Bảng thông báo
- [ ] Bảng cài đặt
- [ ] Bảng nhật ký kiểm tra

### 5.2 Di Chuyển Dữ Liệu
- [ ] Tạo sơ đồ ban đầu
- [ ] Tạo dữ liệu hạt giống
- [ ] Tối ưu hóa chỉ mục
- [ ] Thiết lập ràng buộc

### 5.3 Bảo Mật Dữ Liệu
- [ ] Mã hóa dữ liệu nhạy cảm
- [ ] Bảo mật cấp hàng
- [ ] Xác thực dữ liệu
- [ ] Tuân thủ GDPR

---

## 6. DEVOPS & TRIỂN KHAI

### 6.1 Đường Ống CI/CD
- [ ] Thiết lập GitHub Actions
- [ ] Đường ống kiểm tra tự động
- [ ] Tự động hóa bản dựng
- [ ] Tự động hóa triển khai
- [ ] Giám sát bao phủ mã

### 6.2 Triển Khai Backend
- [ ] Containerization Docker
- [ ] Cấu hình môi trường
- [ ] Tự động hóa di chuyển cơ sở dữ liệu
- [ ] Chiến lược triển khai máy chủ

### 6.3 Triển Khai Frontend
- [ ] Tối ưu hóa bản dựng
- [ ] Triển khai tài sản tĩnh
- [ ] Cấu hình CDN
- [ ] Chiến lược bộ nhớ đệm

### 6.4 Cơ Sở Hạ Tầng
- [ ] Thiết lập máy chủ web
- [ ] Thiết lập máy chủ cơ sở dữ liệu
- [ ] Cân bằng tải
- [ ] Chiến lược sao lưu & phục hồi

---

## 7. ĐẢM BẢO CHẤT LƯỢNG & KIỂM TRA

### 7.1 Kiểm Tra Backend
- [ ] Kiểm tra đơn vị (dịch vụ, trình xử lý)
- [ ] Kiểm tra tích hợp (bộ điều khiển, cơ sở dữ liệu)
- [ ] Kiểm tra endpoint API
- [ ] Kiểm tra xác thực
- [ ] Kiểm tra phân quyền

### 7.2 Kiểm Tra Frontend
- [ ] Kiểm tra đơn vị thành phần
- [ ] Kiểm tra tích hợp
- [ ] Kiểm tra end-to-end
- [ ] Kiểm tra hồi quy trực quan
- [ ] Kiểm tra hiệu suất

### 7.3 Kiểm Tra Bảo Mật
- [ ] Kiểm tra tiêm SQL
- [ ] Kiểm tra lỗ hổng XSS
- [ ] Kiểm tra bảo vệ CSRF
- [ ] Kiểm tra bỏ qua xác thực
- [ ] Kiểm tra bỏ qua phân quyền

### 7.4 Kiểm Tra Hiệu Suất
- [ ] Kiểm tra tải
- [ ] Kiểm tra căng thẳng
- [ ] Tối ưu hóa thời gian phản hồi
- [ ] Tối ưu hóa truy vấn cơ sở dữ liệu

---

## 8. TÀI LIỆU

### 8.1 Tài Liệu Kỹ Thuật
- [ ] Tài liệu API (Swagger)
- [ ] Tài liệu sơ đồ cơ sở dữ liệu
- [ ] Tài liệu kiến trúc
- [ ] Tài liệu thành phần

### 8.2 Tài Liệu Người Dùng
- [ ] Hướng dẫn người dùng
- [ ] Tài liệu Câu Hỏi Thường Gặp
- [ ] Hướng dẫn video
- [ ] Trợ giúp trong ứng dụng

### 8.3 Tài Liệu Nhà Phát Triển
- [ ] Hướng dẫn thiết lập
- [ ] Quy trình làm việc phát triển
- [ ] Hướng dẫn kiểu mã
- [ ] Hướng dẫn đóng góp

---

## 9. HỖ TRỢ & BẢO TRÌ DỰ ÁN

### 9.1 Sửa Chữa Lỗi & Bản Vá
- [ ] Hệ thống theo dõi lỗi
- [ ] Ưu tiên lỗi
- [ ] Quy trình sửa chữa nóng
- [ ] Ghi chú phát hành

### 9.2 Nâng Cao Tính Năng
- [ ] Quy trình yêu cầu tính năng
- [ ] Quản lý danh sách chờ
- [ ] Lập kế hoạch sprint
- [ ] Lập kế hoạch phát hành

### 9.3 Tối Ưu Hóa Hiệu Suất
- [ ] Tối ưu hóa cơ sở dữ liệu
- [ ] Tối ưu hóa API
- [ ] Tối ưu hóa frontend
- [ ] Chiến lược bộ nhớ đệm

### 9.4 Hỗ Trợ Người Dùng
- [ ] Hệ thống phát hành hỗ trợ
- [ ] Cập nhật tài liệu
- [ ] Tham gia cộng đồng
- [ ] Đào tạo & onboarding

---

## CÁC PHỤ THUỘC CHÍNH

### Backend
- **Khung công tác**: ASP.NET Core 8.0
- **ORM**: Entity Framework Core 8.0
- **Cơ sở dữ liệu**: SQL Server / PostgreSQL
- **Xác thực**: JWT Bearer
- **Xác thực**: FluentValidation
- **Thời gian thực**: SignalR
- **Bảo mật**: BCrypt.Net
- **Tài liệu API**: Swagger/Swashbuckle
- **Lưu trữ tệp**: Supabase, NPOI

### Frontend
- **Khung công tác**: React 19.2.4
- **Công cụ xây dựng**: Vite 8.0.1
- **Quản lý trạng thái**: Redux Toolkit 2.11.2
- **Định tuyến**: React Router 7.13.2
- **Máy khách HTTP**: Axios 1.14.0
- **Khung giao diện**: Bootstrap 5.3.8
- **Biểu đồ**: Chart.js & Recharts
- **Thời gian thực**: SignalR
- **Biểu tượng**: Lucide React 1.7.0

---

## GIAI ĐOẠN VÀ LỊCH TRÌNH DỰ ÁN

### Giai Đoạn 1: Nền Tảng (Tuần 1-3)
- Backend: Xác thực, Thiết lập cơ sở dữ liệu
- Frontend: Thiết lập dự án, Các trang xác thực, Bố cục

### Giai Đoạn 2: Tính Năng Cốt Lõi (Tuần 4-8)
- Backend: Quản lý công việc, danh mục, thẻ
- Frontend: Các trang công việc, danh mục, bảng điều khiển

### Giai Đoạn 3: Tính Năng Nâng Cao (Tuần 9-12)
- Backend: Thông báo, quản lý tệp, thời gian thực
- Frontend: Thông báo, tệp, bảng Kanban

### Giai Đoạn 4: Đánh Bóng & Kiểm Tra (Tuần 13-15)
- Kiểm tra & sửa lỗi
- Tối ưu hóa hiệu suất
- Tài liệu

### Giai Đoạn 5: Triển Khai (Tuần 16)
- Thiết lập CI/CD
- Triển khai sản xuất
- Đào tạo & hỗ trợ người dùng

---

## TIÊU CHÍ THÀNH CÔNG
- [ ] Tất cả hoạt động CRUD hoạt động chính xác
- [ ] Các tính năng thời gian thực hoạt động suôn sẻ
- [ ] Thời gian phản hồi API < 200ms (p95)
- [ ] Thời gian tải frontend < 3 giây
- [ ] Bảo hiểm thử nghiệm > 80%
- [ ] Không có lỗ hổng bảo mật quan trọng
- [ ] Điểm hài lòng người dùng > 4/5

---

## GHI CHÚ
- Sử dụng Supabase để lưu trữ tệp bên ngoài
- Cập nhật thời gian thực qua SignalR
- Hỗ trợ nhiều backend cơ sở dữ liệu (SQL Server & PostgreSQL)
- Bootstrap để tạo UI đáp ứng
- Xử lý lỗi và xác thực toàn diện

**Tài Liệu Được Tạo**: 2026-05-13  
**Chủ Sở Hữu Dự Án**: TANVINH0403  
**Kho Lưu Trữ**: https://github.com/TANVINH0403/ManageStudent
