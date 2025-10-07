import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Input, Row, Col } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css";
import {
  addCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../../stores/slices/categoriesSlice";

import PaginationAntd from "../../components/common/Pagination";
import Footer from "../../components/common/Footer";
import type { Category } from "../../types/category";

const Cate: React.FC = () => {
  const dispatch = useDispatch<any>();

  const { categories = [], loading = false } = useSelector(
    (state: any) => state.categories || {}
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<null | number>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterName, setFilterName] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const itemsPerPage = 5;

  const generateTopic = (name: string) => {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  useEffect(() => {
    dispatch(fetchCategories()).then((res: any) => {
      if (res.payload) setAllCategories(res.payload);
      else alert("Failed to load categories!");
    });
  }, [dispatch]);

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
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveCategory = async () => {
    if (!nameInput || !descriptionInput) {
      alert("Please fill all fields!");
      return;
    }

    try {
      const autoTopic = generateTopic(nameInput);

      if (editCategory) {
        await dispatch(
          updateCategory({
            ...editCategory,
            name: nameInput,
            description: descriptionInput,
            topic: autoTopic,
          })
        );
        alert("Category updated successfully!");
      } else {
        await dispatch(
          addCategory({
            name: nameInput,
            description: descriptionInput,
            topic: autoTopic,
          })
        );
        alert("Category added successfully!");
      }

      dispatch(fetchCategories()).then((res: any) => {
        if (res.payload) setAllCategories(res.payload);
      });
      closeModal();
    } catch {
      alert("Something went wrong!");
    }
  };

  const confirmDelete = (id: number) => setDeleteModal(id);

  const handleDelete = async (id: number) => {
    if (!id) return;
    await dispatch(deleteCategory(id));
    alert("Category deleted!");
    dispatch(fetchCategories()).then((res: any) => {
      if (res.payload) setAllCategories(res.payload);
    });
    setDeleteModal(null);
  };

  const filtered = allCategories.filter((cat: Category) => {
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
    ...[...new Set(allCategories.map((cat: Category) => cat.name))].map((name) => ({
      value: name,
      label: name,
    })),
  ];

  return (
    <div className="d-flex flex-column m-vh-100 w-full h- full" >
      <main className="flex-fill " style={{ padding: "40px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center pb-4 pt-4 flex-wrap">
          <h2 style={{ color: "#212529" }}>Vocabulary Categories</h2>
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
              transition: "all 0.2s ease",
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
                    <span style={{ color: "blue", cursor: "pointer" }} onClick={() => openModal(cat)}>
                      Edit
                    </span>{" "}
                    |{" "}
                    <span style={{ color: "red", cursor: "pointer" }} onClick={() => confirmDelete(cat.id)}>
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

        <div className="d-flex justify-content-center mt-4">
          <PaginationAntd
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cate
