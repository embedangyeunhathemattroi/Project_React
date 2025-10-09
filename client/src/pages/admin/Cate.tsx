import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Input, Row, Col } from "antd";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import { fetchCategories, addCategory, updateCategory, deleteCategory } from "../../stores/slices/categoriesSlice";
import PaginationAntd from "../../components/common/Pagination";
import Footer from "../../components/common/Footer";
import type { Category } from "../../types/category";

const Cate: React.FC = () => {
  // === KHAI BÁO BIẾN TRẠNG THÁI & KẾT NỐI REDUX ===
  const dispatch = useDispatch<any>();
  // Lấy danh sách categories từ store Redux
  const { categories = [] } = useSelector((state: any) => state.categories || {});
  // Các state quản lý modal, form và phân trang
  const [modalOpen, setModalOpen] = useState(false); // mở/đóng modal thêm/sửa
  const [deleteModal, setDeleteModal] = useState<null | number>(null); // modal xác nhận xóa
  const [editCategory, setEditCategory] = useState<Category | null>(null); // lưu danh mục đang sửa
  const [nameInput, setNameInput] = useState(""); // input name
  const [descriptionInput, setDescriptionInput] = useState(""); // input description
  const [search, setSearch] = useState(""); // từ khóa tìm kiếm
  const [filterName, setFilterName] = useState("All"); // lọc theo tên
  const [currentPage, setCurrentPage] = useState(1); // trang hiện tại
  const [formError, setFormError] = useState<string>(""); // lỗi trong form

  const itemsPerPage = 5; // số mục hiển thị mỗi trang

  // === HÀM SINH TOPIC TỪ NAME (slug dạng URL) ===
  const generateTopic = (name: string) =>
    name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // === GỌI DỮ LIỆU CATEGORY TỪ REDUX STORE ===
  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories()).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  // Khi component mount → tự động tải danh sách categories
  useEffect(() => {
    loadCategories();
  }, []);

  // === MỞ MODAL (thêm mới hoặc chỉnh sửa) ===
  const openModal = (cat?: Category) => {
    if (cat) {
      // Nếu có category → đang ở chế độ chỉnh sửa
      setEditCategory(cat);
      setNameInput(cat.name);
      setDescriptionInput(cat.description);
    } else {
      // Nếu không → thêm mới
      setEditCategory(null);
      setNameInput("");
      setDescriptionInput("");
    }
    setFormError("");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  // === HÀM LƯU (THÊM / SỬA DANH MỤC) ===
  const saveCategory = async () => {
    //  B1: Cắt bỏ khoảng trắng đầu/cuối trong input
    const trimmedName = nameInput.trim();
    const trimmedDescription = descriptionInput.trim();

    //  B2: Kiểm tra nếu người dùng để trống Name hoặc Description
    if (!trimmedName || !trimmedDescription) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please fill all fields!", 
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return; //  Dừng lại, không lưu
    }

    //  B3: Kiểm tra xem tên danh mục có bị trùng không
    const nameExists = categories.some(
      (cat: Category) =>
        cat.name.trim().toLowerCase() === trimmedName.toLowerCase() && // So sánh không phân biệt hoa thường
        (!editCategory || cat.id !== editCategory.id) // Nếu đang sửa, bỏ qua chính danh mục đó
    );

    // Nếu trùng tên → cảnh báo và dừng lại
    if (nameExists) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: `Category "${trimmedName}" already exists!`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    // B4: Sinh ra một "topic" slug từ tên danh mục (ví dụ: "Animal World" → "animal-world")
    const topic = generateTopic(trimmedName);

    try {
      //  B5: Nếu đang ở chế độ "Edit" (tức là có editCategory)
      if (editCategory) {
        await dispatch(
          updateCategory({
            ...editCategory, // giữ lại id và các thông tin cũ
            name: trimmedName, // cập nhật name mới
            description: trimmedDescription, // cập nhật description mới
            topic, // cập nhật topic mới
          })
        ).unwrap(); // unwrap() để bắt lỗi dễ dàng hơn

        // Gọi lại hàm loadCategories() để refresh danh sách hiển thị
        await loadCategories();

        // Hiển thị thông báo thành công
        Swal.fire("Updated!", `Category "${trimmedName}" updated successfully!`, "success");
      } 
      //  B6: Nếu không có editCategory → đây là thao tác "Add New"
      else {
        await dispatch(
          addCategory({
            name: trimmedName,
            description: trimmedDescription,
            topic,
          })
        ).unwrap();

        await loadCategories(); // reload danh sách sau khi thêm
        Swal.fire("Added!", `Category "${trimmedName}" added successfully!`, "success");
      }

      //  B7: Sau khi lưu thành công → reset form về trạng thái mặc định
      closeModal(); // đóng modal
      setEditCategory(null); // không còn đang chỉnh sửa
      setNameInput(""); // xóa input name
      setDescriptionInput(""); // xóa input description
    } catch (err: any) {
      //  B8: Nếu có lỗi trong quá trình gọi API hoặc redux
      console.error(err);
      Swal.fire("Error", err.message || "Operation failed", "error");
    }
  };

  // === XÓA DANH MỤC ===

  //  Khi nhấn nút Delete → chỉ mở modal xác nhận xóa
  const confirmDelete = (id: number) => setDeleteModal(id);

  //  Khi người dùng xác nhận xóa trong modal
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCategory(id)).unwrap(); // Gọi redux action để xóa danh mục theo id
      await loadCategories(); // Tải lại danh sách danh mục sau khi xóa thành công
      Swal.fire("Deleted!", "Category deleted successfully!", "success");
      setDeleteModal(null); // Đóng modal xác nhận
    } catch (err: any) {
      // Nếu xóa thất bại (VD: lỗi server hoặc không tìm thấy id)
      console.error(err);
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };


  // === LỌC & PHÂN TRANG ===
