import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import {addVocab,deleteVocab,fetchVocabs,updateVocab,} from "../../stores/slices/vocabSLice";
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
  const [deleteModal, setDeleteModal] = useState<null | { id: number; word: string; topic: string }>(null);
  const [editVocab, setEditVocab] = useState<Vocab | null>(null);
  const [wordInput, setWordInput] = useState("");
  const [meaningInput, setMeaningInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [wordError, setWordError] = useState("");
  const [meaningError, setMeaningError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(fetchVocabs());
    dispatch(fetchCategories());
  }, [dispatch]);

  //  debounce 1000ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 1000);
    return () => clearTimeout(timer);
  }, [search]);

  const openModal = (vocab?: Vocab) => {
    setWordError("");
    setMeaningError("");
    setCategoryError("");

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
  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  const saveVocab = async () => {
    const trimmedWord = capitalize(wordInput.trim());
    const trimmedMeaning = capitalize(meaningInput.trim());
    const trimmedCategory = categoryInput.trim();
    setWordError("");
    setMeaningError("");
    setCategoryError("");

    let hasError = false;
    if (!trimmedWord) {
      setWordError("Please enter a word.");
      hasError = true;
    }
    if (!trimmedMeaning) {
      setMeaningError("Please enter a meaning.");
      hasError = true;
    }
    if (!trimmedCategory) {
      setCategoryError("Please select a category.");
      hasError = true;
    }
    if (hasError) return;

    const exists = vocabs.some(
      (v: Vocab) =>
        v.word.trim().toLowerCase() === trimmedWord.toLowerCase() &&
        v.topic === trimmedCategory &&
        (!editVocab || v.id !== editVocab.id)
    );

    if (exists) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate word!",
        text: `The word "${trimmedWord}" already exists in category "${trimmedCategory}".`,
        toast: true,
        position: "center",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    try {
      if (editVocab) {
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
        await dispatch(
          addVocab({
            word: trimmedWord,
            meaning: trimmedMeaning,
            topic: trimmedCategory,
          })
        ).unwrap();
        Swal.fire("Added!", `Vocabulary "${trimmedWord}" added successfully!`, "success");
        setCurrentPage(1);
      }

      // Nếu category mới chưa có thì thêm
      const topicExists = categories.some((cat: Category) => cat.topic === trimmedCategory);
      if (!topicExists) {
        await dispatch(addCategory({ name: trimmedCategory, topic: trimmedCategory })).unwrap();
        await dispatch(fetchCategories());
      }

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

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteVocab(id)).unwrap();
      await dispatch(fetchVocabs());
      Swal.fire("Deleted!", "Vocabulary deleted successfully!", "success");
      setDeleteModal(null);
    } catch (err: any) {
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  const confirmDelete = (vocab: Vocab) => {
    setDeleteModal({ id: vocab.id, word: vocab.word, topic: vocab.topic });
  };

  //  Filter + sort A → Z
  const filtered = vocabs
    .filter((v: Vocab) => {
      const normalize = (text: string) =>
        text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const searchTerm = normalize(debouncedSearch);
      const matchWordOrMeaning =
        normalize(v.word).includes(searchTerm) || normalize(v.meaning).includes(searchTerm);
      const matchCategory = selectedCategory === "All Categories" || v.topic === selectedCategory;
      return matchWordOrMeaning && matchCategory;
    })
    .sort((a: Vocab, b: Vocab) => a.word.localeCompare(b.word)); // Sắp xếp A-Z theo word

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const categoryList = Array.from(new Set(vocabs.map((v: Vocab) => v.topic)));

  return (
    <div className="vocab-page d-flex flex-column" style={{ minHeight: "100vh", width: "100%" }}>
      <main className="flex-fill" style={{ padding: "40px" }}>
        <div className="d-flex justify-content-between align-items-center pb-4 pt-4">
          <h2 style={{ color: "#212529", fontWeight: 700 }}>
            <strong>Vocabulary Words</strong>
          </h2>
          <button
            style={{
              backgroundColor: "#22C55E",
              color: "white",
              padding: "10px 20px",
              fontSize: "1rem",
              border: "none",
              borderRadius: "8px",
            }}
            onClick={() => openModal()}
          >
            Add New Vocabulary
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <select
            className="form-select"
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

        {/* Search box */}
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by word or meaning..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{ height: "56px", borderRadius: "12px" }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
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
              <thead style={{ backgroundColor: "#c0c9ddff" }}>
                <tr >
                  <th style={{color:"rgb(107,114,128"}}>Word</th>
                  <th style={{color:"rgb(107,114,128"}}>Meaning</th>
                  <th style={{color:"rgb(107,114,128"}}>Category</th>
                  <th style={{color:"rgb(107,114,128"}}>Actions</th>
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
                        onClick={() => confirmDelete(v)}
                      >
                        Delete
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length===0&&<tr>
                  
                  <td style={{ position:"inherit"}}>
                    ko có từ đó</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4">
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
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <h5 className="mb-0">{editVocab ? "Edit Vocabulary" : "Add Vocabulary"}</h5>
            </div>

            <div style={{ padding: "16px 20px" }}>
              <label>Word</label>
              <input
                type="text"
                className="form-control mb-1"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
              />
              {wordError && <p className="text-danger small">{wordError}</p>}

              <label>Meaning</label>
              <textarea
                className="form-control mb-1"
                value={meaningInput}
                onChange={(e) => setMeaningInput(e.target.value)}
              />
              {meaningError && <p className="text-danger small">{meaningError}</p>}

              <label>Category</label>
              <select
                className="form-select mb-1"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
              >
               
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {categoryError && <p className="text-danger small">{categoryError}</p>}
            </div>

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
              <p className="mb-0">
                Are you sure you want to delete <strong>{deleteModal.word}</strong> in topic{" "}
                <strong>{deleteModal.topic}</strong>?
              </p>
            </div>
            <div className="d-flex justify-content-end gap-2" style={{ padding: "14px 20px" }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteModal.id)}>
                Delete
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
