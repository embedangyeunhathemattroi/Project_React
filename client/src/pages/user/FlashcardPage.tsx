import React from "react";
import axios from "axios"; 
import "./FlashCardPage.css";
import PaginationAntd from "../../components/common/Pagination"; 
import Footer from "../../components/common/Footer"; 
import FlashCard from "../../components/UI/FlashCard"; 
import Swal from "sweetalert2"; 
import { Table } from "antd"; 
interface Vocab {
  id: number;
  word: string;
  meaning: string;
  categoryId: number;
  topic: string;
  isLearned: boolean;
}

interface Category {
  id: number;
  name: string;
  topic: string;
}

interface State {
  vocabs: Vocab[];
  categories: Category[];
  currentIndex: number; // Vị trí từ hiện tại trong danh sách
  filterCategoryId: number | "All"; // Bộ lọc danh mục hiện tại
  flipped: boolean; 
  loading: boolean; 
  error: string | null;
  currentPage: number;
  pageSize: number; 
  searchTerm: string; 
}

class FlashCardPage extends React.Component<{}, State> {
  state: State = {
    vocabs: [],
    categories: [],
    currentIndex: 0,
    filterCategoryId: "All",
    flipped: false,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 5,
    searchTerm: "",
  };

  // ========================== GỌI API KHI VỪA MỞ TRANG ==========================
  componentDidMount() {
    this.fetchData();
  }

  // ========================== LẤY DỮ LIỆU TỪ SERVER ==========================
  fetchData = async () => {
    this.setState({ loading: true }); 
    try {
      const [vocabsRes, categoriesRes] = await Promise.all([
        axios.get<Vocab[]>("http://localhost:8080/vocabs"),
        axios.get<Category[]>("http://localhost:8080/categories"),
      ]);
      this.setState({
        vocabs: vocabsRes.data,
        categories: categoriesRes.data,
        loading: false,
      });
    } catch (err: any) {
      this.setState({
        error: err.message || "Failed to fetch data",
        loading: false,
      });
    }
  };

  // ========================== XỬ LÝ HÀNH ĐỘNG NGƯỜI DÙNG ==========================
  handleFlip = () => {
    this.setState({ flipped: !this.state.flipped });
  };
  handleNext = () => {
    const filtered = this.getFilteredVocabs();
    const { currentIndex } = this.state;
    if (filtered.length === 0) return; 

    if (currentIndex < filtered.length - 1) {
      this.setState({
        currentIndex: currentIndex + 1,
        flipped: false, 
      });
    } else {
      Swal.fire({
        title: "🎉 Hoàn thành!",
        text: "Bạn đã học hết các từ trong chủ đề này!",
        imageUrl: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMW9obDY2dXVia3prMGF6cnZ4bGZjcmk3ZDg4OHk2bzNwbTlscDU4OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5Sl1sMiMJTgXXTZjrL/giphy.gif",
        imageWidth: 400,
        imageHeight: 200,
      });
    }
  };

  handlePrevious = () => {
    const { currentIndex } = this.state;
    if (currentIndex > 0) {
      this.setState({
        currentIndex: currentIndex - 1,
        flipped: false,
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "Thông báo",
        text: "Bạn đang ở từ đầu tiên!",
      });
    }
  };

  handleMarkLearned = () => {
    const filtered = this.getFilteredVocabs();
    const { currentIndex } = this.state;
    const current = filtered[currentIndex];
    if (!current) return;
    this.setState(
      (prev) => ({
        vocabs: prev.vocabs.map((v) =>
          v.id === current.id ? { ...v, isLearned: true } : v
        ),
      }),
      () => {
        const updatedFiltered = this.getFilteredVocabs();
        const unlearnedLeft = updatedFiltered.filter((v) => !v.isLearned).length;
        if (unlearnedLeft === 0) {
          Swal.fire({
            title: "Tuyệt vời 🎇",
            text: "Bạn đã học hết tất cả từ trong chủ đề này!",
            imageUrl: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
            imageWidth: 400,
            imageHeight: 200,
          });
        } else {
          this.handleNext();
        }
      }
    );
  };

  handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "All" ? "All" : Number(e.target.value);
    this.setState({
      filterCategoryId: value,
      currentIndex: 0,
      flipped: false,
      currentPage: 1,
    });
  };

  // ========================== HÀM LỌC DỮ LIỆU ==========================
  getFilteredVocabs = () => {
    const { vocabs, filterCategoryId, searchTerm } = this.state;
    let filtered = vocabs;
    if (filterCategoryId !== "All") {
      filtered = filtered.filter((v) => v.categoryId === filterCategoryId);
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (v) =>
          v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };
  getPagedVocabs = () => {
    const { currentPage, pageSize } = this.state;
    const filtered = this.getFilteredVocabs();
    const sorted = [...filtered].sort((a, b) =>
      a.isLearned === b.isLearned ? 0 : a.isLearned ? 1 : -1
    );

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  };

  // ========================== GIAO DIỆN (RENDER) ==========================
  render() {
    const {
      categories,
      currentIndex,
      flipped,
      loading,
      error,
      currentPage,
      pageSize,
    } = this.state;

    const filteredVocabs = this.getFilteredVocabs();
    const currentVocab = filteredVocabs[currentIndex] || null;
    const pagedVocabs = this.getPagedVocabs();

    // Tính tiến độ học (%)
    const total = filteredVocabs.length;
    const learnedCount = filteredVocabs.filter((v) => v.isLearned).length;
    const progressPercent = total === 0 ? 0 : (learnedCount / total) * 100;
    if (loading) return <div className="container mt-5">Loading...</div>;
    if (error) return <div className="container mt-5 text-danger">{error}</div>;

    return (
      <div className="d-flex w-full flex-column min-vh-100">
        <div
          className="mt-5 flex-grow-1"
          style={{ paddingBottom: "200px", paddingLeft: "50px" }}
        >
          <h3 style={{ color: "#212529", fontWeight: 600 }}>
            <strong>Flashcard Learning</strong>
          </h3>

          <select
            className="form-select mb-3"
            value={this.state.filterCategoryId}
            onChange={this.handleFilterChange}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* ======== Ô TÌM KIẾM ======== */}
          {/* <input
            type="text"
            className="form-control mb-3"
            placeholder="Search vocabulary..."
            value={this.state.searchTerm}
            onChange={(e) =>
              this.setState({ searchTerm: e.target.value, currentIndex: 0 })
            }
          /> */}

          {/* ======== KHU VỰC FLASHCARD ======== */}
          <div className="flashcard-container mb-3">
            {currentVocab ? (
              <div className="flashcard-wrapper">
                <FlashCard
                  word={currentVocab.word}
                  meaning={currentVocab.meaning}
                  flipped={flipped}
                  onFlip={this.handleFlip}
                  width="700px"
                  height="400px"
                  backgroundColor="#fff" 
                />
              </div>
            ) : (
              // Nếu không có từ nào
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h5>No words available</h5>
              </div>
            )}
          </div>
          <div className="mb-3 d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn btn-primary btn-lg"
              onClick={this.handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            <button
              className="btn btn-success btn-lg"
              onClick={this.handleMarkLearned}
              disabled={!currentVocab}
            >
              Mark as Learned
            </button>

            <button
              className="btn btn-primary btn-lg"
              onClick={this.handleNext}
              disabled={currentIndex >= total - 1}
            >
              Next
            </button>
          </div>

          {/* ======== THANH TIẾN TRÌNH ======== */}
          <div
            className="mb-5 mx-auto"
            style={{ width: "700px", textAlign: "center" }}
          >
            <label className="fw-bold mb-2">Progress</label>
            <div className="progress" style={{ height: "20px", borderRadius: "10px" }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{
                  width: `${progressPercent}%`,
                  transition: "width 0.6s ease",
                  borderRadius: "10px",
                }}
              />
            </div>
            <div className="mt-2 text-secondary">
              {learnedCount}/{total} words learned
            </div>
          </div>

          {/* ======== BẢNG DANH SÁCH TỪ VỰNG ======== */}
          <div className="mx-auto" style={{ width: "100%" }}>
            <h5 className="mb-3">
              <strong>Word List</strong>
            </h5>

            <Table
              bordered
              pagination={false}
              dataSource={pagedVocabs.map((v) => ({
                key: v.id,
                word: v.word,
                meaning: v.meaning,
                status: v.isLearned ? "Learned" : "Not Learned",
              }))}
              columns={[
                { title: "Word", dataIndex: "word", key: "word" },
                { title: "Meaning", dataIndex: "meaning", key: "meaning" },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (text: string) => (
                    <span
                      style={{
                        color: text === "Learned" ? "green" : "red",
                        fontWeight: 600,
                      }}
                    >
                      {text}
                    </span>
                  ),
                },
              ]}
            />
          </div>

          {/* ======== PHÂN TRANG ======== */}
          <div className="d-flex justify-content-center mt-4">
            <PaginationAntd
              currentPage={currentPage}
              totalItems={filteredVocabs.length}
              pageSize={pageSize}
              onPageChange={(page) => this.setState({ currentPage: page })}
            />
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}

export default FlashCardPage;
//thanh tiến trình chưa đúng, chưa học xong đã hiện ra chúc mừng
