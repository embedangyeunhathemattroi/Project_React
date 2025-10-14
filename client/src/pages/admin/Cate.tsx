import React, { useEffect, useState, useMemo } from "react"; 
import { useDispatch, useSelector } from "react-redux"; // Dùng để lấy và gửi dữ liệu Redux
import { Select, Input, Row, Col } from "antd"; 
import Swal from "sweetalert2"; 
import "bootstrap/dist/css/bootstrap.min.css"; 
import "antd/dist/reset.css"; 
import {fetchCategories, addCategory, updateCategory, deleteCategory, } from "../../stores/slices/categoriesSlice";
import PaginationAntd from "../../components/common/Pagination"; 
import Footer from "../../components/common/Footer"; 
import type { Category } from "../../types/category"; 

// ========================== COMPONENT CHÍNH ==========================
const Cate: React.FC = () => {
  const dispatch = useDispatch<any>(); // Dùng để gọi các action Redux
  const { categories = [] } = useSelector(
    (state: any) => state.categories || {}
  ); // Lấy danh sách categories từ store Redux

  // -------------------- STATE --------------------
  const [modalOpen, setModalOpen] = useState(false); // Trạng thái mở modal thêm/sửa
  const [deleteModal, setDeleteModal] = useState<null | number>(null); // ID của category cần xóa
  const [editCategory, setEditCategory] = useState<Category | null>(null); // Lưu category đang được chỉnh sửa
  const [nameInput, setNameInput] = useState(""); // Input tên category
  const [descriptionInput, setDescriptionInput] = useState(""); // Input mô tả
  const [search, setSearch] = useState(""); // Input tìm kiếm
  const [debouncedSearch, setDebouncedSearch] = useState(search); // Giá trị tìm kiếm có debounce (trì hoãn)
  const [filterName, setFilterName] = useState("All"); // Bộ lọc tên category
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại của phân trang
  const [formError, setFormError] = useState<string>(""); // Thông báo lỗi form (nếu có)
  const [lastAddedId, setLastAddedId] = useState<number | null>(null); // ID của category vừa mới thêm
  const itemsPerPage = 5; // Số lượng category mỗi trang

  // -------------------- HÀM TẠO TOPIC --------------------
  // Chuyển tên category thành topic (slug) thân thiện URL, ví dụ: "My Cat" -> "my-cat"
  const generateTopic = (name: string) =>name.toLowerCase() .trim()  .replace(/\s+/g, "-") .replace(/[^a-z0-9-]/g, "");

  // -------------------- HÀM LOAD CATEGORY TỪ API --------------------
  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories()).unwrap(); // Gọi action Redux để lấy dữ liệu
    } catch (err) {
      console.error(err);
    }
  };

  // Khi component vừa mount -> tự động gọi API lấy danh sách category
  useEffect(() => {
    loadCategories();
  }, []);

  // -------------------- DEBOUNCE SEARCH --------------------
  // Cập nhật debouncedSearch sau 100ms khi người dùng ngừng gõ
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 100);
    return () => clearTimeout(t); // Clear timeout khi user tiếp tục gõ
  }, [search]);

//  useEffect được gọi mỗi khi 'categories' hoặc 'lastAddedId' thay đổi
useEffect(() => {
  //  Kiểm tra nếu tồn tại 'lastAddedId' (tức là ID của danh mục vừa được thêm) nhưng ID đó KHÔNG còn nằm trong mảng 'categories' hiện tại
  // → nghĩa là danh mục này có thể đã bị xóa.
  if (
    lastAddedId !== null && // chỉ kiểm tra khi lastAddedId có giá trị
    !categories.some((c: Category) => c.id === lastAddedId) // tìm xem có danh mục nào có id = lastAddedId hay không
  ) {
    //  Nếu danh mục vừa thêm đã bị xóa, đặt lại lastAddedId = null
    // để tránh giữ trạng thái không hợp lệ (tránh hiển thị sai)
    setLastAddedId(null);
  }
}, [categories, lastAddedId]); 



  // -------------------- HÀM MỞ/CLOSE MODAL --------------------
  const openModal = (cat?: Category) => {
    if (cat) {
      // Nếu có cat -> đang chỉnh sửa
      setEditCategory(cat);
      setNameInput(cat.name);
      setDescriptionInput(cat.description);
    } else {
      // Nếu không có cat -> đang thêm mới
      setEditCategory(null);
      setNameInput("");
      setDescriptionInput("");
    }
    setFormError(""); // Reset lỗi
    setModalOpen(true); // Mở modal
  };
  const closeModal = () => setModalOpen(false); // Đóng modal

  // -------------------- HÀM LƯU CATEGORY (THÊM HOẶC CẬP NHẬT) --------------------
  const saveCategory = async () => {
    // Viết hoa chữ cái đầu tên
    const capitalizeFirst = (text: string) =>
      text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    // Chuẩn hóa dữ liệu nhập
    const trimmedName = capitalizeFirst(nameInput.trim());
    const trimmedDescription = descriptionInput.trim();
    // Kiểm tra nhập trống
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
      return;
    }

    // Kiểm tra trùng tên danh mục (trimmedName) đã tồn tại chưa