const filtered = categories.filter((cat: Category) => {
  // ✅ Kiểm tra xem tên danh mục có chứa từ khóa tìm kiếm không (không phân biệt hoa/thường)
  const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());

  // ✅ Kiểm tra xem danh mục có khớp với filterName (tên đang được chọn trong dropdown) hay không
  const matchesName = filterName === "All" || cat.name === filterName;

  // ✅ Chỉ trả về những danh mục thỏa cả 2 điều kiện (lọc & tìm kiếm)
  return matchesSearch && matchesName;
});

// ✅ Sau khi lọc xong → cắt dữ liệu để hiển thị đúng số lượng trên từng trang
const displayed = filtered.slice(
  (currentPage - 1) * itemsPerPage, // Vị trí bắt đầu
  currentPage * itemsPerPage        // Vị trí kết thúc
);

// ✅ Tạo danh sách option cho Select filter (dropdown chọn theo tên danh mục)
const nameOptions = [
  { value: "All", label: "All Names" }, // Lựa chọn hiển thị tất cả
  ...[...new Set(categories.map((cat: Category) => cat.name))] // Loại bỏ trùng tên
    .map((name) => ({
      value: name,
      label: name,
    })),
];

// === GIAO DIỆN CHÍNH ===
return (
  <div className="d-flex flex-column min-vh-100 w-full">
    <main className="flex-fill" style={{ padding: "40px" }}>
      <div className="d-flex justify-content-between align-items-center pb-4 pt-4 flex-wrap">
        <h2 style={{ color: "#212529", fontWeight: 400 }}>Vocabulary Categories</h2>
        {/* Nút "Add New Category" để mở modal thêm danh mục */}
        <button
          style={{
            backgroundColor: "#22C55E",
            color: "white",
            padding: "14px 28px",
            fontSize: "1.1rem",
            minWidth: "180px",
            border: "none",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
          onClick={() => openModal()} // 👉 Khi click → mở modal thêm mới
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#16A34A")} // Hiệu ứng hover
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#22C55E")}
        >
          Add New Category
        </button>
      </div>

      {/* ----- PHẦN LỌC + TÌM KIẾM ----- */}
      <Row gutter={[0, 16]} className="mb-4">
        {/* Dropdown chọn danh mục để lọc theo tên */}
        <Col span={24} className="mb-3">
          <Select
            value={filterName}
            onChange={(value) => {
              setFilterName(value); // Cập nhật giá trị filter
              setCurrentPage(1);    // Trả về trang đầu sau khi lọc
            }}
            style={{ width: "100%", height: "56px", borderRadius: "12px" }}
            size="large"
            options={nameOptions} // Truyền danh sách option từ trên
          />
        </Col>

        {/* Ô input tìm kiếm theo tên danh mục */}
        <Col span={24}>
          <Input
            placeholder="Search categories..."
            allowClear
            size="large"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value); // Cập nhật chuỗi tìm kiếm
              setCurrentPage(1);         // Khi tìm kiếm → reset về trang 1
            }}
            style={{ height: "56px", borderRadius: "12px" }}
          />
        </Col>
      </Row>

      {/* ----- BẢNG HIỂN THỊ DANH MỤC ----- */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          padding: "20px",
          overflowX: "auto",
        }}
      >
        <table className="table table-borderless table-hover mb-0" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ color: "#6B7280" }}>NAME</th>
              <th style={{ color: "#6B7280" }}>DESCRIPTION</th>
              <th style={{ color: "#6B7280" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ Lặp qua danh sách hiển thị (sau khi lọc + phân trang) */}
            {displayed.map((cat: Category) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>
                  {/* Nút Edit → mở modal chỉnh sửa danh mục */}
                  <span
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={() => openModal(cat)}
                  >
                    Edit
                  </span>{" "}
                  |{" "}
                  {/* Nút Delete → mở modal xác nhận xóa */}
                  <span
                    style={{ color: "red", cursor: "pointer" }}
                    onClick={() => confirmDelete(cat.id)}
                  >
                    Delete
                  </span>
                </td>
              </tr>
            ))}

            {/*  Nếu không có danh mục nào khớp → hiển thị thông báo */}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ----- PHÂN TRANG ----- */}
      <div className="d-flex justify-content-center mt-4">
        <PaginationAntd
          currentPage={currentPage}       // Trang hiện tại
          totalItems={filtered.length}    // Tổng số danh mục sau khi lọc
          pageSize={itemsPerPage}         // Số danh mục / 1 trang
          onPageChange={(page) => setCurrentPage(page)} // Hàm chuyển trang
        />
      </div>

      {/* ----- MODAL THÊM / SỬA DANH MỤC ----- */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "60px",
            zIndex: 9999,
          }}
          onClick={closeModal} //  Click ra ngoài → đóng modal
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "0",
            }}
            onClick={(e) => e.stopPropagation()} //  Ngăn click bên trong modal bị đóng ngoài ý muốn
          >
            {/* Header modal */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {/* Nếu có editCategory → hiển thị "Edit", ngược lại là "Add" */}
              <h5 className="mb-0">{editCategory ? "Edit Category" : "Add Category"}</h5>
              <button
                onClick={closeModal} // Đóng modal khi bấm nút "×"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>


              {/* Body modal */}
              <div style={{ padding: "20px 30px" }}>
                {formError && (
                  <div style={{ color: "red", marginBottom: "10px", fontWeight: 500 }}>
                    {formError}
                  </div>
                )}

                <label style={{ fontWeight: 500 }}>Name</label>
                <input
                  type="text"
                  className="form-control mb-4"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (formError) setFormError("");
                  }}
                  style={{ fontSize: "1.1rem", height: "50px" }}
                />

                <label style={{ fontWeight: 500 }}>Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={descriptionInput}
                  onChange={(e) => {
                    setDescriptionInput(e.target.value);
                    if (formError) setFormError("");
                  }}
                  style={{ fontSize: "1.1rem", height: "50px" }}
                />
              </div>

              {/* Footer modal */}
              <div
                className="d-flex justify-content-end gap-3"
                style={{ padding: "16px 30px", borderTop: "1px solid #e5e7eb" }}
              >
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveCategory}>
                  {editCategory ? "Save" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----- MODAL XÓA DANH MỤC ----- */}
        {deleteModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "60px",
              zIndex: 9999,
            }}
            onClick={() => setDeleteModal(null)}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "500px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                overflow: "hidden",
                padding: "0",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <h6 className="mb-0">Delete Category</h6>
                <button
                  onClick={() => setDeleteModal(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "16px 24px" }}>
                <p className="mb-0">Are you sure you want to delete this category?</p>
              </div>

              {/* Footer */}
              <div
                className="d-flex justify-content-end gap-3"
                style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb" }}
              >
                <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteModal!)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cate;
