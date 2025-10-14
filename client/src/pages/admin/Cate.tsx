import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Input, Row, Col } from "antd";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../stores/slices/categoriesSlice";
import PaginationAntd from "../../components/common/Pagination";
import Footer from "../../components/common/Footer";
import type { Category } from "../../types/category";

const Cate: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { categories = [] } = useSelector((state: any) => state.categories || {});

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<null | number>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [filterName, setFilterName] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);
  const itemsPerPage = 5;

  // ------------------- UTILITIES -------------------
  const generateTopic = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const normalizeString = (s?: string | null) =>
    (s ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const loadCategories = async () => {
    try {
      await dispatch(fetchCategories()).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ------------------- DEBOUNCE SEARCH -------------------
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ------------------- FILTERED & DISPLAY -------------------
  const filtered = useMemo(() => {
    const base = categories.filter((cat: Category) => {
      const searchTerm = normalizeString(debouncedSearch);
      const matchesSearch =
        normalizeString(cat.name).includes(searchTerm) ||
        normalizeString(cat.description).includes(searchTerm);
      const matchesName = filterName === "All" || cat.name === filterName;
      return matchesSearch && matchesName;
    });

    base.sort((a: Category, b: Category) => {
      if (lastAddedId !== null) {
        if (a.id === lastAddedId && b.id !== lastAddedId) return 1;
        if (b.id === lastAddedId && a.id !== lastAddedId) return -1;
      }
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });

    return base;
  }, [categories, debouncedSearch, filterName, lastAddedId]);

  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ------------------- SWEETALERT NO RESULT -------------------
  useEffect(() => {
    if (
      debouncedSearch.trim() &&
      !categories.some((cat: Category) =>
        normalizeString(cat.name).includes(normalizeString(debouncedSearch))
      )
    ) {
      Swal.fire({
        icon: "info",
        title: "No categories found!",
        text: `No category matches "${debouncedSearch}".`,
        confirmButtonText: "OK",
      });
    }
  }, [debouncedSearch, categories]);

  // ------------------- OPEN/CLOSE MODAL -------------------
  const openModal = (cat?: Category) => {
    if (cat) {
      setEditCategory(cat);
      setNameInput(cat.name);
      setDescriptionInput(cat.description);
      setTopicInput(cat.topic);
    } else {
      setEditCategory(null);
      setNameInput("");
      setDescriptionInput("");
      setTopicInput("");
    }
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ------------------- SAVE CATEGORY -------------------
  const saveCategory = async () => {
    let newErrors: typeof errors = {};
    const trimmedName = nameInput.trim();
    const trimmedDesc = descriptionInput.trim();

    if (!trimmedName) newErrors.name = "Name is required!";
    if (!trimmedDesc) newErrors.description = "Description is required!";

    const nameExists = categories.some(
      (cat) =>
        normalizeString(cat.name) === normalizeString(trimmedName) &&
        (!editCategory || cat.id !== editCategory.id)
    );
    if (nameExists) newErrors.name = `Category "${trimmedName}" already exists!`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const topic = generateTopic(trimmedName);

    try {
      if (editCategory) {
        await dispatch(
          updateCategory({
            ...editCategory,
            name: trimmedName,
            description: trimmedDesc,
            topic,
          })
        ).unwrap();
      } else {
        const newCat: Category = await dispatch(
          addCategory({
            name: trimmedName,
            description: trimmedDesc,
            topic,
          })
        ).unwrap();

        if (newCat && typeof newCat.id !== "undefined") {
          setLastAddedId(newCat.id);
        }

        const totalPages = Math.ceil((categories.length + 1) / itemsPerPage);
        setCurrentPage(totalPages);
      }

      closeModal();
      setEditCategory(null);
      setNameInput("");
      setDescriptionInput("");
      setTopicInput("");
      setErrors({});
    } catch (err: any) {
      console.error(err);
      setErrors({ name: err.message || "Operation failed" });
    }
  };

  // ------------------- DELETE -------------------
  const confirmDelete = (id: number) => setDeleteModal(id);
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      await loadCategories();
      if (lastAddedId === id) setLastAddedId(null);
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

  const nameOptions = [
    { value: "All", label: "All Names" },
    ...[...new Set(categories.map((cat) => cat.name))].map((name) => ({
      value: name,
      label: name,
    })),
  ];

  return (
    <div className="d-flex flex-column min-vh-100 w-full">
      <main className="flex-fill" style={{ padding: "40px" }}>
        <div className="d-flex justify-content-between align-items-center pb-4 pt-4 flex-wrap">
          <h2 style={{ color: "#212529", fontWeight: 600 }}>Vocabulary Categories</h2>
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
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#16A34A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#22C55E")}
          >
            Add New Category
          </button>
        </div>

        {/* Search & Filter */}
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
              onChange={(e) => setSearch(e.target.value)}
              style={{ height: "56px", borderRadius: "12px" }}
            />
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
            style={{ width: "100%", minWidth: "950px", borderSpacing: "0 12px" }}
          >
            <thead>
              <tr>
                <th style={{ color: "#6B7280", width: "25%" }}>NAME</th>
                <th style={{ color: "#6B7280", width: "55%" }}>DESCRIPTION</th>
                <th style={{ color: "#6B7280", width: "20%" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((cat) => (
                <tr key={cat.id} style={{ height: "60px" }}>
                  <td>{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <span
                        style={{ color: "#2563EB", cursor: "pointer", fontWeight: 500 }}
                        onClick={() => openModal(cat)}
                      >
                        Edit
                      </span>
                      <span
                        style={{ color: "#DC2626", cursor: "pointer", fontWeight: 500 }}
                        onClick={() => confirmDelete(cat.id)}
                      >
                        Delete
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
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
{/* MODAL ADD/EDIT */}
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
        <h5 className="mb-0">{editCategory ? "Edit Category" : "Add Category"}</h5>
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
        {/* Name */}
        <label style={{ fontWeight: 500 }}>Name</label>
        <input
          type="text"
          className="form-control mb-1"
          value={nameInput}
          onChange={(e) => {
            setNameInput(e.target.value);
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          style={{
            fontSize: "1.1rem",
            height: "50px",
            borderColor: errors.name ? "red" : undefined,
          }}
        />
        {errors.name && <div style={{ color: "red", marginBottom: "10px" }}>{errors.name}</div>}

        {/* Description */}
        <label style={{ fontWeight: 500 }}>Description</label>
        <textarea
          className="form-control mb-1"
          value={descriptionInput}
          onChange={(e) => {
            setDescriptionInput(e.target.value);
            if (errors.description) setErrors({ ...errors, description: undefined });
          }}
          style={{
            fontSize: "1.1rem",
            height: "50px",
            borderColor: errors.description ? "red" : undefined,
          }}
        />
        {errors.description && <div style={{ color: "red", marginBottom: "10px" }}>{errors.description}</div>}
      </div>

      <div
        className="d-flex justify-content-end gap-3"
        style={{ padding: "16px 30px", borderTop: "1px solid #e5e7eb" }}
      >
        <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={saveCategory}>
          {editCategory ? "Save" : "Add"}
        </button>
      </div>
    </div>
  </div>
)}

        {/* MODAL DELETE */}
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
                <p className="mb-0">Are you sure you want to delete this category?</p>
              </div>

              <div
                className="d-flex justify-content-end gap-3"
                style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb" }}
              >
                <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteModal!)}>Delete</button>
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