// - So sánh không phân biệt hoa thường
// - Bỏ qua chính danh mục đang chỉnh sửa (nếu có)
const nameExists = categories.some( (cat: Category) =>
    cat.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
    (!editCategory || cat.id !== editCategory.id)
);
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

    // Tạo topic thân thiện với URL
    const topic = generateTopic(trimmedName);

    try {
      if (editCategory) {
        // Nếu đang chỉnh sửa -> gọi update
        await dispatch(
          updateCategory({
            ...editCategory,
            name: trimmedName,
            description: trimmedDescription,
            topic,
          })
        ).unwrap();

        Swal.fire(
          "Updated!",
          `Category "${trimmedName}" updated successfully!`,
          "success"
        );
      } else {
        // Nếu thêm mới
        const newCat: Category = await dispatch(
          addCategory({
            name: trimmedName,
            description: trimmedDescription,
            topic,
          })
        ).unwrap();

        // Lưu lại id của category vừa thêm
        if (newCat && typeof newCat.id !== "undefined") {
          setLastAddedId(newCat.id);
        }

        // Cập nhật lại số trang sau khi thêm
        const totalPages = Math.ceil((categories.length + 1) / itemsPerPage);
        setCurrentPage(totalPages);

        Swal.fire(
          "Added!",
          `Category "${trimmedName}" added successfully!`,
          "success"
        );
      }

      // Sau khi lưu xong -> reset form
      closeModal();
      setEditCategory(null);
      setNameInput("");
      setDescriptionInput("");
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Operation failed", "error");
    }
  };

  // -------------------- XÓA CATEGORY --------------------
  const confirmDelete = (id: number) => setDeleteModal(id); // Hiển thị modal xác nhận xóa
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCategory(id)).unwrap(); // Gọi Redux để xóa category
      await loadCategories(); // Tải lại danh sách
      if (lastAddedId === id) setLastAddedId(null); // Nếu xóa item vừa thêm -> clear
      // Kiểm tra trang hiện tại, nếu vượt tổng trang thì lùi 1 trang
      const totalAfterDelete = categories.length - 1;
      const totalPagesAfter = Math.max(
        1,
        Math.ceil(totalAfterDelete / itemsPerPage)
      );
      if (currentPage > totalPagesAfter) setCurrentPage(totalPagesAfter);

      Swal.fire("Deleted!", "Category deleted successfully!", "success");
      setDeleteModal(null);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  // -------------------- LỌC + TÌM KIẾM + SẮP XẾP --------------------
  const filtered = useMemo(() => {
    // Chuẩn hóa chuỗi để tìm kiếm không phân biệt hoa thường hoặc dấu tiếng Việt
    const normalized = (s: string) =>
      s.toLowerCase() .normalize("NFD") .replace(/[\u0300-\u036f]/g, "");

    // Lọc dữ liệu
    const base = categories.filter((cat: Category) => {
      const searchTerm = normalized(debouncedSearch);
      // Cho phép tìm theo cả name và description
      const matchesSearch =
        normalized(cat.name).includes(searchTerm) ||
        normalized(cat.description).includes(searchTerm);

      // Nếu filterName = "All" thì lấy tất cả
      const matchesName = filterName === "All" || cat.name === filterName;

      return matchesSearch && matchesName;
    });

    // Sắp xếp kết quả
    base.sort((a: Category, b: Category) => {
      // Nếu có lastAddedId -> category đó được đưa xuống cuối danh sách
      if (lastAddedId !== null) {
        if (a.id === lastAddedId && b.id !== lastAddedId) return 1;
        if (b.id === lastAddedId && a.id !== lastAddedId) return -1;
      }

      // Còn lại thì sắp xếp theo tên A-Z
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });

    return base; // Trả về danh sách đã lọc + sắp xếp
  }, [categories, debouncedSearch, filterName, lastAddedId]);

  // -------------------- TÍNH TOÁN PHÂN TRANG --------------------
