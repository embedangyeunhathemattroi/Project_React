import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  addVocab,
  deleteVocab,
  fetchVocabs,
  updateVocab,
} from "../../stores/slices/vocabSLice";
import { fetchCategories, addCategory } from "../../stores/slices/categoriesSlice";
import PaginationAntd from "../../components/common/Pagination";
import Footer from "../../components/common/Footer";
import type { Vocab } from "../../types/vocab";
import type { Category } from "../../types/category";

const VocabularyPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { vocabs = [], loading = false } = useSelector(
    (state: any) => state.vocabs || {}
  );
  const { categories = [] } = useSelector((state: any) => state.categories || {});

  const [modalOpen, setModalOpen] = useState(false);
  const [editVocab, setEditVocab] = useState<Vocab | null>(null);
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ==== Fetch data ban đầu ====
  useEffect(() => {
    dispatch(fetchVocabs());
    dispatch(fetchCategories());
  }, [dispatch]);

  // ==== Mở / đóng modal ====
  const openModal = (vocab?: Vocab) => {
    if (vocab) {
      setEditVocab(vocab);
      setWordInput(vocab.word);
      setMeaningInput(vocab.meaning);
      setCategoryInput(vocab.topic);
    } else {
      setEditVocab(null);
      setWordInput("");
      setMeaningInput("");
      setCategoryInput("");
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ==== Thêm / sửa từ vựng ====
  const saveVocab = async () => {
    if (!wordInput || !meaningInput || !categoryInput) {
      Swal.fire("Warning", "Please fill all fields!", "warning");
      return;
    }

    try {
      if (editVocab) {
        await dispatch(
          updateVocab({
            ...editVocab,
            word: wordInput,
            meaning: meaningInput,
            topic: categoryInput,
          })
        ).unwrap();
        Swal.fire("Updated!", "Vocabulary updated successfully!", "success");
      } else {
        await dispatch(
          addVocab({ word: wordInput, meaning: meaningInput, topic: categoryInput })
        ).unwrap();
        Swal.fire("Added!", "Vocabulary added successfully!", "success");
      }

      // Nếu topic mới chưa có trong categories → thêm vào
      const topicExists = categories.some(
        (cat: Category) => cat.topic === categoryInput
      );
      if (!topicExists) {
        await dispatch(addCategory({ name: categoryInput, topic: categoryInput }));
        await dispatch(fetchCategories());
      }

      dispatch(fetchVocabs());
      closeModal();
    } catch (err) {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // ==== Xóa từ ====
  const removeVocab = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the vocabulary!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteVocab(id)).unwrap();
          Swal.fire("Deleted!", "Vocabulary deleted successfully!", "success");
          dispatch(fetchVocabs());
        } catch {
          Swal.fire("Error", "Failed to delete vocabulary!", "error");
        }
      }
    });
  };

  // ==== Lọc ====
  const filtered = vocabs.filter((v: Vocab) => {
    const matchWord = v.word.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "All Categories" || v.topic === selectedCategory;
    return matchWord && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==== Danh sách category duy nhất (có thanh cuộn) ====
  const categoryList = Array.from(new Set(vocabs.map((v: Vocab) => v.topic)));

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-fill container mt-5 pt-5">
        {/* Header + Add */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="fw-bold fs-1 mb-0">Vocabulary Words</h2>
          <button
            style={{
              backgroundColor: "#22C55E",
              color: "white",
              padding: "10px 20px",
              fontSize: "1rem",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
            onClick={() => openModal()}
          >
            Add New Vocabulary
          </button>
        </div>

        {/* Select Category (có thanh cuộn) */}
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

        {/* Search */}
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
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Category</th>
                <th>Actions</th>
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
                      className="text-primary me-3 action-text"
                      onClick={() => openModal(v)}
                    >
                      Edit
                    </span>
                    <span
                      className="text-danger action-text"
                      onClick={() => removeVocab(v.id)}
                    >
                      Delete
                    </span>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    No vocabulary found.
                  </td>
                </tr>
              )}
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

      {/* Modal thêm/sửa */}
      {modalOpen && (
        <div
          className="custom-modal-backdrop"
          onClick={closeModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="custom-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>{editVocab ? "Edit Vocabulary" : "Add Vocabulary"}</h5>
              <button className="btn-close" onClick={closeModal}></button>
            </div>
            <div>
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
            <div className="d-flex justify-content-end mt-3 gap-2">
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

      <Footer />
    </div>
  );
};

export default VocabularyPage;
