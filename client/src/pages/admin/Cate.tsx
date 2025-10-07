import React, { useEffect, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [filterName, setFilterName] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [formError, setFormError] = useState<string>("");

  const itemsPerPage = 5;

  const generateTopic = (name: string) =>
    name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

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

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditCategory(cat);
      setNameInput(cat.name);
      setDescriptionInput(cat.description);
    } else {
      setEditCategory(null);
      setNameInput("");
      setDescriptionInput("");
    }
    setFormError("");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const saveCategory = async () => {
  const trimmedName = nameInput.trim();
  const trimmedDescription = descriptionInput.trim();

  // Kiểm tra rỗng
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

  // Kiểm tra trùng tên
  const nameExists = categories.some(
    (cat: Category) =>
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

  const topic = generateTopic(trimmedName);

  try {
    if (editCategory) {
      await dispatch(
        updateCategory({ ...editCategory, name: trimmedName, description: trimmedDescription, topic })
      ).unwrap();
      await loadCategories();
      Swal.fire("Updated!", `Category "${trimmedName}" updated successfully!`, "success");
    } else {
      await dispatch(
        addCategory({ name: trimmedName, description: trimmedDescription, topic })
      ).unwrap();
      await loadCategories();
      Swal.fire("Added!", `Category "${trimmedName}" added successfully!`, "success");
    }

    closeModal();
    setEditCategory(null);
    setNameInput("");
    setDescriptionInput("");
  } catch (err: any) {
    console.error(err);
    Swal.fire("Error", err.message || "Operation failed", "error");
  }
};

  const confirmDelete = (id: number) => setDeleteModal(id);

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      await loadCategories();
      Swal.fire("Deleted!", "Category deleted successfully!", "success");
      setDeleteModal(null);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Delete failed", "error");
    }
  };

  // Filtering & Pagination
  const filtered = categories.filter((cat: Category) => {
    const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    const matchesName = filterName === "All" || cat.name === filterName;
    return matchesSearch && matchesName;
  });

  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nameOptions = [
    { value: "All", label: "All Names" },
    ...[...new Set(categories.map((cat: Category) => cat.name))].map((name) => ({
      value: name,
      label: name,
    })),
  ];

  return (
    <div className="d-flex flex-column min-vh-100 w-full">
      <main className="flex-fill" style={{ padding: "40px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center pb-4 pt-4 flex-wrap">
          <h2 style={{ color: "#212529", fontWeight: 400 }}>Vocabulary Categories</h2>
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

        {/* Filter & Search */}
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
                setCurrentPage(1);
              }}
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
          <table className="table table-borderless table-hover mb-0" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ color: "#6B7280" }}>NAME</th>
                <th style={{ color: "#6B7280" }}>DESCRIPTION</th>
                <th style={{ color: "#6B7280" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((cat: Category) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>
                    <span
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => openModal(cat)}
                    >
                      Edit
                    </span>{" "}
                    |{" "}
                    <span
                      style={{ color: "red", cursor: "pointer" }}
                      onClick={() => confirmDelete(cat.id)}
                    >
                      Delete
                    </span>
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

        {/* Modal thêm/sửa */}
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

              {/* Body */}
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

              {/* Footer */}
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

        {/* Modal xóa */}
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