//Quản lý state

// useState để lưu các trạng thái:

// modalOpen → mở/đóng modal thêm/sửa

// deleteModal → mở modal xác nhận xóa

// editCategory → lưu category đang sửa

// nameInput, descriptionInput → dữ liệu nhập trong form

// search, filterName → dữ liệu lọc và tìm kiếm

// currentPage → trang hiện tại cho phân trang

// useSelector lấy danh sách categories từ Redux store (state.categories).

// Load dữ liệu & hiển thị

// Khi component mount (useEffect), gọi loadCategories → dispatch fetchCategories() → Redux slice gọi API → lưu vào state → hiển thị bảng.

// Hiển thị bảng dựa trên filtered + phân trang: lọc theo từ khóa search và dropdown filterName, sau đó cắt dữ liệu đúng trang currentPage và itemsPerPage.

// Thêm / Sửa category

// Nhấn nút Add → mở modal, set form rỗng

// Nhấn nút Edit → mở modal, điền sẵn dữ liệu của category đang sửa

// Khi nhấn Save/Add:

// Trim input

// Kiểm tra trống hoặc trùng tên

// Sinh topic từ tên

// Nếu có editCategory → gọi updateCategory từ Redux, nếu không → gọi addCategory

// Reload danh sách bằng loadCategories()

// Hiển thị thông báo thành công bằng Swal và reset form.

// Xóa category

// Nhấn nút Delete → mở modal xác nhận (deleteModal)

// Khi xác nhận → gọi deleteCategory(id) từ Redux → reload danh sách → hiển thị thông báo thành công.

// Lọc & phân trang

// search → lọc tên chứa từ khóa (không phân biệt hoa thường)

// filterName → lọc theo tên danh mục từ dropdown

// Sau khi lọc → cắt danh sách theo trang hiện tại (currentPage) và số mục mỗi trang (itemsPerPage)

// PaginationAntd thay đổi currentPage → cập nhật hiển thị.