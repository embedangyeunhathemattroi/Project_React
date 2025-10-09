import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

// Import các action CRUD từ redux slice
import { addVocab, deleteVocab, fetchVocabs, updateVocab } from "../../stores/slices/vocabSLice";
import { fetchCategories, addCategory } from "../../stores/slices/categoriesSlice";

// Component phân trang và footer
import PaginationAntd from "../../components/common/Pagination";
import Footer from "../../components/common/Footer";

// Kiểu TypeScript cho từ vựng và category
import type { Vocab } from "../../types/vocab";
import type { Category } from "../../types/category";

const VocabularyPage: React.FC = () => {
  const dispatch = useDispatch<any>();

  // Lấy danh sách từ vựng và trạng thái loading từ redux store
  const { vocabs = [], loading = false } = useSelector((state: any) => state.vocabs || {});
  // Lấy danh sách category
  const { categories = [] } = useSelector((state: any) => state.categories || {});

  // State quản lý modal thêm/sửa từ vựng
  const [modalOpen, setModalOpen] = useState(false);
  // State lưu id từ vựng muốn xóa → hiển thị modal confirm delete
  const [deleteModal, setDeleteModal] = useState<null | number>(null);
  // State lưu từ đang sửa, null nếu thêm mới
  const [editVocab, setEditVocab] = useState<Vocab | null>(null);

  // State lưu input form thêm/sửa
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  // State cho search và lọc theo category
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // số lượng từ mỗi trang

  // Khi component mount, fetch dữ liệu từ redux
  useEffect(() => {
    dispatch(fetchVocabs());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Mở modal thêm/sửa
  const openModal = (vocab?: Vocab) => {
    if (vocab) {
      // Nếu có vocab → đang sửa
      setEditVocab(vocab);
      setWordInput(vocab.word);
      setMeaningInput(vocab.meaning);
      setCategoryInput(vocab.topic);
    } else {
      // Thêm mới
      setEditVocab(null);
      setWordInput("");
      setMeaningInput("");
      setCategoryInput("");
    }
    setModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => setModalOpen(false);

  // Thêm hoặc cập nhật từ vựng
  const saveVocab = async () => {
    const trimmedWord = wordInput.trim();
    const trimmedMeaning = meaningInput.trim();
    const trimmedCategory = categoryInput.trim();

    // Kiểm tra input rỗng
    if (!trimmedWord || !trimmedMeaning || !trimmedCategory) {
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

    // Kiểm tra trùng từ trong cùng category
    const exists = vocabs.some(
      (v: Vocab) =>
        v.word.trim().toLowerCase() === trimmedWord.toLowerCase() &&
        v.topic === trimmedCategory &&
        (!editVocab || v.id !== editVocab.id) // Nếu đang sửa bỏ qua từ đang sửa
    );
    if (exists) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: `Word "${trimmedWord}" already exists in this category!`,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      if (editVocab) {
        // Update từ
        await dispatch(
          updateVocab({
            ...editVocab,
            word: trimmedWord,
            meaning: trimmedMeaning,
            topic: trimmedCategory,
          })
        ).unwrap();
        Swal.fire("Updated!", `Vocabulary "${trimmedWord}" updated successfully!`, "success");
      } else {
        // Add từ mới
        await dispatch(
          addVocab({
            word: trimmedWord,
            meaning: trimmedMeaning,
            topic: trimmedCategory,
          })
        ).unwrap();
        Swal.fire("Added!", `Vocabulary "${trimmedWord}" added successfully!`, "success");
      }

      // Nếu category chưa tồn tại → tự động add
      const topicExists = categories.some((cat: Category) => cat.topic === trimmedCategory);
      if (!topicExists) {
        await dispatch(addCategory({ name: trimmedCategory, topic: trimmedCategory })).unwrap();
        await dispatch(fetchCategories());
      }

      // Refresh list
      await dispatch(fetchVocabs());
      closeModal();
      setEditVocab(null);
      setWordInput("");
      setMeaningInput("");
      setCategoryInput("");
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Operation failed", "error");
    }
  };

  // Xóa từ vựng
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteVocab(id)).unwrap();
      await dispatch(fetchVocabs());
      Swal.fire("Deleted!", "Vocabulary deleted successfully!", "success");
      setDeleteModal(null);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  // Mở modal confirm delete
  const confirmDelete = (id: number) => setDeleteModal(id);

  // Filter vocabs theo search + category
  const filtered = vocabs.filter((v: Vocab) => {
    const matchWord = v.word.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "All Categories" || v.topic === selectedCategory;
    return matchWord && matchCategory;
  });

  // Phân trang
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Lấy danh sách category duy nhất từ vocabs
  const categoryList = Array.from(new Set(vocabs.map((v: Vocab) => v.topic)));

  return (
    <div className="d-flex flex-column m-vh-1000 w-full h-full">
      <main className="flex-fill container mt-5 pt-3">
        {/* Header + nút Add */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold fs-1 mb-0">Vocabulary Words</h2>
          <button
            style={{
              backgroundColor: "#22C55E",
              color: "white",
              padding: "10px 20px",
              fontSize: "1rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => openModal()}
          >
            Add New Vocabulary
          </button>
        </div>

        {/* Filter category */}
        <div className="mb-3">
          <div
            style={{
              maxHeight: "120px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "5px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <select
              className="form-select border-0 bg-transparent"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Categories</option>
              {categoryList.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search box */}
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search vocabulary..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table
            className="table table-borderless"
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <thead
              style={{
                backgroundColor: "#f3f4f6",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <tr>
                <th style={{ fontWeight: 500, color: "#374151" }}>Word</th>
                <th style={{ fontWeight: 500, color: "#374151" }}>Meaning</th>
                <th style={{ fontWeight: 500, color: "#374151" }}>Category</th>
                <th style={{ fontWeight: 500, color: "#374151" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((v: Vocab) => (
                <tr key={v.id}>
                  <td>{v.word}</td>
                  <td>{v.meaning}</td>
                  <td>{v.topic}</td>
                  <td>
                    <span
                      className="text-primary me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => openModal(v)}
                    >
                      Edit
                    </span>
                    <span
                      className="text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => confirmDelete(v.id)}
                    >
                      Delete
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="d-flex justify-content-end mt-3">
          <PaginationAntd
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={closeModal} // click ngoài modal → đóng
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "500px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()} // tránh đóng khi click bên trong
          >
            {/* Tiêu đề modal */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <h5 className="mb-0">{editVocab ? "Edit Vocabulary" : "Add Vocabulary"}</h5>
            </div>

            {/* Form input */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <label>Word</label>
              <input
                type="text"
                className="form-control mb-2"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
              />
              <label>Meaning</label>
              <input
                type="text"
                className="form-control mb-2"
                value={meaningInput}
                onChange={(e) => setMeaningInput(e.target.value)}
              />
              <label>Category</label>
              <input
                type="text"
                className="form-control"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2" style={{ padding: "16px 20px" }}>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveVocab}>
                {editVocab ? "Save" : "Add"}
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
            paddingTop: "30px",
            zIndex: 9999,
          }}
          onClick={() => setDeleteModal(null)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              width: "420px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <h6 className="mb-0">Delete Vocabulary</h6>
            </div>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <p className="mb-0">Are you sure you want to delete this vocabulary?</p>
            </div>
            <div className="d-flex justify-content-end gap-2" style={{ padding: "14px 20px" }}>
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VocabularyPage;
