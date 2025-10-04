import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Select } from "antd"; // ✅ Dùng Ant Design Select
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import "./Categories.css";

import {
  addCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
  filterCategories,
} from "../../stores/slices/categoriesSlice";

import PaginationAntd from "../../components/common/Pagination";
import Footer from "../../components/common/Footer";
import type { Category } from "../../types/category";

const CategoriesPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { categories = [], loading = false } = useSelector(
    (state: any) => state.categories || {}
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Lấy danh sách ban đầu
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Lọc theo topic
  useEffect(() => {
    if (filterTopic === "All") {
      dispatch(fetchCategories());
    } else {
      dispatch(filterCategories(filterTopic));
    }
  }, [filterTopic, dispatch]);

  const openModal = (cat?: Category) => {
    if (cat) {
      setEditCategory(cat);
      setNameInput(cat.name);
      setTopicInput(cat.topic);
    } else {
      setEditCategory(null);
      setNameInput("");
      setTopicInput("");
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveCategory = async () => {
    if (!nameInput || !topicInput) {
      Swal.fire("Warning", "Please fill all fields!", "warning");
      return;
    }

    try {
      if (editCategory) {
        await dispatch(
          updateCategory({ ...editCategory, name: nameInput, topic: topicInput })
        ).unwrap();
        Swal.fire("Updated!", "Category updated successfully!", "success");
      } else {
        await dispatch(addCategory({ name: nameInput, topic: topicInput })).unwrap();
        Swal.fire("Added!", "Category added successfully!", "success");
      }

      if (filterTopic === "All") dispatch(fetchCategories());
      else dispatch(filterCategories(filterTopic));

      closeModal();
    } catch (err) {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const removeCategory = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the category!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteCategory(id)).unwrap();
          Swal.fire("Deleted!", "Category has been deleted!", "success");
          if (filterTopic === "All") dispatch(fetchCategories());
          else dispatch(filterCategories(filterTopic));
        } catch {
          Swal.fire("Error", "Failed to delete category!", "error");
        }
      }
    });
  };

  const filtered = categories.filter((cat: Category) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const topicOptions = [
    { value: "All", label: "All Topics" },
    ...[...new Set(categories.map((cat: Category) => cat.topic))].map((topic) => ({
      value: topic,
      label: topic,
    })),
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-fill container mt-5 pt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="fw-bold fs-1">Vocabulary Categories</h2>
          <button
            className="btn btn-success"
            onClick={() => openModal()}
          >
            Add New Category
          </button>
        </div>

        {/* Filter + Search */}
        <div className="d-flex gap-3 mb-3 align-items-center">

          <Select
            style={{ width: 200 }}
            value={filterTopic}
            onChange={(value) => {
              setFilterTopic(value);
              setCurrentPage(1);
            }}
            options={topicOptions}
            listHeight={100} 
            dropdownStyle={{ borderRadius: 8 }}
          />

          <input
            type="text"
            className="form-control"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: 250 }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Topic</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((cat: Category) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.topic}</td>
                  <td>
                    <span
                      className="text-primary me-3 action-text"
                      onClick={() => openModal(cat)}
                    >
                      Edit
                    </span>
                    <span
                      className="text-danger action-text"
                      onClick={() => removeCategory(cat.id)}
                    >
                      Delete
                    </span>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <PaginationAntd
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </main>

      <Footer />

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="custom-modal-backdrop" onClick={closeModal}>
          <div
            className="custom-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-header">
              <h5>{editCategory ? "Edit Category" : "Add Category"}</h5>
              <button className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="custom-modal-body">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <label>Topic</label>
              <input
                type="text"
                className="form-control"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
              />
            </div>
            <div className="custom-modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={saveCategory}>
                {editCategory ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