// loc để chỉ lấy các phần tử thuộc trang hiện tại
// - (currentPage - 1) * itemsPerPage → vị trí bắt đầu (index đầu của trang)
// - currentPage * itemsPerPage → vị trí kết thúc (index cuối của trang)
// → Giúp hiển thị đúng số lượng item theo từng trang (phân trang)
const displayed = filtered.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


  // -------------------- TẠO DANH SÁCH OPTION LỌC THEO TÊN --------------------
  const nameOptions = [
    { value: "All", label: "All Names" }, // Mặc định: All
    ...[...new Set(categories.map((cat: Category) => cat.name))].map(
      (name) => ({
        value: name,
        label: name,
      })
    ),
  ];
 // Log ra để kiểm tra các option lọc
  console.log(nameOptions);

  return (
    <div className="d-flex flex-column min-vh-100 w-full">
      <main className="flex-fill" style={{ padding: "40px" }}>
        <div className="d-flex justify-content-between align-items-center pb-4 pt-4 flex-wrap">
          <h2 style={{ color: "#212529", fontWeight: 40000 }}>
            <strong>Vocabulary Categories</strong>
          </h2>
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
            onClick={() => openModal()}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#16A34A")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#22C55E")
            }
          >
            Add New Category
          </button>
        </div>

        {/* Filter + Search */}
        <Row gutter={[0, 16]} className="mb-4">
          <Col span={24} className="mb-3">
            <Select
              value={filterName}
              onChange={(value) => {
                setFilterName(value);
                setCurrentPage(1);
              }}
              style={{ width: "100%", height: "56px", borderRadius: "12px" }}
              size="large"
              options={nameOptions}
            />
          </Col>

          <Col span={24}>
            <Input
              placeholder="Search categories..."
              allowClear
              size="large"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // reset page khi user bắt đầu tìm (UX tốt)
              }}
              style={{ height: "56px", borderRadius: "12px" }}
            />
            {/* Ghi chú: kết quả thực tế sẽ filter sau 1s (debounce) */}
          </Col>
        </Row>

        {/* Table */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            padding: "20px",
            overflowX: "auto",
          }}
        >
          <table
            className="table table-borderless table-hover mb-0"
            style={{ width: "100%", borderSpacing: "0 12px" }}
          >
            <thead>
              <tr>
                <th style={{ color: "#6B7280" }}>NAME</th>
                <th style={{ color: "#6B7280" }}>DESCRIPTION</th>
                <th style={{ color: "#6B7280" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((cat: Category) => (
                <tr key={cat.id} style={{ height: "60px" }}>
                  <td>{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <span
                        style={{
                          color: "blue",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        onClick={() => openModal(cat)}
                      >
                        Edit
                      </span>
                      <span
                        style={{
                          color: "red",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        onClick={() => confirmDelete(cat.id)}
                      >
                        Delete
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

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

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4">
          <PaginationAntd
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Modal Add/Edit */}
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
            onClick={closeModal}
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
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 24px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <h5 className="mb-0">
                  {editCategory ? "Edit Category" : "Add Category"}
                </h5>
                <button
                  onClick={closeModal}
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

              <div style={{ padding: "20px 30px" }}>
                {formError && (
                  <div
                    style={{
                      color: "red",
                      marginBottom: "10px",
                      fontWeight: 500,
                    }}
                  >
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
                <textarea
                  
                  className="form-control"
                  value={descriptionInput}
                  onChange={(e) => {
                    setDescriptionInput(e.target.value);
                    if (formError) setFormError("");
                  }}
                  style={{ fontSize: "1.1rem", height: "50px" }}
                />
              </div>

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

        {/* Modal Delete */}
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

              <div style={{ padding: "16px 24px" }}>
                <p className="mb-0">
                  Are you sure you want to delete this category?
                </p>
              </div>

              <div
                className="d-flex justify-content-end gap-3"
                style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb" }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteModal!)}
                >
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

//fix cho nó rộng ra về chiều dài trong bảng và edit và delete thì mất dấu gạch
