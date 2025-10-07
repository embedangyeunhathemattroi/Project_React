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
  const { vocabs = [], loading = false } = useSelector((state: any) => state.vocabs || {});
  const { categories = [] } = useSelector((state: any) => state.categories || {});

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<null | number>(null);
  const [editVocab, setEditVocab] = useState<Vocab | null>(null);
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(fetchVocabs());
    dispatch(fetchCategories());
  }, [dispatch]);

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
          addVocab({
            word: wordInput,
            meaning: meaningInput,
            topic: categoryInput,
          })
        ).unwrap();
        Swal.fire("Added!", "Vocabulary added successfully!", "success");
      }

      const topicExists = categories.some((cat: Category) => cat.topic === categoryInput);
      if (!topicExists) {
        await dispatch(addCategory({ name: categoryInput, topic: categoryInput }));
        await dispatch(fetchCategories());
      }

      dispatch(fetchVocabs());
      closeModal();
    } catch {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const confirmDelete = (id: number) => setDeleteModal(id);

  const handleDelete = async (id: number) => {
    await dispatch(deleteVocab(id));
    Swal.fire("Deleted!", "Vocabulary deleted successfully!", "success");
    dispatch(fetchVocabs());
    setDeleteModal(null);
  };

  const filtered = vocabs.filter((v: Vocab) => {
    const matchWord = v.word.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "All Categories" || v.topic === selectedCategory;
    return matchWord && matchCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const categoryList = Array.from(new Set(vocabs.map((v: Vocab) => v.topic)));

  return (
    <div className="d-flex flex-column m-vh-1000 w-full h- full">
      <main className="flex-fill container mt-5 pt-3">
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
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "500px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tiêu đề */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <h5 className="mb-0">{editVocab ? "Edit Vocabulary" : "Add Vocabulary"}</h5>
            </div>

            {/* Nội dung form */}
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
            <div className="d-flex justify-content-end gap-2" style={{ padding: "16px 20px" }}>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={saveVocab}>{editVocab ? "Save" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
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
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteModal!)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VocabularyPage;
